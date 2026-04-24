import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { createAuthSlice, type AuthSlice } from './authSlice';
import { createProjectsSlice, type ProjectsSlice } from './projectsSlice';
import { createCatalogSlice, type CatalogSlice } from './catalogSlice';
import { createUiSlice, type UiSlice } from './uiSlice';
import { createApprovalsSlice, type ApprovalsSlice } from './approvalsSlice';

import { loadSeedBundle, isSeeded, markSeeded } from '@/data/seedLoader';

export type Store = AuthSlice & ProjectsSlice & CatalogSlice & UiSlice & ApprovalsSlice;

export const useStore = create<Store>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createProjectsSlice(set, get, api),
      ...createCatalogSlice(set, get, api),
      ...createUiSlice(set, get, api),
      ...createApprovalsSlice(set, get, api),
    }),
    {
      name: 'murch-vision:store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Persist only durable state — never ephemeral UI state.
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        users: state.users,
        projects: state.projects,
        sections: state.sections,
        items: state.items,
        changeLog: state.changeLog,
        approvals: state.approvals,
        suppliers: state.suppliers,
        catalog: state.catalog,
        recentSearches: state.recentSearches,
      }),
      // Seeding is performed after create() resolves (see seedIfNeeded
      // call at the bottom of this file) to avoid a TDZ where
      // onRehydrateStorage fires before `useStore` has been assigned.
    },
  ),
);

// Initial seed: if no prior localStorage state exists, hydrate the store
// with the shipped seed bundle. Also runs when the seed version flag is
// missing (e.g. after a data migration).
export function seedIfNeeded(): void {
  const s = useStore.getState();
  const alreadyLoaded =
    s.projects.length > 0 ||
    s.users.length > 0 ||
    s.items.length > 0;
  if (isSeeded() && alreadyLoaded) return;

  const seed = loadSeedBundle();
  useStore.setState({
    users: seed.users,
    currentUserId: s.currentUserId ?? seed.users.find((u) => u.role === 'sales')?.id ?? null,
    projects: seed.projects,
    sections: seed.sections,
    items: seed.items,
    suppliers: seed.suppliers,
    catalog: seed.catalog,
    approvals: seed.approvals,
    changeLog: seed.changeLog,
  });
  markSeeded();
}

// Seed synchronously at module-load. For localStorage (sync storage),
// zustand's persist rehydration has already completed by the time we
// reach here — so existing user data is preserved and only missing
// bundles are populated.
seedIfNeeded();

// Convenience selectors used across the UI.
export const selectors = {
  currentUser: (s: Store) => s.users.find((u) => u.id === s.currentUserId),
  project: (projectId: string) => (s: Store) =>
    s.projects.find((p) => p.id === projectId),
  projectItems: (projectId: string) => (s: Store) =>
    s.items.filter((i) => i.projectId === projectId),
  sectionItems: (projectId: string, sectionId: string) => (s: Store) =>
    s.items.filter((i) => i.projectId === projectId && i.sectionId === sectionId),
};
