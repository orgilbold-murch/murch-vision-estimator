import {
  Check,
  FileText,
  FileJson,
  FileSpreadsheet,
  RotateCcw,
  Upload,
  Layers,
  Zap,
  Percent,
  Settings,
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';

import { ToggleCard } from '@/components/primitives/ToggleCard';
import { InfoBit } from '@/components/primitives/InfoBit';
import { TIER_OPTIONS } from '@/lib/tiers';
import { useStore } from '@/store';
import { loadSeedBundle } from '@/data/seedLoader';
import { exportLegacyJSON } from '@/lib/exportLegacy';
import { exportExcel } from '@/lib/exportExcel';
import type { TierId } from '@/types';
import type { DashboardOutletContext } from './layout';

const TIER_EXAMPLES: Record<TierId, string> = {
  premium: 'Bosch, Siemens, ABB, Panasonic, Hager',
  standard: 'Hikvision, Schneider, LS, CommScope, Nexans',
  economy: 'Монгол угсрах, Hytera, CHINT, Baokuan',
};

export function SettingsRoute() {
  const ctx = useOutletContext<DashboardOutletContext>();
  const navigate = useNavigate();
  const setTier = useStore((s) => s.setTier);
  const setSynergy = useStore((s) => s.setSynergy);
  const setVatEnabled = useStore((s) => s.setVatEnabled);
  const resetProjectItems = useStore((s) => s.resetProjectItems);
  const resetProjectSettings = useStore((s) => s.resetProjectSettings);
  const clearHistory = useStore((s) => s.clearHistory);
  const pushToast = useStore((s) => s.pushToast);

  const tier = ctx.project.settings.tier;
  const synergy = ctx.project.settings.synergy;
  const vatEnabled = ctx.project.settings.vatEnabled;
  const files = ctx.project.files;
  const projectId = ctx.project.id;

  const onReset = () => {
    if (!window.confirm('Бүх өөрчлөлтийг буцаах уу? Анхны инженерийн тооцоонд шилжинэ.'))
      return;
    const seeded = loadSeedBundle().items.filter((i) => i.projectId === projectId);
    resetProjectItems(projectId, seeded);
    resetProjectSettings(projectId);
    clearHistory();
    pushToast({ kind: 'success', text: 'Анхны утгад буцаалаа' });
  };
  const onFullReset = () => navigate('/projects/new');

  const onExportJSON = () => {
    exportLegacyJSON({
      projectMeta: ctx.project.meta,
      sectionTotals: ctx.sectionTotals,
      auxiliaryData: ctx.auxiliaryData,
      auxTotals: ctx.auxTotals,
      mainSubtotal: ctx.mainSubtotal,
      auxSubtotal: ctx.auxSubtotal,
      grandSubtotal: ctx.grandSubtotal,
      synergyDiscount: ctx.synergyDiscount,
      afterDiscount: ctx.afterDiscount,
      vat: ctx.vat,
      finalTotal: ctx.finalTotal,
      tier,
      tierMultiplier: ctx.tierMultiplier,
      synergy,
      vatEnabled,
      totalItems: ctx.totalItems,
      totalAuxItems: ctx.totalAuxItems,
      totalCableMeters: ctx.totalCableMeters,
    });
  };
  const onExportExcel = () => {
    const state = useStore.getState();
    exportExcel({
      projectMeta: ctx.project.meta,
      sectionTotals: ctx.sectionTotals,
      auxiliaryData: ctx.auxiliaryData,
      auxTotals: ctx.auxTotals,
      mainSubtotal: ctx.mainSubtotal,
      auxSubtotal: ctx.auxSubtotal,
      grandSubtotal: ctx.grandSubtotal,
      totalLabor: ctx.totalLabor,
      totalMaterial: ctx.totalMaterial,
      synergyDiscount: ctx.synergyDiscount,
      afterDiscount: ctx.afterDiscount,
      vat: ctx.vat,
      finalTotal: ctx.finalTotal,
      tier,
      tierMultiplier: ctx.tierMultiplier,
      synergy,
      vatEnabled,
      totalItems: ctx.totalItems,
      totalAuxItems: ctx.totalAuxItems,
      totalCableMeters: ctx.totalCableMeters,
      changeLog: state.changeLog.filter((e) => e.projectId === projectId),
      users: state.users,
    });
    pushToast({ kind: 'success', text: 'Excel татаж авлаа' });
  };
  return (
    <div className="fade-in max-w-5xl">
      <div className="mb-6 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-blue-400" />
          <h2 className="font-display text-2xl font-bold text-white">
            Тооцооллын тохиргоо
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Материалын ангилал, SQUAD синерги, татвар болон экспортын тохиргоог энд удирдана.
        </p>
      </div>

      {/* Tier selector */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            Материалын чанарын түвшин
          </h3>
        </div>
        <div className="text-xs text-slate-500 mb-4">
          Сонгосон түвшин нь зөвхөн үндсэн материалын үнэд үржигч болж, ажлын хөлсөнд нөлөөлөхгүй
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIER_OPTIONS.map((opt) => {
            const isActive = tier === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTier(projectId, opt.id)}
                className={`relative p-5 text-left border-2 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-950/30'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="font-display text-base font-bold text-white mb-1">
                  {opt.label}
                </div>
                <div className="text-xs text-slate-400 mb-3 leading-relaxed">{opt.desc}</div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-mono-tab text-2xl font-bold"
                    style={{ color: isActive ? '#4d7fff' : opt.accent }}
                  >
                    ×{opt.multiplier.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500">үржигч</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 leading-relaxed">
                  <span className="text-slate-400">Жишээ брэнд: </span>
                  <span className="text-slate-300">{TIER_EXAMPLES[opt.id]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synergy + VAT toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ToggleCard
          icon={<Zap className="w-5 h-5" />}
          title="SQUAD Synergy хөнгөлөлт"
          desc="SQUAD нэгдлийн гишүүн ажил гүйцэтгэгч сонгосон тохиолдолд ажлын хөлснөөс 10% хасагдана"
          checked={synergy}
          onChange={(v) => setSynergy(projectId, v)}
          savingsNote={synergy ? 'Хөнгөлөлт идэвхитэй' : 'Унтраалгатай'}
        />
        <ToggleCard
          icon={<Percent className="w-5 h-5" />}
          title="НӨАТ тооцох"
          desc="Нэмэгдсэн өртгийн албан татвар 10% эцсийн дэд дүн дээр нэмэгдэнэ"
          checked={vatEnabled}
          onChange={(v) => setVatEnabled(projectId, v)}
          savingsNote={vatEnabled ? 'НӨАТ нэмэгдэнэ' : 'НӨАТ хасагдсан'}
        />
      </div>

      {/* Files */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            Анализд ашигласан зургууд
          </h3>
        </div>
        <div className="border border-slate-800 bg-slate-950/40 divide-y divide-slate-900">
          {files.length > 0 ? (
            files.map((f, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-blue-950/60 border border-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{f.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {f.pages ? `${f.pages} хуудас · ` : ''}{f.type}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] px-2 py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Боловсруулсан
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              Ажлын зураг байхгүй байна
            </div>
          )}
        </div>
      </div>

      {/* Export + Reset */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3 font-semibold">
          Үйлдэл
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={onExportJSON}
            className="px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <FileJson className="w-4 h-4" />
            <span>JSON экспорт</span>
          </button>
          <button
            onClick={onExportExcel}
            className="px-4 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel экспорт</span>
          </button>
          <button
            onClick={onReset}
            className="px-4 py-4 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-800 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Анхны утгад</span>
          </button>
          <button
            onClick={onFullReset}
            className="px-4 py-4 bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-800 hover:border-red-900 text-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Шинээр эхлүүлэх</span>
          </button>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-8 p-4 bg-slate-950/60 border border-slate-800">
        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3">
          Систем мэдээлэл
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <InfoBit label="Үнийн сан"       value="Улаанбаатар Q1 2026" />
          <InfoBit label="Норм"             value="БНбД 43-101, 43-103" />
          <InfoBit label="AI хөдөлгүүр"    value="Murch Vision v3.0" />
          <InfoBit label="Нийт нэр төрөл"  value="120+ үндсэн · 50+ туслах" />
        </div>
      </div>
    </div>
  );
}
