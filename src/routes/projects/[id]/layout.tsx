// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT — route-based in Phase 3
//
// Reads the project + items from the Zustand store. Tab content lives in
// child routes and is rendered via <Outlet /> with a typed OutletContext.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import {
  Camera,
  Flame,
  Radio,
  Zap,
  LayoutDashboard,
  Settings2,
  Upload,
  FileCheck,
  Sparkles,
  Target,
  Database,
  Package,
  Cable,
  Wrench,
  Boxes,
  TrendingDown,
  Eye,
  AlertTriangle,
  FilePlus2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Store,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Logo } from '@/components/primitives/Logo';
import { MetricCard } from '@/components/primitives/MetricCard';
import { TabButton } from '@/components/primitives/TabButton';
import { SummaryCell } from '@/components/primitives/SummaryCell';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { StatusBar } from '@/components/layout/StatusBar';

import { useStore } from '@/store';
import { useComputedProject } from '@/selectors/useComputedProject';
import { writeLastTab, type TabRoute } from '@/lib/tabMemory';
import { formatMNT, formatShort } from '@/lib/format';

import type { ComputedProject } from '@/selectors/useComputedProject';

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  flame: Flame,
  radio: Radio,
  zap: Zap,
};

export interface DashboardOutletContext extends ComputedProject {}

export function DashboardLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const projects = useStore((s) => s.projects);
  const computed = useComputedProject(id ?? '');

  // Track and persist the active tab whenever pathname changes.
  useEffect(() => {
    if (!id) return;
    const rel = location.pathname.replace(`/projects/${id}/`, '');
    const tab = toTabRoute(rel);
    if (tab) writeLastTab(id, tab);
  }, [id, location.pathname]);

  if (!id) return <Navigate to="/projects" replace />;
  const exists = projects.some((p) => p.id === id);
  if (projects.length > 0 && !exists) return <Navigate to="/projects" replace />;

  if (!computed) {
    return (
      <div className="grid-bg min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-sm">Ачааллаж байна…</div>
      </div>
    );
  }

  const {
    project,
    sectionTotals,
    mainSubtotal,
    auxSubtotal,
    grandSubtotal,
    totalLabor,
    totalMaterial,
    synergyDiscount,
    vat,
    finalTotal,
    totalItems,
    totalAuxItems,
    totalCableMeters,
    modifiedItemCount,
  } = computed;

  const synergy = project.settings.synergy;
  const vatEnabled = project.settings.vatEnabled;

  const activeTab = resolveActiveTab(location.pathname, id);

  const navigateTab = (tab: TabRoute) => {
    navigate(`/projects/${id}/${tab}`);
  };

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-5">
        {/* Top nav */}
        <header className="mb-5">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800/60">
            <Logo height={24} />
            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-1.5 border border-slate-700 text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-lime-400 rounded-full pulse-soft"></span>
                {project.meta.code}
              </div>
              {modifiedItemCount > 0 && (
                <button
                  onClick={() => navigate(`/projects/${id}/changes`)}
                  className="px-3 py-1.5 border border-amber-500/60 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px] font-semibold"
                  title="Өөрчлөлтийн түүх харах"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {modifiedItemCount} өөрчлөлт хийсэн
                </button>
              )}
              <button
                onClick={() => navigate('/projects/new')}
                className="px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px]"
              >
                <Upload className="w-3 h-3" /> Шинэ файл
              </button>
              <button
                onClick={() => navigate(`/projects/${id}/suppliers`)}
                className="px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/60 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px]"
                title="Нийлүүлэгчийн үнэ харьцуулах"
              >
                <Store className="w-3 h-3" /> Нийлүүлэгч
              </button>
              <ApprovalEntryButton projectStatus={project.status} onClick={() => navigate(`/projects/${id}/approval`)} />
              <button
                onClick={() => navigate(`/projects/${id}/quote`)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2 uppercase tracking-wider text-[10px] font-semibold shadow-[0_0_24px_-8px_rgba(59,130,246,0.8)]"
              >
                <Eye className="w-3 h-3" /> Үнийн санал харах
              </button>
              <StatusBar />
              <RoleSwitcher />
            </div>
          </div>

          <div className="mt-5 pb-5 border-b border-slate-800/60 flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-semibold flex items-center gap-2">
                  <FileCheck className="w-3 h-3" /> Анализ дууссан · Draft v1.0
                </div>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {project.meta.name}{' '}
                <span className="text-slate-500 font-normal text-2xl">
                  /{project.meta.subtitle}/
                </span>
              </h1>
              <div className="text-slate-400 text-sm mt-1.5 flex items-center gap-3 flex-wrap">
                <span>{project.meta.clients}</span>
                <span className="text-slate-700">·</span>
                <span>{project.meta.location}</span>
                <span className="text-slate-700">·</span>
                <span className="font-mono-tab">{project.meta.area}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1">
                Эцсийн нийт дүн
              </div>
              <div
                className="font-display text-4xl md:text-5xl font-extrabold ticker"
                style={{ color: '#4d7fff' }}
              >
                {formatShort(finalTotal)}{' '}
                <span className="text-2xl text-blue-400/60">₮</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono-tab">
                {formatMNT(finalTotal)} {vatEnabled ? '(НӨАТ-тай)' : '(НӨАТ-гүй)'}
              </div>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <MetricCard
            icon={<Package className="w-4 h-4" />}
            label="Нэр төрөл"
            value={totalItems + totalAuxItems}
            sub={`${totalItems} үндсэн + ${totalAuxItems} туслах`}
            accent="#4d7fff"
          />
          <MetricCard
            icon={<Cable className="w-4 h-4" />}
            label="Нийт кабель"
            value={formatShort(totalCableMeters)}
            sub="метр (+15% waste)"
            accent="#06b6d4"
          />
          <MetricCard
            icon={<Wrench className="w-4 h-4" />}
            label="Ажлын хөлс"
            value={formatShort(totalLabor)}
            sub={`мат: ${formatShort(totalMaterial)}`}
            accent="#f59e0b"
          />
          <MetricCard
            icon={<Boxes className="w-4 h-4" />}
            label="Туслах материал"
            value={formatShort(auxSubtotal)}
            sub={`${totalAuxItems} мөр auto-calc`}
            accent="#10b981"
          />
          <MetricCard
            icon={<TrendingDown className="w-4 h-4" />}
            label="SQUAD хэмнэлт"
            value={synergy ? formatShort(synergyDiscount) : '—'}
            sub={synergy ? '10% ажлын хөлс' : 'унтраалттай'}
            accent={synergy ? '#84cc16' : '#64748b'}
            highlight={synergy}
          />
        </div>

        {/* Tab nav */}
        <div className="mb-5 border border-slate-800 bg-slate-950/60 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="flex-none">
              <div className="px-4 pt-2.5 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                Тойм
              </div>
              <div className="flex">
                <TabButton
                  active={activeTab === 'overview'}
                  onClick={() => navigateTab('overview')}
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="Ерөнхий"
                  color="#4d7fff"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="px-4 pt-2.5 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold flex items-center justify-between">
                <span>BOQ хэсгүүд</span>
                <span className="font-mono-tab normal-case tracking-normal text-slate-600 text-[10px]">
                  {formatShort(mainSubtotal)}₮
                </span>
              </div>
              <div className="flex overflow-x-auto custom-scroll">
                {sectionTotals.map((sec) => {
                  const Icon = ICONS[sec.iconKey] ?? Camera;
                  const sectionTab: TabRoute = `section/${sec.id}`;
                  const modCount = computed.modifiedCountBySection[sec.id] ?? 0;
                  return (
                    <TabButton
                      key={sec.id}
                      active={activeTab === sectionTab}
                      onClick={() => navigateTab(sectionTab)}
                      icon={<Icon className="w-4 h-4" />}
                      label={sec.shortName}
                      sublabel={formatShort(sec.subtotal) + '₮'}
                      color={sec.color}
                      badge={modCount}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex-none">
              <div className="px-4 pt-2.5 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                Нэмэлт
              </div>
              <div className="flex">
                <TabButton
                  active={activeTab === 'auxiliary'}
                  onClick={() => navigateTab('auxiliary')}
                  icon={<Boxes className="w-4 h-4" />}
                  label="Туслах"
                  sublabel={formatShort(auxSubtotal) + '₮'}
                  color="#10b981"
                />
                <TabButton
                  active={activeTab === 'settings'}
                  onClick={() => navigateTab('settings')}
                  icon={<Settings2 className="w-4 h-4" />}
                  label="Тохиргоо"
                  color="#94a3b8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content — rendered by child routes */}
        <div className="fade-slide" key={activeTab}>
          <Outlet context={computed satisfies DashboardOutletContext} />
        </div>

        {/* Bottom summary */}
        <div className="mt-6 border border-slate-800 bg-slate-950/80 backdrop-blur-sm relative">
          <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 divide-slate-800 divide-y md:divide-y-0 md:divide-x">
            <SummaryCell
              label="Үндсэн материал+ажил"
              value={formatMNT(mainSubtotal)}
              sub={`${totalItems} мөр`}
            />
            <SummaryCell
              label="Туслах материал"
              value={formatMNT(auxSubtotal)}
              sub={`${totalAuxItems} мөр`}
            />
            <SummaryCell label="Дэд дүн" value={formatMNT(grandSubtotal)} sub="нийт" />
            <SummaryCell
              label="SQUAD 10%"
              value={synergy ? '−' + formatMNT(synergyDiscount) : formatMNT(0)}
              sub={synergy ? 'ажлын хөлснөөс' : 'унтраалттай'}
              mute={!synergy}
              negative={synergy}
            />
            <SummaryCell
              label={`НӨАТ ${vatEnabled ? '(10%)' : '(0%)'}`}
              value={vatEnabled ? '+' + formatMNT(vat) : formatMNT(0)}
              sub={vatEnabled ? '' : ' '}
              mute={!vatEnabled}
            />
            <SummaryCell
              label="НИЙТ"
              value={formatMNT(finalTotal)}
              sub={vatEnabled ? 'НӨАТ-тай' : 'НӨАТ-гүй'}
              highlight
            />
          </div>
        </div>

        <footer className="mt-5 pt-3 border-t border-slate-800/50 flex items-center justify-between flex-wrap gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono-tab">Engine v0.9</span>
            <span className="flex items-center gap-1.5">
              <Target className="w-3 h-3" /> ХД-03 · ХТ-4,5,6
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400" /> Vision-parsed
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-400" /> БНбД 3.02-2016
            </span>
          </div>
          <div>© Murch Vision AI · {new Date().getFullYear()}</div>
        </footer>
      </div>

      {/* Floating "Preview Quote" CTA */}
      <button
        onClick={() => navigate(`/projects/${id}/quote`)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2.5 shadow-[0_12px_36px_-8px_rgba(77,127,255,0.6)] transition-all hover:scale-105 group print:hidden"
        style={{
          boxShadow:
            '0 0 0 1px rgba(77,127,255,0.4), 0 20px 48px -12px rgba(0,65,255,0.5)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Eye className="w-5 h-5 relative z-10" />
        <div className="relative z-10 text-left leading-tight">
          <div className="text-[10px] uppercase tracking-wider opacity-80">Үнийн санал</div>
          <div className="font-display font-bold text-sm">
            {formatShort(finalTotal)}₮ үзэх
          </div>
        </div>
      </button>
    </div>
  );
}

interface ApprovalEntryButtonProps {
  projectStatus: DashboardOutletContext['project']['status'];
  onClick: () => void;
}

function ApprovalEntryButton({ projectStatus, onClick }: ApprovalEntryButtonProps) {
  const config: Record<
    ApprovalEntryButtonProps['projectStatus'],
    { label: string; color: string; bg: string; border: string; Icon: typeof Clock }
  > = {
    draft:      { label: 'Батлуулах',         color: 'text-slate-300',   bg: 'bg-slate-800/60', border: 'border-slate-700',    Icon: Send },
    in_review:  { label: 'Хянагдаж буй',      color: 'text-amber-300',   bg: 'bg-amber-500/10', border: 'border-amber-500/50', Icon: Clock },
    approved:   { label: 'Зөвшөөрөгдсөн',     color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', Icon: CheckCircle2 },
    signed:     { label: 'Гарын үсэг бүхий',  color: 'text-blue-300',    bg: 'bg-blue-500/10',  border: 'border-blue-500/50',  Icon: ShieldCheck },
    archived:   { label: 'Архивласан',        color: 'text-slate-400',   bg: 'bg-slate-800/60', border: 'border-slate-700',    Icon: FilePlus2 },
  };
  const info = config[projectStatus];
  const Icon = info.Icon;
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 border ${info.border} ${info.bg} ${info.color} hover:brightness-125 transition-all flex items-center gap-2 uppercase tracking-wider text-[10px] font-semibold`}
      title="Батлах ажиллагаа"
    >
      <Icon className={`w-3 h-3 ${projectStatus === 'in_review' ? 'pulse-soft' : ''}`} />
      {info.label}
    </button>
  );
}

function toTabRoute(rel: string): TabRoute | null {
  if (rel === 'overview' || rel === 'auxiliary' || rel === 'settings') return rel;
  if (rel.startsWith('section/')) return rel as TabRoute;
  return null;
}

function resolveActiveTab(pathname: string, projectId: string): TabRoute {
  const rel = pathname.replace(`/projects/${projectId}/`, '').replace(/\/$/, '');
  return toTabRoute(rel) ?? 'overview';
}
