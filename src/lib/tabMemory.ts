// Per-project "last viewed tab" memory. Stored as individual
// localStorage keys so they survive store migrations.

const tabKey = (projectId: string): string => `murch:project:${projectId}:lastTab`;

export const VALID_TABS = ['overview', 'auxiliary', 'settings', 'quote'] as const;
export const SECTION_TABS = ['cctv', 'fire', 'intercom', 'electrical'] as const;
export type TabRoute = (typeof VALID_TABS)[number] | `section/${(typeof SECTION_TABS)[number]}`;

export function readLastTab(projectId: string): TabRoute {
  try {
    const raw = localStorage.getItem(tabKey(projectId));
    if (!raw) return 'overview';
    if (VALID_TABS.includes(raw as (typeof VALID_TABS)[number])) return raw as TabRoute;
    if (raw.startsWith('section/')) {
      const sid = raw.slice('section/'.length);
      if (SECTION_TABS.includes(sid as (typeof SECTION_TABS)[number])) return raw as TabRoute;
    }
    return 'overview';
  } catch {
    return 'overview';
  }
}

export function writeLastTab(projectId: string, tab: TabRoute): void {
  try {
    localStorage.setItem(tabKey(projectId), tab);
  } catch {
    // ignore
  }
}
