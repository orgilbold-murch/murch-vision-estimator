import type { StateCreator } from 'zustand';
import type { Supplier, SupplierCatalogItem } from '@/types';

export interface CatalogSlice {
  suppliers: Supplier[];
  catalog: SupplierCatalogItem[];
  setSuppliers: (list: Supplier[]) => void;
  setCatalog: (list: SupplierCatalogItem[]) => void;
}

export const createCatalogSlice: StateCreator<CatalogSlice, [], [], CatalogSlice> = (set) => ({
  suppliers: [],
  catalog: [],
  setSuppliers: (suppliers) => set({ suppliers }),
  setCatalog: (catalog) => set({ catalog }),
});
