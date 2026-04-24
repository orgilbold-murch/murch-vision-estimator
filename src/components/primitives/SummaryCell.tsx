export interface SummaryCellProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  mute?: boolean;
  negative?: boolean;
}

export function SummaryCell({ label, value, sub, highlight, mute, negative }: SummaryCellProps) {
  return (
    <div className="p-3 relative">
      <div
        className={`text-[10px] uppercase tracking-[0.2em] mb-1 ${
          highlight ? 'text-blue-400' : 'text-slate-500'
        }`}
      >
        {label}
      </div>
      <div
        className={`font-display ${
          highlight ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
        } font-bold ticker ${
          highlight
            ? 'text-blue-400'
            : negative
              ? 'text-amber-400'
              : mute
                ? 'text-slate-600'
                : 'text-white'
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}
