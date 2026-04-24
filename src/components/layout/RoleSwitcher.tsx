// ═══════════════════════════════════════════════════════════════════════════
// RoleSwitcher — top-bar demo affordance
//
// In production this entire component is replaced by an auth-driven badge.
// The "DEV" tag makes that status explicit during the beta.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useStore } from '@/store';
import type { UserRole, User } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Админ',
  engineer: 'Инженер',
  sales: 'Борлуулалт',
};

const ROLE_COLORS: Record<
  UserRole,
  { text: string; bg: string; border: string; dot: string }
> = {
  admin: {
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400',
  },
  engineer: {
    text: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    dot: 'bg-blue-400',
  },
  sales: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
  },
};

export function RoleSwitcher() {
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const pushToast = useStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const currentUser = users.find((u) => u.id === currentUserId);
  if (!currentUser) return null;
  const color = ROLE_COLORS[currentUser.role];

  const pickUser = (u: User) => {
    setCurrentUser(u.id);
    pushToast({
      kind: 'info',
      text: `${u.name} (${ROLE_LABELS[u.role]}) болж нэвтэрлээ`,
    });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-2 py-1.5 border ${color.border} ${color.bg} ${color.text} hover:brightness-125 transition-all text-[10px] uppercase tracking-wider font-semibold`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className={`ml-0.5 px-1 py-[1px] bg-slate-950 text-slate-500 text-[8px] font-mono-tab tracking-[0.2em] border border-slate-700`}
          title="Зөвхөн демогийн төлөө — production-д auth-аас роль тодорхойлогдоно"
        >
          DEV
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`}></span>
        <span>{ROLE_LABELS[currentUser.role]}</span>
        <span className="normal-case tracking-normal text-[11px] font-medium text-slate-200">
          {currentUser.name}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[240px] z-30 border border-slate-700 bg-slate-950/95 backdrop-blur-md shadow-2xl fade-in"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-semibold">
              Хэрэглэгч солих
            </span>
            <span
              className="px-1 py-[1px] bg-amber-500/10 border border-amber-500/40 text-[8px] text-amber-300 font-mono-tab tracking-[0.2em]"
              title="Зөвхөн демогийн төлөө"
            >
              DEV ONLY
            </span>
          </div>
          <div className="divide-y divide-slate-800">
            {users.map((u) => {
              const c = ROLE_COLORS[u.role];
              const active = u.id === currentUserId;
              return (
                <button
                  key={u.id}
                  onClick={() => pickUser(u)}
                  role="menuitemradio"
                  aria-checked={active}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-slate-900/60 transition-colors ${
                    active ? 'bg-slate-900/40' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.dot}`}></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {ROLE_LABELS[u.role]}
                      {u.role === 'engineer' && u.licenseNumber
                        ? ` · ${u.licenseNumber}`
                        : ''}
                    </div>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
