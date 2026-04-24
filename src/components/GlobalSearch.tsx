// ═══════════════════════════════════════════════════════════════════════════
// GlobalSearch — Cmd/Ctrl+K modal
//
// Three result groups (each capped at 5 rows):
//   Төслүүд     — projects by name
//   Каталог     — supplier catalog items
//   BOQ         — items in the project currently in the URL (if any)
//
// Recent searches (max 5) are persisted in uiSlice and shown when the
// input is empty.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Clock, X, Package, Store, Layers } from 'lucide-react';
import Fuse from 'fuse.js';

import { useStore } from '@/store';
import { normaliseQuery } from '@/selectors/catalogMatch';
import { formatNum } from '@/lib/format';
import type { BoqLineItem, Project, SupplierCatalogItem } from '@/types';

type ResultKind = 'project' | 'catalog' | 'boq';

interface Result {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  navigate: string;
}

export interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const projects = useStore((s) => s.projects);
  const catalog = useStore((s) => s.catalog);
  const items = useStore((s) => s.items);
  const recent = useStore((s) => s.recentSearches);
  const pushRecent = useStore((s) => s.pushRecentSearch);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Derive the "currently-open project id" from the URL so BOQ-local
  // search is available inside a project.
  const currentProjectId = useMemo(() => {
    const m = location.pathname.match(/^\/projects\/([^/]+)/);
    return m?.[1] ?? null;
  }, [location.pathname]);

  const projectFuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ['meta.name', 'meta.code', 'meta.subtitle', 'meta.clients'],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [projects],
  );
  const catalogFuse = useMemo(
    () =>
      new Fuse(catalog, {
        keys: ['name', 'code', 'spec', 'manufacturer'],
        threshold: 0.5,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [catalog],
  );
  const boqFuse = useMemo(() => {
    if (!currentProjectId) return null;
    const projectItems = items.filter((i) => i.projectId === currentProjectId);
    return new Fuse(projectItems, {
      keys: ['name', 'spec'],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [items, currentProjectId]);

  const results = useMemo<{
    groups: { kind: ResultKind; label: string; entries: Result[] }[];
    flat: Result[];
  }>(() => {
    if (query.trim().length < 2) return { groups: [], flat: [] };
    const q = normaliseQuery(query);

    const projectHits = projectFuse
      .search(q, { limit: 5 })
      .map((r) => projectToResult(r.item));

    const catalogHits = catalogFuse
      .search(q, { limit: 5 })
      .map((r) => catalogToResult(r.item));

    const boqHits = boqFuse
      ? boqFuse.search(q, { limit: 5 }).map((r) => boqToResult(r.item, currentProjectId!))
      : [];

    const groups = [
      { kind: 'project' as ResultKind, label: 'Төслүүд', entries: projectHits },
      { kind: 'catalog' as ResultKind, label: 'Каталог', entries: catalogHits },
      { kind: 'boq' as ResultKind, label: 'BOQ', entries: boqHits },
    ].filter((g) => g.entries.length > 0);

    const flat = groups.flatMap((g) => g.entries);
    return { groups, flat };
  }, [query, projectFuse, catalogFuse, boqFuse, currentProjectId]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Keep selection clamped when results change
  useEffect(() => {
    if (selected >= results.flat.length) setSelected(0);
  }, [results.flat.length, selected]);

  // Global escape handler
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const pick = (r: Result) => {
    pushRecent(query);
    navigate(r.navigate);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((i) => Math.min(results.flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const target = results.flat[selected];
      if (target) pick(target);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative flex items-start justify-center pt-[15vh] px-4">
        <div className="w-full max-w-xl border border-slate-700 bg-slate-950 shadow-2xl slide-up">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Төсөл, каталог, BOQ-ын мөр хайх..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-white"
              aria-label="Хаах"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto custom-scroll">
            {query.trim().length < 2 ? (
              <RecentPanel recent={recent} onPick={(q) => setQuery(q)} />
            ) : results.flat.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Тохирох үр дүн олдсонгүй
              </div>
            ) : (
              <div>
                {results.groups.map((group) => (
                  <div key={group.kind}>
                    <div className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold flex items-center gap-2 border-t border-slate-900 first:border-0">
                      <GroupIcon kind={group.kind} />
                      {group.label}
                      <span className="font-mono-tab text-slate-700 ml-auto">
                        {group.entries.length}
                      </span>
                    </div>
                    {group.entries.map((r) => {
                      const flatIdx = results.flat.indexOf(r);
                      const active = selected === flatIdx;
                      return (
                        <button
                          key={r.id}
                          onClick={() => pick(r)}
                          onMouseEnter={() => setSelected(flatIdx)}
                          className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                            active ? 'bg-blue-600/30' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{r.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">{r.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono-tab">
            <div className="flex items-center gap-3">
              <span>↑ ↓ Сонгох</span>
              <span>↵ Нээх</span>
              <span>ESC Хаах</span>
            </div>
            <span>⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentPanel({
  recent,
  onPick,
}: {
  recent: string[];
  onPick: (q: string) => void;
}) {
  if (recent.length === 0) {
    return (
      <div className="p-8 text-center text-[11px] text-slate-600">
        Сүүлд хайсан зүйл байхгүй. Хайлтын үгээ оруулаад эхлүүлнэ үү.
      </div>
    );
  }
  return (
    <div>
      <div className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold flex items-center gap-2">
        <Clock className="w-3 h-3" /> Сүүлд хайсан
      </div>
      {recent.map((q) => (
        <button
          key={q}
          onClick={() => onPick(q)}
          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-900/60 transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

function GroupIcon({ kind }: { kind: ResultKind }) {
  const Icon = kind === 'project' ? Layers : kind === 'catalog' ? Store : Package;
  return <Icon className="w-3 h-3" />;
}

// ─── Result builders ──────────────────────────────────────────────────

function projectToResult(p: Project): Result {
  return {
    kind: 'project',
    id: p.id,
    title: p.meta.name,
    subtitle: `${p.meta.code} · ${p.meta.subtitle}`,
    navigate: `/projects/${p.id}`,
  };
}

function catalogToResult(c: SupplierCatalogItem): Result {
  return {
    kind: 'catalog',
    id: c.id,
    title: c.name,
    subtitle: `${c.manufacturer ?? '—'} · ${formatNum(c.price)} ₮ / ${c.unit}`,
    navigate: `/catalog`, // detail is handled on /catalog via the card drawer
  };
}

function boqToResult(it: BoqLineItem, projectId: string): Result {
  return {
    kind: 'boq',
    id: it.id,
    title: it.name,
    subtitle: `${it.spec ?? '—'} · ${formatNum(it.qty)} ${it.unit}`,
    navigate: `/projects/${projectId}/section/${it.sectionId}`,
  };
}
