// ═══════════════════════════════════════════════════════════════════════════
// /projects/:id/changes — audit log timeline
//
// Renders every ChangeLogEntry for the current project, grouped by DAY
// (sticky header per day) and sorted TIME within day. Includes a filter
// bar (section · field · user), a right-hand summary panel, and a
// "Бүгдийг буцаах" action that previews the cost impact before committing.
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Filter,
  TrendingUp,
  TrendingDown,
  Target,
  X,
  Search,
} from 'lucide-react';

import { Logo } from '@/components/primitives/Logo';
import { useStore } from '@/store';
import { useComputedProject } from '@/selectors/useComputedProject';
import { useBoqMutations } from '@/hooks/useBoqMutations';
import { formatMNT, formatShort, formatNum } from '@/lib/format';
import { formatDateMN, formatRelativeMN } from '@/lib/date';
import type { ChangeField, ChangeLogEntry, SectionId } from '@/types';

const FIELD_LABELS: Record<ChangeField, string> = {
  qty: 'Тоо',
  unitPrice: 'Нэгж үнэ',
  supplierId: 'Нийлүүлэгч',
  'settings.tier': 'Түвшин',
  'settings.synergy': 'SQUAD',
  'settings.vatEnabled': 'НӨАТ',
  auxQty: 'Туслах тоо',
  auxUnitPrice: 'Туслах үнэ',
};

export function ChangesRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const changeLog = useStore((s) => s.changeLog);
  const items = useStore((s) => s.items);
  const sectionsMeta = useStore((s) => s.sections);
  const users = useStore((s) => s.users);
  const { revertAll } = useBoqMutations();
  const computed = useComputedProject(id ?? '');

  const [filterSection, setFilterSection] = useState<SectionId | 'all'>('all');
  const [filterField, setFilterField] = useState<ChangeField | 'all'>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [showConfirm, setShowConfirm] = useState(false);

  const entriesForProject = useMemo(
    () => (id ? changeLog.filter((e) => e.projectId === id) : []),
    [changeLog, id],
  );

  const filtered = useMemo(
    () =>
      entriesForProject.filter((e) => {
        if (filterSection !== 'all' && e.sectionId !== filterSection) return false;
        if (filterField !== 'all' && e.field !== filterField) return false;
        if (filterUser !== 'all' && e.userId !== filterUser) return false;
        return true;
      }),
    [entriesForProject, filterSection, filterField, filterUser],
  );

  // Newest first — group by calendar day then sort desc.
  const groupedByDay = useMemo(() => {
    const byDay = new Map<string, ChangeLogEntry[]>();
    filtered.forEach((e) => {
      const dayKey = e.at.slice(0, 10); // YYYY-MM-DD
      const list = byDay.get(dayKey) ?? [];
      list.push(e);
      byDay.set(dayKey, list);
    });
    return [...byDay.entries()]
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
      .map(([day, list]) => ({
        day,
        entries: list.sort((a, b) => (a.at < b.at ? 1 : -1)),
      }));
  }, [filtered]);

  if (!id || !computed) {
    return (
      <div className="grid-bg min-h-screen flex items-center justify-center text-slate-500">
        Ачааллаж байна…
      </div>
    );
  }

  // Per-section edited most
  const sectionCounts = new Map<SectionId, number>();
  entriesForProject.forEach((e) => {
    if (!e.sectionId) return;
    sectionCounts.set(e.sectionId, (sectionCounts.get(e.sectionId) ?? 0) + 1);
  });
  const mostEditedSection = [...sectionCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];
  const mostEditedMeta = mostEditedSection
    ? sectionsMeta.find((s) => s.id === mostEditedSection[0])
    : undefined;

  const totalDelta = computed.finalTotal - computed.originalFinalTotal;

  const onRevertAll = () => {
    if (!id) return;
    revertAll(id);
    setShowConfirm(false);
  };

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-5">
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
          {entriesForProject.length > 0 && (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-1.5 bg-red-600/20 border border-red-500/50 text-red-300 hover:bg-red-600/30 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px] font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Бүгдийг буцаах
            </button>
          )}
        </header>

        {/* Hero */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400 mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-3 h-3" /> Өөрчлөлтийн түүх
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {computed.project.meta.name}{' '}
            <span className="text-slate-500 font-normal text-2xl">
              /{entriesForProject.length} бичлэг/
            </span>
          </h1>
          <div className="text-slate-400 text-sm mt-1">
            AI-ийн анхны тооцооноос хүний оруулсан өөрчлөлтүүдийг энд бүгдийг харуулж байна.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Timeline */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="mb-4 p-3 border border-slate-800 bg-slate-950/60 flex items-center gap-3 flex-wrap">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                <Filter className="w-3 h-3" /> Шүүлтүүр
              </div>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value as SectionId | 'all')}
                className="bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Бүх хэсэг</option>
                {sectionsMeta.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortName}
                  </option>
                ))}
              </select>
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value as ChangeField | 'all')}
                className="bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Бүх талбар</option>
                <option value="qty">Тоо</option>
                <option value="unitPrice">Нэгж үнэ</option>
                <option value="supplierId">Нийлүүлэгч</option>
              </select>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Бүх хэрэглэгч</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <div className="ml-auto text-[10px] uppercase tracking-wider text-slate-500 font-mono-tab">
                {filtered.length} / {entriesForProject.length} бичлэг
              </div>
            </div>

            {entriesForProject.length === 0 ? (
              <div className="border border-slate-800 bg-slate-950/40 p-10 text-center">
                <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <div className="text-slate-400 text-sm mb-1">
                  Одоогоор өөрчлөлт бүртгэгдээгүй байна
                </div>
                <div className="text-[11px] text-slate-500">
                  BOQ-ын тоо ширхэг эсвэл нэгж үнэ өөрчилсөн үед энд бичигдэнэ.
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-slate-800 bg-slate-950/40 p-10 text-center text-slate-500 text-sm">
                Тохирох бичлэг олдсонгүй. Шүүлтүүрээ өөрчилнө үү.
              </div>
            ) : (
              <div className="space-y-5">
                {groupedByDay.map(({ day, entries }) => (
                  <div key={day}>
                    <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 py-2 px-3 mb-2 flex items-center justify-between">
                      <div className="text-xs font-display font-bold text-white uppercase tracking-wider">
                        {formatDateMN(day + 'T00:00:00.000Z')}
                      </div>
                      <div className="font-mono-tab text-[10px] text-slate-500">
                        {entries.length} бичлэг
                      </div>
                    </div>
                    <div className="border border-slate-800 bg-slate-950/40 divide-y divide-slate-900">
                      {entries.map((e) => (
                        <ChangeRow
                          key={e.id}
                          entry={e}
                          itemName={items.find((i) => i.id === e.itemId)?.name ?? '?'}
                          sectionColor={
                            sectionsMeta.find((s) => s.id === e.sectionId)?.color ?? '#64748b'
                          }
                          sectionShort={
                            sectionsMeta.find((s) => s.id === e.sectionId)?.shortName ?? '—'
                          }
                          userName={users.find((u) => u.id === e.userId)?.name ?? e.userId}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right summary panel */}
          <div className="lg:col-span-1">
            <div className="border border-slate-800 bg-slate-950/60 sticky top-4">
              <div className="px-4 py-3 border-b border-slate-800 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                Нэгдсэн дүгнэлт
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    Нийт өөрчлөлт
                  </div>
                  <div className="font-display text-2xl font-bold text-white">
                    {entriesForProject.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                    {totalDelta >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-red-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-emerald-400" />
                    )}
                    Эцсийн дүнгийн зөрүү
                  </div>
                  <div
                    className={`font-mono-tab text-lg font-bold ${
                      totalDelta >= 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {totalDelta >= 0 ? '+' : ''}
                    {formatMNT(totalDelta)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono-tab">
                    {formatShort(computed.originalFinalTotal)}₮ → {formatShort(computed.finalTotal)}₮
                  </div>
                </div>
                {mostEditedSection && mostEditedMeta && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <Target className="w-3 h-3" /> Хамгийн их засвар
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1 h-5"
                        style={{ background: mostEditedMeta.color }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {mostEditedMeta.shortName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono-tab">
                          {mostEditedSection[1]} бичлэг
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-slate-800">
                <Link
                  to={`/projects/${id}`}
                  className="text-[10px] uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Тойм руу буцах
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revert-all confirm modal */}
      {showConfirm && (
        <RevertAllConfirmModal
          count={entriesForProject.length}
          currentTotal={computed.finalTotal}
          originalTotal={computed.originalFinalTotal}
          onCancel={() => setShowConfirm(false)}
          onConfirm={onRevertAll}
        />
      )}
    </div>
  );
}

// ─── Single change log row ─────────────────────────────────────────────

interface ChangeRowProps {
  entry: ChangeLogEntry;
  itemName: string;
  sectionColor: string;
  sectionShort: string;
  userName: string;
}

function ChangeRow({ entry, itemName, sectionColor, sectionShort, userName }: ChangeRowProps) {
  const beforeStr = formatValue(entry.field, entry.before);
  const afterStr = formatValue(entry.field, entry.after);
  const delta = entry.deltaPct;
  const deltaColor =
    delta === undefined
      ? 'text-slate-500'
      : delta > 0
        ? 'text-red-400'
        : 'text-emerald-400';

  return (
    <div className="px-4 py-3 flex items-start gap-4">
      <div className="w-1 h-full self-stretch flex-shrink-0" style={{ background: sectionColor }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            {sectionShort}
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-xs text-slate-400">{FIELD_LABELS[entry.field]}</span>
        </div>
        <div className="text-sm text-white truncate" title={itemName}>
          {itemName}
        </div>
        <div className="mt-1 flex items-baseline gap-2 font-mono-tab text-xs">
          <span className="text-slate-500 line-through">{beforeStr}</span>
          <span className="text-slate-600">→</span>
          <span className="text-white">{afterStr}</span>
          {delta !== undefined && (
            <span className={`text-[10px] font-semibold ${deltaColor}`}>
              {delta > 0 ? '+' : ''}
              {delta.toFixed(0)}%
            </span>
          )}
        </div>
        {entry.note && <div className="text-[10px] text-slate-500 mt-1">{entry.note}</div>}
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-slate-400">{userName}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{formatRelativeMN(entry.at)}</div>
      </div>
    </div>
  );
}

function formatValue(field: ChangeField, value: number | string | boolean): string {
  if (field === 'unitPrice' || field === 'auxUnitPrice') {
    if (typeof value === 'number') return formatNum(value) + ' ₮';
    return String(value);
  }
  if (field === 'qty' || field === 'auxQty') {
    if (typeof value === 'number') return formatNum(value);
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'Тийм' : 'Үгүй';
  return String(value);
}

// ─── Revert-all confirm modal ─────────────────────────────────────────

interface RevertAllConfirmModalProps {
  count: number;
  currentTotal: number;
  originalTotal: number;
  onCancel: () => void;
  onConfirm: () => void;
}

function RevertAllConfirmModal({
  count,
  currentTotal,
  originalTotal,
  onCancel,
  onConfirm,
}: RevertAllConfirmModalProps) {
  const delta = originalTotal - currentTotal;
  const deltaSign = delta >= 0 ? '+' : '';

  return (
    <div className="fixed inset-0 z-50 fade-in">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="max-w-lg w-full border-2 border-red-500/60 bg-slate-950 shadow-2xl slide-up">
          <div className="px-5 py-4 border-b border-red-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Бүгдийг буцаах уу?
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Хаах"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">{count} өөрчлөлтийг</span> буцаавал нийт дүн:
            </p>
            <div className="bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Одоогийн дүн
                </span>
                <span className="font-mono-tab text-sm text-slate-300">
                  {formatMNT(currentTotal)}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Буцаасны дараа
                </span>
                <span className="font-mono-tab text-sm text-white font-bold">
                  {formatMNT(originalTotal)}
                </span>
              </div>
              <div className="h-px bg-slate-800 my-2" />
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Зөрүү
                </span>
                <span
                  className={`font-mono-tab text-base font-bold ${
                    delta >= 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {deltaSign}
                  {formatMNT(delta)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Энэ үйлдэл бүх мөрүүдийг AI-ийн анхны тооцоонд буцаах бөгөөд өөрчлөлтийн түүх мөн устана.
            </p>
          </div>
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Цуцлах
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Үргэлжлүүлэх
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
