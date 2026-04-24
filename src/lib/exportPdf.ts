// ═══════════════════════════════════════════════════════════════════════════
// exportPdf — pdfmake-based PDF export with Cyrillic fonts embedded.
//
// Fonts: validated in Phase 1 — Noto Sans for body, Manrope for display.
// TTFs are served from /fonts/ (public/fonts/*.ttf) and base64-encoded at
// runtime on first export. Cached for the life of the tab.
//
// Document structure (Phase 7 spec):
//   Page 1     : Cover
//   Page 2     : Executive summary (tiles + calc ladder)
//   Pages 3-6  : One section table per BOQ section (CCTV / Fire /
//                Intercom / Electrical)
//   Page 7     : Auxiliary summary grouped by section
//   Page 8     : Terms + signatures + approval seal
//
// All pages get a header (logo + doc number), footer (page X of Y), and
// a 'НООРОГ' watermark when the project is not signed.
// ═══════════════════════════════════════════════════════════════════════════

import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import type {
  ApprovalRecord,
  AuxiliaryBySection,
  AuxTotals,
  ComputedAuxRuntimeItem,
  ComputedSection,
  ProjectMeta,
  ProjectStatus,
  SectionId,
  TierId,
} from '@/types';
import { TIER_OPTIONS } from '@/lib/tiers';
import { formatMNT, formatNum, formatShort } from '@/lib/format';
import { formatDateShortMN, formatDateTimeMN } from '@/lib/date';

export interface PdfExportInputs {
  projectMeta: ProjectMeta;
  projectStatus: ProjectStatus;
  approvalRecord?: ApprovalRecord;
  sectionTotals: ComputedSection[];
  auxiliaryData: AuxiliaryBySection;
  auxTotals: AuxTotals;
  mainSubtotal: number;
  auxSubtotal: number;
  grandSubtotal: number;
  totalLabor: number;
  totalMaterial: number;
  synergyDiscount: number;
  afterDiscount: number;
  vat: number;
  finalTotal: number;
  tier: TierId;
  tierMultiplier: number;
  synergy: boolean;
  vatEnabled: boolean;
  changeLogCount: number;
  files: { name: string }[];
}

// ─── Font loader ────────────────────────────────────────────────────────

let vfsCache: Record<string, string> | null = null;

async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  // Chunked conversion to avoid call-stack overflow on large TTFs.
  const bytes = new Uint8Array(buf);
  const CHUNK = 0x8000;
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

async function loadFontVfs(): Promise<Record<string, string>> {
  if (vfsCache) return vfsCache;
  const files = [
    'NotoSans-Regular.ttf',
    'NotoSans-Bold.ttf',
    'Manrope-Variable.ttf',
  ];
  const pairs = await Promise.all(
    files.map(async (file) => {
      const res = await fetch(`/fonts/${file}`);
      if (!res.ok) throw new Error(`Failed to load /fonts/${file}: ${res.status}`);
      const buf = await res.arrayBuffer();
      const b64 = await arrayBufferToBase64(buf);
      return [file, b64] as const;
    }),
  );
  vfsCache = Object.fromEntries(pairs);
  return vfsCache;
}

// ─── Document builder ───────────────────────────────────────────────────

const BRAND = '#0041ff';
const GRAY_LINE = '#e5e7eb';
const GRAY_TEXT = '#6b7280';
const EMERALD = '#059669';

function docNumber(projectCode: string): string {
  const d = new Date();
  return `MV-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${projectCode}`;
}

function sectionIconSymbol(iconKey: string | undefined): string {
  // Simple unicode stand-in for the lucide icons in the on-screen UI.
  switch (iconKey) {
    case 'camera': return '◉';
    case 'flame': return '△';
    case 'radio': return '◐';
    case 'zap': return '⚡';
    default: return '•';
  }
}

function buildCoverPage(inputs: PdfExportInputs, docNo: string): Content[] {
  const { projectMeta, finalTotal, vatEnabled, tier, tierMultiplier } = inputs;
  const today = new Date();
  const validUntil = new Date(today.getTime() + 30 * 86_400_000);
  const tierLabel = TIER_OPTIONS.find((t) => t.id === tier)?.label ?? 'Standard';

  return [
    { text: 'MURCH VISION', font: 'Display', fontSize: 28, bold: true, color: BRAND, margin: [0, 80, 0, 4] },
    { text: 'AI-POWERED BOQ · CONSTRUCTION COST ESTIMATE', font: 'Body', fontSize: 9, color: GRAY_TEXT, characterSpacing: 2, margin: [0, 0, 0, 60] },
    {
      text: 'Ажлын зардлын хэмжээ (BOQ)',
      font: 'Display',
      fontSize: 11,
      color: GRAY_TEXT,
      margin: [0, 0, 0, 8],
    },
    {
      text: projectMeta.name,
      font: 'Display',
      fontSize: 32,
      bold: true,
      margin: [0, 0, 0, 4],
    },
    {
      text: projectMeta.subtitle,
      font: 'Body',
      fontSize: 13,
      color: GRAY_TEXT,
      margin: [0, 0, 0, 40],
    },

    {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { stack: [
              { text: 'ЗАХИАЛАГЧ', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2 },
              { text: projectMeta.clients, fontSize: 10, margin: [0, 4, 0, 0] },
            ], border: [false, false, false, false] },
            { stack: [
              { text: 'БАЙРШИЛ', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2 },
              { text: projectMeta.location, fontSize: 10, margin: [0, 4, 0, 0] },
            ], border: [false, false, false, false] },
          ],
          [
            { stack: [
              { text: 'ТАЛБАЙ', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2, margin: [0, 12, 0, 0] },
              { text: projectMeta.area, fontSize: 10, margin: [0, 4, 0, 0] },
            ], border: [false, false, false, false] },
            { stack: [
              { text: 'ҮНЭ ХҮЧИНТЭЙ', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2, margin: [0, 12, 0, 0] },
              { text: formatDateShortMN(validUntil), fontSize: 10, margin: [0, 4, 0, 0] },
            ], border: [false, false, false, false] },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 50],
    },

    // Big total box
    {
      table: {
        widths: ['*'],
        body: [[
          {
            stack: [
              { text: 'ЭЦСИЙН НИЙТ ДҮН', fontSize: 9, color: GRAY_TEXT, characterSpacing: 3 },
              {
                text: formatMNT(finalTotal),
                font: 'Display',
                fontSize: 40,
                bold: true,
                color: BRAND,
                margin: [0, 8, 0, 4],
              },
              {
                text: `Түвшин: ${tierLabel} · үржигч ×${tierMultiplier.toFixed(2)} · ${vatEnabled ? 'НӨАТ-тай' : 'НӨАТ-гүй'}`,
                fontSize: 9,
                color: GRAY_TEXT,
              },
            ],
            fillColor: '#f8fafc',
            border: [true, true, true, true],
            borderColor: [BRAND, BRAND, BRAND, BRAND],
            margin: [16, 16, 16, 16],
          },
        ]],
      },
      layout: { paddingTop: () => 0, paddingBottom: () => 0, paddingLeft: () => 0, paddingRight: () => 0 },
      margin: [0, 0, 0, 60],
    },

    // Doc number footer
    {
      columns: [
        {
          stack: [
            { text: 'БАРИМТ №', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2 },
            { text: docNo, fontSize: 10, margin: [0, 3, 0, 0] },
          ],
        },
        {
          stack: [
            { text: 'ОГНОО', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2 },
            { text: formatDateShortMN(today), fontSize: 10, margin: [0, 3, 0, 0] },
          ],
        },
      ],
    },

    {
      text: 'Энэхүү баримт бичгийг Murch Vision AI Estimator-ийн туслалцаатай боловсруулж, лицензтэй инженер хянан баталсан болно.',
      fontSize: 8,
      color: GRAY_TEXT,
      italics: true,
      margin: [0, 50, 0, 0],
      alignment: 'center',
    },

    { text: '', pageBreak: 'after' },
  ];
}

function buildExecSummary(inputs: PdfExportInputs): Content[] {
  const {
    totalMaterial,
    totalLabor,
    auxSubtotal,
    grandSubtotal,
    synergyDiscount,
    afterDiscount,
    vat,
    finalTotal,
    synergy,
    vatEnabled,
    tier,
    tierMultiplier,
  } = inputs;
  const tierLabel = TIER_OPTIONS.find((t) => t.id === tier)?.label ?? 'Standard';

  const tileBody: TableCell[][] = [[
    tileCell('ҮНДСЭН МАТЕРИАЛ', formatShort(totalMaterial) + '₮'),
    tileCell('АЖЛЫН ХӨЛС', formatShort(totalLabor) + '₮'),
    tileCell('ТУСЛАХ МАТЕРИАЛ', formatShort(auxSubtotal) + '₮', EMERALD),
    tileCell(
      synergy ? 'SQUAD ХЭМНЭЛТ' : 'ХӨНГӨЛӨЛТ',
      synergy ? '−' + formatShort(synergyDiscount) + '₮' : '—',
      synergy ? '#b45309' : undefined,
    ),
  ]];

  const ladder: TableCell[][] = [];
  ladder.push([
    { text: 'Үндсэн материал', fontSize: 10 },
    { text: `Түвшин: ${tierLabel} · үржигч ×${tierMultiplier.toFixed(2)}`, fontSize: 8, color: GRAY_TEXT },
    { text: formatMNT(totalMaterial), alignment: 'right', fontSize: 10, font: 'Body' },
  ]);
  ladder.push([
    { text: 'Ажлын хөлс', fontSize: 10 },
    { text: 'Угсралт, суурилуулалт, туршилт', fontSize: 8, color: GRAY_TEXT },
    { text: formatMNT(totalLabor), alignment: 'right', fontSize: 10, font: 'Body' },
  ]);
  ladder.push([
    { text: 'Туслах материал (БНбД auto)', fontSize: 10, color: EMERALD },
    { text: 'Бэхэлгээ · Холбогч · Тусгаарлалт · Газардуулга', fontSize: 8, color: GRAY_TEXT },
    { text: formatMNT(auxSubtotal), alignment: 'right', fontSize: 10, color: EMERALD, bold: true },
  ]);
  ladder.push([
    { text: 'Дэд дүн', bold: true, fontSize: 11 },
    { text: '', fontSize: 8 },
    { text: formatMNT(grandSubtotal), alignment: 'right', bold: true, fontSize: 11 },
  ]);
  if (synergy) {
    ladder.push([
      { text: 'SQUAD Synergy хөнгөлөлт (−10% ажлын хөлс)', fontSize: 10, color: '#b45309' },
      { text: '', fontSize: 8 },
      { text: '− ' + formatMNT(synergyDiscount), alignment: 'right', fontSize: 10, color: '#b45309' },
    ]);
    ladder.push([
      { text: 'Хөнгөлөлтийн дараа', bold: true, fontSize: 11 },
      { text: '', fontSize: 8 },
      { text: formatMNT(afterDiscount), alignment: 'right', bold: true, fontSize: 11 },
    ]);
  }
  if (vatEnabled) {
    ladder.push([
      { text: 'НӨАТ (+10%)', fontSize: 10, color: '#b45309' },
      { text: '', fontSize: 8 },
      { text: '+ ' + formatMNT(vat), alignment: 'right', fontSize: 10, color: '#b45309' },
    ]);
  }
  ladder.push([
    { text: 'ЭЦСИЙН НИЙТ ДҮН', font: 'Display', bold: true, fontSize: 12, color: BRAND, fillColor: '#eff6ff' },
    { text: '', fillColor: '#eff6ff' },
    {
      text: formatMNT(finalTotal),
      alignment: 'right',
      font: 'Display',
      bold: true,
      fontSize: 16,
      color: BRAND,
      fillColor: '#eff6ff',
    },
  ]);

  return [
    h2('Нэгдсэн дүгнэлт'),
    {
      table: { widths: ['*', '*', '*', '*'], body: tileBody },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 0, 0, 24],
    },
    h2('Үнэлгээний тооцоолол'),
    {
      table: { widths: ['*', 'auto', 90], body: ladder, headerRows: 0 },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
        hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? '#0f172a' : GRAY_LINE),
        vLineWidth: () => 0,
        paddingTop: () => 8,
        paddingBottom: () => 8,
      },
    },
    { text: '', pageBreak: 'after' },
  ];
}

function buildSectionPages(inputs: PdfExportInputs): Content[] {
  const out: Content[] = [];
  inputs.sectionTotals.forEach((sec, idx) => {
    out.push({
      columns: [
        {
          stack: [
            { text: sec.source, fontSize: 9, color: GRAY_TEXT, characterSpacing: 2 },
            { text: sec.name, font: 'Display', fontSize: 18, bold: true, margin: [0, 2, 0, 0] },
            {
              text: `${sec.itemCount} нэр төрөл · ${formatShort(sec.material)}₮ мат + ${formatShort(sec.labor)}₮ ажил`,
              fontSize: 9,
              color: GRAY_TEXT,
              margin: [0, 4, 0, 0],
            },
          ],
        },
        {
          stack: [
            { text: 'ДЭД ДҮН', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2, alignment: 'right' },
            {
              text: formatMNT(sec.subtotal),
              font: 'Display',
              fontSize: 16,
              bold: true,
              color: sec.color,
              alignment: 'right',
              margin: [0, 4, 0, 0],
            },
          ],
          width: 180,
        },
      ],
      margin: [0, 0, 0, 14],
    });

    const body: TableCell[][] = [];
    body.push([
      headerCell('№'),
      headerCell('Нэр'),
      headerCell('Тэмдэглэгээ'),
      headerCell('Тоо', 'right'),
      headerCell('Нэгж'),
      headerCell('Нэгж үнэ', 'right'),
      headerCell('Дүн', 'right'),
    ]);
    sec.items.forEach((it, i) => {
      body.push([
        { text: String(i + 1), fontSize: 9, color: GRAY_TEXT },
        { text: it.name, fontSize: 9 },
        { text: it.spec ?? '—', fontSize: 8, color: GRAY_TEXT },
        { text: formatNum(it.qty), alignment: 'right', fontSize: 9, font: 'Body' },
        { text: it.unit, fontSize: 8, color: GRAY_TEXT },
        {
          text: formatNum(Math.round(it.unitPrice * inputs.tierMultiplier)),
          alignment: 'right',
          fontSize: 9,
        },
        {
          text: formatNum(Math.round(it.total)),
          alignment: 'right',
          fontSize: 9,
          bold: true,
        },
      ]);
    });
    // Subtotal row
    body.push([
      { text: '', colSpan: 6, border: [false, true, false, false] } as TableCell,
      {} as TableCell, {} as TableCell, {} as TableCell, {} as TableCell,
      { text: 'ДЭД ДҮН', alignment: 'right', bold: true, fontSize: 9, characterSpacing: 1 },
      {
        text: formatMNT(sec.subtotal),
        alignment: 'right',
        bold: true,
        fontSize: 10,
        color: sec.color,
      },
    ]);

    out.push({
      table: {
        widths: [20, '*', 70, 40, 30, 60, 70],
        headerRows: 1,
        body,
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.3),
        hLineColor: () => GRAY_LINE,
        vLineWidth: () => 0,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
    });
    // Last section doesn't need a trailing page break — aux gets a
    // pageBreak-before instead so we can insert it even if sections fit
    // on fewer pages.
    if (idx < inputs.sectionTotals.length - 1) {
      out.push({ text: '', pageBreak: 'after' });
    }
  });
  return out;
}

function buildAuxPage(inputs: PdfExportInputs): Content[] {
  const body: TableCell[][] = [];
  body.push([
    headerCell('Хэсэг'),
    headerCell('Бүлэг'),
    headerCell('Нэр'),
    headerCell('Тоо', 'right'),
    headerCell('Нэгж'),
    headerCell('Дүн', 'right'),
  ]);

  const orderedSections: SectionId[] = ['cctv', 'fire', 'intercom', 'electrical'];
  orderedSections.forEach((sk) => {
    const rows = inputs.auxiliaryData[sk];
    if (!rows || rows.length === 0) return;
    const sec = inputs.sectionTotals.find((s) => s.id === sk);
    const shortName = sec?.shortName ?? sk;
    rows.forEach((a: ComputedAuxRuntimeItem, i) => {
      body.push([
        { text: i === 0 ? shortName : '', fontSize: 8, color: sec?.color ?? GRAY_TEXT, bold: i === 0 },
        { text: a.group, fontSize: 8, color: GRAY_TEXT },
        { text: a.name, fontSize: 9 },
        { text: formatNum(a.qty), alignment: 'right', fontSize: 9 },
        { text: a.unit, fontSize: 8, color: GRAY_TEXT },
        { text: formatNum(Math.round(a.total)), alignment: 'right', fontSize: 9 },
      ]);
    });
    const auxTotalForSection = inputs.auxTotals[sk] ?? 0;
    body.push([
      { text: '', colSpan: 4, border: [false, true, false, false] } as TableCell,
      {} as TableCell, {} as TableCell, {} as TableCell,
      {
        text: `${shortName} дэд дүн`,
        alignment: 'right',
        bold: true,
        fontSize: 9,
        color: EMERALD,
      },
      {
        text: formatMNT(auxTotalForSection),
        alignment: 'right',
        bold: true,
        fontSize: 9,
        color: EMERALD,
      },
    ]);
  });

  return [
    { text: '', pageBreak: 'before' },
    h2('Туслах материалын задаргаа'),
    {
      text: 'БНбД 43-101-18 болон БНбД 43-103-18 нормд тулгуурлан, үндсэн материалын тоо ширхэг болон кабелийн уртаас автоматаар тооцсон.',
      fontSize: 9,
      color: GRAY_TEXT,
      margin: [0, 0, 0, 14],
    },
    {
      table: {
        widths: [55, 60, '*', 40, 30, 70],
        headerRows: 1,
        body,
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.3),
        hLineColor: () => GRAY_LINE,
        vLineWidth: () => 0,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
    },
    {
      columns: [
        { text: 'Нийт туслах материал', fontSize: 10, color: GRAY_TEXT, margin: [0, 10, 0, 0] },
        {
          text: formatMNT(inputs.auxTotals.grand),
          alignment: 'right',
          font: 'Display',
          fontSize: 14,
          bold: true,
          color: EMERALD,
          margin: [0, 10, 0, 0],
        },
      ],
    },
  ];
}

function buildTermsPage(inputs: PdfExportInputs): Content[] {
  const { synergy, vatEnabled, tier, tierMultiplier, changeLogCount, files, approvalRecord, projectStatus } = inputs;
  const tierLabel = TIER_OPTIONS.find((t) => t.id === tier)?.label ?? 'Standard';
  const today = new Date();
  const validUntil = new Date(today.getTime() + 30 * 86_400_000);

  const terms: Content[] = [
    {
      text: [
        '• Үнэлгээ нь ',
        { text: 'Улаанбаатар Q1 2026', bold: true },
        ' оны зах зээлийн үнэ, БНбД 43-101-18 болон БНбД 43-103-18 нормд тулгуурлан гаргав.',
      ],
      fontSize: 10,
      margin: [0, 0, 0, 6],
    },
    { text: '• Туслах материалын тоо хэмжээг үндсэн материалын тоо ширхэг, кабелийн уртаас автомат тооцоолсон (+15% нөөц).', fontSize: 10, margin: [0, 0, 0, 6] },
    {
      text: [
        '• Материалын чанарын түвшин: ',
        { text: tierLabel, bold: true },
        ` (×${tierMultiplier.toFixed(2)} үржигч).`,
      ],
      fontSize: 10,
      margin: [0, 0, 0, 6],
    },
  ];
  if (synergy) terms.push({ text: '• SQUAD нэгдлийн гишүүн компаниар гүйцэтгэгч байгуулбал ажлын хөлснөөс 10% хасагдана.', fontSize: 10, margin: [0, 0, 0, 6] });
  if (vatEnabled) terms.push({ text: '• Эцсийн дүнд 10% НӨАТ нэмэгдсэн.', fontSize: 10, margin: [0, 0, 0, 6] });
  terms.push({ text: `• Үнийн санал ${formatDateShortMN(validUntil)} хүртэл хүчинтэй.`, fontSize: 10, margin: [0, 0, 0, 6] });
  if (files.length > 0) {
    terms.push({
      text: `• Анализад ашигласан зураг: ${files.map((f) => f.name).join(', ')}.`,
      fontSize: 10,
      margin: [0, 0, 0, 6],
    });
  }
  if (changeLogCount > 0) {
    terms.push({
      text: [
        { text: '• Анхааруулга. ', bold: true, color: '#b45309' },
        `Энэхүү үнийн санал AI-ийн анхны үнэлгээнээс ${changeLogCount} өөрчлөлттэй.`,
      ],
      fontSize: 10,
      margin: [0, 4, 0, 6],
    });
  }
  if (projectStatus !== 'signed' && projectStatus !== 'approved') {
    terms.push({
      text: [
        { text: '⚠ ', color: '#b45309' },
        { text: 'Энэ үнийн санал инженерийн баталгаа аваагүй байна.', color: '#b45309', bold: true },
        ' Захиалагчид албан ёсоор хүлээлгэн өгөхөөс өмнө цахим гарын үсэг авах шаардлагатай.',
      ],
      fontSize: 10,
      margin: [0, 4, 0, 6],
    });
  }

  const sealContent: Content[] = [];
  if ((projectStatus === 'approved' || projectStatus === 'signed') && approvalRecord) {
    sealContent.push({
      table: {
        widths: ['*'],
        body: [[
          {
            stack: [
              {
                text: projectStatus === 'signed' ? '✓ БАТЛАГДСАН · PIN баталгаажуулалттай' : '✓ ЗӨВШӨӨРӨГДСӨН',
                font: 'Display',
                fontSize: 14,
                bold: true,
                color: EMERALD,
                characterSpacing: 2,
              },
              { text: `Инженер: ${approvalRecord.engineerName}`, fontSize: 10, margin: [0, 8, 0, 0] },
              { text: `Лиценз: ${approvalRecord.licenseNumber}`, fontSize: 10, margin: [0, 2, 0, 0] },
              {
                text: `Огноо: ${formatDateTimeMN(approvalRecord.signedAt ?? approvalRecord.decidedAt ?? approvalRecord.submittedAt)}`,
                fontSize: 10,
                margin: [0, 2, 0, 0],
              },
              { text: `Баримт №: ${docNumber(inputs.projectMeta.code)}`, fontSize: 10, margin: [0, 2, 0, 0] },
            ],
            fillColor: '#ecfdf5',
            border: [true, true, true, true],
            borderColor: [EMERALD, EMERALD, EMERALD, EMERALD],
            margin: [16, 16, 16, 16],
          },
        ]],
      },
      layout: { paddingTop: () => 0, paddingBottom: () => 0, paddingLeft: () => 0, paddingRight: () => 0 },
      margin: [0, 20, 0, 0],
    });
  }

  return [
    { text: '', pageBreak: 'before' },
    h2('Тэмдэглэл · Нөхцөл'),
    ...terms,
    {
      columns: [
        {
          stack: [
            { text: 'ГҮЙЦЭТГЭГЧ', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2, margin: [0, 40, 0, 30] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5, lineColor: '#94a3b8' }] },
            { text: '(Гарын үсэг · Тамга)', fontSize: 8, color: GRAY_TEXT, margin: [0, 4, 0, 0] },
            { text: 'Murch Vision AI Estimator v3.0', fontSize: 8, color: GRAY_TEXT, margin: [0, 10, 0, 0] },
          ],
        },
        {
          stack: [
            { text: 'ЗАХИАЛАГЧ', fontSize: 8, color: GRAY_TEXT, characterSpacing: 2, margin: [0, 40, 0, 30] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5, lineColor: '#94a3b8' }] },
            { text: '(Гарын үсэг · Тамга)', fontSize: 8, color: GRAY_TEXT, margin: [0, 4, 0, 0] },
            { text: inputs.projectMeta.clients, fontSize: 8, color: GRAY_TEXT, margin: [0, 10, 0, 0] },
          ],
        },
      ],
      margin: [0, 40, 0, 0],
    },
    ...sealContent,
    {
      text: 'Энэхүү баримт бичгийг Murch Vision AI Estimator-ийн туслалцаатай боловсруулж, лицензтэй инженер хянан баталсан болно.',
      fontSize: 8,
      color: GRAY_TEXT,
      italics: true,
      margin: [0, 40, 0, 0],
      alignment: 'center',
    },
  ];
}

// ─── Helpers ────────────────────────────────────────────────────────────

function h2(text: string): Content {
  return {
    text,
    font: 'Display',
    fontSize: 14,
    bold: true,
    margin: [0, 0, 0, 12],
  };
}

function headerCell(text: string, alignment?: 'left' | 'right' | 'center'): TableCell {
  return {
    text,
    fontSize: 8,
    characterSpacing: 1,
    color: GRAY_TEXT,
    bold: true,
    fillColor: '#f8fafc',
    alignment: alignment ?? 'left',
  };
}

function tileCell(label: string, value: string, color?: string): TableCell {
  return {
    stack: [
      { text: label, fontSize: 8, color: GRAY_TEXT, characterSpacing: 2 },
      { text: value, font: 'Display', fontSize: 15, bold: true, color: color ?? '#0f172a', margin: [0, 6, 0, 0] },
    ],
    fillColor: '#f8fafc',
    border: [true, true, true, true],
    borderColor: [GRAY_LINE, GRAY_LINE, GRAY_LINE, GRAY_LINE],
  };
}

// ─── Public entrypoint ──────────────────────────────────────────────────

export async function exportPdf(inputs: PdfExportInputs): Promise<void> {
  const vfs = await loadFontVfs();

  // pdfmake ships as a CJS module; webpack-style default import via Vite.
  const pdfMakeModule = (await import('pdfmake/build/pdfmake.js')) as unknown as {
    default?: unknown;
    createPdf?: (d: TDocumentDefinitions) => { download: (name: string) => void };
  };
  const pdfMake =
    (pdfMakeModule.default as typeof pdfMakeModule | undefined) ?? pdfMakeModule;

  // Attach our custom VFS and font descriptors.
  // pdfmake's browser build reads these two module-level fields.
  (pdfMake as unknown as { vfs: Record<string, string> }).vfs = vfs;
  (pdfMake as unknown as { fonts: Record<string, unknown> }).fonts = {
    Body: {
      normal: 'NotoSans-Regular.ttf',
      bold: 'NotoSans-Bold.ttf',
      italics: 'NotoSans-Regular.ttf',
      bolditalics: 'NotoSans-Bold.ttf',
    },
    Display: {
      normal: 'Manrope-Variable.ttf',
      bold: 'Manrope-Variable.ttf',
      italics: 'Manrope-Variable.ttf',
      bolditalics: 'Manrope-Variable.ttf',
    },
  };

  const docNo = docNumber(inputs.projectMeta.code);
  const isDraft =
    inputs.projectStatus !== 'signed' && inputs.projectStatus !== 'approved';

  const iconGlyph = sectionIconSymbol('camera');
  void iconGlyph;

  const docDef: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 50],
    defaultStyle: { font: 'Body', fontSize: 10, color: '#0f172a' },
    header: (currentPage) => ({
      columns: [
        {
          stack: [
            { text: 'MURCH VISION', font: 'Display', fontSize: 10, bold: true, color: BRAND },
            { text: `${inputs.projectMeta.name} · ${inputs.projectMeta.code}`, fontSize: 7, color: GRAY_TEXT },
          ],
          margin: [40, 24, 0, 0],
        },
        {
          stack: [
            { text: docNo, fontSize: 8, alignment: 'right', color: GRAY_TEXT, font: 'Body' },
            { text: formatDateShortMN(new Date()), fontSize: 7, alignment: 'right', color: GRAY_TEXT },
          ],
          margin: [0, 24, 40, 0],
        },
      ],
      // Hide header on cover page for cleanliness.
      opacity: currentPage === 1 ? 0 : 1,
    }),
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: 'Murch Vision AI Estimator', fontSize: 7, color: GRAY_TEXT, margin: [40, 20, 0, 0] },
        {
          text: `Хуудас ${currentPage} / ${pageCount}`,
          fontSize: 8,
          alignment: 'right',
          color: GRAY_TEXT,
          margin: [0, 20, 40, 0],
        },
      ],
    }),
    watermark: isDraft
      ? { text: 'НООРОГ', color: '#d1d5db', opacity: 0.15, bold: true, angle: -45, font: 'Display' }
      : undefined,

    content: [
      ...buildCoverPage(inputs, docNo),
      ...buildExecSummary(inputs),
      ...buildSectionPages(inputs),
      ...buildAuxPage(inputs),
      ...buildTermsPage(inputs),
    ],

    info: {
      title: `${inputs.projectMeta.name} · BOQ`,
      author: 'Murch Vision AI Estimator',
      subject: 'Ажлын зардлын хэмжээ (BOQ)',
      creator: 'Murch Vision',
    },
  };

  const filename = `Murch-Vision-${inputs.projectMeta.code.replace(/[^A-Za-z0-9]+/g, '-')}-${formatDateShortMN(new Date()).replace(/\./g, '')}.pdf`;
  (pdfMake as { createPdf: (d: TDocumentDefinitions) => { download: (name: string) => void } })
    .createPdf(docDef)
    .download(filename);
}
