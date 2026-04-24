// Number and currency formatters. Ported from the v3 artifact verbatim —
// the outputs must match character-for-character.

const MNT = new Intl.NumberFormat('mn-MN');

export const formatMNT = (n: number): string =>
  MNT.format(Math.round(n)) + ' ₮';

export const formatShort = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'Б';
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'М';
  if (abs >= 1_000) return (n / 1_000).toFixed(0) + 'К';
  return Math.round(n).toString();
};

export const formatNum = (n: number): string => MNT.format(n);
