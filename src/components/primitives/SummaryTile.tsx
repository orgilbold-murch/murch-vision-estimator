export interface SummaryTileProps {
  label: string;
  value: string;
  emerald?: boolean;
  amber?: boolean;
}

export function SummaryTile({ label, value, emerald, amber }: SummaryTileProps) {
  return (
    <div className="p-3 bg-white border border-slate-200">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
        {label}
      </div>
      <div
        className={`font-mono-tab text-base font-bold ${
          emerald ? 'text-emerald-700' : amber ? 'text-amber-700' : 'text-slate-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
