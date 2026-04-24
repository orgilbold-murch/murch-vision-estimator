import { Wrench, Info } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

import { RefItem } from '@/components/primitives/RefItem';
import { formatMNT, formatShort } from '@/lib/format';
import type { ComputedAuxRuntimeItem, SectionId } from '@/types';
import type { DashboardOutletContext } from './layout';

export function AuxiliaryRoute() {
  const { auxiliaryData, auxTotals, sectionTotals } = useOutletContext<DashboardOutletContext>();
  const grandTotal = auxTotals.grand;

  const sectionMeta: Record<string, { name: string; color: string; shortName: string }> = {};
  sectionTotals.forEach((sec) => {
    sectionMeta[sec.id] = {
      name: sec.name,
      color: sec.color,
      shortName: sec.shortName || sec.name,
    };
  });

  const sectionIds: SectionId[] = (['cctv', 'fire', 'intercom', 'electrical'] as const).filter(
    (id) => auxiliaryData[id],
  );

  // Top-6 group summary across all sections
  const groupSummary: Record<string, { count: number; total: number }> = {};
  sectionIds.forEach((sk) => {
    (auxiliaryData[sk] ?? []).forEach((a) => {
      if (!groupSummary[a.group]) groupSummary[a.group] = { count: 0, total: 0 };
      groupSummary[a.group]!.count += 1;
      groupSummary[a.group]!.total += a.total;
    });
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-slate-800">
        <div className="flex items-start justify-between gap-6 mb-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-6 h-6 text-emerald-400" />
              <h2 className="font-display text-2xl font-bold text-white">
                Туслах материалын тооцоо
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              БНбД 43-101-18, БНбД 43-103-18 болон кабелийн үйлдвэрлэгчийн нормд тулгуурлан, үндсэн материалын тоо ширхэг болон кабелийн уртаас автоматаар тооцсон.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-emerald-500 mb-1">
              Нийт туслах материал
            </div>
            <div className="font-mono-tab text-3xl font-bold text-emerald-400">
              {formatMNT(grandTotal)}
            </div>
          </div>
        </div>

        {/* Calculation reference card */}
        <div className="mt-4 p-4 bg-emerald-950/20 border border-emerald-900/40">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2 font-semibold flex items-center gap-2">
            <Info className="w-3 h-3" />
            Тооцооллын коэффициентүүд (БНбД)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1.5 text-[11px]">
            <RefItem label="Кабель бэхэлгээ"        value="0.5 м тутамд 1" />
            <RefItem label="Галын кабель бэхэлгээ"  value="0.4 м тутамд 1" />
            <RefItem label="Кабель боолт"           value="3 м тутамд 1" />
            <RefItem label="Кабелийн нөөц"          value="+15%" />
            <RefItem label="RJ45 холбогч"           value="төгсгөл×2 + 10%" />
            <RefItem label="Халуун агшилт"          value="0.4 м / холболт" />
            <RefItem label="Дюбель/анкер"           value="цэг × 4 ш" />
            <RefItem label="DIN рейк"               value="самбар × 1.5 м" />
            <RefItem label="Хоолойн булан"          value="8 м тутамд 1" />
            <RefItem label="Хоолойн холбогч"        value="3 м тутамд 1" />
            <RefItem label="Сэдэл бэхэлгээ"         value="0.8 м тутамд 1" />
            <RefItem label="Бентонит"               value="1 шуудай / электрод" />
          </div>
        </div>
      </div>

      {/* Group summary strip */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2.5">
          Бүлгээр задаргаа (топ 6)
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(groupSummary)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 6)
            .map(([group, data]) => (
              <div key={group} className="border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-500 mb-1 truncate">
                  {group}
                </div>
                <div className="font-mono-tab text-base font-bold text-white">
                  {formatShort(data.total)}₮
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{data.count} зүйл</div>
              </div>
            ))}
        </div>
      </div>

      {/* Per-section blocks */}
      <div className="space-y-5">
        {sectionIds.map((sk) => {
          const items = auxiliaryData[sk] ?? [];
          const sectionTotal = auxTotals[sk] ?? 0;
          const meta = sectionMeta[sk] ?? { name: sk, color: '#10b981', shortName: sk };
          const sectionGrouped = items.reduce<Record<string, ComputedAuxRuntimeItem[]>>(
            (acc, item) => {
              if (!acc[item.group]) acc[item.group] = [];
              acc[item.group]!.push(item);
              return acc;
            },
            {},
          );
          return (
            <div key={sk} className="border border-slate-800 bg-slate-950/40 blueprint-corner">
              <div
                className="px-5 py-4 border-b border-slate-800 flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, ${meta.color}18, transparent)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10" style={{ background: meta.color }}></div>
                  <div>
                    <div className="font-display text-base font-bold text-white">{meta.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {items.length} нэр төрөл · {Object.keys(sectionGrouped).length} бүлэг
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-500">
                    Дэд дүн
                  </div>
                  <div className="font-mono-tab text-xl font-bold text-emerald-400">
                    {formatMNT(sectionTotal)}
                  </div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(sectionGrouped).map(([groupName, groupItems]) => {
                  const groupTotal = groupItems.reduce((s, a) => s + a.total, 0);
                  return (
                    <div
                      key={groupName}
                      className="border border-slate-800/60 bg-slate-950/40 p-3"
                    >
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/60">
                        <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                          {groupName}
                        </div>
                        <div className="font-mono-tab text-xs text-emerald-400">
                          {formatShort(groupTotal)}₮
                        </div>
                      </div>
                      <div className="space-y-1">
                        {groupItems.map((a, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-baseline text-xs gap-2"
                          >
                            <span className="text-slate-300 flex-1 truncate">{a.name}</span>
                            <span className="font-mono-tab text-slate-500 text-[10px] whitespace-nowrap">
                              {a.qty.toLocaleString('en-US')} {a.unit}
                            </span>
                            <span className="font-mono-tab text-white w-20 text-right">
                              {formatShort(a.total)}₮
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
