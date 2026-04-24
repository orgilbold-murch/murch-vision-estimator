// Legacy JSON + CSV exports from the v3 artifact. Phase 7 will add PDF
// and richer Excel via SheetJS — these are kept unchanged for parity with
// the v3 demo flow.

import { downloadBlob } from '@/lib/download';
import type {
  AuxiliaryBySection,
  AuxTotals,
  ComputedSection,
  ProjectMeta,
} from '@/types';

export interface LegacyExportInputs {
  projectMeta: ProjectMeta;
  sectionTotals: ComputedSection[];
  auxiliaryData: AuxiliaryBySection;
  auxTotals: AuxTotals;
  mainSubtotal: number;
  auxSubtotal: number;
  grandSubtotal: number;
  synergyDiscount: number;
  afterDiscount: number;
  vat: number;
  finalTotal: number;
  tier: string;
  tierMultiplier: number;
  synergy: boolean;
  vatEnabled: boolean;
  totalItems: number;
  totalAuxItems: number;
  totalCableMeters: number;
}

export function exportLegacyJSON(inputs: LegacyExportInputs): void {
  const payload = {
    project: inputs.projectMeta,
    generated: new Date().toISOString(),
    tier: inputs.tier,
    synergyDiscount: inputs.synergy,
    vatIncluded: inputs.vatEnabled,
    sections: inputs.sectionTotals,
    auxiliary: inputs.auxiliaryData,
    auxTotals: inputs.auxTotals,
    summary: {
      mainSubtotal: inputs.mainSubtotal,
      auxSubtotal: inputs.auxSubtotal,
      grandSubtotal: inputs.grandSubtotal,
      synergyDiscount: inputs.synergyDiscount,
      afterDiscount: inputs.afterDiscount,
      vat: inputs.vat,
      finalTotal: inputs.finalTotal,
      totalItems: inputs.totalItems,
      totalAuxItems: inputs.totalAuxItems,
      totalCableMeters: inputs.totalCableMeters,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const filename = `murch-vision-${slugifyCode(inputs.projectMeta.code)}-full-estimate.json`;
  downloadBlob(blob, filename);
}

function slugifyCode(code: string): string {
  return code.replace(/[^A-Za-z0-9-]+/g, '-').toLowerCase();
}
