// ═══════════════════════════════════════════════════════════════════════════
// FirstRunSplash — ~1.2s logo animation shown when the app has never run
// before in this browser. Auto-dismisses. Feels like a loading screen, not
// an onboarding wizard (per Phase 8 rule: no "Get started" button).
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { Logo } from '@/components/primitives/Logo';

const FLAG_KEY = 'murch-vision:first-run-shown';
const TOTAL_MS = 1200;

export function useFirstRunSplash(): boolean {
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem(FLAG_KEY) !== '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(FLAG_KEY, '1');
      } catch {
        // ignore
      }
      setShow(false);
    }, TOTAL_MS);
    return () => window.clearTimeout(t);
  }, [show]);
  return show;
}

export function FirstRunSplash({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at 20% 0%, #0a1a3e 0%, #050914 60%)',
      }}
    >
      <div
        className="splash-logo"
        style={{
          animation: 'splashFade 1s ease-out forwards',
        }}
      >
        <Logo height={56} />
        <div className="mt-5 text-center text-[10px] uppercase tracking-[0.3em] text-slate-500 font-semibold">
          AI · Construction Cost Estimate
        </div>
      </div>
      <style>{`
        @keyframes splashFade {
          0%   { opacity: 0; transform: scale(0.8); }
          50%  { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
