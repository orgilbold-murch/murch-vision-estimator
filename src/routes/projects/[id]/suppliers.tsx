// ═══════════════════════════════════════════════════════════════════════════
// /projects/:id/suppliers — project-scoped supplier comparison
//
// Shows every BOQ item of the project alongside the cheapest catalog
// match, the potential savings, and a drawer for head-to-head comparison.
// Bulk action: switch every item to its cheapest compatible supplier.
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Store,
  X,
  TrendingDown,
  Package,
} from 'lucide-react';

import { Logo } from '@/components/primitives/Logo';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { useStore } from '@/store';
import { useComputedProject } from '@/selectors/useComputedProject';
import { useBoqMutations } from '@/hooks/useBoqMutations';
import { findCatalogMatches, cheapestMatch, type CatalogMatch } from '@/selectors/catalogMatch';
import { formatMNT, formatNum, formatShort } from '@/lib/format';
import { daysAgo } from '@/lib/date';
import type { BoqLineItem, SectionId, SupplierCatalogItem } from '@/types';

interface RowData {
  item: BoqLineItem;
  matches: CatalogMatch[];
  cheapest: CatalogMatch | null;
  potentialSavings: number; // positive = savings available
}

export function SuppliersRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useStore((s) => s.items);
  const catalog = useStore((s) => s.catalog);
  const suppliers = useStore((s) => s.suppliers);
  const sectionsMeta = useStore((s) => s.sections);
  const { applySupplierPrice } = useBoqMutations();
  const computed = useComputedProject(id ?? '');
  const pushToast = useStore((s) => s.pushToast);

  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState<SectionId | 'all'>('all');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const rows = useMemo<RowData[]>(() => {
    if (!id) return [];
    const projectItems = items.filter((i) => i.projectId === id);
    return projectItems.map((item) => {
      const matches = findCatalogMatches(item, catalog, 5);
      const cheapest = cheapestMatch(matches);
      const potentialSavings = cheapest
        ? (item.unitPrice - cheapest.item.price) * item.qty
        : 0;
      return { item, matches, cheapest, potentialSavings };
    });
  }, [id, items, catalog]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterSection !== 'all' && r.item.sectionId !== filterSection) return false;
      if (
        search &&
        !r.item.name.toLowerCase().includes(search.toLowerCase()) &&
        !(r.item.spec ?? '').toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rows, filterSection, search]);

  const totalSavings = useMemo(() => {
    return rows.reduce((s, r) => s + Math.max(0, r.potentialSavings), 0);
  }, [rows]);

  if (!id || !computed) return <Navigate to="/projects" replace />;

  const drawerRow = drawerItemId ? rows.find((r) => r.item.id === drawerItemId) : null;
  const isLocked = computed.project.status === 'signed';

  const applyBulk = () => {
    if (isLocked) {
      pushToast({ kind: 'warn', text: 'Энэ төсөл баталгаажсан — шинэ хувилбар үүсгэнэ үү' });
      setShowBulkConfirm(false);
      return;
    }
    rows.forEach((r) => {
      if (r.cheapest && r.potentialSavings > 0) {
        const supplier = suppliers.find((s) => s.id === r.cheapest!.item.supplierId);
        applySupplierPrice(r.item.id, r.cheapest.item, supplier?.name ?? 'Нийлүүлэгч');
      }
    });
    setShowBulkConfirm(false);
    pushToast({ kind: 'success', text: `Нийт ${formatMNT(totalSavings)} хэмнэгдлээ` });
  };

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-5">
        {/* Top nav */}
        <header className="mb-5 pb-4 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Logo height={24} />
            <button
              onClick={() => navigate(`/projects/${id}`)}
              className="px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px]"
            >
              <ArrowLeft className="w-3 h-3" /> Төсөл рүү буцах
            </button>
          </div>
          <RoleSwitcher />
        </header>

        {/* Hero */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-2 flex items-center gap-2 font-semibold">
            <Store className="w-3 h-3" /> Нийлүүлэгч харьцуулалт
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {computed.project.meta.name}
          </h1>
          <div className="text-slate-400 text-sm mt-1 flex items-center gap-4 flex-wrap">
            <span>{computed.totalItems} BOQ мөр хайгдсан</span>
            {totalSavings > 0 && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Боломжит хэмнэлт {formatMNT(totalSavings)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-4 p-3 border border-slate-800 bg-slate-950/60 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="BOQ мөр хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value as SectionId | 'all')}
            className="bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Бүх хэсэг</option>
            {sectionsMeta.map((s) => (
              <option key={s.id} value={s.id}>{s.shortName}</option>
            ))}
          </select>
          {totalSavings > 0 && !isLocked && (
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 uppercase tracking-wider transition-colors"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Бүгдийг хамгийн хямд үнэд шилжүүлэх
            </button>
          )}
        </div>

        {/* Table */}
        <div className="border border-slate-800 bg-slate-950/40 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Хэсэг</th>
                <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Материал</th>
                <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Одоогийн үнэ</th>
                <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Нийлүүлэгч</th>
                <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Хамгийн хямд</th>
                <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Хэмнэх</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const section = sectionsMeta.find((s) => s.id === row.item.sectionId);
                const currentSupplier = row.item.supplierId
                  ? suppliers.find((s) => s.id === row.item.supplierId)
                  : null;
                const hasSavings = row.potentialSavings > 0;
                const hasMatch = row.cheapest !== null;
                const active = drawerItemId === row.item.id;
                return (
                  <tr
                    key={row.item.id}
                    onClick={() => setDrawerItemId(row.item.id)}
                    className={`border-b border-slate-900/60 cursor-pointer hover:bg-slate-900/40 transition-colors ${
                      active ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-6 flex-shrink-0"
                          style={{ background: section?.color ?? '#64748b' }}
                        />
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 whitespace-nowrap">
                          {section?.shortName ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-sm text-white line-clamp-1">{row.item.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">
                        {row.item.spec ?? ''}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="font-mono-tab text-sm text-white">
                        {formatNum(row.item.unitPrice)} ₮
                      </div>
                      <div className="font-mono-tab text-[10px] text-slate-500">
                        × {formatNum(row.item.qty)} {row.item.unit}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      {currentSupplier ? (
                        <div className="text-xs text-slate-300 truncate max-w-[180px]">
                          {currentSupplier.name}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600">—</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {hasMatch ? (
                        <div className="font-mono-tab text-sm text-emerald-300">
                          {formatNum(row.cheapest!.item.price)} ₮
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600">Тохирол олдсонгүй</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {hasSavings ? (
                        <div className="font-mono-tab text-sm font-bold text-emerald-400">
                          −{formatShort(row.potentialSavings)}₮
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600">—</div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                    Тохирох мөр олдсонгүй. Шүүлтүүрээ өөрчилнө үү.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison drawer */}
      {drawerRow && (
        <SupplierComparisonDrawer
          row={drawerRow}
          suppliers={suppliers}
          onClose={() => setDrawerItemId(null)}
          onApply={(catalogItem, supplierName) => {
            if (isLocked) {
              pushToast({
                kind: 'warn',
                text: 'Энэ төсөл баталгаажсан — засварлахын тулд шинэ хувилбар үүсгэнэ үү',
              });
              return;
            }
            applySupplierPrice(drawerRow.item.id, catalogItem, supplierName);
          }}
          isLocked={isLocked}
        />
      )}

      {/* Bulk confirm modal */}
      {showBulkConfirm && (
        <BulkSwitchConfirmModal
          count={rows.filter((r) => r.potentialSavings > 0).length}
          savings={totalSavings}
          onCancel={() => setShowBulkConfirm(false)}
          onConfirm={applyBulk}
        />
      )}
    </div>
  );
}

// ─── Comparison drawer ─────────────────────────────────────────────────

interface SupplierComparisonDrawerProps {
  row: RowData;
  suppliers: ReturnType<typeof useStore.getState>['suppliers'];
  onClose: () => void;
  onApply: (catalogItem: SupplierCatalogItem, supplierName: string) => void;
  isLocked: boolean;
}

function SupplierComparisonDrawer({
  row,
  suppliers,
  onClose,
  onApply,
  isLocked,
}: SupplierComparisonDrawerProps) {
  const { item, matches } = row;
  const sorted = [...matches].sort((a, b) => a.item.price - b.item.price);
  const cheapestId = sorted[0]?.item.id;

  return (
    <div className="fixed inset-0 z-50 fade-in flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-[520px] bg-slate-950 border-l border-slate-700 h-full overflow-y-auto custom-scroll shadow-2xl slide-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-1">
              Үнэ харьцуулалт
            </div>
            <div className="text-sm font-semibold text-white line-clamp-1">{item.name}</div>
            {item.spec && (
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.spec}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
            aria-label="Хаах"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pinned current price */}
        <div className="p-5 bg-slate-900/60 border-b border-slate-800">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
            Одоогийн үнэ
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="font-mono-tab text-xl font-bold text-white">
                {formatNum(item.unitPrice)} ₮ <span className="text-xs text-slate-500">/ {item.unit}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {item.qty} {item.unit} × {formatNum(item.unitPrice)} ={' '}
                <span className="font-mono-tab text-slate-300">
                  {formatMNT(item.qty * item.unitPrice)}
                </span>
              </div>
            </div>
            {item.supplierId && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Нийлүүлэгч</div>
                <div className="text-xs text-slate-300 mt-0.5 max-w-[160px]">
                  {suppliers.find((s) => s.id === item.supplierId)?.name ?? '—'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alternatives */}
        <div>
          {sorted.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              <Package className="w-8 h-8 mx-auto mb-3 text-slate-700" />
              Тохирох нийлүүлэгчийн санал олдсонгүй
            </div>
          ) : (
            <div className="divide-y divide-slate-900">
              <div className="px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold flex items-center justify-between sticky top-[88px] bg-slate-950 z-10">
                <span>Боломжит сонголтууд ({sorted.length})</span>
                <span className="normal-case tracking-normal text-slate-600 text-[10px]">
                  үнийн өсөхөөр эрэмбэлсэн
                </span>
              </div>
              {sorted.map((match, idx) => {
                const supplier = suppliers.find((s) => s.id === match.item.supplierId);
                const delta = match.item.price - item.unitPrice;
                const deltaPct = item.unitPrice === 0 ? 0 : (delta / item.unitPrice) * 100;
                const isCheapest = match.item.id === cheapestId;
                return (
                  <ComparisonRow
                    key={match.item.id}
                    match={match}
                    supplier={supplier}
                    delta={delta}
                    deltaPct={deltaPct}
                    isCheapest={isCheapest}
                    rank={idx + 1}
                    isLocked={isLocked}
                    onApply={() => onApply(match.item, supplier?.name ?? 'Нийлүүлэгч')}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  match: CatalogMatch;
  supplier: { id: string; name: string } | undefined;
  delta: number;
  deltaPct: number;
  isCheapest: boolean;
  rank: number;
  isLocked: boolean;
  onApply: () => void;
}

function ComparisonRow({
  match,
  supplier,
  delta,
  deltaPct,
  isCheapest,
  rank,
  isLocked,
  onApply,
}: ComparisonRowProps) {
  const savingsText =
    delta === 0
      ? '—'
      : `${delta > 0 ? '+' : '−'}${formatNum(Math.abs(delta))}₮ (${delta > 0 ? '+' : '−'}${Math.abs(deltaPct).toFixed(1)}%)`;
  const savingsColor = delta < 0 ? 'text-emerald-400' : delta > 0 ? 'text-red-400' : 'text-slate-500';
  const ageDays = daysAgo(match.item.priceUpdatedAt);
  const freshnessColor =
    ageDays < 30 ? 'bg-emerald-400' : ageDays < 90 ? 'bg-amber-400' : 'bg-red-400';
  const stockLabel: Record<string, string> = {
    in_stock: 'Агуулахад',
    order: 'Захиалгаар',
    out_of_stock: 'Дууссан',
  };
  const stockColor: Record<string, string> = {
    in_stock: 'text-emerald-300',
    order: 'text-amber-300',
    out_of_stock: 'text-red-300',
  };

  return (
    <div className={`p-5 ${isCheapest ? 'bg-emerald-950/20' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                isCheapest ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {rank}
            </span>
            {isCheapest && (
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                Хамгийн хямд
              </span>
            )}
          </div>
          <div className="text-sm text-white">{match.item.name}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{match.item.spec ?? ''}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono-tab text-lg font-bold text-white">
            {formatNum(match.item.price)} ₮
          </div>
          <div className={`font-mono-tab text-xs font-semibold mt-0.5 ${savingsColor}`}>
            {savingsText}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap mb-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${freshnessColor}`} />
          <span>Үнэ {ageDays === 0 ? 'өнөөдөр' : `${ageDays} өдрийн өмнө`}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={stockColor[match.item.stockStatus]}>
            {stockLabel[match.item.stockStatus]}
          </span>
        </div>
        {match.item.manufacturer && (
          <span className="text-slate-500 truncate">{match.item.manufacturer}</span>
        )}
        {match.item.warranty && match.item.warranty !== '—' && (
          <span className="text-slate-500">Баталгаа: {match.item.warranty}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-400 truncate flex-1">
          {supplier?.name ?? '—'}
        </div>
        <button
          onClick={onApply}
          disabled={isLocked}
          className={`px-3 py-1.5 text-xs font-semibold transition-colors flex-shrink-0 ${
            isLocked
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : isCheapest
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
          }`}
        >
          Энэ үнийг авах
        </button>
      </div>
    </div>
  );
}

// ─── Bulk switch modal ─────────────────────────────────────────────────

interface BulkSwitchConfirmModalProps {
  count: number;
  savings: number;
  onCancel: () => void;
  onConfirm: () => void;
}

function BulkSwitchConfirmModal({
  count,
  savings,
  onCancel,
  onConfirm,
}: BulkSwitchConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onCancel} />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="max-w-lg w-full border-2 border-emerald-500/60 bg-slate-950 shadow-2xl slide-up">
          <div className="px-5 py-4 border-b border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <div className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Бөөнөөр шилжүүлэх
              </div>
            </div>
            <button onClick={onCancel} className="p-1 text-slate-400 hover:text-white" aria-label="Хаах">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">{count} мөрийг</span> хамгийн хямд
              нийлүүлэгч рүү шилжүүлэх үү?
            </p>
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                  Хэмнэх дүн
                </span>
                <span className="font-mono-tab text-2xl font-bold text-emerald-400">
                  −{formatMNT(savings)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Шилжүүлсэн мөр бүрт өөрчлөлтийн бичлэг үүсч, тус бүр буцаах боломжтой хэвээр үлдэнэ.
            </p>
          </div>
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-300 hover:text-white">
              Цуцлах
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2"
            >
              <TrendingDown className="w-4 h-4" /> Шилжүүлэх
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

