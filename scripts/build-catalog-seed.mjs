// ═══════════════════════════════════════════════════════════════════════════
// Catalog seed generator — builds suppliers.json + catalog.json from
// template definitions so the 230-item catalog stays organic and easy
// to tweak.
//
// Rules (from the Phase 6 brief):
//   - Realistic UB Q1 2026 prices
//   - ±8% jitter on the nominal price
//   - stockStatus weighted 70% in_stock / 20% order / 10% out_of_stock
//   - priceUpdatedAt weighted toward recent (60% <30d, 30% 30–90d, 10% >90d)
//   - 10–15 outlier items (±35–55% price swing) to make comparison interesting
//
// Deterministic — a seeded LCG keeps output stable across runs so the
// catalog doesn't drift between commits.
// ═══════════════════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const seedDir = resolve(root, 'src/data/seed');
mkdirSync(seedDir, { recursive: true });

// ─── Deterministic PRNG ────────────────────────────────────────────────
// LCG with an arbitrary-but-fixed seed. Every invocation of build-catalog
// produces byte-identical output.
let prngState = 0x12345678;
function rand() {
  prngState = (prngState * 1103515245 + 12345) & 0x7fffffff;
  return prngState / 0x7fffffff;
}
function randInt(lo, hi) { return Math.floor(rand() * (hi - lo + 1)) + lo; }
function jitter(base, pct) { return Math.round(base * (1 + (rand() * 2 - 1) * pct)); }
function pickWeighted(items) {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = rand() * total;
  for (const it of items) {
    r -= it.w;
    if (r <= 0) return it.v;
  }
  return items[items.length - 1].v;
}
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

// ─── Shared helpers ────────────────────────────────────────────────────
const STOCK_DISTRIBUTION = [
  { v: 'in_stock', w: 70 },
  { v: 'order', w: 20 },
  { v: 'out_of_stock', w: 10 },
];

const NOW = Date.UTC(2026, 3, 24); // aligned with the demo clock

function randomPriceUpdatedAt() {
  // Weighted: 60% <30d, 30% 30–90d, 10% 90–180d.
  const bucket = pickWeighted([
    { v: 'recent', w: 60 },
    { v: 'mid', w: 30 },
    { v: 'old', w: 10 },
  ]);
  let days;
  if (bucket === 'recent') days = randInt(0, 29);
  else if (bucket === 'mid') days = randInt(30, 89);
  else days = randInt(90, 180);
  return new Date(NOW - days * 86_400_000).toISOString();
}

function makeId(supplierId, index, name) {
  const slug = String(name)
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return `${supplierId}-${String(index).padStart(3, '0')}-${slug}`;
}

function isOutlierIndex(n, total, outlierCount) {
  // Deterministic slots for outliers — evenly spaced.
  const step = Math.floor(total / outlierCount);
  return step > 0 && n % step === 0 && n > 0 && n <= outlierCount * step;
}

// ─── Suppliers ─────────────────────────────────────────────────────────
const suppliers = [
  { id: 'sup-microtech',   name: 'МикроТех Монгол ХХК',   categories: ['cctv', 'drone_security'], country: 'Монгол (импорт)',  contact: '+976 7711-2233' },
  { id: 'sup-tsakhilgaan', name: 'Цахилгаан Импорт ХХК',  categories: ['electrical', 'cable'],    country: 'Солонгос/Хятад импорт', contact: '+976 7722-3344' },
  { id: 'sup-gereltuulge', name: 'Гэрэлтүүлэг Плюс ХХК',  categories: ['lighting'],               country: 'ЕХ/Солонгос импорт', contact: '+976 7733-4455' },
  { id: 'sup-bekhelgee',   name: 'Монгол Бэхэлгээ ХХК',   categories: ['auxiliary'],              country: 'Хятад/Монгол',     contact: '+976 7744-5566' },
];

// ─── Supplier 1 · МикроТех — CCTV + drone ──────────────────────────────
function generateMicroTech(supplierId) {
  const items = [];
  let idx = 0;

  // Hikvision IP cameras — 4 base × 3 variants × 3 lenses = 36 items
  const HIKVISION_CAMS = [
    { base: 'DS-2CD2143G2',  mp: '4MP',  type: 'Dome',   nominal: 420_000, manufacturer: 'Hikvision' },
    { base: 'DS-2CD2T63G2',  mp: '6MP',  type: 'Bullet', nominal: 580_000, manufacturer: 'Hikvision' },
    { base: 'IPC-HFW2439S',  mp: '4MP',  type: 'Bullet', nominal: 380_000, manufacturer: 'Dahua' },
    { base: 'IPC-HDW3541TM', mp: '5MP',  type: 'Dome',   nominal: 495_000, manufacturer: 'Dahua' },
  ];
  const VARIANTS = ['I', 'IS', 'IU'];
  const LENSES = ['2.8mm', '4mm', '6mm'];
  HIKVISION_CAMS.forEach((cam) => {
    VARIANTS.forEach((v) => {
      LENSES.forEach((l) => {
        const name = `${cam.mp} ${cam.type} IP камер ${l}`;
        const code = `${cam.base}-${v}-${l.replace(/[^0-9]/g, '')}`;
        const price = jitter(cam.nominal, 0.08);
        items.push({
          supplierId,
          category: 'cctv',
          name,
          code,
          spec: `${cam.mp} · ${l} lens · PoE · IP67`,
          manufacturer: cam.manufacturer,
          origin: 'Хятад',
          unit: 'ш',
          price,
          warranty: '2 жил',
          stockStatus: pickWeighted(STOCK_DISTRIBUTION),
          priceUpdatedAt: randomPriceUpdatedAt(),
          _idx: idx++,
        });
      });
    });
  });

  // NVRs
  const NVRS = [
    { ch: 8,  brand: 'Hikvision', code: 'DS-7608NI-K1',    nominal: 1_850_000 },
    { ch: 16, brand: 'Hikvision', code: 'DS-7616NI-I2/16P',nominal: 3_400_000 },
    { ch: 16, brand: 'Dahua',     code: 'NVR4216-16P-4KS2',nominal: 3_100_000 },
    { ch: 32, brand: 'Hikvision', code: 'DS-7732NI-I4',    nominal: 5_800_000 },
    { ch: 48, brand: 'Hikvision', code: 'DS-9648NI-I8',    nominal: 8_200_000 },
  ];
  NVRS.forEach((n) => {
    items.push({
      supplierId,
      category: 'cctv',
      name: `NVR ${n.ch} суваг бичлэгийн төхөөрөмж`,
      code: n.code,
      spec: `${n.ch}ch IP · 4K · H.265+`,
      manufacturer: n.brand,
      origin: 'Хятад',
      unit: 'ш',
      price: jitter(n.nominal, 0.07),
      warranty: '3 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // PoE switches
  const POE_SWITCHES = [
    { ports: 4,  code: 'DS-3E0105P-E', nominal: 280_000 },
    { ports: 8,  code: 'DS-3E0310P-E', nominal: 480_000 },
    { ports: 16, code: 'DS-3E0318P-E', nominal: 920_000 },
    { ports: 24, code: 'DS-3E1326P-SI',nominal: 1_650_000 },
  ];
  POE_SWITCHES.forEach((s) => {
    items.push({
      supplierId,
      category: 'cctv',
      name: `PoE Switch ${s.ports}-порт`,
      code: s.code,
      spec: `${s.ports}×PoE+ · 120W total budget`,
      manufacturer: 'Hikvision',
      origin: 'Хятад',
      unit: 'ш',
      price: jitter(s.nominal, 0.08),
      warranty: '3 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // PTZ
  const PTZS = [
    { code: 'DS-2DE4425IW-DE', nominal: 2_450_000, zoom: '25×' },
    { code: 'DS-2DE5225IW-AE', nominal: 3_650_000, zoom: '25×' },
    { code: 'SD50230U-HNI',    nominal: 2_980_000, zoom: '30×' },
  ];
  PTZS.forEach((p) => {
    items.push({
      supplierId,
      category: 'cctv',
      name: `PTZ камер 4MP · ${p.zoom} zoom`,
      code: p.code,
      spec: `${p.zoom} optical zoom · IP67 · IR 200m`,
      manufacturer: p.code.startsWith('SD') ? 'Dahua' : 'Hikvision',
      origin: 'Хятад',
      unit: 'ш',
      price: jitter(p.nominal, 0.08),
      warranty: '2 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Drones
  const DRONES = [
    { code: 'DJI-MAVIC-3E',     name: 'DJI Mavic 3 Enterprise',         nominal: 9_800_000,  mfr: 'DJI',   origin: 'Хятад' },
    { code: 'DJI-MAVIC-3T',     name: 'DJI Mavic 3 Thermal',            nominal: 14_500_000, mfr: 'DJI',   origin: 'Хятад' },
    { code: 'DJI-MATRICE-30T',  name: 'DJI Matrice 30T (thermal)',      nominal: 22_800_000, mfr: 'DJI',   origin: 'Хятад' },
    { code: 'DJI-MATRICE-350',  name: 'DJI Matrice 350 RTK',            nominal: 28_500_000, mfr: 'DJI',   origin: 'Хятад' },
    { code: 'AUTEL-EVO-II',     name: 'Autel EVO II Pro 6K',            nominal: 7_950_000,  mfr: 'Autel', origin: 'Хятад' },
    { code: 'AUTEL-EVO-MAX',    name: 'Autel EVO Max 4T',               nominal: 11_800_000, mfr: 'Autel', origin: 'Хятад' },
    { code: 'DJI-ZENMUSE-H20T', name: 'DJI Zenmuse H20T gimbal (payload)', nominal: 13_500_000, mfr: 'DJI', origin: 'Хятад' },
    { code: 'PARROT-ANAFI-USA', name: 'Parrot Anafi USA (secure)',      nominal: 10_200_000, mfr: 'Parrot', origin: 'Франц' },
  ];
  DRONES.forEach((d) => {
    items.push({
      supplierId,
      category: 'drone_security',
      name: d.name,
      code: d.code,
      spec: 'Контролер + батарей + хамгаалалтын бүрхүүлтэй',
      manufacturer: d.mfr,
      origin: d.origin,
      unit: 'иж',
      price: jitter(d.nominal, 0.06),
      warranty: '1 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  return items;
}

// ─── Supplier 2 · Цахилгаан Импорт — electrical + cable ────────────────
function generateTsakhilgaan(supplierId) {
  const items = [];
  let idx = 0;

  // ВА88 breakers (LS/Schneider/ABB) — 3P × ratings
  const VA88_RATINGS = [63, 80, 100, 125, 160];
  const VA88_BRANDS = ['LS Electric', 'Schneider Electric', 'ABB'];
  VA88_RATINGS.forEach((a) => {
    VA88_BRANDS.forEach((brand) => {
      const basePrice = 180_000 + a * 800;
      items.push({
        supplierId,
        category: 'electrical',
        name: `ВА88-32 автомат 3P ${a}A`,
        code: `VA88-3P-${a}A-${brand.split(' ')[0].toUpperCase()}`,
        spec: `3P · ${a}A · 35kA · breaking capacity`,
        manufacturer: brand,
        origin: brand.includes('LS') ? 'Солонгос' : brand.includes('Schneider') ? 'Франц' : 'Герман',
        unit: 'ш',
        price: jitter(basePrice, 0.08),
        warranty: '3 жил',
        stockStatus: pickWeighted(STOCK_DISTRIBUTION),
        priceUpdatedAt: randomPriceUpdatedAt(),
        _idx: idx++,
      });
    });
  });

  // ВА47 — 1P/2P/3P × amps
  const VA47_RATINGS = [16, 20, 25, 32, 40, 50, 63];
  const VA47_POLES = [1, 2, 3];
  VA47_RATINGS.forEach((a) => {
    VA47_POLES.forEach((p) => {
      if (a > 50 && p === 1) return; // not a common combo
      const basePrice = 12_000 + a * 380 + p * 8_000;
      items.push({
        supplierId,
        category: 'electrical',
        name: `ВА47-29 автомат ${p}P ${a}A`,
        code: `VA47-${p}P-${a}A`,
        spec: `${p}P · ${a}A · C-curve · 4.5kA`,
        manufacturer: 'LS Electric',
        origin: 'Солонгос',
        unit: 'ш',
        price: jitter(basePrice, 0.08),
        warranty: '2 жил',
        stockStatus: pickWeighted(STOCK_DISTRIBUTION),
        priceUpdatedAt: randomPriceUpdatedAt(),
        _idx: idx++,
      });
    });
  });

  // АД12 differential
  [
    { a: 16,  mA: 10,  nominal: 72_000 },
    { a: 25,  mA: 10,  nominal: 95_000 },
    { a: 25,  mA: 30,  nominal: 98_000 },
    { a: 40,  mA: 30,  nominal: 135_000 },
    { a: 63,  mA: 30,  nominal: 185_000 },
    { a: 63,  mA: 100, nominal: 195_000 },
  ].forEach((d) => {
    items.push({
      supplierId,
      category: 'electrical',
      name: `АД12 дифференциал автомат ${d.a}A/${d.mA}mA`,
      code: `AD12-${d.a}A-${d.mA}mA`,
      spec: `${d.a}A · ${d.mA}mA · type A`,
      manufacturer: 'IEK',
      origin: 'Орос',
      unit: 'ш',
      price: jitter(d.nominal, 0.08),
      warranty: '2 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // ВД1
  [16, 25, 40, 63, 80].forEach((a) => {
    items.push({
      supplierId,
      category: 'electrical',
      name: `ВД1-63 автомат 2P ${a}A`,
      code: `VD1-2P-${a}A`,
      spec: `2P · ${a}A · 30mA residual current`,
      manufacturer: 'IEK',
      origin: 'Орос',
      unit: 'ш',
      price: jitter(50_000 + a * 600, 0.08),
      warranty: '2 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Panels
  const PANELS = [
    { code: 'PANEL-ЕС-3800', name: 'Ерөнхий самбар ЕС',            nominal: 3_800_000, spec: '1320x750x300 IP54' },
    { code: 'PANEL-БТАЗС',   name: 'Бэлтгэл тэжээлийн самбар БТАЗС', nominal: 2_800_000, spec: '1320x750x300 IP54' },
    { code: 'PANEL-ГС-01',   name: 'Гэрлийн самбар ГС',             nominal: 850_000,   spec: '550x320x120 IP30' },
    { code: 'PANEL-TC-395',  name: 'Тоолууртай самбар ТС',          nominal: 620_000,   spec: '395x310x165 IP30' },
    { code: 'PANEL-AC-15',   name: 'Айлын самбар АС (ЩРВ-П-15)',    nominal: 280_000,   spec: 'ЩРВ-П-15 · 15 модуль' },
    { code: 'PANEL-DAVHRYN', name: 'Давхрын самбар (ЩЭ 5)',          nominal: 720_000,   spec: 'ЩЭ 5 · metal enclosure' },
  ];
  PANELS.forEach((p) => {
    items.push({
      supplierId,
      category: 'electrical',
      name: p.name,
      code: p.code,
      spec: p.spec,
      manufacturer: 'Schneider Electric',
      origin: 'Франц',
      unit: 'ш',
      price: jitter(p.nominal, 0.08),
      warranty: '5 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Cables — cross-sections × types
  const CABLES = [
    { type: 'ПВ-660',  size: '1x1.5мм²',  nominal: 1_200 },
    { type: 'ПВ-660',  size: '1x2.5мм²',  nominal: 1_800 },
    { type: 'ПВ-660',  size: '1x4мм²',    nominal: 2_400 },
    { type: 'ПВ-660',  size: '1x6мм²',    nominal: 3_600 },
    { type: 'ПВ-660',  size: '1x10мм²',   nominal: 5_500 },
    { type: 'ВВГ-660', size: '3x1.5мм²',  nominal: 3_500 },
    { type: 'ВВГ-660', size: '3x2.5мм²',  nominal: 5_200 },
    { type: 'ВВГ-660', size: '5x4мм²',    nominal: 7_500 },
    { type: 'ВВГ-660', size: '5x6мм²',    nominal: 8_500 },
    { type: 'ВВГ-660', size: '5x10мм²',   nominal: 14_000 },
    { type: 'ВВГ-660', size: '5x16мм²',   nominal: 22_000 },
    { type: 'ВВГ-660', size: '5x25мм²',   nominal: 32_000 },
    { type: 'ВВГ-660', size: '3x35мм²',   nominal: 32_000 },
    { type: 'ВВГ-660', size: '3x50мм²',   nominal: 42_000 },
    { type: 'NYM',     size: '3x1.5мм²',  nominal: 4_100 },
    { type: 'NYM',     size: '3x2.5мм²',  nominal: 6_100 },
    { type: 'UTP',     size: 'Cat.5e',    nominal: 2_200 },
    { type: 'UTP',     size: 'Cat.6',     nominal: 3_200 },
    { type: 'FTP',     size: 'Cat.6 shielded', nominal: 4_500 },
    { type: 'Галд тэсвэртэй', size: '1x4x0.8мм', nominal: 4_500 },
  ];
  CABLES.forEach((c) => {
    items.push({
      supplierId,
      category: 'cable',
      name: `${c.type} ${c.size} кабель`,
      code: `CBL-${c.type.replace(/[^A-Za-z0-9]/g, '')}-${c.size.replace(/[^A-Za-z0-9]/g, '')}`,
      spec: `${c.type} · ${c.size}`,
      manufacturer: 'Nexans / Дэд станц',
      origin: 'Хятад',
      unit: 'м',
      price: jitter(c.nominal, 0.08),
      warranty: '1 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Conduits
  const CONDUITS = [
    { size: 'Ф16мм',  nominal: 800 },
    { size: 'Ф20мм',  nominal: 1_100 },
    { size: 'Ф25мм',  nominal: 1_500 },
    { size: 'Ф32мм',  nominal: 2_400 },
    { size: 'Ф40мм',  nominal: 3_200 },
    { size: 'Ф50мм',  nominal: 4_500 },
    { size: 'Ф63мм',  nominal: 6_200 },
    { size: 'Ф75мм',  nominal: 7_800 },
  ];
  CONDUITS.forEach((c) => {
    items.push({
      supplierId,
      category: 'electrical',
      name: `ПВХ хоолой ${c.size}`,
      code: `CND-PVC-${c.size.replace(/[^0-9]/g, '')}`,
      spec: `PVC · flexible · ${c.size}`,
      manufacturer: 'DKC',
      origin: 'Итали',
      unit: 'м',
      price: jitter(c.nominal, 0.08),
      warranty: '1 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Junction boxes
  [
    { name: 'Утас салбарлах хайрцаг', size: 'small',  nominal: 3_500 },
    { name: 'Унтраалга/розетк хайрцаг', size: 'small', nominal: 1_800 },
    { name: 'Хананд 3-ласан үүр',      size: 'flush', nominal: 28_000 },
    { name: 'Давхар хоорондын хайрцаг', size: '650x500x150', nominal: 180_000 },
    { name: 'Айлын хайрцаг',           size: '395x310x120', nominal: 65_000 },
  ].forEach((b) => {
    items.push({
      supplierId,
      category: 'electrical',
      name: b.name,
      code: `BOX-${b.size.replace(/[^A-Za-z0-9]/g, '-')}`,
      spec: b.size,
      manufacturer: 'DKC',
      origin: 'Итали',
      unit: 'ш',
      price: jitter(b.nominal, 0.08),
      warranty: '1 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  return items;
}

// ─── Supplier 3 · Гэрэлтүүлэг Плюс — lighting ──────────────────────────
function generateGereltuulge(supplierId) {
  const items = [];
  let idx = 0;

  // LED panels
  const PANELS = [
    { size: '600x600',  w: 36, nominal: 125_000 },
    { size: '600x600',  w: 48, nominal: 155_000 },
    { size: '300x1200', w: 36, nominal: 135_000 },
    { size: '300x1200', w: 48, nominal: 175_000 },
    { size: '600x1200', w: 60, nominal: 220_000 },
  ];
  PANELS.forEach((p) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: `ЛЕД панел гэрэл ${p.size} ${p.w}W`,
      code: `LED-PANEL-${p.size}-${p.w}W`,
      spec: `${p.size}мм · ${p.w}W · 4000K · IP40`,
      manufacturer: 'Philips / LEDVance',
      origin: 'Польш',
      unit: 'ш',
      price: jitter(p.nominal, 0.08),
      warranty: '3 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Ceiling LED
  [
    { w: 40,  nominal: 55_000 },
    { w: 60,  nominal: 72_000 },
    { w: 100, nominal: 95_000 },
    { w: 150, nominal: 135_000 },
  ].forEach((l) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: `ЛЕД таазны гэрэлтүүлэгч ${l.w}W`,
      code: `LED-CEIL-${l.w}W`,
      spec: `230В · ${l.w}W · IP20 · 4000K`,
      manufacturer: 'Osram',
      origin: 'Герман',
      unit: 'ш',
      price: jitter(l.nominal, 0.08),
      warranty: '2 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Downlights
  [
    { d: '75мм',  w: 5,  nominal: 22_000 },
    { d: '75мм',  w: 7,  nominal: 28_000 },
    { d: '100мм', w: 10, nominal: 35_000 },
    { d: '120мм', w: 15, nominal: 45_000 },
    { d: '150мм', w: 20, nominal: 58_000 },
  ].forEach((dl) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: `Downlight ЛЕД ${dl.d} ${dl.w}W`,
      code: `LED-DOWN-${dl.d.replace(/[^0-9]/g, '')}-${dl.w}W`,
      spec: `${dl.d} · ${dl.w}W · flush mount · 3000K`,
      manufacturer: 'Philips',
      origin: 'Польш',
      unit: 'ш',
      price: jitter(dl.nominal, 0.08),
      warranty: '2 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Emergency + exit signs
  [
    { name: 'Далд батарейтай "Гарах" чийдэн', nominal: 85_000, spec: '230В · 3ч батарей · IP20' },
    { name: 'Ослын гэрэлтүүлэгч 2W', nominal: 65_000, spec: '230В · 3ч · IP65' },
    { name: 'Ослын гэрэлтүүлэгч 5W', nominal: 95_000, spec: '230В · 3ч · IP65 · 2 модуль' },
    { name: 'Anti-panic exit sign LED', nominal: 115_000, spec: 'LED · бие даасан батарей' },
  ].forEach((e) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: e.name,
      code: `EM-${e.name.replace(/[^A-Za-zА-Яа-я0-9]/g, '').slice(0, 10)}-${idx}`,
      spec: e.spec,
      manufacturer: 'Legrand',
      origin: 'Франц',
      unit: 'ш',
      price: jitter(e.nominal, 0.08),
      warranty: '3 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // LED drivers
  [
    { w: 25,  nominal: 32_000 },
    { w: 50,  nominal: 52_000 },
    { w: 100, nominal: 85_000 },
    { w: 200, nominal: 145_000 },
  ].forEach((d) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: `ЛЕД драйвер ${d.w}W constant current`,
      code: `LED-DRV-${d.w}W`,
      spec: `${d.w}W · 24V DC · IP20`,
      manufacturer: 'Mean Well',
      origin: 'Тайвань',
      unit: 'ш',
      price: jitter(d.nominal, 0.08),
      warranty: '5 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Flex strips
  [
    { name: '5м SMD5050 60LED/м',   nominal: 55_000 },
    { name: '5м SMD5630 90LED/м',   nominal: 78_000 },
    { name: '5м COB хэлбэр',        nominal: 120_000 },
    { name: '5м RGB SMD5050',       nominal: 85_000 },
    { name: '5м IP65 waterproof',   nominal: 95_000 },
  ].forEach((f) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: `Flex strip ${f.name}`,
      code: `LED-FLEX-${idx}`,
      spec: `24V · ${f.name}`,
      manufacturer: 'OPPLE',
      origin: 'Хятад',
      unit: 'рулон',
      price: jitter(f.nominal, 0.08),
      warranty: '1 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // IP65 industrial
  [
    { w: 40,  nominal: 95_000 },
    { w: 80,  nominal: 155_000 },
    { w: 100, nominal: 185_000 },
    { w: 150, nominal: 245_000 },
  ].forEach((l) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: `ЛЕД ус-чийг хамгаалалттай ${l.w}W`,
      code: `LED-IP65-${l.w}W`,
      spec: `230В · IP65 · ${l.w}W · 4000K`,
      manufacturer: 'Philips',
      origin: 'Польш',
      unit: 'ш',
      price: jitter(l.nominal, 0.08),
      warranty: '5 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Motion sensors
  [
    { name: 'Хөдөлгөөн мэдрэгч 180°',           nominal: 38_000 },
    { name: 'Хөдөлгөөн мэдрэгч 360° таазны',    nominal: 52_000 },
    { name: 'Radar хөдөлгөөн мэдрэгч',           nominal: 65_000 },
    { name: 'Хөдөлгөөн мэдрэгчтэй 100W гэрэл',   nominal: 105_000 },
  ].forEach((s) => {
    items.push({
      supplierId,
      category: 'lighting',
      name: s.name,
      code: `MS-${idx}`,
      spec: '230В · PIR · adjustable time',
      manufacturer: 'Steinel',
      origin: 'Герман',
      unit: 'ш',
      price: jitter(s.nominal, 0.08),
      warranty: '2 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  return items;
}

// ─── Supplier 4 · Монгол Бэхэлгээ — auxiliary ──────────────────────────
function generateBekhelgee(supplierId) {
  const items = [];
  let idx = 0;

  // Cable clips
  [6, 8, 10, 12, 16, 20, 25].forEach((s) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: `Кабелийн хавчаар (saddle clip) ${s}мм`,
      code: `CLIP-SADDLE-${s}MM`,
      spec: `${s}мм диаметрт · plastic`,
      manufacturer: 'Legrand',
      origin: 'Франц',
      unit: 'ш',
      price: jitter(100 + s * 8, 0.08),
      warranty: '—',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Cable ties
  const TIE_SIZES = [100, 150, 200, 300, 400];
  const TIE_COLORS = ['Цагаан', 'Хар', 'UV-proof хар'];
  TIE_SIZES.forEach((l) => {
    TIE_COLORS.forEach((c) => {
      items.push({
        supplierId,
        category: 'auxiliary',
        name: `Кабелийн ратан ${l}мм ${c}`,
        code: `TIE-${l}-${c.replace(/[^A-Za-zА-Яа-я]/g, '').slice(0, 4)}`,
        spec: `${l}мм · 100 ширхэгтэй багц`,
        manufacturer: 'Legrand',
        origin: 'Франц',
        unit: 'багц',
        price: jitter(l * 120 + 3_500, 0.08),
        warranty: '—',
        stockStatus: pickWeighted(STOCK_DISTRIBUTION),
        priceUpdatedAt: randomPriceUpdatedAt(),
        _idx: idx++,
      });
    });
  });

  // Dowels + anchors
  [6, 8, 10, 12, 14, 16, 20].forEach((s) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: `Өрөмдсөн анкер ${s}мм`,
      code: `ANCH-${s}MM`,
      spec: `${s}мм · nylon expansion`,
      manufacturer: 'FISCHER',
      origin: 'Герман',
      unit: 'ш',
      price: jitter(80 + s * 12, 0.08),
      warranty: '—',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Heat shrink tubes
  [
    { d: '2мм',   nominal: 800 },
    { d: '3мм',   nominal: 950 },
    { d: '5мм',   nominal: 1_100 },
    { d: '8мм',   nominal: 1_400 },
    { d: '13мм',  nominal: 1_800 },
  ].forEach((h) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: `Дулаан агшаагч хоолой ${h.d}`,
      code: `HS-${h.d.replace(/[^0-9]/g, '')}MM`,
      spec: `${h.d} · 1м урт`,
      manufacturer: 'Sumitomo',
      origin: 'Япон',
      unit: 'м',
      price: jitter(h.nominal, 0.08),
      warranty: '—',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // DIN rail
  [
    { l: '1м',  nominal: 4_500 },
    { l: '2м',  nominal: 8_500 },
    { l: '3м',  nominal: 12_500 },
  ].forEach((r) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: `DIN зам 35мм ${r.l}`,
      code: `DIN-35-${r.l.replace(/[^0-9]/g, '')}M`,
      spec: `35мм · galvanized · ${r.l}`,
      manufacturer: 'Legrand',
      origin: 'Франц',
      unit: 'ш',
      price: jitter(r.nominal, 0.08),
      warranty: '—',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Grounding
  [
    { name: 'Газардуулгын электрод Ф30 L=4м', nominal: 45_000 },
    { name: 'Бентонит дэлгэрс 30кг',         nominal: 8_500 },
    { name: 'Экзотерм гагнаас CADWELD',      nominal: 25_000 },
    { name: 'Газардуулгын хавчаар',          nominal: 4_500 },
  ].forEach((g) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: g.name,
      code: `GRD-${idx}`,
      spec: '—',
      manufacturer: 'ERICO',
      origin: 'АНУ',
      unit: 'ш',
      price: jitter(g.nominal, 0.08),
      warranty: '—',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Fire-rated sealant
  [
    { name: 'Галд тэсвэртэй битүүмжлэл (fire stop)',       nominal: 6_500 },
    { name: 'Галд тэсвэртэй silicone 300мл картридж',      nominal: 18_500 },
    { name: 'Intumescent coating 1л',                       nominal: 45_000 },
  ].forEach((f) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: f.name,
      code: `FS-${idx}`,
      spec: '—',
      manufacturer: 'Hilti',
      origin: 'Лихтенштейн',
      unit: 'ш',
      price: jitter(f.nominal, 0.08),
      warranty: '—',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Cable trays
  [
    { w: '100мм', l: '2м',  nominal: 55_000 },
    { w: '200мм', l: '2м',  nominal: 95_000 },
    { w: '300мм', l: '2м',  nominal: 135_000 },
    { w: '400мм', l: '2м',  nominal: 165_000 },
    { name: 'Тавиурын 90° булан 200мм', nominal: 65_000 },
    { name: 'Тавиурын бэхэлгээ Ф12x60', nominal: 3_500 },
  ].forEach((t) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: t.name ?? `Кабелийн тавиур ${t.w} ${t.l}`,
      code: `TRAY-${idx}`,
      spec: t.w ? `${t.w} × ${t.l} · galvanized` : '—',
      manufacturer: 'DKC',
      origin: 'Итали',
      unit: 'ш',
      price: jitter(t.nominal, 0.08),
      warranty: '3 жил',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  // Terminals
  [
    { name: 'WAGO 221 Lever-nut 2-жинл',   nominal: 550 },
    { name: 'WAGO 221 Lever-nut 3-жинл',   nominal: 680 },
    { name: 'WAGO 221 Lever-nut 5-жинл',   nominal: 1_150 },
    { name: 'Клеммийн блок ассорти багц',  nominal: 8_500 },
    { name: 'Цахилгаан тусгаарлах тууз',   nominal: 3_500 },
  ].forEach((t) => {
    items.push({
      supplierId,
      category: 'auxiliary',
      name: t.name,
      code: `TERM-${idx}`,
      spec: '—',
      manufacturer: 'WAGO',
      origin: 'Герман',
      unit: 'ш',
      price: jitter(t.nominal, 0.08),
      warranty: '—',
      stockStatus: pickWeighted(STOCK_DISTRIBUTION),
      priceUpdatedAt: randomPriceUpdatedAt(),
      _idx: idx++,
    });
  });

  return items;
}

// ─── Apply outliers & finalize ─────────────────────────────────────────
function finalizeItems(rawItems, supplierId, outlierTargetCount) {
  // Pick ~outlierTargetCount indices and skew their price ±35–55%.
  const outlierIndices = new Set();
  while (outlierIndices.size < outlierTargetCount && outlierIndices.size < rawItems.length) {
    outlierIndices.add(randInt(0, rawItems.length - 1));
  }

  return rawItems.map((it, i) => {
    let price = it.price;
    if (outlierIndices.has(i)) {
      const direction = rand() > 0.5 ? 1 : -1;
      const magnitude = 0.35 + rand() * 0.2; // 35–55%
      price = Math.round(price * (1 + direction * magnitude));
    }
    const id = makeId(supplierId, i, it.code ?? it.name);
    const { _idx, ...rest } = it;
    void _idx; // suppress unused
    return { id, ...rest, price };
  });
}

// ─── Run generators ────────────────────────────────────────────────────
let allCatalog = [];
const groups = [
  { supplierId: 'sup-microtech',   gen: generateMicroTech,    outliers: 5 },
  { supplierId: 'sup-tsakhilgaan', gen: generateTsakhilgaan,  outliers: 4 },
  { supplierId: 'sup-gereltuulge', gen: generateGereltuulge,  outliers: 3 },
  { supplierId: 'sup-bekhelgee',   gen: generateBekhelgee,    outliers: 3 },
];

for (const { supplierId, gen, outliers } of groups) {
  const raw = gen(supplierId);
  const finalized = finalizeItems(raw, supplierId, outliers);
  allCatalog = allCatalog.concat(finalized);
}

// ─── Write files ───────────────────────────────────────────────────────
writeFileSync(
  resolve(seedDir, 'suppliers.json'),
  JSON.stringify(suppliers, null, 2) + '\n',
);
writeFileSync(
  resolve(seedDir, 'catalog.json'),
  JSON.stringify(allCatalog, null, 2) + '\n',
);

// ─── Report ─────────────────────────────────────────────────────────────
const perSupplier = suppliers.map((s) => ({
  supplier: s.name,
  items: allCatalog.filter((c) => c.supplierId === s.id).length,
}));
console.log('catalog seed generated:');
perSupplier.forEach((p) => console.log(`  ${p.items.toString().padStart(3)} · ${p.supplier}`));
console.log(`  ${allCatalog.length.toString().padStart(3)} · TOTAL`);
const byCategory = {};
allCatalog.forEach((c) => {
  byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
});
console.log('\nby category:');
Object.entries(byCategory)
  .sort(([, a], [, b]) => b - a)
  .forEach(([k, v]) => console.log(`  ${v.toString().padStart(3)} · ${k}`));

// Freshness distribution
const ageBuckets = { recent: 0, mid: 0, old: 0 };
allCatalog.forEach((c) => {
  const ageDays = Math.floor((NOW - new Date(c.priceUpdatedAt).getTime()) / 86_400_000);
  if (ageDays < 30) ageBuckets.recent += 1;
  else if (ageDays < 90) ageBuckets.mid += 1;
  else ageBuckets.old += 1;
});
console.log('\nprice freshness:');
console.log(`  <30d  : ${ageBuckets.recent}`);
console.log(`  30-90d: ${ageBuckets.mid}`);
console.log(`  >90d  : ${ageBuckets.old}`);

const stockBuckets = { in_stock: 0, order: 0, out_of_stock: 0 };
allCatalog.forEach((c) => {
  stockBuckets[c.stockStatus] = (stockBuckets[c.stockStatus] ?? 0) + 1;
});
console.log('\nstock:');
Object.entries(stockBuckets).forEach(([k, v]) => console.log(`  ${k.padEnd(12)}: ${v}`));
