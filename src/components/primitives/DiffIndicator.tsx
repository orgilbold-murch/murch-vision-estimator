import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatNum } from '@/lib/format';

// Shows a strikethrough original value (below the current value) and a
// right-aligned delta arrow with percent. Does NOT render the amber left
// bar — that is applied at the ItemRow level so the whole row signals
// "this was modified" at a glance from across the table.

export interface DiffIndicatorProps {
  current: number;
  original: number;
  // Higher = "worse for the customer". Default: increase is red (bad),
  // decrease is green (good). A negotiated price drop is green.
  inverse?: boolean;
  size?: 'sm' | 'xs';
  // Optional unit suffix shown on the strikethrough line, e.g. 'ш' or '₮'.
  unitSuffix?: string;
}

export function DiffIndicator({
  current,
  original,
  inverse = false,
  size = 'xs',
  unitSuffix,
}: DiffIndicatorProps) {
  if (current === original) return null;

  const delta = current - original;
  const pct = original === 0 ? null : (delta / original) * 100;
  const isIncrease = delta > 0;
  const colorClass = (inverse ? !isIncrease : isIncrease)
    ? 'text-red-400'
    : 'text-emerald-400';
  const Icon = isIncrease ? ArrowUp : ArrowDown;

  const baseSize = size === 'sm' ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className={`${baseSize} text-slate-500 line-through font-mono-tab`}>
        {formatNum(original)}
        {unitSuffix ? ` ${unitSuffix}` : ''}
      </span>
      <span className={`${baseSize} ${colorClass} font-mono-tab font-semibold flex items-center gap-0.5 whitespace-nowrap`}>
        <Icon className="w-3 h-3" />
        {pct === null ? '—' : `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`}
      </span>
    </div>
  );
}
