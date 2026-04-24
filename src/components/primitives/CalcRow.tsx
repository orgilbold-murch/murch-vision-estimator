export interface CalcRowProps {
  label: string;
  value: string;
  bold?: boolean;
  amber?: boolean;
  final?: boolean;
  emerald?: boolean;
  note?: string;
}

export function CalcRow({ label, value, bold, amber, final, emerald, note }: CalcRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${final ? 'py-1' : ''}`}>
      <div>
        <div
          className={`text-sm ${
            final
              ? 'font-display font-bold text-blue-400 uppercase tracking-wider'
              : bold
                ? 'text-white font-semibold'
                : 'text-slate-300'
          }`}
        >
          {label}
        </div>
        {note && <div className="text-[10px] text-slate-500 mt-0.5">{note}</div>}
      </div>
      <div
        className={`font-mono-tab ${
          final
            ? 'text-2xl font-bold text-blue-400'
            : bold
              ? 'text-base font-bold text-white'
              : emerald
                ? 'text-emerald-400'
                : amber
                  ? 'text-amber-400'
                  : 'text-slate-200'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
