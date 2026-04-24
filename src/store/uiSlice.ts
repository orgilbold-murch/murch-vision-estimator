import type { StateCreator } from 'zustand';
import type { ToastMessage } from '@/types';
import type { ItemEditEntry } from './projectsSlice';

const UNDO_STACK_LIMIT = 50;

export interface UiSlice {
  // Toast queue (auto-dismiss handled by <ToastHost>)
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id' | 'at'>) => void;
  dismissToast: (id: string) => void;

  // Undo/redo. Scope: BOQ item qty/unitPrice/supplierId only — see
  // projectsSlice.ItemEditEntry. Settings (tier/synergy/vat) are not
  // recorded here.
  undoStack: ItemEditEntry[];
  redoStack: ItemEditEntry[];
  pushUndo: (entry: ItemEditEntry) => void;
  popUndo: () => ItemEditEntry | undefined;
  popRedo: () => ItemEditEntry | undefined;
  clearHistory: () => void;

  // Global search recent queries (Phase 7)
  recentSearches: string[];
  pushRecentSearch: (query: string) => void;

  // Phase 8 — last-saved timestamp. Bumped from useBoqMutations on every
  // successful BOQ edit (qty/unitPrice/supplierId). Settings toggles do
  // NOT bump this — the status-bar text reads 'last BOQ save'.
  lastPersistedAt: number | null;
  bumpLastPersistedAt: () => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = Math.random().toString(36).slice(2, 10);
    const at = new Date().toISOString();
    set((s) => ({ toasts: [...s.toasts, { id, at, ...toast }] }));
  },
  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  undoStack: [],
  redoStack: [],

  pushUndo: (entry) => {
    set((s) => {
      // New edit → clear redo (standard undo-stack semantics)
      const nextUndo = [...s.undoStack, entry].slice(-UNDO_STACK_LIMIT);
      return { undoStack: nextUndo, redoStack: [] };
    });
  },

  popUndo: () => {
    const stack = get().undoStack;
    const entry = stack[stack.length - 1];
    if (!entry) return undefined;
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, entry].slice(-UNDO_STACK_LIMIT),
    }));
    return entry;
  },

  popRedo: () => {
    const stack = get().redoStack;
    const entry = stack[stack.length - 1];
    if (!entry) return undefined;
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, entry].slice(-UNDO_STACK_LIMIT),
    }));
    return entry;
  },

  clearHistory: () => set({ undoStack: [], redoStack: [] }),

  recentSearches: [],
  pushRecentSearch: (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    set((s) => ({
      recentSearches: [trimmed, ...s.recentSearches.filter((q) => q !== trimmed)].slice(0, 5),
    }));
  },

  lastPersistedAt: null,
  bumpLastPersistedAt: () => set({ lastPersistedAt: Date.now() }),
});
