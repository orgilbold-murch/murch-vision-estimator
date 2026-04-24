export interface RefItemProps {
  label: string;
  value: string;
}

export function RefItem({ label, value }: RefItemProps) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-slate-400">{label}:</span>
      <span className="font-mono-tab text-emerald-300 text-[10px]">{value}</span>
    </div>
  );
}
