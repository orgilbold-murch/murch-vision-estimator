import type { ReactNode } from 'react';

export interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub: string;
  accent: string;
  highlight?: boolean;
}

export function MetricCard({ icon, label, value, sub, accent, highlight }: MetricCardProps) {
  return (
    <div
      className={`relative p-3 border bg-slate-950/40 blueprint-corner transition-all ${
        highlight ? 'border-lime-500/40' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <div className="font-display text-xl md:text-2xl font-bold text-white ticker leading-none">
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-1">{sub}</div>
      <div
        className="absolute top-0 left-0 h-[2px] transition-all"
        style={{ width: highlight ? '100%' : '30%', background: accent, opacity: 0.8 }}
      ></div>
    </div>
  );
}
