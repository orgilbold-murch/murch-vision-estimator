import type { ReactNode } from 'react';

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  sublabel?: string;
  color: string;
  // Optional count badge (Phase 4 — surfaces "this section has N edits").
  // Only renders when > 0. Amber to match the DiffIndicator language.
  badge?: number;
}

export function TabButton({ active, onClick, icon, label, sublabel, color, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 min-w-[110px] px-3 md:px-4 py-2.5 flex items-center gap-2.5 text-sm transition-all whitespace-nowrap group ${
        active ? 'bg-slate-900/80' : 'hover:bg-slate-900/40'
      }`}
    >
      {active && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        ></div>
      )}
      <div
        className={`w-7 h-7 flex items-center justify-center flex-shrink-0 transition-all ${
          active ? '' : 'bg-slate-900/60 group-hover:bg-slate-800/60'
        }`}
        style={active ? { background: color + '25', color } : {}}
      >
        <span className={active ? '' : 'text-slate-500 group-hover:text-slate-300'}>{icon}</span>
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span
          className={`text-xs ${
            active ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className={`font-mono-tab text-[10px] tracking-tight ${
              active ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {sublabel}
          </span>
        )}
      </div>
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-mono-tab text-[10px] font-bold bg-amber-500 text-amber-950"
          aria-label={`${badge} өөрчлөлт`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
