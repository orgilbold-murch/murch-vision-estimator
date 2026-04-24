import type { StateCreator } from 'zustand';
import type {
  BoqLineItem,
  BoqSectionMeta,
  ChangeLogEntry,
  Project,
  ProjectSettings,
  SectionId,
  TierId,
} from '@/types';

export type BoqItemField = 'qty' | 'unitPrice' | 'supplierId';

// A single undo/redo entry. Undo/redo scope is BOQ line item mutations
// (qty, unitPrice, supplierId) — settings changes (tier/synergy/vat) and
// tab navigation are intentionally excluded.
//
// `id` links the undo entry to the matching ChangeLogEntry, so undo/redo
// can remove/re-add the same audit log row in lockstep.
export interface ItemEditEntry {
  id: string;
  itemId: string;
  field: BoqItemField;
  before: number | string | undefined;
  after: number | string | undefined;
  at: string;
}

export interface ProjectsSlice {
  projects: Project[];
  sections: BoqSectionMeta[];
  items: BoqLineItem[];
  changeLog: ChangeLogEntry[];

  setProjects: (projects: Project[]) => void;
  setSections: (sections: BoqSectionMeta[]) => void;
  setItems: (items: BoqLineItem[]) => void;

  // Returns true if the mutation actually changed the value. Pushes the
  // before/after pair onto the undo stack only on real changes.
  updateItemField: (
    itemId: string,
    field: BoqItemField,
    value: number | string | undefined,
  ) => boolean;

  // Settings do NOT participate in undo/redo per Phase 3 rule.
  updateSettings: (projectId: string, patch: Partial<ProjectSettings>) => void;
  setTier: (projectId: string, tier: TierId) => void;
  setSynergy: (projectId: string, v: boolean) => void;
  setVatEnabled: (projectId: string, v: boolean) => void;

  // Reset helpers
  resetProjectItems: (projectId: string, seededItems: BoqLineItem[]) => void;
  resetProjectSettings: (projectId: string) => void;

  // Internal: apply a plain patch to an item without recording an undo
  // entry. Used by undo/redo to replay without re-recording.
  applyItemFieldRaw: (
    itemId: string,
    field: BoqItemField,
    value: number | string | undefined,
  ) => void;

  // Change tracking (Phase 4)
  pushChangeLogEntry: (entry: ChangeLogEntry) => void;
  removeChangeLogEntry: (entryId: string) => void;
  revertItemToOriginal: (itemId: string) => void;
  revertAllForProject: (projectId: string) => void;

  // Status transitions (Phase 5)
  setProjectStatus: (projectId: string, status: Project['status']) => void;
  cloneProjectAsRevision: (sourceProjectId: string, createdBy: string) => string | null;

  // Recompute isModified across all items of a project from current vs.
  // original. Called after bulk operations (revert, undo batches).
  recomputeItemModifiedFlags: (projectId: string) => void;

  // Selectors
  getItemsForProject: (projectId: string) => BoqLineItem[];
  getItemsForSection: (projectId: string, sectionId: SectionId) => BoqLineItem[];
  getProject: (projectId: string) => Project | undefined;
}

function letterForIndex(i: number): string {
  // 0→A, 1→B, … 25→Z. Beyond 25, wraps (unlikely in practice).
  return String.fromCharCode(65 + (i % 26));
}

export const createProjectsSlice: StateCreator<ProjectsSlice, [], [], ProjectsSlice> = (
  set,
  get,
) => ({
  projects: [],
  sections: [],
  items: [],
  changeLog: [],

  setProjects: (projects) => set({ projects }),
  setSections: (sections) => set({ sections }),
  setItems: (items) => set({ items }),

  updateItemField: (itemId, field, value) => {
    const current = get().items.find((i) => i.id === itemId);
    if (!current) return false;
    const before = current[field as keyof BoqLineItem] as number | string | undefined;
    if (before === value) return false;
    set((state) => ({
      items: state.items.map((it) => {
        if (it.id !== itemId) return it;
        const next = { ...it, [field]: value };
        // Derive isModified from current vs. original so undoing a single
        // edit restores isModified=false automatically.
        const qtyDiffers = next.qty !== next.originalQty;
        const priceDiffers = next.unitPrice !== next.originalUnitPrice;
        return { ...next, isModified: qtyDiffers || priceDiffers };
      }),
    }));
    return true;
  },

  applyItemFieldRaw: (itemId, field, value) => {
    set((state) => ({
      items: state.items.map((it) => {
        if (it.id !== itemId) return it;
        const next = { ...it, [field]: value };
        const qtyDiffers = next.qty !== next.originalQty;
        const priceDiffers = next.unitPrice !== next.originalUnitPrice;
        return { ...next, isModified: qtyDiffers || priceDiffers };
      }),
    }));
  },

  updateSettings: (projectId, patch) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, settings: { ...p.settings, ...patch }, updatedAt: new Date().toISOString() } : p,
      ),
    }));
  },

  setTier: (projectId, tier) => {
    get().updateSettings(projectId, { tier });
  },
  setSynergy: (projectId, synergy) => {
    get().updateSettings(projectId, { synergy });
  },
  setVatEnabled: (projectId, vatEnabled) => {
    get().updateSettings(projectId, { vatEnabled });
  },

  resetProjectItems: (projectId, seededItems) => {
    set((state) => ({
      items: [
        ...state.items.filter((i) => i.projectId !== projectId),
        ...seededItems,
      ],
    }));
  },

  resetProjectSettings: (projectId) => {
    get().updateSettings(projectId, { tier: 'standard', synergy: true, vatEnabled: true });
  },

  pushChangeLogEntry: (entry) => {
    set((state) => ({ changeLog: [...state.changeLog, entry] }));
  },

  removeChangeLogEntry: (entryId) => {
    set((state) => ({
      changeLog: state.changeLog.filter((e) => e.id !== entryId),
    }));
  },

  revertItemToOriginal: (itemId) => {
    set((state) => ({
      items: state.items.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          qty: it.originalQty,
          unitPrice: it.originalUnitPrice,
          isModified: false,
          // Preserve any supplier link and manualOverride flag; those are
          // governed by Phase 6 + the aux-override rule and not tied to
          // the qty/unitPrice revert.
        };
      }),
      // Drop every change log entry referencing this item — the net
      // effect of "revert" is that no edits were ever committed.
      changeLog: state.changeLog.filter((e) => e.itemId !== itemId),
    }));
  },

  revertAllForProject: (projectId) => {
    const state = get() as ProjectsSlice & { currentUserId: string | null };
    const purgedCount = state.changeLog.filter((e) => e.projectId === projectId).length;
    const userId = state.currentUserId ?? 'unknown-user';
    set((s) => ({
      items: s.items.map((it) => {
        if (it.projectId !== projectId) return it;
        return {
          ...it,
          qty: it.originalQty,
          unitPrice: it.originalUnitPrice,
          isModified: false,
        };
      }),
      // Replace the per-item entries with a single historical summary
      // so "who reverted what, when" survives in the audit trail.
      changeLog: [
        ...s.changeLog.filter((e) => e.projectId !== projectId),
        {
          id: `cl-revert-all-${projectId}-${Date.now().toString(36)}`,
          projectId,
          itemKind: 'project' as const,
          field: 'qty' as const, // placeholder — field is required; note holds the real content
          before: purgedCount,
          after: 0,
          userId,
          at: new Date().toISOString(),
          note: `Бүх өөрчлөлтийг буцаасан (${purgedCount} бичлэг)`,
        },
      ],
    }));
  },

  setProjectStatus: (projectId, status) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, status, updatedAt: new Date().toISOString() }
          : p,
      ),
    }));
  },

  cloneProjectAsRevision: (sourceProjectId, createdBy) => {
    const source = get().projects.find((p) => p.id === sourceProjectId);
    if (!source) return null;

    // Compute the next REV letter. Walk the chain back to the original if
    // this source is itself a revision.
    const rootId = source.revisionOf ?? source.id;
    const allRevisions = get().projects.filter(
      (p) => p.revisionOf === rootId || p.id === rootId,
    );
    const nextLetter = letterForIndex(allRevisions.length); // 0→A, 1→B, ...
    const revLabel = `REV-${nextLetter}`;

    const newId = `${rootId}-rev-${nextLetter.toLowerCase()}`;
    const now = new Date().toISOString();

    const newProject: Project = {
      ...source,
      id: newId,
      status: 'draft',
      revisionOf: rootId,
      revisionLabel: revLabel,
      createdAt: now,
      updatedAt: now,
      createdBy,
      meta: {
        ...source.meta,
        code: `${source.meta.code.replace(/-REV-[A-Z]$/, '')}-${revLabel}`,
      },
    };

    // Clone items with new ids and a reset baseline — the revision starts
    // from the source's CURRENT state (not original), so customers keep
    // their negotiated numbers as the new baseline.
    const sourceItems = get().items.filter((i) => i.projectId === sourceProjectId);
    const clonedItems = sourceItems.map((it) => ({
      ...it,
      id: it.id.replace(sourceProjectId, newId),
      projectId: newId,
      originalQty: it.qty,
      originalUnitPrice: it.unitPrice,
      isModified: false,
      manualOverride: false,
    }));

    set((state) => ({
      projects: [...state.projects, newProject],
      items: [...state.items, ...clonedItems],
    }));
    return newId;
  },

  recomputeItemModifiedFlags: (projectId) => {
    set((state) => ({
      items: state.items.map((it) => {
        if (it.projectId !== projectId) return it;
        const qtyDiffers = it.qty !== it.originalQty;
        const priceDiffers = it.unitPrice !== it.originalUnitPrice;
        return { ...it, isModified: qtyDiffers || priceDiffers };
      }),
    }));
  },

  getItemsForProject: (projectId) =>
    get().items.filter((i) => i.projectId === projectId),

  getItemsForSection: (projectId, sectionId) =>
    get().items.filter((i) => i.projectId === projectId && i.sectionId === sectionId),

  getProject: (projectId) => get().projects.find((p) => p.id === projectId),
});
