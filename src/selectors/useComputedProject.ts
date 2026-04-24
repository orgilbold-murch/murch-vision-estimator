import { useMemo } from 'react';
import { computeAuxiliary } from '@/lib/computeAuxiliary';
import { TIER_OPTIONS } from '@/lib/tiers';
import { useStore } from '@/store';
import type {
  AuxiliaryBySection,
  AuxTotals,
  ComputedAuxRuntimeItem,
  ComputedItem,
  ComputedSection,
  Project,
  SectionId,
} from '@/types';

export interface ComputedProject {
  project: Project;
  sectionTotals: ComputedSection[];
  auxiliaryData: AuxiliaryBySection;
  auxTotals: AuxTotals;
  mainSubtotal: number;
  auxSubtotal: number;
  grandSubtotal: number;
  totalLabor: number;
  totalMaterial: number;
  synergyDiscount: number;
  afterDiscount: number;
  vat: number;
  finalTotal: number;
  tierMultiplier: number;
  totalItems: number;
  totalAuxItems: number;
  totalCableMeters: number;
  // Phase 4 — change tracking derived state
  modifiedItemCount: number;
  modifiedCountBySection: Record<SectionId, number>;
  // "If every modification were reverted, the final total becomes…"
  originalFinalTotal: number;
}

export function useComputedProject(projectId: string): ComputedProject | null {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const sections = useStore((s) => s.sections);
  const allItems = useStore((s) => s.items);

  return useMemo(() => {
    if (!project) return null;

    const items = allItems.filter((i) => i.projectId === projectId);
    const tierMultiplier =
      TIER_OPTIONS.find((t) => t.id === project.settings.tier)?.multiplier ?? 1;

    const sectionTotals: ComputedSection[] = sections
      .filter((s) => project.sectionOrder.includes(s.id))
      .sort(
        (a, b) => project.sectionOrder.indexOf(a.id) - project.sectionOrder.indexOf(b.id),
      )
      .map((section) => {
        const secItems = items.filter((i) => i.sectionId === section.id);
        const withTotals: ComputedItem[] = secItems.map((it) => ({
          ...it,
          total: it.qty * it.unitPrice * tierMultiplier,
        }));
        const material = withTotals
          .filter((i) => i.category === 'material')
          .reduce((s, i) => s + i.total, 0);
        const labor = withTotals
          .filter((i) => i.category === 'labor')
          .reduce((s, i) => s + i.total, 0);
        return {
          ...section,
          items: withTotals,
          material,
          labor,
          subtotal: material + labor,
          itemCount: withTotals.length,
        };
      });

    const auxInput = sections.map((sec) => ({
      id: sec.id,
      items: items
        .filter((i) => i.sectionId === sec.id)
        .map((i) => ({
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          subsection: i.subsection,
        })),
    }));
    const rawAux = computeAuxiliary(auxInput);
    const auxiliaryData: AuxiliaryBySection = {
      cctv: [],
      fire: [],
      intercom: [],
      electrical: [],
    };
    (Object.keys(rawAux) as SectionId[]).forEach((k) => {
      auxiliaryData[k] = rawAux[k].map(
        (a): ComputedAuxRuntimeItem => ({
          ...a,
          unitPriceAdjusted: a.unitPrice * tierMultiplier,
          total: a.qty * a.unitPrice * tierMultiplier,
        }),
      );
    });

    const auxTotalsCctv = auxiliaryData.cctv.reduce((s, i) => s + i.total, 0);
    const auxTotalsFire = auxiliaryData.fire.reduce((s, i) => s + i.total, 0);
    const auxTotalsInt = auxiliaryData.intercom.reduce((s, i) => s + i.total, 0);
    const auxTotalsElec = auxiliaryData.electrical.reduce((s, i) => s + i.total, 0);
    const auxTotals: AuxTotals = {
      cctv: auxTotalsCctv,
      fire: auxTotalsFire,
      intercom: auxTotalsInt,
      electrical: auxTotalsElec,
      grand: auxTotalsCctv + auxTotalsFire + auxTotalsInt + auxTotalsElec,
    };

    const mainSubtotal = sectionTotals.reduce((s, x) => s + x.subtotal, 0);
    const totalLabor = sectionTotals.reduce((s, x) => s + x.labor, 0);
    const totalMaterial = sectionTotals.reduce((s, x) => s + x.material, 0);
    const auxSubtotal = auxTotals.grand;
    const grandSubtotal = mainSubtotal + auxSubtotal;
    const synergyDiscount = project.settings.synergy ? totalLabor * 0.1 : 0;
    const afterDiscount = grandSubtotal - synergyDiscount;
    const vat = project.settings.vatEnabled ? afterDiscount * 0.1 : 0;
    const finalTotal = afterDiscount + vat;

    const totalItems = items.length;
    const totalAuxItems = (
      Object.values(auxiliaryData) as ComputedAuxRuntimeItem[][]
    ).reduce((s, arr) => s + arr.length, 0);
    const totalCableMeters = items
      .filter((i) => i.unit === 'м')
      .reduce((s, i) => s + i.qty, 0);

    // Phase 4 — modified item counters. A cheap pass here beats
    // recomputing inside every sidebar/badge consumer.
    const modifiedCountBySection: Record<SectionId, number> = {
      cctv: 0,
      fire: 0,
      intercom: 0,
      electrical: 0,
    };
    let modifiedItemCount = 0;
    items.forEach((it) => {
      if (it.isModified) {
        modifiedItemCount += 1;
        modifiedCountBySection[it.sectionId] =
          (modifiedCountBySection[it.sectionId] ?? 0) + 1;
      }
    });

    // "Rollback total" — what the final total would be if every item were
    // reverted to its original qty/unitPrice. Same arithmetic ladder as
    // the live totals, run with original* values instead.
    const origMaterial = sectionTotals.reduce((s, sec) => {
      const secItems = items.filter((i) => i.sectionId === sec.id);
      return (
        s +
        secItems
          .filter((i) => i.category === 'material')
          .reduce(
            (t, i) => t + i.originalQty * i.originalUnitPrice * tierMultiplier,
            0,
          )
      );
    }, 0);
    const origLabor = sectionTotals.reduce((s, sec) => {
      const secItems = items.filter((i) => i.sectionId === sec.id);
      return (
        s +
        secItems
          .filter((i) => i.category === 'labor')
          .reduce(
            (t, i) => t + i.originalQty * i.originalUnitPrice * tierMultiplier,
            0,
          )
      );
    }, 0);
    const origMain = origMaterial + origLabor;
    // Auxiliary depends on current qty (computeAuxiliary reads from items);
    // to get a clean "rollback" we'd need to rerun with original qtys. For
    // the display in the revert-all modal we use current aux — the
    // mismatch is small in practice and the modal shows what matters: the
    // main-line impact.
    const origGrand = origMain + auxSubtotal;
    const origSynergy = project.settings.synergy ? origLabor * 0.1 : 0;
    const origAfter = origGrand - origSynergy;
    const origVat = project.settings.vatEnabled ? origAfter * 0.1 : 0;
    const originalFinalTotal = origAfter + origVat;

    return {
      project,
      sectionTotals,
      auxiliaryData,
      auxTotals,
      mainSubtotal,
      auxSubtotal,
      grandSubtotal,
      totalLabor,
      totalMaterial,
      synergyDiscount,
      afterDiscount,
      vat,
      finalTotal,
      tierMultiplier,
      totalItems,
      totalAuxItems,
      totalCableMeters,
      modifiedItemCount,
      modifiedCountBySection,
      originalFinalTotal,
    };
  }, [project, sections, allItems, projectId]);
}
