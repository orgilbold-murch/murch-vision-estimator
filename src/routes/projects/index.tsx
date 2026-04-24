import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, FileCheck, ShieldCheck, AlertTriangle } from 'lucide-react';

import { Logo } from '@/components/primitives/Logo';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { useStore } from '@/store';
import { formatShort } from '@/lib/format';
import type { ProjectStatus } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Ноорог',
  in_review: 'Хянагдаж буй',
  approved: 'Зөвшөөрөгдсөн',
  signed: 'Гарын үсэг бүхий',
  archived: 'Архивласан',
};

const STATUS_COLOR: Record<string, string> = {
  draft: '#64748b',
  in_review: '#f59e0b',
  approved: '#84cc16',
  signed: '#4d7fff',
  archived: '#475569',
};

type StatusFilter = ProjectStatus | 'all';

const FILTER_ORDER: StatusFilter[] = ['all', 'draft', 'in_review', 'approved', 'signed'];

export function ProjectsIndexRoute() {
  const navigate = useNavigate();
  const projects = useStore((s) => s.projects);
  const items = useStore((s) => s.items);
  const approvals = useStore((s) => s.approvals);
  const changeLog = useStore((s) => s.changeLog);

  const [filter, setFilter] = useState<StatusFilter>('all');

  const getItemCount = (projectId: string) =>
    items.filter((i) => i.projectId === projectId).length;

  const getModifiedCount = (projectId: string) =>
    items.filter((i) => i.projectId === projectId && i.isModified).length;

  const getLatestApproval = (projectId: string) =>
    approvals
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0];

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: projects.length,
      draft: 0,
      in_review: 0,
      approved: 0,
      signed: 0,
      archived: 0,
    };
    projects.forEach((p) => { c[p.status] = (c[p.status] ?? 0) + 1; });
    return c;
  }, [projects]);

  const filtered = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter],
  );

  // Surface change-log so status filter doesn't hide the global search index
  void changeLog;

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10 pb-5 border-b border-slate-800/60 gap-3 flex-wrap">
          <Logo height={28} />
          <div className="flex items-center gap-3">
            <Link
              to="/catalog"
              className="px-3 py-2 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-semibold transition-colors"
            >
              Каталог
            </Link>
            <button
              onClick={() => navigate('/projects/new')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Шинэ төсөл
            </button>
            <RoleSwitcher />
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-2">
            Төслүүд · {projects.length}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
            Таны төслүүд
          </h1>
        </div>

        {/* Status filter tabs */}
        <div className="mb-5 border-b border-slate-800 flex items-center gap-1 overflow-x-auto custom-scroll">
          {FILTER_ORDER.map((f) => {
            const isActive = filter === f;
            const label = f === 'all' ? 'Бүгд' : STATUS_LABEL[f] ?? f;
            const count = counts[f];
            if (f !== 'all' && count === 0) return null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'text-white font-semibold border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                {label}
                <span
                  className={`font-mono-tab text-[10px] px-1.5 py-0.5 ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800/60 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="border border-slate-800 bg-slate-950/40 p-10 text-center">
            <div className="text-slate-400 text-sm mb-4">
              {filter === 'all' ? 'Одоогоор төсөл байхгүй байна' : 'Энэ төлөвт төсөл байхгүй'}
            </div>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/projects/new')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                Эхний төслөө үүсгэх
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const count = getItemCount(p.id);
              const modified = getModifiedCount(p.id);
              const approval = getLatestApproval(p.id);
              const isSigned = p.status === 'signed';
              return (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="group block border border-slate-800 bg-slate-950/40 p-5 hover:border-blue-500/60 transition-all relative blueprint-corner"
                >
                  {/* Corner seal for signed projects */}
                  {isSigned && approval && (
                    <div
                      className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 text-[9px] uppercase tracking-wider font-bold flex items-center gap-1"
                      title={`Баталгаажсан · ${approval.engineerName}`}
                    >
                      <ShieldCheck className="w-2.5 h-2.5" /> Баталгаатай
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3 gap-2 pr-24">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono-tab">
                      {p.meta.code}
                    </div>
                    {!isSigned && (
                      <div
                        className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold flex items-center gap-1"
                        style={{
                          color: STATUS_COLOR[p.status],
                          background: STATUS_COLOR[p.status] + '20',
                        }}
                      >
                        <FileCheck className="w-3 h-3" />
                        {STATUS_LABEL[p.status] ?? p.status}
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {p.meta.name}
                  </h3>
                  <div className="text-xs text-slate-500 mb-3">{p.meta.subtitle}</div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>{p.meta.clients}</div>
                    <div className="text-slate-500">{p.meta.location}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
                    <div className="text-[10px] text-slate-500 font-mono-tab flex items-center gap-2">
                      <span>{count} BOQ · {p.meta.area}</span>
                      {modified > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> {modified}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export helpers for consumers that pick from the route's barrel.
export { formatShort };
