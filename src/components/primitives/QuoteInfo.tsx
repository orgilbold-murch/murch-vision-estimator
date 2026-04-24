export interface QuoteInfoProps {
  label: string;
  value: string;
}

export function QuoteInfo({ label, value }: QuoteInfoProps) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-0.5 font-semibold">
        {label}
      </div>
      <div className="text-xs text-slate-900 font-medium">{value}</div>
    </div>
  );
}
