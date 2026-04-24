import type { ReactNode } from 'react';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

export function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="p-4 border border-slate-800 bg-slate-950/40 hover:border-blue-500/50 transition-colors">
      <div
        className="w-8 h-8 flex items-center justify-center mb-3"
        style={{ background: 'rgba(0, 65, 255, 0.1)', color: '#4d7fff' }}
      >
        {icon}
      </div>
      <div className="font-semibold text-sm text-white mb-1">{title}</div>
      <div className="text-[11px] text-slate-500 leading-relaxed">{desc}</div>
    </div>
  );
}
