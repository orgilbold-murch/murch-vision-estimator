import type { Tier } from '@/types';

export const TIER_OPTIONS: readonly Tier[] = [
  { id: 'premium',  label: 'Premium',  desc: 'Европ/Япон брэнд',           multiplier: 1.30, accent: '#fbbf24' },
  { id: 'standard', label: 'Standard', desc: 'Hikvision/Schneider/LS',     multiplier: 1.00, accent: '#84cc16' },
  { id: 'economy',  label: 'Economy',  desc: 'Монгол/Хятад хямд',          multiplier: 0.78, accent: '#06b6d4' },
] as const;

export const AUX_PRICE_PER_SECTION_HINT: Record<string, string> = {
  cctv: 'CCTV ~ 2-3% материалын дүнгээс',
  fire: 'Гал ~ 3-4% материалын дүнгээс',
  intercom: 'Домофон ~ 2-3% материалын дүнгээс',
  electrical: 'Цахилгаан ~ 5-7% материалын дүнгээс',
};
