// Fuzzy-match BOQ items against the supplier catalog. Uses fuse.js with
// a name+spec+manufacturer index. The matcher is memoised by catalog
// identity so consumer hooks can call it many times per render without
// rebuilding the index.

import Fuse from 'fuse.js';
import type { BoqLineItem, SupplierCatalogItem } from '@/types';

export interface CatalogMatch {
  item: SupplierCatalogItem;
  score: number;
}

let cachedCatalogRef: SupplierCatalogItem[] | null = null;
let cachedFuse: Fuse<SupplierCatalogItem> | null = null;

function getFuse(catalog: SupplierCatalogItem[]): Fuse<SupplierCatalogItem> {
  if (cachedCatalogRef === catalog && cachedFuse) return cachedFuse;
  cachedFuse = new Fuse(catalog, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'code', weight: 1 },
      { name: 'spec', weight: 1 },
      { name: 'manufacturer', weight: 0.5 },
    ],
    threshold: 0.5,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
  cachedCatalogRef = catalog;
  return cachedFuse;
}

// Normalises free-form search text for fuzzy matching.
// 'ВВГ 5x6' should hit 'ВВГ-660 5x6мм²' — so we replicate common
// cross-section variants and strip decorative separators.
export function normaliseQuery(q: string): string {
  return q
    .replace(/\s*[×x*]\s*/gi, 'x')   // 5 × 6 → 5x6
    .replace(/[\-_]/g, ' ')          // ВВГ-660 → ВВГ 660
    .replace(/\s+/g, ' ')
    .trim();
}

export function findCatalogMatches(
  item: Pick<BoqLineItem, 'name' | 'spec' | 'unit'>,
  catalog: SupplierCatalogItem[],
  limit = 5,
): CatalogMatch[] {
  const fuse = getFuse(catalog);
  // Combine name + spec into the query so a "3x1.5mm²" spec is weighed
  // against a "3x1.5мм²" catalog entry.
  const query = normaliseQuery([item.name, item.spec].filter(Boolean).join(' '));
  const results = fuse.search(query, { limit });
  // Post-filter: only keep items with compatible unit (ш vs. м) when we
  // have a clear BOQ unit to compare against.
  const compatible = results.filter((r) => {
    if (!item.unit || !r.item.unit) return true;
    // normalise simple cases
    if (item.unit === 'м' && r.item.unit !== 'м') return false;
    if (item.unit !== 'м' && r.item.unit === 'м') return false;
    return true;
  });
  return compatible.slice(0, limit).map((r) => ({
    item: r.item,
    score: r.score ?? 1,
  }));
}

export function cheapestMatch(matches: CatalogMatch[]): CatalogMatch | null {
  if (matches.length === 0) return null;
  return matches.reduce((best, cur) =>
    cur.item.price < best.item.price ? cur : best,
  );
}
