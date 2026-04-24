import { useEffect } from 'react';
import { Check, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '@/store';

const AUTO_DISMISS_MS = 2000;

export function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS),
    );
    return () => timers.forEach((h) => window.clearTimeout(h));
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 print:hidden">
      {toasts.slice(-3).map((t) => {
        const Icon = t.kind === 'success' ? Check : t.kind === 'warn' ? AlertTriangle : Info;
        const color =
          t.kind === 'success'
            ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60'
            : t.kind === 'warn'
              ? 'text-amber-400 border-amber-500/40 bg-amber-950/60'
              : t.kind === 'error'
                ? 'text-red-400 border-red-500/40 bg-red-950/60'
                : 'text-blue-400 border-blue-500/40 bg-blue-950/60';
        return (
          <div
            key={t.id}
            className={`fade-in min-w-[180px] max-w-[420px] px-4 py-2.5 border backdrop-blur-md flex items-center gap-2 text-sm shadow-xl ${color}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{t.text}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Хаах"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
