import organizationsData from './seed/organizations.json';
import usersData from './seed/users.json';
import projectsData from './seed/projects.json';
import sectionsData from './seed/sections.json';
import itemsData from './seed/items.json';
import suppliersData from './seed/suppliers.json';
import catalogData from './seed/catalog.json';
import approvalsData from './seed/approvals.json';
import changeLogData from './seed/changeLog.json';

import type {
  Organization,
  User,
  Project,
  BoqSectionMeta,
  BoqLineItem,
  Supplier,
  SupplierCatalogItem,
  ApprovalRecord,
  ChangeLogEntry,
} from '@/types';

const SEED_FLAG = 'murch-vision:seeded';
const SEED_VERSION = '1';

export interface SeedBundle {
  organizations: Organization[];
  users: User[];
  projects: Project[];
  sections: BoqSectionMeta[];
  items: BoqLineItem[];
  suppliers: Supplier[];
  catalog: SupplierCatalogItem[];
  approvals: ApprovalRecord[];
  changeLog: ChangeLogEntry[];
}

// Type-cast the JSON imports once. JSON `import` lacks the fine-grained
// typing we want, and the build-seed.mjs script is the authority on shape.
export function loadSeedBundle(): SeedBundle {
  return {
    organizations: organizationsData as Organization[],
    users: usersData as User[],
    projects: projectsData as Project[],
    sections: sectionsData as BoqSectionMeta[],
    items: itemsData as BoqLineItem[],
    suppliers: suppliersData as Supplier[],
    catalog: catalogData as SupplierCatalogItem[],
    approvals: approvalsData as ApprovalRecord[],
    changeLog: changeLogData as ChangeLogEntry[],
  };
}

export function isSeeded(): boolean {
  try {
    return localStorage.getItem(SEED_FLAG) === SEED_VERSION;
  } catch {
    return false;
  }
}

export function markSeeded(): void {
  try {
    localStorage.setItem(SEED_FLAG, SEED_VERSION);
  } catch {
    // Private mode or storage full — proceed without persistence.
  }
}
