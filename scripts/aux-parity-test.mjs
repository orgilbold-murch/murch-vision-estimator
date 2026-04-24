// Regression test: run the ported src/lib/computeAuxiliary.ts against
// INITIAL_DATA extracted from reference/murch_vision_dashboard.jsx, and
// compare the output against the artifact's own computeAuxiliary output.
// If a single number drifts, the port is not byte-identical.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { register } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

// We need to load:
//   (a) INITIAL_DATA + reference computeAuxiliary from the artifact (JSX)
//   (b) the ported computeAuxiliary (TS)
//
// For (a) we extract the relevant module-level declarations from the JSX
// by stripping the import/export/React bits and evaling in a sandbox. The
// reference file is pure data + functions — no JSX is used inside
// INITIAL_DATA or computeAuxiliary, so this is safe.

const jsxSource = readFileSync(
  resolve(root, 'reference/murch_vision_dashboard.jsx'),
  'utf8',
);

function extract(src, markerOpen, markerClose) {
  const start = src.indexOf(markerOpen);
  if (start < 0) throw new Error(`missing marker: ${markerOpen}`);
  const end = src.indexOf(markerClose, start);
  if (end < 0) throw new Error(`missing closing marker: ${markerClose}`);
  return src.slice(start, end);
}

// Pull INITIAL_DATA ← declaration through the closing `];`
const initMatch = jsxSource.match(
  /const INITIAL_DATA = \[[\s\S]*?\n\];/m,
);
if (!initMatch) throw new Error('INITIAL_DATA not found');

// Pull computeAuxiliary function body
const fnMatch = jsxSource.match(
  /function computeAuxiliary\(sections\) \{[\s\S]*?^\}/m,
);
if (!fnMatch) throw new Error('computeAuxiliary not found');

// Build a sandbox: we define Camera/Flame/etc. as plain strings since they
// are only used as the `icon` field inside INITIAL_DATA (we don't care about
// the identity of the icon for this parity test).
const iconStubs = [
  'Camera', 'Flame', 'Radio', 'Zap',
].map((n) => `const ${n} = Symbol('${n}');`).join('\n');

const sandbox = `
${iconStubs}
${initMatch[0]}
${fnMatch[0]}
module.exports = { INITIAL_DATA, computeAuxiliary };
`;

// Evaluate via Node's CJS vm
const vm = await import('node:vm');
const ctx = { module: { exports: {} }, exports: {}, Symbol };
vm.createContext(ctx);
vm.runInContext(sandbox, ctx);
const { INITIAL_DATA, computeAuxiliary: refCompute } = ctx.module.exports;

// Now load the ported TS module. We use Vite's own bundler for this by
// running a subprocess that imports the .ts via a loader. Simpler approach:
// since the ported file is pure TypeScript without runtime dependencies,
// we compile it on-the-fly with esbuild.
const { build } = await import('esbuild');
const tmpOut = resolve(root, 'scripts/out/computeAuxiliary.bundle.mjs');
await build({
  entryPoints: [resolve(root, 'src/lib/computeAuxiliary.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: tmpOut,
  alias: { '@': resolve(root, 'src') },
  logLevel: 'error',
});
const ported = await import('file://' + tmpOut);
const portedCompute = ported.computeAuxiliary;

// Run both
const refResult = refCompute(INITIAL_DATA);
const portedResult = portedCompute(INITIAL_DATA);

// Deep compare (order-preserving)
function deepEqual(a, b, path = '$') {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return [`${path}: length ${a.length} vs ${b.length}`];
    }
    return a.flatMap((x, i) => deepEqual(x, b[i], `${path}[${i}]`));
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((k) => deepEqual(a[k], b[k], `${path}.${k}`));
  }
  if (a === b) return [];
  return [`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`];
}

const diffs = deepEqual(refResult, portedResult);
if (diffs.length === 0) {
  const totals = Object.fromEntries(
    Object.entries(portedResult).map(([k, items]) => [
      k,
      items.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    ]),
  );
  console.log('PASS: ported computeAuxiliary matches reference byte-for-byte.');
  console.log('Per-section totals (₮, pre-tier):');
  for (const [k, v] of Object.entries(totals)) {
    console.log(`  ${k.padEnd(11)} ${v.toLocaleString('en-US')}`);
  }
  console.log(`  ${'GRAND'.padEnd(11)} ${Object.values(totals).reduce((s, v) => s + v, 0).toLocaleString('en-US')}`);
  process.exit(0);
} else {
  console.log('FAIL: drift detected');
  diffs.slice(0, 30).forEach((d) => console.log('  ' + d));
  if (diffs.length > 30) console.log(`  ...and ${diffs.length - 30} more`);
  process.exit(1);
}
