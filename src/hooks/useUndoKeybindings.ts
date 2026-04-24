import { useEffect } from 'react';
import { useBoqMutations } from './useBoqMutations';

// Global Cmd/Ctrl+Z (undo) and Cmd/Ctrl+Shift+Z (redo).
// Scope is BOQ item mutations — see useBoqMutations. Ignored when the
// target is a text input/textarea unless the user explicitly wants
// system-level undo (we don't short-circuit system undo; we just also
// trigger app-level undo, which is fine when focused on a BOQ qty/price
// field because the app-level undo takes precedence after commit).
export function useUndoKeybindings(): void {
  const { undo, redo } = useBoqMutations();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() !== 'z') return;
      // Skip if user is typing in a non-numeric field (we don't want to
      // disrupt text editing). Numeric inputs for qty/unitPrice fall
      // through — the app-level undo should run instead of the browser's.
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const isNumberInput =
          tag === 'INPUT' && (target as HTMLInputElement).type === 'number';
        const isTextArea = tag === 'TEXTAREA';
        const isEditable = (target as HTMLElement).isContentEditable;
        if (!isNumberInput && (tag === 'INPUT' || isTextArea || isEditable)) {
          return;
        }
      }
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
}
