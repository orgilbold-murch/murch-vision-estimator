import { useCallback, useRef } from 'react';
import { useStore } from '@/store';

const DEBOUNCE_MS = 10_000;

// Guard for signed-project edit attempts. Returns a trigger function that
// fires a specific toast at most once per 10 seconds (per rule in Phase 5
// notes). Use on any interactive element that is disabled because the
// project is signed — clicking it still feels responsive but doesn't spam
// the toast queue.
export function useLockedProjectGuard() {
  const pushToast = useStore((s) => s.pushToast);
  const lastAt = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastAt.current < DEBOUNCE_MS) return;
    lastAt.current = now;
    pushToast({
      kind: 'warn',
      text: 'Энэ төсөл баталгаажсан — засварлахын тулд шинэ хувилбар үүсгэнэ үү',
    });
  }, [pushToast]);
}
