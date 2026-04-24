// ═══════════════════════════════════════════════════════════════════════════
// /catalog — global supplier catalog browser
//
// Sidebar with category tree + item counts, top search + filters, main
// responsive card grid, detail drawer on click.
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Store,
  X,
  Package,
  Camera,
  Zap,
  Lightbulb,
  Wrench,
  Cable,
  Plane,
} from 'lucide-react';
import Fuse from 'fuse.js';

import { normaliseQuery } from '@/selectors/catalogMatch';
import { Logo } from '@/components/primitives/Logo';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { useStore } from '@/store';
import { formatNum } from '@/lib/format';
import { daysAgo } from '@/lib/date';
import type { SupplierCategory, SupplierCatalogItem, StockStatus } from '@/types';

const CATEGORY_META: Record<
  SupplierCategory,
  { label: string; Icon: typeof Camera; color: string }
> = {
  cctv:            { label: 'CCTV',              Icon: Camera,    color: '#06b6d4' },
  drone_security:  { label: 'Drone · хамгаалалт', Icon: Plane,     color: '#a78bfa' },
  electrical:      { label: 'Цахилгаан',          Icon: Zap,       color: '#fbbf24' },
  lighting:        { label: 'Гэрэлтүүлэг',        Icon: Lightbulb, color: '#f59e0b' },
  cable:           { label: 'Кабель',             Icon: Cable,     color: '#06b6d4' },
  auxiliary:       { label: 'Туслах',             Icon: Wrench,    color: '#10b981' },
};

export function CatalogRoute() {
  const navigate = useNavigate();
  const catalog = useStore((s) => s.catalog);
  const suppliers = useStore((s) => s.suppliers);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategory | 'all'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string | 'all'>('all');
  const [selectedStock, setSelectedStock] = useState<StockStatus | 'all'>('all');
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(catalog, {
        keys: [
          { name: 'name', weight: 2 },
          { name: 'code', weight: 1 },
          { name: 'spec', weight: 1 },
          { name: 'manufacturer', weight: 0.5 },
        ],
        threshold: 0.5,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [catalog],
  );

  const filtered = useMemo(() => {
    let list = catalog;
    if (query.trim().length >= 2) {
      list = fuse.search(normaliseQuery(query)).map((r) => r.item);
    }
    if (selectedCategory !== 'all') list = list.filter((c) => c.category === selectedCategory);
    if (selectedSupplier !== 'all') list = list.filter((c) => c.supplierId === selectedSupplier);
    if (selectedStock !== 'all') list = list.filter((c) => c.stockStatus === selectedStock);
    return list;
  }, [catalog, query, selectedCategory, selectedSupplier, selectedStock, fuse]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    catalog.forEach((c) => {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    });
    return counts;
  }, [catalog]);

  const drawerItem = drawerItemId ? catalog.find((c) => c.id === drawerItemId) : null;

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-5">
        {/* Top nav */}
        <header className="mb-5 pb-4 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Logo height={24} />
            <button
              onClick={() => navigate('/projects')}
              className="px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px]"
            >
              <ArrowLeft className="w-3 h-3" /> Төслийн жагсаалт
            </button>
          </div>
          <RoleSwitcher />
        </header>

        {/* Hero */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-2 flex items-center gap-2 font-semibold">
            <Store className="w-3 h-3" /> Нийлүүлэгчийн каталог
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {catalog.length} материал · {suppliers.length} нийлүүлэгч
          </h1>
          <div className="text-slate-400 text-sm mt-1">
            Улаанбаатарын Q1 2026 зах зээлийн үнийн сан. Нийлүүлэгч, ангилал, агуулахын төлөв-өөр шүүгдэнэ.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          {/* Sidebar */}
          <aside className="border border-slate-800 bg-slate-950/40 h-fit sticky top-4">
            <div className="px-4 py-3 border-b border-slate-800 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
              Ангилал
            </div>
            <CategoryButton
              label="Бүгд"
              count={catalog.length}
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              color="#4d7fff"
              Icon={Package}
            />
            {(Object.keys(CATEGORY_META) as SupplierCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = categoryCounts[cat] ?? 0;
              if (count === 0) return null;
              return (
                <CategoryButton
                  key={cat}
                  label={meta.label}
                  count={count}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  color={meta.color}
                  Icon={meta.Icon}
                />
              );
            })}
          </aside>

          {/* Main column */}
          <div>
            {/* Filters */}
            <div className="mb-4 p-3 border border-slate-800 bg-slate-950/60 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Нэр, код, spec, үйлдвэрлэгчээр хайх..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Бүх нийлүүлэгч</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value as StockStatus | 'all')}
                className="bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Бүх төлөв</option>
                <option value="in_stock">Агуулахад</option>
                <option value="order">Захиалгаар</option>
                <option value="out_of_stock">Дууссан</option>
              </select>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono-tab">
                {filtered.length} / {catalog.length}
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="border border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                Шүүлтэнд тохирох материал олдсонгүй
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.slice(0, 120).map((c) => (
                  <CatalogCard
                    key={c.id}
                    item={c}
                    supplierName={suppliers.find((s) => s.id === c.supplierId)?.name ?? '—'}
                    onClick={() => setDrawerItemId(c.id)}
                  />
                ))}
                {filtered.length > 120 && (
                  <div className="col-span-full text-center text-[11px] text-slate-500 py-3">
                    Дэлгэц дээр харуулж байгаа: 120 / {filtered.length}. Шүүлтүүрээр нарийсгана уу.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {drawerItem && (
        <CatalogDetailDrawer
          item={drawerItem}
          supplierName={suppliers.find((s) => s.id === drawerItem.supplierId)?.name ?? '—'}
          onClose={() => setDrawerItemId(null)}
        />
      )}
    </div>
  );
}

// ─── Sidebar category button ───────────────────────────────────────────

interface CategoryButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
  Icon: typeof Camera;
}

function CategoryButton({ label, count, active, onClick, color, Icon }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-900/60 transition-colors border-b border-slate-900/60 last:border-0 ${
        active ? 'bg-slate-900/40' : ''
      }`}
    >
      <div
        className="w-6 h-6 flex items-center justify-center flex-shrink-0"
        style={{ background: active ? color + '25' : 'transparent', color: active ? color : '#64748b' }}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs ${active ? 'text-white font-semibold' : 'text-slate-300'}`}>
          {label}
        </div>
      </div>
      <div className="font-mono-tab text-[10px] text-slate-500">{count}</div>
    </button>
  );
}

// ─── Catalog card ──────────────────────────────────────────────────────

interface CatalogCardProps {
  item: SupplierCatalogItem;
  supplierName: string;
  onClick: () => void;
}

function CatalogCard({ item, supplierName, onClick }: CatalogCardProps) {
  const ageDays = daysAgo(item.priceUpdatedAt);
  const freshnessColor =
    ageDays < 30 ? 'bg-emerald-400' : ageDays < 90 ? 'bg-amber-400' : 'bg-red-400';
  const stockBadge: Record<string, { label: string; color: string }> = {
    in_stock:     { label: 'Агуулахад',   color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/40' },
    order:        { label: 'Захиалгаар',   color: 'text-amber-300 bg-amber-500/10 border-amber-500/40' },
    out_of_stock: { label: 'Дууссан',      color: 'text-red-300 bg-red-500/10 border-red-500/40' },
  };
  const badge = stockBadge[item.stockStatus];
  const initial = supplierName.charAt(0);

  return (
    <button
      onClick={onClick}
      className="text-left border border-slate-800 bg-slate-950/40 hover:border-blue-500/50 transition-all p-4 group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/30 text-blue-400 font-display font-bold text-base flex-shrink-0"
          aria-hidden
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            {item.manufacturer ?? '—'}
          </div>
          <div className="text-sm font-semibold text-white leading-tight line-clamp-2 mt-0.5">
            {item.name}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-slate-500 mb-3 line-clamp-1">{item.spec ?? ''}</div>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="font-mono-tab text-lg font-bold text-white">
          {formatNum(item.price)} ₮ <span className="text-xs text-slate-500">/ {item.unit}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${freshnessColor}`} />
          <span className="text-[10px] text-slate-500 font-mono-tab">
            {ageDays}d
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div className="text-[10px] text-slate-500 truncate min-w-0 flex-1">
          {supplierName}
        </div>
        {badge && (
          <span className={`text-[9px] px-1.5 py-0.5 uppercase tracking-wider border ${badge.color}`}>
            {badge.label}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Catalog detail drawer ─────────────────────────────────────────────

interface CatalogDetailDrawerProps {
  item: SupplierCatalogItem;
  supplierName: string;
  onClose: () => void;
}

function CatalogDetailDrawer({ item, supplierName, onClose }: CatalogDetailDrawerProps) {
  const ageDays = daysAgo(item.priceUpdatedAt);
  return (
    <div className="fixed inset-0 z-50 fade-in flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-[480px] bg-slate-950 border-l border-slate-700 h-full overflow-y-auto custom-scroll shadow-2xl slide-up">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
          <div className="text-sm font-semibold text-white">Каталог дэлгэрэнгүй</div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white" aria-label="Хаах">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              {item.manufacturer ?? '—'}
            </div>
            <div className="text-lg font-semibold text-white">{item.name}</div>
            {item.spec && <div className="text-xs text-slate-500 mt-1">{item.spec}</div>}
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Үнэ</div>
            <div className="font-mono-tab text-2xl font-bold text-white">
              {formatNum(item.price)} ₮ <span className="text-xs text-slate-500">/ {item.unit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Сүүлд шинэчилсэн {ageDays === 0 ? 'өнөөдөр' : `${ageDays} өдрийн өмнө`}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Field label="Нийлүүлэгч" value={supplierName} />
            <Field label="Код" value={item.code ?? '—'} mono />
            <Field label="Үйлдвэрлэгч" value={item.manufacturer ?? '—'} />
            <Field label="Гарал үүсэл" value={item.origin ?? '—'} />
            <Field label="Баталгаа" value={item.warranty ?? '—'} />
            <Field label="Төлөв" value={item.stockStatus} />
          </div>
          <div className="pt-3 border-t border-slate-800">
            <Link
              to="/projects"
              className="block w-full text-center px-4 py-2.5 bg-slate-800 text-slate-500 text-sm font-semibold cursor-not-allowed"
              onClick={(e) => e.preventDefault()}
              title="Төсөл идэвхижүүлэх"
            >
              Энэ үнээр BOQ-д нэмэх
            </Link>
            <div className="text-[10px] text-slate-500 mt-2 text-center">
              BOQ-д нэмэхийн тулд эхлээд төслийн <strong className="text-slate-400">Нийлүүлэгч</strong> цонхноос оруулна.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps { label: string; value: string; mono?: boolean }
function Field({ label, value, mono }: FieldProps) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</div>
      <div className={`text-xs text-slate-200 ${mono ? 'font-mono-tab' : ''}`}>{value}</div>
    </div>
  );
}
