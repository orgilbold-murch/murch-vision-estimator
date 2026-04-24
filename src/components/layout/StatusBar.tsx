// ═══════════════════════════════════════════════════════════════════════════
// StatusBar — a compact header widget showing:
//   · "Онлайн" dot (always green in v1 — Phase 9 wires real connection check)
//   · "Хадгалагдсан · N сек/мин өмнө" — last-saved indicator, refreshed
//     every 10 seconds
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { Wifi, Save } from 'lucide-react';
import { useStore } from '@/store';
import { formatRelativeMN } from '@/lib/date';

const REFRESH_MS = 10_000;

export function StatusBar() {
  const lastPersistedAt = useStore((s) => s.lastPersistedAt);
  const [, tick] = useState(0);

  // Tick every 10s so the relative timestamp refreshes even without store
  // changes.
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), REFRESH_MS);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-slate-500 font-mono-tab">
      <div className="flex items-center gap-1.5">
        <Wifi className="w-3 h-3 text-emerald-400" />
        <span className="text-emerald-300">Онлайн</span>
      </div>
      {lastPersistedAt ? (
        <div
          className="flex items-center gap-1.5"
          title={new Date(lastPersistedAt).toISOString()}
        >
          <Save className="w-3 h-3" />
          <span>Хадгалагдсан · {formatRelativeMN(new Date(lastPersistedAt))}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 opacity-60">
          <Save className="w-3 h-3" />
          <span>Өөрчлөлт байхгүй</span>
        </div>
      )}
    </div>
  );
}
