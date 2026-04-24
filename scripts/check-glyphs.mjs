// Standalone TTF cmap scanner. Verifies that a given font file actually
// has a glyph for every codepoint we care about (ү U+04AF, ө U+04E9,
// ₮ U+20AE, − U+2212, С U+0421). Uses pdfjs-dist's sfnt parser indirectly
// by doing a minimal cmap walk ourselves — this keeps the check
// dependency-free apart from Node stdlib.

import { readFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

const files = argv.slice(2);
if (files.length === 0) {
  console.error('usage: check-glyphs.mjs <font.ttf> [<font.ttf>...]');
  exit(2);
}

const TARGETS = [
  { cp: 0x04AF, name: 'ү CYRILLIC SMALL LETTER STRAIGHT U (U+04AF)' },
  { cp: 0x04AE, name: 'Ү CYRILLIC CAPITAL LETTER STRAIGHT U (U+04AE)' },
  { cp: 0x04E9, name: 'ө CYRILLIC SMALL LETTER BARRED O (U+04E9)' },
  { cp: 0x04E8, name: 'Ө CYRILLIC CAPITAL LETTER BARRED O (U+04E8)' },
  { cp: 0x0421, name: 'С CYRILLIC CAPITAL LETTER ES (U+0421)' },
  { cp: 0x20AE, name: '₮ TUGRIK SIGN (U+20AE)' },
  { cp: 0x2212, name: '− MINUS SIGN (U+2212)' },
  { cp: 0x00B7, name: '· MIDDLE DOT (U+00B7)' },
];

function parseCmap(buf) {
  const view = new DataView(
    buf.buffer,
    buf.byteOffset,
    buf.byteLength,
  );
  const scalar = view.getUint32(0);
  if (scalar !== 0x00010000 && scalar !== 0x4F54544F && scalar !== 0x74727565) {
    // 0x00010000 = TrueType, 0x4F54544F = 'OTTO', 0x74727565 = 'true'
    throw new Error(`not a TrueType/OpenType file (scalar=0x${scalar.toString(16)})`);
  }
  const numTables = view.getUint16(4);
  let cmapOffset = null;
  for (let i = 0; i < numTables; i++) {
    const recOff = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(recOff),
      view.getUint8(recOff + 1),
      view.getUint8(recOff + 2),
      view.getUint8(recOff + 3),
    );
    if (tag === 'cmap') {
      cmapOffset = view.getUint32(recOff + 8);
      break;
    }
  }
  if (cmapOffset === null) throw new Error('no cmap table');

  const numSub = view.getUint16(cmapOffset + 2);
  // Prefer Unicode platform (0) or Windows/Unicode BMP (3,1) or Windows/UCS-4 (3,10)
  const candidates = [];
  for (let i = 0; i < numSub; i++) {
    const recOff = cmapOffset + 4 + i * 8;
    const platformId = view.getUint16(recOff);
    const encodingId = view.getUint16(recOff + 2);
    const subOff = cmapOffset + view.getUint32(recOff + 4);
    const format = view.getUint16(subOff);
    candidates.push({ platformId, encodingId, subOff, format });
  }
  // Prefer: (3,10)=Win/UCS-4 → (0,*)=Unicode → (3,1)=Win/BMP
  const preferredOrder = [
    (c) => c.platformId === 3 && c.encodingId === 10,
    (c) => c.platformId === 0,
    (c) => c.platformId === 3 && c.encodingId === 1,
  ];
  let chosen = null;
  for (const pred of preferredOrder) {
    chosen = candidates.find(pred);
    if (chosen) break;
  }
  if (!chosen) chosen = candidates[0];
  if (!chosen) throw new Error('no usable cmap subtable');
  return { view, chosen };
}

// Format 4 (segment mapping for BMP) lookup
function lookupFormat4(view, subOff, cp) {
  if (cp > 0xFFFF) return 0;
  const segCountX2 = view.getUint16(subOff + 6);
  const segCount = segCountX2 / 2;
  const endOff = subOff + 14;
  const startOff = endOff + segCountX2 + 2;
  const idDeltaOff = startOff + segCountX2;
  const idRangeOffsetOff = idDeltaOff + segCountX2;

  for (let i = 0; i < segCount; i++) {
    const end = view.getUint16(endOff + i * 2);
    if (end < cp) continue;
    const start = view.getUint16(startOff + i * 2);
    if (cp < start) return 0;
    const idDelta = view.getInt16(idDeltaOff + i * 2);
    const idRangeOffset = view.getUint16(idRangeOffsetOff + i * 2);
    if (idRangeOffset === 0) {
      return (cp + idDelta) & 0xFFFF;
    }
    const glyphIdOff = idRangeOffsetOff + i * 2 + idRangeOffset + (cp - start) * 2;
    const glyphId = view.getUint16(glyphIdOff);
    return glyphId === 0 ? 0 : (glyphId + idDelta) & 0xFFFF;
  }
  return 0;
}

// Format 12 (segmented coverage, full Unicode)
function lookupFormat12(view, subOff, cp) {
  const numGroups = view.getUint32(subOff + 12);
  let lo = 0;
  let hi = numGroups - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const groupOff = subOff + 16 + mid * 12;
    const startChar = view.getUint32(groupOff);
    const endChar = view.getUint32(groupOff + 4);
    if (cp < startChar) hi = mid - 1;
    else if (cp > endChar) lo = mid + 1;
    else {
      const startGlyph = view.getUint32(groupOff + 8);
      return startGlyph + (cp - startChar);
    }
  }
  return 0;
}

function lookup(view, chosen, cp) {
  if (chosen.format === 4) return lookupFormat4(view, chosen.subOff, cp);
  if (chosen.format === 12) return lookupFormat12(view, chosen.subOff, cp);
  return 0;
}

let allOk = true;
for (const file of files) {
  const buf = readFileSync(file);
  const { view, chosen } = parseCmap(buf);
  console.log(`\n== ${file}`);
  console.log(`   cmap: platform ${chosen.platformId}.${chosen.encodingId}, format ${chosen.format}`);
  for (const { cp, name } of TARGETS) {
    const glyphId = lookup(view, chosen, cp);
    const ok = glyphId !== 0;
    if (!ok) allOk = false;
    console.log(`   ${ok ? 'OK  ' : 'MISS'} gid=${glyphId.toString().padStart(5)} ${name}`);
  }
}

exit(allOk ? 0 : 1);
