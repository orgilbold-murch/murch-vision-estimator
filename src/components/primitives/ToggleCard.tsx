import type { ReactNode } from 'react';
import { CircleDot } from 'lucide-react';

export interface ToggleCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  savingsNote: string;
}

export function ToggleCard({
  icon,
  title,
  desc,
  checked,
  onChange,
  savingsNote,
}: ToggleCardProps) {
  return (
    <div
      className={`p-5 border-2 transition-all ${
        checked ? 'border-blue-700 bg-blue-950/20' : 'border-slate-800 bg-slate-950/40'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className={checked ? 'text-blue-400' : 'text-slate-500'}>{icon}</div>
          <h4 className="font-display text-sm font-bold text-white">{title}</h4>
        </div>
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-12 h-6 transition-colors flex-shrink-0 ${
            checked ? 'bg-blue-600' : 'bg-slate-700'
          }`}
          aria-label={title}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          ></div>
        </button>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{desc}</p>
      <div
        className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
          checked ? 'text-blue-400' : 'text-slate-500'
        }`}
      >
        <CircleDot className="w-3 h-3" />
        <span>{savingsNote}</span>
      </div>
    </div>
  );
}
