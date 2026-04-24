// Tiny stable JSON hash — used to snapshot a BOQ+aux state at approval time
// so a revised project can be diffed against what the engineer signed.
// FNV-1a 32-bit over a deterministic key-sorted JSON stringification.

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
  );
  return (
    '{' +
    entries
      .map(([k, v]) => JSON.stringify(k) + ':' + stableStringify(v))
      .join(',') +
    '}'
  );
}

export function jsonHash(value: unknown): string {
  const s = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
