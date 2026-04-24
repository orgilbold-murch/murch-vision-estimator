import { useCallback } from 'react';
import { useStore } from '@/store';
import type { BoqItemField } from '@/store/projectsSlice';
import type { ChangeLogEntry, SupplierCatalogItem } from '@/types';

function makeEntryId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function computeDeltaPct(before: unknown, after: unknown): number | undefined {
  if (typeof before !== 'number' || typeof after !== 'number') return undefined;
  if (before === 0) return undefined;
  return ((after - before) / before) * 100;
}

// Thin wrapper around the store that:
//   1. mutates the item
//   2. records the before/after pair in the undo stack (on real change)
//   3. appends a ChangeLogEntry (linked by id to the undo entry)
//   4. fires an auto-save toast ("Хадгалагдсан ✓")
//
// Scope is BOQ qty/unitPrice/supplierId only, per Phase 3 rule. Settings
// (tier/synergy/vat) do NOT route through here.
export function useBoqMutations() {
  const items = useStore((s) => s.items);
  const currentUserId = useStore((s) => s.currentUserId ?? 'unknown-user');
  const updateItemField = useStore((s) => s.updateItemField);
  const applyItemFieldRaw = useStore((s) => s.applyItemFieldRaw);
  const pushUndo = useStore((s) => s.pushUndo);
  const popUndo = useStore((s) => s.popUndo);
  const popRedo = useStore((s) => s.popRedo);
  const pushToast = useStore((s) => s.pushToast);
  const pushChangeLogEntry = useStore((s) => s.pushChangeLogEntry);
  const removeChangeLogEntry = useStore((s) => s.removeChangeLogEntry);
  const revertItemToOriginal = useStore((s) => s.revertItemToOriginal);
  const revertAllForProject = useStore((s) => s.revertAllForProject);
  const bumpLastPersistedAt = useStore((s) => s.bumpLastPersistedAt);

  const mutate = useCallback(
    (itemId: string, field: BoqItemField, value: number | string | undefined) => {
      const current = items.find((i) => i.id === itemId);
      if (!current) return;
      const before = current[field as keyof typeof current] as
        | number
        | string
        | undefined;
      const changed = updateItemField(itemId, field, value);
      if (!changed) return;

      const entryId = makeEntryId();
      const now = new Date().toISOString();

      pushUndo({
        id: entryId,
        itemId,
        field,
        before,
        after: value,
        at: now,
      });

      const logEntry: ChangeLogEntry = {
        id: entryId,
        projectId: current.projectId,
        itemId,
        itemKind: 'boq',
        sectionId: current.sectionId,
        field,
        before: (before ?? '') as number | string | boolean,
        after: (value ?? '') as number | string | boolean,
        deltaPct: computeDeltaPct(before, value),
        userId: currentUserId,
        at: now,
      };
      pushChangeLogEntry(logEntry);
      bumpLastPersistedAt();

      pushToast({ kind: 'success', text: 'Хадгалагдсан ✓' });
    },
    [
      items,
      currentUserId,
      updateItemField,
      pushUndo,
      pushChangeLogEntry,
      pushToast,
      bumpLastPersistedAt,
    ],
  );

  const undo = useCallback(() => {
    const entry = popUndo();
    if (!entry) return false;
    applyItemFieldRaw(entry.itemId, entry.field, entry.before);
    // Keep the audit log in lockstep with undo so users don't see a ghost
    // entry for an edit they just reversed.
    removeChangeLogEntry(entry.id);
    pushToast({ kind: 'info', text: 'Буцаасан' });
    return true;
  }, [popUndo, applyItemFieldRaw, removeChangeLogEntry, pushToast]);

  const redo = useCallback(() => {
    const entry = popRedo();
    if (!entry) return false;
    applyItemFieldRaw(entry.itemId, entry.field, entry.after);
    const current = useStore.getState().items.find((i) => i.id === entry.itemId);
    if (current) {
      const logEntry: ChangeLogEntry = {
        id: entry.id,
        projectId: current.projectId,
        itemId: entry.itemId,
        itemKind: 'boq',
        sectionId: current.sectionId,
        field: entry.field,
        before: (entry.before ?? '') as number | string | boolean,
        after: (entry.after ?? '') as number | string | boolean,
        deltaPct: computeDeltaPct(entry.before, entry.after),
        userId: currentUserId,
        at: entry.at,
      };
      pushChangeLogEntry(logEntry);
    }
    pushToast({ kind: 'info', text: 'Давтсан' });
    return true;
  }, [popRedo, applyItemFieldRaw, pushChangeLogEntry, pushToast, currentUserId]);

  const revertItem = useCallback(
    (itemId: string) => {
      revertItemToOriginal(itemId);
      pushToast({ kind: 'info', text: 'Анхны утгад буцаалаа' });
    },
    [revertItemToOriginal, pushToast],
  );

  const revertAll = useCallback(
    (projectId: string) => {
      revertAllForProject(projectId);
      pushToast({ kind: 'success', text: 'Бүх өөрчлөлтийг буцаалаа' });
    },
    [revertAllForProject, pushToast],
  );

  // Apply a supplier catalog row to a BOQ item: updates unitPrice +
  // supplier linkage, records the mutation in the undo stack + change
  // log with a helpful auto-generated note, and fires a price-update toast.
  const applySupplierPrice = useCallback(
    (itemId: string, catalogItem: SupplierCatalogItem, supplierName: string) => {
      const current = useStore.getState().items.find((i) => i.id === itemId);
      if (!current) return;
      const beforePrice = current.unitPrice;
      const afterPrice = catalogItem.price;

      // Use the full updateItemField flow so undo/log links stay in lockstep.
      if (beforePrice !== afterPrice) {
        const entryId = makeEntryId();
        const now = new Date().toISOString();
        const changed = useStore.getState().updateItemField(itemId, 'unitPrice', afterPrice);
        if (changed) {
          pushUndo({
            id: entryId,
            itemId,
            field: 'unitPrice',
            before: beforePrice,
            after: afterPrice,
            at: now,
          });
          const logEntry: ChangeLogEntry = {
            id: entryId,
            projectId: current.projectId,
            itemId,
            itemKind: 'boq',
            sectionId: current.sectionId,
            field: 'unitPrice',
            before: beforePrice,
            after: afterPrice,
            deltaPct: computeDeltaPct(beforePrice, afterPrice),
            userId: currentUserId,
            at: now,
            note: `Нийлүүлэгч сонгов: ${supplierName}`,
          };
          pushChangeLogEntry(logEntry);
        }
      }

      // Write supplier linkage directly — these fields don't go through
      // the change tracker (they are metadata attached to the price).
      useStore.setState((state) => ({
        items: state.items.map((it) =>
          it.id === itemId
            ? {
                ...it,
                supplierId: catalogItem.supplierId,
                supplierItemId: catalogItem.id,
                supplierPriceUpdatedAt: catalogItem.priceUpdatedAt,
              }
            : it,
        ),
      }));

      if (beforePrice !== afterPrice) {
        const delta = afterPrice - beforePrice;
        pushToast({
          kind: 'success',
          text: `Үнэ шинэчлэгдлээ: ${beforePrice.toLocaleString('mn-MN')} → ${afterPrice.toLocaleString('mn-MN')} ₮ (${delta >= 0 ? '+' : ''}${delta.toLocaleString('mn-MN')})`,
        });
      } else {
        pushToast({ kind: 'info', text: `Нийлүүлэгч сонгов: ${supplierName}` });
      }
    },
    [currentUserId, pushUndo, pushChangeLogEntry, pushToast],
  );

  return { mutate, undo, redo, revertItem, revertAll, applySupplierPrice };
}
