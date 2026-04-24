export interface InfoBitProps {
  label: string;
  value: string;
}

export function InfoBit({ label, value }: InfoBitProps) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white mt-0.5 font-mono-tab">{value}</div>
    </div>
  );
}
