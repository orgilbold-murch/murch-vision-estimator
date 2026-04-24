export interface QuoteCalcRowProps {
  label: string;
  value: string;
  bold?: boolean;
  amber?: boolean;
  emerald?: boolean;
  sub?: string;
}

export function QuoteCalcRow({ label, value, bold, amber, emerald, sub }: QuoteCalcRowProps) {
  return (
    <div
      className={`px-4 py-3 flex items-center justify-between gap-4 border-b border-slate-200 last:border-b-0 ${
        bold ? 'bg-white' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
          {label}
        </div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
      <div
        className={`font-mono-tab whitespace-nowrap ${
          bold
            ? 'text-base font-bold text-slate-900'
            : amber
              ? 'text-sm text-amber-700 font-semibold'
              : emerald
                ? 'text-sm text-emerald-700 font-semibold'
                : 'text-sm text-slate-800'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
