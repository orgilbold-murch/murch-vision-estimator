// Seed builder: extracts INITIAL_DATA + PROJECT_META from the v3 artifact,
// augments every BOQ item with the change-tracking baseline fields, attaches
// deterministic IDs, and writes the full seed JSON set under
// src/data/seed/.
//
// Run: node scripts/build-seed.mjs
//
// Idempotent — running twice produces byte-identical output.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const seedDir = resolve(root, 'src/data/seed');
mkdirSync(seedDir, { recursive: true });

// ─── Extract literals from the artifact ─────────────────────────────────
const jsxSource = readFileSync(
  resolve(root, 'reference/murch_vision_dashboard.jsx'),
  'utf8',
);

function extractDecl(src, regex) {
  const m = src.match(regex);
  if (!m) throw new Error(`no match: ${regex}`);
  return m[0];
}

const initialData = extractDecl(jsxSource, /const INITIAL_DATA = \[[\s\S]*?\n\];/m);
const projectMeta = extractDecl(jsxSource, /const PROJECT_META = \{[\s\S]*?\n\};/m);

const iconStubs = ['Camera', 'Flame', 'Radio', 'Zap']
  .map((n) => `const ${n} = '${n}';`)
  .join('\n');

const sandbox = {
  module: { exports: {} },
  exports: {},
};
vm.createContext(sandbox);
vm.runInContext(
  `
  ${iconStubs}
  ${initialData}
  ${projectMeta}
  module.exports = { INITIAL_DATA, PROJECT_META };
  `,
  sandbox,
);
const { INITIAL_DATA, PROJECT_META } = sandbox.module.exports;

// ─── Build records ──────────────────────────────────────────────────────
const PROJECT_ID = 'prj-bross-c';
const ORG_ID = 'org-murch';
const USER_SALES = 'usr-b-narantuya';
const USER_ENGINEER = 'usr-ts-batbayar';
const USER_ADMIN = 'usr-t-otgonbayar';
const BOOTSTRAP_ISO = '2026-04-15T09:00:00.000Z';

function slug(s) {
  // Mongolian-safe deterministic slug: keep letters/digits, strip rest,
  // lowercase. Not human-readable but stable.
  return String(s).normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '').toLowerCase().slice(0, 24);
}

function makeItemId(sectionId, idx, item) {
  const tail = slug(item.name) || 'item';
  return `${PROJECT_ID}-${sectionId}-${String(idx).padStart(3, '0')}-${tail}`.slice(0, 80);
}

const organizations = [
  { id: ORG_ID, name: 'Мурч Вижн ХХК' },
];

const users = [
  {
    id: USER_ADMIN,
    organizationId: ORG_ID,
    name: 'Т.Отгонбаяр',
    role: 'admin',
    title: 'Үйл ажиллагааны захирал',
  },
  {
    id: USER_ENGINEER,
    organizationId: ORG_ID,
    name: 'Ц.Батбаяр',
    role: 'engineer',
    licenseNumber: '2024-CE-0341',
    licenseExpires: '2028-03-15',
    title: 'Ахлах инженер',
  },
  {
    id: USER_SALES,
    organizationId: ORG_ID,
    name: 'Б.Нарантуяа',
    role: 'sales',
    title: 'Борлуулалтын менежер',
  },
];

// ─── Project records ────────────────────────────────────────────────────
const sectionMetaById = {
  cctv:       { shortName: 'CCTV',         color: '#06b6d4', iconKey: 'camera', source: 'ХД-03',  fullName: 'Хяналтын камерын систем' },
  fire:       { shortName: 'Гал+Зарлан',   color: '#f97316', iconKey: 'flame',  source: 'ХД-03',  fullName: 'Галын дохиолол + Зарлан мэдээлэх' },
  intercom:   { shortName: 'Домофон+IPTV', color: '#a78bfa', iconKey: 'radio',  source: 'ХД-03',  fullName: 'Домофон + IPTV/Сүлжээ' },
  electrical: { shortName: 'Цахилгаан+ДГ', color: '#fbbf24', iconKey: 'zap',    source: 'ХТ-4,5,6', fullName: 'Цахилгаан + Дотор гэрэлтүүлэг' },
};

const sections = INITIAL_DATA.map((sec) => ({
  id: sec.id,
  name: sec.name,
  shortName: sec.shortName,
  color: sec.color,
  source: sec.source,
  iconKey: sectionMetaById[sec.id].iconKey,
}));

// ─── Per-project item generator ─────────────────────────────────────────
// Filters Бросс-С INITIAL_DATA to an evenly-spaced subset and scales
// quantities. Lets us mint realistically-structured secondary projects
// without hand-crafting 72 × 45 = 117 more BOQ rows.
function buildItemsForProject({
  projectId,
  itemFilter,        // (item, idx) => boolean — keep if true
  qtyScale,          // number or fn(item) → number
}) {
  const out = [];
  INITIAL_DATA.forEach((sec) => {
    sec.items.forEach((it, idx) => {
      if (!itemFilter(it, idx)) return;
      const scale = typeof qtyScale === 'function' ? qtyScale(it) : qtyScale;
      const scaledQty = Math.max(1, Math.round(it.qty * scale));
      out.push({
        id: `${projectId}-${sec.id}-${String(idx).padStart(3, '0')}-${slug(it.name) || 'item'}`.slice(0, 80),
        projectId,
        sectionId: sec.id,
        ...(it.subsection !== undefined ? { subsection: it.subsection } : {}),
        name: it.name,
        ...(it.spec !== undefined ? { spec: it.spec } : {}),
        unit: it.unit,
        category: it.category,
        qty: scaledQty,
        unitPrice: it.unitPrice,
        originalQty: scaledQty,
        originalUnitPrice: it.unitPrice,
        isModified: false,
        manualOverride: false,
      });
    });
  });
  return out;
}

// ─── Project 1 · Бросс-С блок (draft) ──────────────────────────────────
const brossItems = buildItemsForProject({
  projectId: PROJECT_ID,
  itemFilter: () => true,
  qtyScale: 1,
});

const brossProject = {
  id: PROJECT_ID,
  organizationId: ORG_ID,
  meta: PROJECT_META,
  status: 'draft',
  createdAt: BOOTSTRAP_ISO,
  updatedAt: BOOTSTRAP_ISO,
  createdBy: USER_SALES,
  settings: { tier: 'standard', synergy: true, vatEnabled: true },
  files: [
    { name: 'Бросс-С_блок-ХД_2026_04_07.pdf',   size: '4.2 MB',  pages: 14, type: 'Холбоо-дохиолол' },
    { name: 'Бросс-С_блок-ХТ_ДГ_2026_04_07.pdf', size: '12.8 MB', pages: 30, type: 'Цахилгаан + Дотор гэрэлтүүлэг' },
  ],
  sectionOrder: ['cctv', 'fire', 'intercom', 'electrical'],
};

// ─── Project 2 · Алтан бодь резиденс (in_review, premium tier) ──────────
const ALTAN_BODY_ID = 'prj-altan-body';
const ALTAN_BODY_SALES_ISO = '2026-04-21T10:30:00.000Z';
const ALTAN_BODY_SUBMIT_ISO = '2026-04-22T14:15:00.000Z';

// Keep every 2nd item (~60%) and scale qty by 0.6 (12/16 floors × apartment mix).
const altanBodyItems = buildItemsForProject({
  projectId: ALTAN_BODY_ID,
  itemFilter: (_, idx) => idx % 2 === 0,
  qtyScale: (it) => (['иж', 'ш'].includes(it.unit) && it.qty <= 3 ? 1 : 0.6),
});

// Apply 3 pre-existing modifications for demo (shows diff indicators at boot).
const altanBodyMods = [
  { findIdx: 0, qtyScale: 1.4, reason: 'NVR 48-суваг шаардлагатай' },
  { findIdx: 2, priceScale: 0.92, reason: 'Нийлүүлэгчтэй тохиролцож бууруулсан' },
  { findIdx: 6, qtyScale: 1.2, reason: 'Байрны тоог шинэчилсэн' },
];
const altanChangeLog = [];
altanBodyMods.forEach((m, i) => {
  const item = altanBodyItems[m.findIdx];
  if (!item) return;
  const originalQty = item.qty;
  const originalPrice = item.unitPrice;
  if (m.qtyScale) {
    const newQty = Math.round(originalQty * m.qtyScale);
    item.qty = newQty;
    item.isModified = true;
    altanChangeLog.push({
      id: `cl-altan-${String(i).padStart(3, '0')}`,
      projectId: ALTAN_BODY_ID,
      itemId: item.id,
      itemKind: 'boq',
      sectionId: item.sectionId,
      field: 'qty',
      before: originalQty,
      after: newQty,
      deltaPct: ((newQty - originalQty) / originalQty) * 100,
      userId: USER_SALES,
      at: `2026-04-22T${String(9 + i).padStart(2, '0')}:${String(15 + i * 7).padStart(2, '0')}:00.000Z`,
      note: m.reason,
    });
  }
  if (m.priceScale) {
    const newPrice = Math.round(originalPrice * m.priceScale);
    item.unitPrice = newPrice;
    item.isModified = true;
    altanChangeLog.push({
      id: `cl-altan-p${String(i).padStart(3, '0')}`,
      projectId: ALTAN_BODY_ID,
      itemId: item.id,
      itemKind: 'boq',
      sectionId: item.sectionId,
      field: 'unitPrice',
      before: originalPrice,
      after: newPrice,
      deltaPct: ((newPrice - originalPrice) / originalPrice) * 100,
      userId: USER_SALES,
      at: `2026-04-22T${String(9 + i).padStart(2, '0')}:${String(30 + i * 7).padStart(2, '0')}:00.000Z`,
      note: m.reason,
    });
  }
});

const altanBodyProject = {
  id: ALTAN_BODY_ID,
  organizationId: ORG_ID,
  meta: {
    code: 'ЗП-26-01-047',
    name: 'Алтан бодь резиденс',
    subtitle: '12 давхар, 48 айл',
    clients: '"АЛТАН БОДЬ ПРОПЕРТИЗ" ХХК',
    location: 'Улаанбаатар · Сүхбаатар дүүрэг · 1 хороо',
    area: '~5,200 м²',
    pageCountHD: 11,
    pageCountHT: 22,
  },
  status: 'in_review',
  createdAt: ALTAN_BODY_SALES_ISO,
  updatedAt: ALTAN_BODY_SUBMIT_ISO,
  createdBy: USER_SALES,
  settings: { tier: 'premium', synergy: true, vatEnabled: true },
  files: [
    { name: 'Алтан-бодь-ХД_2026_04_18.pdf',    size: '3.4 MB',  pages: 11, type: 'Холбоо-дохиолол' },
    { name: 'Алтан-бодь-ХТ_ДГ_2026_04_18.pdf', size: '9.8 MB',  pages: 22, type: 'Цахилгаан + Дотор гэрэлтүүлэг' },
  ],
  sectionOrder: ['cctv', 'fire', 'intercom', 'electrical'],
};

const altanApproval = {
  id: 'apr-altan-001',
  projectId: ALTAN_BODY_ID,
  status: 'pending',
  engineerId: USER_ENGINEER,
  engineerName: 'Ц.Батбаяр',
  licenseNumber: '2024-CE-0341',
  licenseExpires: '2028-03-15',
  submittedBy: USER_SALES,
  submittedAt: ALTAN_BODY_SUBMIT_ISO,
  note: 'Захиалагч 2026-05-15 хүртэл баталгаажуулах шаардлагатай гэж байна.',
  snapshotHash: 'seed-altan-01',
};

// ─── Project 3 · Үндэсний номын сан шинэчлэл (signed) ──────────────────
const LIBRARY_ID = 'prj-library';
const LIB_CREATED_ISO = '2026-04-10T09:00:00.000Z';
const LIB_SUBMITTED_ISO = '2026-04-15T14:00:00.000Z';
const LIB_DECIDED_ISO = '2026-04-16T11:30:00.000Z';
const LIB_SIGNED_ISO = '2026-04-16T11:45:00.000Z';

// Keep every 3rd item and scale qty by 0.35 (3 floors renovation vs 16 new-build).
const libraryItems = buildItemsForProject({
  projectId: LIBRARY_ID,
  itemFilter: (_, idx) => idx % 3 === 0,
  qtyScale: 0.35,
});

const libraryProject = {
  id: LIBRARY_ID,
  organizationId: ORG_ID,
  meta: {
    code: 'ЗП-26-02-012',
    name: 'Үндэсний номын сан шинэчлэл',
    subtitle: '3 давхар, олон нийтийн барилга',
    clients: '"НИЙСЛЭЛИЙН НОМЫН САНГИЙН ГАЗАР"',
    location: 'Улаанбаатар · Чингэлтэй дүүрэг · 5 хороо',
    area: '~2,800 м²',
    pageCountHD: 6,
    pageCountHT: 14,
  },
  status: 'signed',
  createdAt: LIB_CREATED_ISO,
  updatedAt: LIB_SIGNED_ISO,
  createdBy: USER_SALES,
  settings: { tier: 'standard', synergy: false, vatEnabled: true },
  files: [
    { name: 'Номын-сан-ХД_2026_04_05.pdf',    size: '1.8 MB', pages: 6,  type: 'Холбоо-дохиолол' },
    { name: 'Номын-сан-ХТ_ДГ_2026_04_05.pdf', size: '5.2 MB', pages: 14, type: 'Цахилгаан + Дотор гэрэлтүүлэг' },
  ],
  sectionOrder: ['cctv', 'fire', 'intercom', 'electrical'],
};

const libraryApproval = {
  id: 'apr-library-001',
  projectId: LIBRARY_ID,
  status: 'signed',
  engineerId: USER_ENGINEER,
  engineerName: 'Ц.Батбаяр',
  licenseNumber: '2024-CE-0341',
  licenseExpires: '2028-03-15',
  submittedBy: USER_SALES,
  submittedAt: LIB_SUBMITTED_ISO,
  decidedAt: LIB_DECIDED_ISO,
  signedAt: LIB_SIGNED_ISO,
  snapshotHash: 'seed-library-01',
};

// ─── Combine ────────────────────────────────────────────────────────────
const items = [...brossItems, ...altanBodyItems, ...libraryItems];
const projects = [brossProject, altanBodyProject, libraryProject];
const approvals = [altanApproval, libraryApproval];
const changeLog = [...altanChangeLog];

// ─── Write JSONs ────────────────────────────────────────────────────────
function writeJSON(name, data) {
  const p = resolve(seedDir, name);
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${name} (${JSON.stringify(data).length} chars)`);
}

writeJSON('organizations.json', organizations);
writeJSON('users.json', users);
writeJSON('projects.json', projects);
writeJSON('sections.json', sections);
writeJSON('items.json', items);
writeJSON('approvals.json', approvals);
writeJSON('changeLog.json', changeLog);
// suppliers.json + catalog.json are owned by build-catalog-seed.mjs.

console.log(`\nseed stats:`);
console.log(`  organizations: ${organizations.length}`);
console.log(`  users:         ${users.length}`);
console.log(`  projects:      ${projects.length}`);
console.log(`  sections:      ${sections.length}`);
console.log(`  items:         ${items.length}`);
console.log(`    ${brossItems.length.toString().padStart(3)} · Бросс-С блок`);
console.log(`    ${altanBodyItems.length.toString().padStart(3)} · Алтан бодь резиденс`);
console.log(`    ${libraryItems.length.toString().padStart(3)} · Үндэсний номын сан`);
console.log(`  approvals:     ${approvals.length}`);
console.log(`  changeLog:     ${changeLog.length}`);

// Sanity check: every item has change-tracking fields.
const missing = items.filter(
  (i) =>
    i.originalQty === undefined ||
    i.originalUnitPrice === undefined ||
    i.isModified === undefined ||
    i.manualOverride === undefined,
);
if (missing.length > 0) {
  console.error(`FAIL: ${missing.length} items missing change-tracking fields`);
  process.exit(1);
}
console.log('\nall items have change-tracking baseline fields.');
