// Phase 1 font validation: build a test PDF with pdfmake using Noto Sans +
// Manrope, then use pdfjs-dist to extract text and confirm every Cyrillic
// codepoint round-trips through the PDF.
//
// Exit code:
//   0 = all glyphs round-trip, fonts are embedded, no Helvetica fallback
//   1 = text mismatch or font substitution detected

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);
const pdfmake = require('pdfmake');

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const fonts = {
  Body: {
    normal: resolve(root, 'fonts/NotoSans-Regular.ttf'),
    bold: resolve(root, 'fonts/NotoSans-Bold.ttf'),
    italics: resolve(root, 'fonts/NotoSans-Regular.ttf'),
    bolditalics: resolve(root, 'fonts/NotoSans-Bold.ttf'),
  },
  Display: {
    normal: resolve(root, 'fonts/Manrope-Variable.ttf'),
    bold: resolve(root, 'fonts/Manrope-Variable.ttf'),
    italics: resolve(root, 'fonts/Manrope-Variable.ttf'),
    bolditalics: resolve(root, 'fonts/Manrope-Variable.ttf'),
  },
};

pdfmake.setFonts(fonts);
pdfmake.setUrlAccessPolicy(() => false); // disable remote loads

// Exactly the content from Q1 of the user's decision
const TEST_LINES = [
  'Murch Vision — Үнийн санал',
  'Бросс-С блок · ЗП-25-12-229',
  'Эцсийн дүн: 547,234,000 ₮',
  'Ашигласан ажлын хөлс: 87,450,000 ₮',
  'SQUAD хөнгөлөлт: −8,745,000 ₮',
];

const docDef = {
  defaultStyle: { font: 'Body', fontSize: 12 },
  content: [
    { text: TEST_LINES[0], font: 'Display', fontSize: 24, bold: true, margin: [0, 0, 0, 12] },
    { text: TEST_LINES[1], fontSize: 14, margin: [0, 0, 0, 16] },
    { text: TEST_LINES[2], fontSize: 14, margin: [0, 0, 0, 4] },
    { text: TEST_LINES[3], fontSize: 14, margin: [0, 0, 0, 4] },
    { text: TEST_LINES[4], fontSize: 14 },
  ],
};

const pdfBuf = await pdfmake.createPdf(docDef).getBuffer();

mkdirSync(resolve(root, 'scripts/out'), { recursive: true });
const outPath = resolve(root, 'scripts/out/font-validation.pdf');
writeFileSync(outPath, pdfBuf);
console.log(`Generated PDF: ${outPath} (${pdfBuf.length} bytes)`);

// ─── Extract text with pdfjs-dist ───────────────────────────────
const uint8 = new Uint8Array(pdfBuf);
const pdfjsDoc = await getDocument({
  data: uint8,
  useSystemFonts: false,
  disableFontFace: true,
}).promise;

console.log(`PDF pages: ${pdfjsDoc.numPages}`);

const page = await pdfjsDoc.getPage(1);
const content = await page.getTextContent();

const extractedItems = content.items.map((it) => it.str);
console.log('\nExtracted text items:');
extractedItems.forEach((s, i) => console.log(`  [${i}] ${JSON.stringify(s)}`));

// Concatenate items (pdfmake emits one item per styled run; line breaks are
// separate items). We stitch by joining non-empty items.
const extractedConcat = extractedItems.filter((s) => s.length > 0).join(' ');

// Inspect the fonts that were actually rendered on the page
const operatorList = await page.getOperatorList();
const commonObjs = page.commonObjs;
const objs = page.objs;
const seenFonts = new Set();
for (let i = 0; i < operatorList.fnArray.length; i++) {
  // OPS.setFont = 40 (from pdfjs-dist/src/shared/util.js); we do not
  // hard-code it here because we read it from the shared OPS map instead.
  const fn = operatorList.fnArray[i];
  const args = operatorList.argsArray[i];
  if (Array.isArray(args) && args.length >= 1 && typeof args[0] === 'string' && args[0].startsWith('g_')) {
    // Likely a font reference passed to setFont
    seenFonts.add(args[0]);
  }
}

// pdfjs-dist exposes font data on commonObjs under names like "g_d0_f1". We
// introspect every font to see which family name / loaded-font slot it
// reports.
const fontReport = [];
function enumerate(store) {
  // _objs is the internal map; we read it defensively.
  const internal = store._objs || {};
  for (const name of Object.keys(internal)) {
    const rec = internal[name];
    if (rec && rec.data && rec.data.loadedName) {
      fontReport.push({ name, loadedName: rec.data.loadedName, fallbackName: rec.data.fallbackName });
    }
  }
}
enumerate(commonObjs);
enumerate(objs);

console.log('\nFont objects seen in page:');
if (fontReport.length === 0) {
  console.log('  (none — will rely on extraction round-trip as proof)');
} else {
  fontReport.forEach((f) => console.log(`  ${f.name}: loadedName=${f.loadedName} fallback=${f.fallbackName ?? '—'}`));
}

// ─── Verify ─────────────────────────────────────────────────────
const expectedConcat = TEST_LINES.join(' ');
console.log('\nExpected concat:');
console.log(`  ${JSON.stringify(expectedConcat)}`);
console.log('Extracted concat:');
console.log(`  ${JSON.stringify(extractedConcat)}`);

let failures = 0;

// 1. Byte-for-byte match
if (extractedConcat !== expectedConcat) {
  console.log('\nFAIL: extracted text does not match expected text byte-for-byte.');
  failures += 1;
} else {
  console.log('\nPASS: extracted text matches expected text byte-for-byte.');
}

// 2. Every critical codepoint present in the extracted string
const CRITICAL = [
  { cp: 0x04AF, name: 'ү' },
  { cp: 0x04E9, name: 'ө' },
  { cp: 0x0421, name: 'С' },
  { cp: 0x20AE, name: '₮' },
  { cp: 0x2212, name: '−' },
  { cp: 0x00B7, name: '·' },
];
for (const c of CRITICAL) {
  const present = extractedConcat.includes(String.fromCodePoint(c.cp));
  console.log(`  ${present ? 'PASS' : 'FAIL'}: codepoint U+${c.cp.toString(16).toUpperCase().padStart(4, '0')} "${c.name}" ${present ? 'present' : 'MISSING'} in extracted text`);
  if (!present) failures += 1;
}

// 3. No Helvetica fallback — look for the Helvetica substring in the raw
//    PDF bytes. pdfmake writes font subsets under names like "NotoSans" /
//    "Manrope"; if any page references Helvetica we fail loudly.
const pdfAsString = pdfBuf.toString('latin1');
const helveticaRefs = (pdfAsString.match(/\/Helvetica\b/g) ?? []).length;
const notoRefs = (pdfAsString.match(/NotoSans/g) ?? []).length;
const manropeRefs = (pdfAsString.match(/Manrope/g) ?? []).length;
console.log(`\nRaw PDF font-name references: NotoSans=${notoRefs} Manrope=${manropeRefs} Helvetica=${helveticaRefs}`);
if (helveticaRefs > 0) {
  console.log('FAIL: Helvetica reference(s) found in the PDF — font substitution occurred.');
  failures += 1;
}
if (notoRefs === 0) {
  console.log('FAIL: No NotoSans font reference in the PDF — embedding failed.');
  failures += 1;
}
if (manropeRefs === 0) {
  console.log('FAIL: No Manrope font reference in the PDF — embedding failed.');
  failures += 1;
}

process.exit(failures === 0 ? 0 : 1);
