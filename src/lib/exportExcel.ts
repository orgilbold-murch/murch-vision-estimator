// ═══════════════════════════════════════════════════════════════════════════
// exportExcel — SheetJS (xlsx) export with 7 sheets:
//   Тойм · CCTV · Гал+Зарлан · Домофон+IPTV · Цахилгаан+ДГ · Туслах · Өөрчлөлт
//
// Mongolian Cyrillic is preserved natively by xlsx (UTF-16 internally).
// Column widths are set explicitly so the Mongolian text doesn't squish.
// ═══════════════════════════════════════════════════════════════════════════

import * as XLSX from 'xlsx';

import type {
  AuxiliaryBySection,
  AuxTotals,
  ChangeLogEntry,
  ComputedSection,
  ProjectMeta,
  SectionId,
  TierId,
  User,
} from '@/types';
import { TIER_OPTIONS } from '@/lib/tiers';
import { formatDateShortMN, formatDateTimeMN } from '@/lib/date';

export interface ExcelExportInputs {
  projectMeta: ProjectMeta;
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
  totalItems: number;
  totalAuxItems: number;
  totalCableMeters: number;
  changeLog: ChangeLogEntry[];
  users: User[];
}

export function exportExcel(inputs: ExcelExportInputs): void {
  const wb = XLSX.utils.book_new();

  addSummarySheet(wb, inputs);
  inputs.sectionTotals.forEach((section) => {
    addSectionSheet(wb, section, inputs.tierMultiplier);
  });
  addAuxSheet(wb, inputs);
  addChangeLogSheet(wb, inputs);

  const filename = `Murch-Vision-${inputs.projectMeta.code.replace(/[^A-Za-z0-9]+/g, '-')}-${formatDateShortMN(new Date()).replace(/\./g, '')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─── Тойм ───────────────────────────────────────────────────────────────

function addSummarySheet(wb: XLSX.WorkBook, inputs: ExcelExportInputs): void {
  const tierLabel = TIER_OPTIONS.find((t) => t.id === inputs.tier)?.label ?? 'Standard';
  const today = new Date();
  const rows: (string | number | null)[][] = [
    ['Murch Vision AI Estimator · Үнийн саналын тойм', null, null],
    [null, null, null],
    ['Төсөл', inputs.projectMeta.name, null],
    ['Дэд гарчиг', inputs.projectMeta.subtitle, null],
    ['Код', inputs.projectMeta.code, null],
    ['Захиалагч', inputs.projectMeta.clients, null],
    ['Байршил', inputs.projectMeta.location, null],
    ['Талбай', inputs.projectMeta.area, null],
    ['Боловсруулсан огноо', formatDateShortMN(today), null],
    [null, null, null],
    ['Тооцооллын тохиргоо', null, null],
    ['Материалын түвшин', tierLabel, `× ${inputs.tierMultiplier.toFixed(2)}`],
    ['SQUAD Synergy', inputs.synergy ? 'Идэвхитэй (−10%)' : 'Унтраалттай', null],
    ['НӨАТ', inputs.vatEnabled ? 'Нэмэгдэнэ (+10%)' : 'Хасагдсан', null],
    [null, null, null],
    ['Статистик', null, null],
    ['Нэр төрөл (үндсэн)', inputs.totalItems, null],
    ['Нэр төрөл (туслах)', inputs.totalAuxItems, null],
    ['Кабелийн нийт урт', inputs.totalCableMeters, 'м'],
    [null, null, null],
    ['Үнэлгээний тооцоолол', null, null],
    ['Үндсэн материал', inputs.totalMaterial, '₮'],
    ['Ажлын хөлс', inputs.totalLabor, '₮'],
    ['Туслах материал', inputs.auxSubtotal, '₮'],
    ['Дэд дүн', inputs.grandSubtotal, '₮'],
  ];
  if (inputs.synergy) {
    rows.push(['SQUAD хөнгөлөлт', -inputs.synergyDiscount, '₮']);
    rows.push(['Хөнгөлөлтийн дараа', inputs.afterDiscount, '₮']);
  }
  if (inputs.vatEnabled) {
    rows.push(['НӨАТ', inputs.vat, '₮']);
  }
  rows.push(['ЭЦСИЙН НИЙТ ДҮН', inputs.finalTotal, '₮']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 36 }, { wch: 40 }, { wch: 10 }];
  applyNumberFormatToColumn(ws, 1, '#,##0');
  XLSX.utils.book_append_sheet(wb, ws, 'Тойм');
}

// ─── Section sheets ─────────────────────────────────────────────────────

function addSectionSheet(wb: XLSX.WorkBook, section: ComputedSection, tierMultiplier: number): void {
  const rows: (string | number | null)[][] = [
    [`${section.name} · ${section.source}`, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [
      '№',
      'Дэд хэсэг',
      'Нэр',
      'Тэмдэглэгээ',
      'Тоо',
      'Нэгж',
      'Нэгж үнэ (₮)',
      'Ангилал',
      'Дүн (₮)',
    ],
  ];
  section.items.forEach((it, i) => {
    rows.push([
      i + 1,
      it.subsection ?? '—',
      it.name,
      it.spec ?? '—',
      it.qty,
      it.unit,
      Math.round(it.unitPrice * tierMultiplier),
      it.category === 'labor' ? 'Ажил' : 'Материал',
      Math.round(it.total),
    ]);
  });
  // Totals
  rows.push([]);
  rows.push([null, null, null, null, null, null, null, 'Материал дүн', Math.round(section.material)]);
  rows.push([null, null, null, null, null, null, null, 'Ажил дүн', Math.round(section.labor)]);
  rows.push([null, null, null, null, null, null, null, 'ДЭД ДҮН', Math.round(section.subtotal)]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 4 },
    { wch: 28 },
    { wch: 38 },
    { wch: 22 },
    { wch: 10 },
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
  ];
  applyNumberFormatToColumn(ws, 4, '#,##0');
  applyNumberFormatToColumn(ws, 6, '#,##0 ₮');
  applyNumberFormatToColumn(ws, 8, '#,##0 ₮');
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName(section.shortName));
}

// ─── Aux ────────────────────────────────────────────────────────────────

function addAuxSheet(wb: XLSX.WorkBook, inputs: ExcelExportInputs): void {
  const rows: (string | number | null)[][] = [
    ['Туслах материалын задаргаа (БНбД auto)', null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    ['Хэсэг', 'Бүлэг', 'Нэр', 'Томьёо', 'Тоо', 'Нэгж', 'Нэгж үнэ (₮)', 'Дүн (₮)'],
  ];
  const orderedSections: SectionId[] = ['cctv', 'fire', 'intercom', 'electrical'];
  orderedSections.forEach((sk) => {
    const items = inputs.auxiliaryData[sk];
    if (!items || items.length === 0) return;
    const secName = inputs.sectionTotals.find((s) => s.id === sk)?.shortName ?? sk;
    items.forEach((a) => {
      rows.push([
        secName,
        a.group,
        a.name,
        a.formula ?? '—',
        a.qty,
        a.unit,
        Math.round(a.unitPriceAdjusted),
        Math.round(a.total),
      ]);
    });
    rows.push([null, null, null, null, null, null, `${secName} дэд дүн`, Math.round(inputs.auxTotals[sk] ?? 0)]);
    rows.push([null, null, null, null, null, null, null, null]);
  });
  rows.push([null, null, null, null, null, null, 'НИЙТ ТУСЛАХ', Math.round(inputs.auxTotals.grand)]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 38 },
    { wch: 28 },
    { wch: 10 },
    { wch: 8 },
    { wch: 14 },
    { wch: 16 },
  ];
  applyNumberFormatToColumn(ws, 4, '#,##0');
  applyNumberFormatToColumn(ws, 6, '#,##0 ₮');
  applyNumberFormatToColumn(ws, 7, '#,##0 ₮');
  XLSX.utils.book_append_sheet(wb, ws, 'Туслах');
}

// ─── Change log ─────────────────────────────────────────────────────────

function addChangeLogSheet(wb: XLSX.WorkBook, inputs: ExcelExportInputs): void {
  const rows: (string | number | null)[][] = [
    ['Өөрчлөлтийн түүх', null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['Огноо', 'Хэсэг', 'Материал', 'Талбар', 'Анхны утга', 'Шинэ утга', 'Δ %', 'Хэрэглэгч', 'Тэмдэглэл'],
  ];
  const projectLog = inputs.changeLog.filter((e) => e.itemId !== undefined);
  if (projectLog.length === 0) {
    rows.push(['—', null, null, null, null, null, null, null, null]);
  } else {
    projectLog.forEach((e) => {
      const userName = inputs.users.find((u) => u.id === e.userId)?.name ?? e.userId;
      const sectionName =
        e.sectionId && inputs.sectionTotals.find((s) => s.id === e.sectionId)?.shortName;
      rows.push([
        formatDateTimeMN(e.at),
        sectionName ?? '—',
        '—', // name is ItemId; harvesting from items would require a lookup; keep placeholder for now
        fieldLabel(e.field),
        typeof e.before === 'number' ? e.before : String(e.before),
        typeof e.after === 'number' ? e.after : String(e.after),
        typeof e.deltaPct === 'number' ? Number(e.deltaPct.toFixed(1)) : '—',
        userName,
        e.note ?? '—',
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 20 },
    { wch: 16 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 8 },
    { wch: 18 },
    { wch: 32 },
  ];
  applyNumberFormatToColumn(ws, 4, '#,##0');
  applyNumberFormatToColumn(ws, 5, '#,##0');
  applyNumberFormatToColumn(ws, 6, '0.0 "%"');
  XLSX.utils.book_append_sheet(wb, ws, 'Өөрчлөлт');
}

function fieldLabel(field: string): string {
  const m: Record<string, string> = {
    qty: 'Тоо',
    unitPrice: 'Нэгж үнэ',
    supplierId: 'Нийлүүлэгч',
    'settings.tier': 'Түвшин',
    'settings.synergy': 'SQUAD',
    'settings.vatEnabled': 'НӨАТ',
    auxQty: 'Туслах тоо',
    auxUnitPrice: 'Туслах үнэ',
  };
  return m[field] ?? field;
}

// ─── Utilities ──────────────────────────────────────────────────────────

function safeSheetName(name: string): string {
  // Excel sheet names must be ≤31 chars and can't contain: [ ] : * ? / \
  return name
    .replace(/[[\]:*?/\\]/g, '-')
    .slice(0, 31);
}

function applyNumberFormatToColumn(
  ws: XLSX.WorkSheet,
  colIndex: number,
  format: string,
): void {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let r = range.s.r; r <= range.e.r; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: colIndex });
    const cell = ws[addr];
    if (cell && typeof cell.v === 'number') {
      cell.z = format;
    }
  }
}
