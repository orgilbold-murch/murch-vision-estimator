// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN TYPES — Murch Vision v1
//
// Types marked "Phase 4/5/6 fields" exist now (so slices never need a data
// migration later) but are only read/written starting in that phase.
// ═══════════════════════════════════════════════════════════════════════════

// ─── IDs and enums ─────────────────────────────────────────────────────────

export type SectionId = 'cctv' | 'fire' | 'intercom' | 'electrical';
export type ItemCategory = 'material' | 'labor';
export type TierId = 'premium' | 'standard' | 'economy';
export type ProjectStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'signed'
  | 'archived';
export type UserRole = 'admin' | 'engineer' | 'sales';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'signed';
export type SupplierCategory =
  | 'cctv'
  | 'drone_security'
  | 'electrical'
  | 'auxiliary'
  | 'lighting'
  | 'cable';
export type StockStatus = 'in_stock' | 'order' | 'out_of_stock';

// ─── BOQ items ─────────────────────────────────────────────────────────────

export interface BoqLineItem {
  id: string;
  projectId: string;
  sectionId: SectionId;
  subsection?: string;
  code?: string;
  name: string;
  spec?: string;
  unit: string;
  category: ItemCategory;
  qty: number;
  unitPrice: number;

  // Change tracking (Phase 4)
  originalQty: number;
  originalUnitPrice: number;
  isModified: boolean;
  manualOverride: boolean;
  modifiedAt?: string;
  modifiedBy?: string;
  modificationNote?: string;

  // Supplier linkage (Phase 6)
  supplierId?: string;
  supplierItemId?: string;
  supplierPriceUpdatedAt?: string;

  // Labor-only
  laborUnit?: number;

  // AI provenance (optional)
  aiConfidence?: number;
  aiSource?: string;
}

// Aux items are computed at runtime from BOQ quantities by computeAuxiliary().
// They are stored in the project after initial compute so manual overrides and
// change tracking survive across recomputes.
export interface AuxiliaryItem {
  id: string;
  projectId: string;
  sectionId: SectionId;
  group: string;
  name: string;
  formula: string;
  qty: number;
  unit: string;
  unitPrice: number;

  // Change tracking (Phase 4)
  originalQty: number;
  originalUnitPrice: number;
  isModified: boolean;
  manualOverride: boolean;
  // The last-known value from the БНбД auto-compute, kept in sync on every
  // recompute regardless of manualOverride so the tooltip can show both
  // "formula says X, you have Y" — see store auxiliarySlice for details.
  autoQty: number;
  autoUnitPrice: number;
  modifiedAt?: string;
  modifiedBy?: string;
  modificationNote?: string;
}

// ─── Section metadata ──────────────────────────────────────────────────────

export interface BoqSectionMeta {
  id: SectionId;
  name: string;
  shortName: string;
  color: string;
  source: string; // e.g. 'ХД-03'
  iconKey: 'camera' | 'flame' | 'radio' | 'zap'; // maps to lucide icon
}

// ─── Tier ──────────────────────────────────────────────────────────────────

export interface Tier {
  id: TierId;
  label: string;
  desc: string;
  multiplier: number;
  accent: string;
}

// ─── Project ───────────────────────────────────────────────────────────────

export interface ProjectMeta {
  code: string;
  name: string;
  subtitle: string;
  clients: string;
  location: string;
  area: string;
  pageCountHD?: number;
  pageCountHT?: number;
}

export interface ProjectSettings {
  tier: TierId;
  synergy: boolean;
  vatEnabled: boolean;
}

export interface ProjectFile {
  name: string;
  size: string;
  pages: number;
  type: string;
}

export interface Project {
  id: string;
  organizationId: string;
  meta: ProjectMeta;
  status: ProjectStatus;
  revisionOf?: string;
  revisionLabel?: string; // e.g. "REV-B"
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  settings: ProjectSettings;
  files: ProjectFile[];
  sectionOrder: SectionId[];
  // Items live inside the slice (projectsSlice.items[projectId]) to keep the
  // Project record small and JSON-serialisable.
}

// ─── Users & organizations ─────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  role: UserRole;
  // Engineer-only
  licenseNumber?: string;
  licenseExpires?: string;
  title?: string;
}

// ─── Approvals (Phase 5) ───────────────────────────────────────────────────

export interface ApprovalRecord {
  id: string;
  projectId: string;
  status: ApprovalStatus;
  engineerId: string;
  engineerName: string;
  licenseNumber: string;
  licenseExpires: string;
  submittedBy: string;
  submittedAt: string;
  decidedAt?: string;
  signedAt?: string;
  rejectionReason?: string;
  note?: string;
  snapshotHash: string; // hash of BOQ + aux at approval time
}

// ─── Change log (Phase 4) ──────────────────────────────────────────────────

export type ChangeField =
  | 'qty'
  | 'unitPrice'
  | 'supplierId'
  | 'settings.tier'
  | 'settings.synergy'
  | 'settings.vatEnabled'
  | 'auxQty'
  | 'auxUnitPrice';

export interface ChangeLogEntry {
  id: string;
  projectId: string;
  itemId?: string; // BOQ or aux item id (omitted for project-level settings)
  itemKind?: 'boq' | 'aux' | 'project';
  sectionId?: SectionId;
  field: ChangeField;
  before: number | string | boolean;
  after: number | string | boolean;
  deltaPct?: number;
  userId: string;
  at: string;
  note?: string;
}

// ─── Suppliers & catalog (Phase 6) ─────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  categories: SupplierCategory[];
  country?: string;
  contact?: string;
}

export interface SupplierCatalogItem {
  id: string;
  supplierId: string;
  category: SupplierCategory;
  name: string;
  code?: string;
  spec?: string;
  manufacturer?: string;
  origin?: string;
  unit: string;
  price: number;
  warranty?: string;
  stockStatus: StockStatus;
  priceUpdatedAt: string; // ISO
}

// ─── Computed / derived (Dashboard props) ──────────────────────────────────

export interface ComputedItem extends BoqLineItem {
  total: number;
}

export interface ComputedSection extends BoqSectionMeta {
  items: ComputedItem[];
  material: number;
  labor: number;
  subtotal: number;
  itemCount: number;
}

export interface ComputedAuxRuntimeItem {
  name: string;
  formula: string;
  qty: number;
  unit: string;
  unitPrice: number;
  unitPriceAdjusted: number;
  total: number;
  group: string;
}

export type AuxiliaryBySection = Record<SectionId, ComputedAuxRuntimeItem[]>;

export interface AuxTotals {
  cctv: number;
  fire: number;
  intercom: number;
  electrical: number;
  grand: number;
}

// ─── UI / ephemeral ────────────────────────────────────────────────────────

export interface ToastMessage {
  id: string;
  kind: 'info' | 'success' | 'warn' | 'error';
  text: string;
  at: string;
}
