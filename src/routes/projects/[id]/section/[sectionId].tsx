import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Search, Wrench, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNavigate, useOutletContext, useParams, Navigate } from 'react-router-dom';

import { formatShort, formatMNT } from '@/lib/format';
import { AUX_PRICE_PER_SECTION_HINT } from '@/lib/tiers';
import { useBoqMutations } from '@/hooks/useBoqMutations';
import { useLockedProjectGuard } from '@/hooks/useLockedProjectGuard';
import { DiffIndicator } from '@/components/primitives/DiffIndicator';
import { daysAgo } from '@/lib/date';
import type { ComputedItem, SectionId } from '@/types';
import type { DashboardOutletContext } from '../layout';

type UpdateField = 'qty' | 'unitPrice';

export function SectionRoute() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const ctx = useOutletContext<DashboardOutletContext>();
  const [search, setSearch] = useState('');
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({});
  const { mutate, revertItem } = useBoqMutations();
  const lockedGuard = useLockedProjectGuard();
  const isLocked = ctx.project.status === 'signed';

  const openSuppliers = () => navigate(`/projects/${ctx.project.id}/suppliers`);

  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const section = ctx.sectionTotals.find((s) => s.id === sectionId);
  if (!section) {
    return <Navigate to={`/projects/${ctx.project.id}/overview`} replace />;
  }

  const auxItems = ctx.auxiliaryData[sectionId as SectionId] ?? [];
  const auxTotal = ctx.auxTotals[sectionId as SectionId] ?? 0;
  const tierMultiplier = ctx.tierMultiplier;

  const toggleSub = (key: string) => {
    setExpandedSub((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const onUpdate = (idx: number, field: UpdateField, value: number) => {
    if (isLocked) {
      lockedGuard();
      return;
    }
    const item = section.items[idx];
    if (!item) return;
    mutate(item.id, field, Math.max(0, Number.isFinite(value) ? value : 0));
  };

  const items = section.items;
  const filtered = items
    .map((it, origIdx) => ({ ...it, _idx: origIdx }))
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.spec !== undefined && item.spec.toLowerCase().includes(search.toLowerCase())),
    );

  const hasSubsections = items.some((it) => it.subsection !== undefined);
  const grouped = hasSubsections
    ? filtered.reduce<Record<string, (ComputedItem & { _idx: number })[]>>((acc, item) => {
        const key = item.subsection ?? 'Бусад';
        if (!acc[key]) acc[key] = [];
        acc[key]!.push(item);
        return acc;
      }, {})
    : null;

  const totalMaterial = section.material;
  const totalLabor = section.labor;

  return (
    <div className="fade-in">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8" style={{ background: section.color }}></div>
            <h2 className="font-display text-2xl font-bold text-white">{section.name}</h2>
          </div>
          <div className="text-xs text-slate-500">
            {items.length} нэр төрөл · {auxItems.length} туслах материал · Нийт{' '}
            {items.reduce((s, i) => s + i.qty, 0).toLocaleString('en-US')} ш/м
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Материал</div>
            <div className="font-mono-tab text-lg text-white">{formatShort(totalMaterial)}₮</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Ажил</div>
            <div className="font-mono-tab text-lg text-white">{formatShort(totalLabor)}₮</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-emerald-500">Туслах</div>
            <div className="font-mono-tab text-lg text-emerald-400">{formatShort(auxTotal)}₮</div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Материал хайх... (/ дарж фокуслана)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono-tab">
          {filtered.length} / {items.length}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main items list */}
        <div className="xl:col-span-2">
          {hasSubsections && grouped ? (
            <div className="space-y-3">
              {Object.entries(grouped).map(([group, groupItems]) => {
                const isExpanded = expandedSub[group] !== false;
                const groupTotal = groupItems.reduce(
                  (s, i) =>
                    s + i.qty * i.unitPrice * (i.category === 'material' ? tierMultiplier : 1),
                  0,
                );
                return (
                  <div key={group} className="border border-slate-800 bg-slate-950/40">
                    <button
                      onClick={() => toggleSub(group)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-display text-sm font-semibold text-white">
                          {group}
                        </span>
                        <span className="text-xs text-slate-500">({groupItems.length})</span>
                      </div>
                      <span className="font-mono-tab text-sm text-slate-300">
                        {formatShort(groupTotal)}₮
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-800 divide-y divide-slate-900">
                        {groupItems.map((item) => (
                          <ItemRow
                            key={item._idx}
                            item={item}
                            idx={item._idx}
                            update={onUpdate}
                            onRevert={() => (isLocked ? lockedGuard() : revertItem(item.id))}
                            tierMultiplier={tierMultiplier}
                            locked={isLocked}
                            onLockedAttempt={lockedGuard}
                            onSupplierClick={openSuppliers}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-slate-800 bg-slate-950/40 divide-y divide-slate-900">
              {filtered.map((item) => (
                <ItemRow
                  key={item._idx}
                  item={item}
                  idx={item._idx}
                  update={onUpdate}
                  onRevert={() => (isLocked ? lockedGuard() : revertItem(item.id))}
                  tierMultiplier={tierMultiplier}
                  locked={isLocked}
                  onLockedAttempt={lockedGuard}
                  onSupplierClick={openSuppliers}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auxiliary preview sidebar */}
        <div className="xl:col-span-1">
          <div className="border border-emerald-900/50 bg-gradient-to-br from-emerald-950/30 to-slate-950/60 p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <div className="font-display text-sm font-bold text-emerald-300 uppercase tracking-wider">
                Туслах материал
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              БНбД нормчлолоор автоматаар тооцоолсон.{' '}
              {AUX_PRICE_PER_SECTION_HINT[section.id] ?? ''}
            </div>
            <div className="max-h-[520px] overflow-y-auto custom-scroll -mr-2 pr-2">
              <div className="space-y-1.5">
                {auxItems.map((a, i) => (
                  <div
                    key={i}
                    className="flex justify-between gap-2 py-1.5 border-b border-slate-800/50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate">{a.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {a.group} · {a.qty.toLocaleString('en-US')} {a.unit}
                      </div>
                    </div>
                    <div className="font-mono-tab text-xs text-emerald-400 whitespace-nowrap">
                      {formatShort(a.total)}₮
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-emerald-900/50 flex justify-between items-center">
              <span className="text-xs text-slate-400">Нийт</span>
              <span className="font-mono-tab text-lg font-bold text-emerald-400">
                {formatMNT(auxTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ItemRow ────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ComputedItem;
  idx: number;
  update: (idx: number, field: UpdateField, value: number) => void;
  onRevert: () => void;
  tierMultiplier: number;
  locked?: boolean;
  onLockedAttempt?: () => void;
  onSupplierClick?: () => void;
}

function handleNumericKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  current: number,
  setValue: (v: number) => void,
  steps: { small: number; medium: number; large: number } = { small: 1, medium: 10, large: 100 },
): void {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  const sign = e.key === 'ArrowUp' ? 1 : -1;
  const step = e.altKey ? steps.large : e.shiftKey ? steps.medium : steps.small;
  setValue(Math.max(0, current + sign * step));
}

function ItemRow({ item, idx, update, onRevert, tierMultiplier, locked = false, onLockedAttempt, onSupplierClick }: ItemRowProps) {
  const priceAgeDays = item.supplierPriceUpdatedAt ? daysAgo(item.supplierPriceUpdatedAt) : null;
  const isStale = priceAgeDays !== null && priceAgeDays > 30;
  const effectiveMultiplier = item.category === 'material' ? tierMultiplier : 1;
  const total = item.qty * item.unitPrice * effectiveMultiplier;
  const qtyChanged = item.qty !== item.originalQty;
  const priceChanged = item.unitPrice !== item.originalUnitPrice;
  const originalTotal =
    item.originalQty * item.originalUnitPrice * effectiveMultiplier;

  return (
    <div
      className={`relative px-4 py-3 hover:bg-slate-900/30 transition group ${
        item.isModified ? 'bg-amber-500/[0.04]' : ''
      }`}
    >
      {/* Amber "this row changed" bar — 3px, visible across the table. */}
      {item.isModified && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: '#f59e0b' }}
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {item.category === 'labor' && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-amber-950/60 border border-amber-900/50 text-amber-400 uppercase tracking-wider">
                Ажил
              </span>
            )}
            <span className="text-sm text-white leading-tight">{item.name}</span>
          </div>
          {item.spec && <div className="text-[10px] text-slate-500 mt-0.5">{item.spec}</div>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="font-mono-tab text-sm font-bold text-white whitespace-nowrap">
              {formatShort(total)}₮
            </div>
            {item.isModified && originalTotal !== total && (
              <div className="mt-0.5">
                <DiffIndicator
                  current={total}
                  original={originalTotal}
                  unitSuffix="₮"
                />
              </div>
            )}
          </div>
          {/* Revert icon — hover-only to avoid 120-item visual noise. */}
          {item.isModified && (
            <button
              onClick={onRevert}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400"
              title="Анхны утгад буцаах"
              aria-label="Анхны утгад буцаах"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-start gap-3 text-xs flex-wrap">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Тоо:</span>
            <input
              type="number"
              value={item.qty}
              readOnly={locked}
              onFocus={locked ? onLockedAttempt : undefined}
              onKeyDown={locked ? onLockedAttempt : (e) => handleNumericKey(e, item.qty, (v) => update(idx, 'qty', v))}
              onChange={(e) => update(idx, 'qty', parseFloat(e.target.value) || 0)}
              className={`w-20 border px-2 py-1 text-xs font-mono-tab focus:outline-none ${
                locked
                  ? 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed'
                  : qtyChanged
                    ? 'bg-slate-950 border-amber-500/60 focus:border-amber-400 text-white'
                    : 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white'
              }`}
            />
            <span className="text-slate-600 text-[10px]">{item.unit}</span>
          </div>
          {qtyChanged && (
            <div className="pl-8 pr-2 min-w-[9rem]">
              <DiffIndicator
                current={item.qty}
                original={item.originalQty}
                unitSuffix={item.unit}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Үнэ:</span>
            <input
              type="number"
              value={item.unitPrice}
              readOnly={locked}
              onFocus={locked ? onLockedAttempt : undefined}
              onKeyDown={locked ? onLockedAttempt : (e) => handleNumericKey(e, item.unitPrice, (v) => update(idx, 'unitPrice', v), { small: 100, medium: 1000, large: 10000 })}
              onChange={(e) => update(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
              className={`w-28 border px-2 py-1 text-xs font-mono-tab focus:outline-none ${
                locked
                  ? 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed'
                  : priceChanged
                    ? 'bg-slate-950 border-amber-500/60 focus:border-amber-400 text-white'
                    : 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white'
              }`}
            />
            <span className="text-slate-600 text-[10px]">₮</span>
            {isStale && priceAgeDays !== null && (
              <button
                onClick={onSupplierClick}
                className="ml-0.5 text-amber-400 hover:text-amber-300"
                title={`Нийлүүлэгчийн үнэ ${priceAgeDays} өдрийн өмнөх — шинэчлэх үү?`}
                aria-label="Stale price"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {priceChanged && (
            <div className="pl-8 pr-2 min-w-[9rem]">
              <DiffIndicator
                current={item.unitPrice}
                original={item.originalUnitPrice}
                unitSuffix="₮"
              />
            </div>
          )}
        </div>
        {tierMultiplier !== 1 && item.category === 'material' && (
          <span className="text-[10px] text-slate-500 self-center">×{tierMultiplier.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}
