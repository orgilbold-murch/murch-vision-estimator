import { useMemo } from 'react';
import {
  Camera,
  Flame,
  Radio,
  Zap,
  Boxes,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { useOutletContext } from 'react-router-dom';

import { CalcRow } from '@/components/primitives/CalcRow';
import { formatMNT, formatShort } from '@/lib/format';
import type { DashboardOutletContext } from './layout';

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  flame: Flame,
  radio: Radio,
  zap: Zap,
};

export function OverviewRoute() {
  const ctx = useOutletContext<DashboardOutletContext>();
  const {
    sectionTotals,
    auxSubtotal,
    grandSubtotal,
    synergyDiscount,
    afterDiscount,
    vat,
    finalTotal,
    totalLabor,
    totalMaterial,
    project,
  } = ctx;
  const synergy = project.settings.synergy;
  const vatEnabled = project.settings.vatEnabled;
  const pieData = [
    ...sectionTotals.map((s) => ({ name: s.shortName, value: s.subtotal, color: s.color })),
    { name: 'Туслах', value: auxSubtotal, color: '#10b981' },
  ];

  const topItems = useMemo(() => {
    const all: { name: string; fullName: string; value: number; color: string; section: string }[] = [];
    sectionTotals.forEach((sec) => {
      sec.items.forEach((it) =>
        all.push({
          name: it.name.length > 30 ? it.name.slice(0, 28) + '…' : it.name,
          fullName: it.name,
          value: it.total,
          color: sec.color,
          section: sec.shortName,
        }),
      );
    });
    return all.sort((a, b) => b.value - a.value).slice(0, 12);
  }, [sectionTotals]);

  const laborMaterialData = [
    { name: 'Материал', value: totalMaterial, color: '#4d7fff' },
    { name: 'Ажил', value: totalLabor, color: '#f59e0b' },
    { name: 'Туслах', value: auxSubtotal, color: '#10b981' },
  ];

  return (
    <div className="space-y-4">
      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {sectionTotals.map((sec) => {
          const Icon = ICONS[sec.iconKey] ?? Camera;
          const pct = (sec.subtotal / grandSubtotal) * 100;
          return (
            <div
              key={sec.id}
              className="border border-slate-800 p-4 bg-slate-950/40 relative blueprint-corner"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ background: sec.color + '20', color: sec.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">
                      {sec.source}
                    </div>
                    <div className="font-semibold text-sm text-white">{sec.shortName}</div>
                  </div>
                </div>
                <div className="font-mono-tab text-xs text-slate-400">{pct.toFixed(1)}%</div>
              </div>
              <div className="font-display text-xl font-bold text-white ticker">
                {formatShort(sec.subtotal)}{' '}
                <span className="text-sm text-slate-500">₮</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 mb-2">
                {sec.itemCount} мөр · {formatShort(sec.material)}₮ мат +{' '}
                {formatShort(sec.labor)}₮ ажил
              </div>
              <div className="h-1 bg-slate-800 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ width: pct + '%', background: sec.color }}
                ></div>
              </div>
            </div>
          );
        })}

        {/* Auxiliary summary card */}
        <div className="border border-emerald-500/30 p-4 bg-emerald-500/5 relative blueprint-corner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-400">
                  АВТО
                </div>
                <div className="font-semibold text-sm text-white">Туслах</div>
              </div>
            </div>
            <div className="font-mono-tab text-xs text-emerald-400">
              {((auxSubtotal / grandSubtotal) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="font-display text-xl font-bold text-white ticker">
            {formatShort(auxSubtotal)} <span className="text-sm text-slate-500">₮</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 mb-2">
            БНбД-ийн нормоор автомат тооцсон
          </div>
          <div className="h-1 bg-slate-800 overflow-hidden">
            <div
              className="h-full transition-all bg-emerald-500"
              style={{ width: (auxSubtotal / grandSubtotal) * 100 + '%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="border border-slate-800 p-5 bg-slate-950/40 lg:col-span-2 blueprint-corner relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Зардлын задаргаа
              </div>
              <div className="font-display text-lg font-semibold text-white mt-0.5">
                Хэсгүүдийн хувь
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                stroke="#0f1829"
                strokeWidth={2}
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0a1020',
                  border: '1px solid #1e293b',
                  borderRadius: 0,
                  fontSize: '12px',
                }}
                formatter={(v) => formatMNT(Number(v))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3" style={{ background: p.color }}></div>
                  <span className="text-slate-300">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono-tab">
                  <span className="text-slate-500 text-[10px]">
                    {((p.value / grandSubtotal) * 100).toFixed(1)}%
                  </span>
                  <span className="text-white">{formatShort(p.value)}₮</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-slate-800 p-5 bg-slate-950/40 lg:col-span-3 blueprint-corner relative">
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
              Top-12 Cost Drivers
            </div>
            <div className="font-display text-lg font-semibold text-white mt-0.5">
              Хамгийн үнэтэй мөрүүд
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={topItems} layout="vertical" margin={{ left: 0, right: 40 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickFormatter={formatShort}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={200}
                tick={{ fill: '#cbd5e1', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0a1020',
                  border: '1px solid #1e293b',
                  borderRadius: 0,
                  fontSize: '12px',
                }}
                formatter={(v) => formatMNT(Number(v))}
                labelFormatter={(l: unknown, p: ReadonlyArray<{ payload?: { fullName?: string } }>) =>
                  p[0]?.payload?.fullName ?? String(l)
                }
              />
              <Bar dataKey="value" radius={0}>
                {topItems.map((it, i) => (
                  <Cell key={i} fill={it.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Material vs Labor + Computation Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="border border-slate-800 p-5 bg-slate-950/40 blueprint-corner relative">
          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3">
            Бүтэц
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={laborMaterialData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={70}
                dataKey="value"
                stroke="#0f1829"
                strokeWidth={2}
              >
                {laborMaterialData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0a1020',
                  border: '1px solid #1e293b',
                  borderRadius: 0,
                  fontSize: '12px',
                }}
                formatter={(v) => formatMNT(Number(v))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {laborMaterialData.map((d, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5" style={{ background: d.color }}></div>
                  <span className="text-slate-300">{d.name}</span>
                </span>
                <span className="font-mono-tab text-white">{formatShort(d.value)}₮</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-800 p-5 bg-slate-950/40 blueprint-corner relative">
          <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3">
            Тооцооллын гинж
          </div>
          <div className="space-y-2.5">
            <CalcRow label="1 · Үндсэн материал" value={formatMNT(totalMaterial)} />
            <CalcRow label="2 · Ажлын хөлс" value={formatMNT(totalLabor)} />
            <CalcRow
              label="3 · Туслах материал (БНбД auto)"
              value={formatMNT(auxSubtotal)}
              emerald
            />
            <CalcRow label="4 · Дэд дүн (нийт)" value={formatMNT(grandSubtotal)} bold />
            {synergy && (
              <CalcRow
                label="5 · SQUAD Synergy −10%"
                value={'− ' + formatMNT(synergyDiscount)}
                amber
                note="ажлын хөлснөөс хасна"
              />
            )}
            <CalcRow
              label={synergy ? '6 · Хөнгөлөлтийн дараа' : '5 · НӨАТ-гүй дүн'}
              value={formatMNT(afterDiscount)}
              bold
            />
            {vatEnabled && (
              <CalcRow
                label={`${synergy ? '7' : '6'} · НӨАТ +10%`}
                value={'+ ' + formatMNT(vat)}
                amber
              />
            )}
            <div className="pt-3 border-t border-slate-800">
              <CalcRow label="ЭЦСИЙН НИЙТ ДҮН" value={formatMNT(finalTotal)} final />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
