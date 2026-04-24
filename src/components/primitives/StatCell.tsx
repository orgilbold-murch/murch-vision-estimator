export interface StatCellProps {
  value: string;
  label: string;
}

export function StatCell({ value, label }: StatCellProps) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">{label}</div>
    </div>
  );
}
