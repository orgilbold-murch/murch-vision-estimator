import { useEffect } from 'react';
import {
  Eye,
  Printer,
  FileJson,
  FileSpreadsheet,
  FileText,
  X,
  Package,
  Calculator,
  Wrench,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Logo } from '@/components/primitives/Logo';
import { QuoteInfo } from '@/components/primitives/QuoteInfo';
import { SummaryTile } from '@/components/primitives/SummaryTile';
import { QuoteCalcRow } from '@/components/primitives/QuoteCalcRow';
import { ApprovalSeal } from '@/components/primitives/ApprovalSeal';
import { formatMNT, formatShort } from '@/lib/format';
import { TIER_OPTIONS } from '@/lib/tiers';
import { useComputedProject } from '@/selectors/useComputedProject';
import { useStore } from '@/store';
import { exportLegacyJSON, type LegacyExportInputs } from '@/lib/exportLegacy';
import { exportPdf } from '@/lib/exportPdf';
import { exportExcel } from '@/lib/exportExcel';
import type { SectionId } from '@/types';

export function QuoteRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const computed = useComputedProject(id ?? '');
  const changeLog = useStore((s) => s.changeLog);
  const approvals = useStore((s) => s.approvals);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(`/projects/${id ?? ''}`);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, id]);

  if (!id) return <Navigate to="/projects" replace />;
  if (!computed) return <Navigate to="/projects" replace />;

  const changeLogCount = changeLog.reduce(
    (acc, e) => (e.projectId === id ? acc + 1 : acc),
    0,
  );

  const latestApproval = approvals
    .filter((a) => a.projectId === id)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0];
  const isSigned = computed.project.status === 'signed';
  const isApproved = computed.project.status === 'approved' || isSigned;
  const isDraft = !isApproved;

  const {
    project,
    sectionTotals,
    auxiliaryData,
    auxTotals,
    mainSubtotal,
    auxSubtotal,
    grandSubtotal,
    totalLabor,
    totalMaterial,
    synergyDiscount,
    afterDiscount,
    vat,
    finalTotal,
    tierMultiplier,
    totalItems,
    totalAuxItems,
    totalCableMeters,
  } = computed;

  const tier = project.settings.tier;
  const synergy = project.settings.synergy;
  const vatEnabled = project.settings.vatEnabled;
  const files = project.files;

  const tierLabel = TIER_OPTIONS.find((t) => t.id === tier)?.label ?? 'Standard';
  const today = new Date();
  const docNo = `MV-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${project.meta.code}`;
  const validUntil = new Date(today.getTime() + 30 * 86_400_000);

  const onClose = () => navigate(`/projects/${id}`);

  const legacyInputs: LegacyExportInputs = {
    projectMeta: project.meta,
    sectionTotals,
    auxiliaryData,
    auxTotals,
    mainSubtotal,
    auxSubtotal,
    grandSubtotal,
    synergyDiscount,
    afterDiscount,
    vat,
    finalTotal,
    tier,
    tierMultiplier,
    synergy,
    vatEnabled,
    totalItems,
    totalAuxItems,
    totalCableMeters,
  };
  const onExportJSON = () => exportLegacyJSON(legacyInputs);

  const onExportExcel = () => {
    const state = useStore.getState();
    exportExcel({
      projectMeta: project.meta,
      sectionTotals,
      auxiliaryData,
      auxTotals,
      mainSubtotal,
      auxSubtotal,
      grandSubtotal,
      totalLabor,
      totalMaterial,
      synergyDiscount,
      afterDiscount,
      vat,
      finalTotal,
      tier,
      tierMultiplier,
      synergy,
      vatEnabled,
      totalItems,
      totalAuxItems,
      totalCableMeters,
      changeLog: state.changeLog.filter((e) => e.projectId === id),
      users: state.users,
    });
    state.pushToast({ kind: 'success', text: 'Excel татаж авлаа' });
  };

  const pushToast = useStore.getState().pushToast;
  const onExportPdf = async () => {
    pushToast({ kind: 'info', text: 'PDF бэлтгэж байна…' });
    try {
      await exportPdf({
        projectMeta: project.meta,
        projectStatus: project.status,
        approvalRecord: latestApproval,
        sectionTotals,
        auxiliaryData,
        auxTotals,
        mainSubtotal,
        auxSubtotal,
        grandSubtotal,
        totalLabor,
        totalMaterial,
        synergyDiscount,
        afterDiscount,
        vat,
        finalTotal,
        tier,
        tierMultiplier,
        synergy,
        vatEnabled,
        changeLogCount,
        files,
      });
      pushToast({ kind: 'success', text: 'PDF татаж авлаа' });
    } catch (err) {
      console.error('exportPdf failed', err);
      pushToast({ kind: 'error', text: 'PDF үүсгэхэд алдаа гарлаа' });
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative h-full flex flex-col">
        {/* Action bar */}
        <div className="flex-shrink-0 bg-slate-950/95 border-b border-slate-800 backdrop-blur-sm print:hidden">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Урьдчилан харах</div>
                <div className="font-display text-sm font-bold text-white">Үнийн санал</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportPdf}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs flex items-center gap-2 transition-colors font-semibold"
                title="PDF татах"
              >
                <FileText className="w-3.5 h-3.5" /> PDF татах
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Хэвлэх
              </button>
              <button
                onClick={onExportJSON}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <FileJson className="w-3.5 h-3.5" /> JSON
              </button>
              <button
                onClick={onExportExcel}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-2 border border-slate-700 transition-colors"
                title="Excel татах"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs flex items-center gap-2 border border-slate-800 hover:border-red-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Хаах
              </button>
            </div>
          </div>
        </div>

        {/* Document scroll area */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          <div className="max-w-[900px] mx-auto my-6 bg-white text-slate-900 shadow-2xl print:shadow-none print:my-0 print:max-w-full slide-up relative overflow-hidden">
            {/* DRAFT watermark — rotated overlay, visible when not signed */}
            {isDraft && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
                aria-hidden
              >
                <div
                  className="font-display font-extrabold text-[8rem] text-slate-900 opacity-[0.06] select-none tracking-[0.1em] whitespace-nowrap"
                  style={{ transform: 'rotate(-35deg)' }}
                >
                  НООРОГ / DRAFT
                </div>
              </div>
            )}
            {/* Unapproved banner (above the document header) */}
            {isDraft && (
              <div className="relative z-10 bg-amber-50 border-b-2 border-amber-400 px-10 py-3 flex items-center gap-3 print:border-amber-500">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>Анхааруулга.</strong> Энэ үнийн санал инженерийн баталгаа аваагүй байна. Захиалагчид албан ёсоор хүлээлгэн өгөхөөс өмнө цахим гарын үсэг авах шаардлагатай.
                </div>
              </div>
            )}
            <div className="relative z-10">
            {/* Document header */}
            <div className="p-10 border-b-2 border-slate-900">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <Logo height={32} inverted />
                  <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    AI-powered BOQ · Construction Cost Estimate
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Баримт №
                  </div>
                  <div className="font-mono-tab text-sm font-bold text-slate-900">{docNo}</div>
                  <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
                    Огноо
                  </div>
                  <div className="font-mono-tab text-sm text-slate-900">
                    {today.toLocaleDateString('mn-MN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-1">
                Ажлын зардлын хэмжээ (BOQ)
              </h1>
              <div className="text-lg text-slate-700 mb-4">
                {project.meta.name}{' '}
                <span className="text-slate-500 text-base">/ {project.meta.subtitle} /</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-200">
                <QuoteInfo label="Захиалагч" value={project.meta.clients} />
                <QuoteInfo label="Байршил"    value={project.meta.location} />
                <QuoteInfo label="Талбай"     value={project.meta.area} />
                <QuoteInfo
                  label="Үнэ хүчинтэй"
                  value={validUntil.toLocaleDateString('mn-MN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                />
              </div>
            </div>

            {/* Executive summary box */}
            <div className="px-10 py-8 bg-slate-50 border-b border-slate-200">
              <div className="text-[10px] uppercase tracking-[0.25em] text-blue-700 mb-3 font-semibold">
                Нэгдсэн дүн
              </div>
              <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
                <div>
                  <div className="text-xs text-slate-600 mb-1">
                    Эцсийн нийт дүн ({vatEnabled ? 'НӨАТ-тай' : 'НӨАТ-гүй'})
                  </div>
                  <div className="font-display text-5xl font-extrabold text-blue-700 ticker">
                    {formatMNT(finalTotal)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Материалын түвшин
                  </div>
                  <div className="font-display text-lg font-bold text-slate-900">{tierLabel}</div>
                  <div className="text-xs text-slate-600">үржигч ×{tierMultiplier.toFixed(2)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryTile label="Үндсэн материал" value={formatShort(totalMaterial) + '₮'} />
                <SummaryTile label="Ажлын хөлс"      value={formatShort(totalLabor) + '₮'} />
                <SummaryTile label="Туслах материал" value={formatShort(auxSubtotal) + '₮'} emerald />
                <SummaryTile
                  label={synergy ? 'SQUAD хэмнэлт' : 'Хөнгөлөлт'}
                  value={synergy ? '−' + formatShort(synergyDiscount) + '₮' : '—'}
                  amber={synergy}
                />
              </div>
            </div>

            {/* Section-by-section table */}
            <div className="p-10">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-4 font-semibold flex items-center gap-2">
                <Package className="w-3 h-3" /> BOQ задаргаа
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">№</th>
                    <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Хэсэг</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Мөр</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Материал</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Ажил</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Туслах</th>
                    <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Дэд дүн</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionTotals.map((sec, i) => {
                    const secAux = auxTotals[sec.id] ?? 0;
                    const secTotal = sec.subtotal + secAux;
                    return (
                      <tr key={sec.id} className="border-b border-slate-200">
                        <td className="py-3 px-2 font-mono-tab text-xs text-slate-500">{i + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6" style={{ background: sec.color }}></div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{sec.name}</div>
                              <div className="text-[10px] text-slate-500">
                                {sec.itemCount} нэр төрөл
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-600">
                          {sec.itemCount}
                        </td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-700">
                          {formatShort(sec.material)}₮
                        </td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-700">
                          {formatShort(sec.labor)}₮
                        </td>
                        <td className="py-3 px-2 text-right font-mono-tab text-xs text-emerald-700">
                          {formatShort(secAux)}₮
                        </td>
                        <td className="py-3 px-2 text-right font-mono-tab text-sm font-bold text-slate-900">
                          {formatShort(secTotal)}₮
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-b-2 border-slate-900 bg-slate-100">
                    <td></td>
                    <td className="py-3 px-2 font-display font-bold text-slate-900 uppercase text-xs tracking-wider">
                      Дэд дүн
                    </td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs text-slate-600">
                      {sectionTotals.reduce((s, x) => s + x.itemCount, 0)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs font-bold text-slate-900">
                      {formatShort(totalMaterial)}₮
                    </td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs font-bold text-slate-900">
                      {formatShort(totalLabor)}₮
                    </td>
                    <td className="py-3 px-2 text-right font-mono-tab text-xs font-bold text-emerald-700">
                      {formatShort(auxSubtotal)}₮
                    </td>
                    <td className="py-3 px-2 text-right font-mono-tab text-sm font-bold text-blue-700">
                      {formatShort(grandSubtotal)}₮
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculation ladder */}
            <div className="px-10 pb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3 font-semibold flex items-center gap-2">
                <Calculator className="w-3 h-3" /> Үнэлгээний тооцоолол
              </div>
              <div className="border border-slate-200 bg-slate-50">
                <QuoteCalcRow
                  label="Үндсэн материал"
                  value={formatMNT(totalMaterial)}
                  sub={`Түвшин: ${tierLabel} · үржигч ×${tierMultiplier.toFixed(2)}`}
                />
                <QuoteCalcRow
                  label="Ажлын хөлс"
                  value={formatMNT(totalLabor)}
                  sub="Угсралт, суурилуулалт, туршилт"
                />
                <QuoteCalcRow
                  label="Туслах материал (БНбД auto)"
                  value={formatMNT(auxSubtotal)}
                  sub="Бэхэлгээ · Холбогч · Тусгаарлалт · Газардуулга"
                  emerald
                />
                <QuoteCalcRow label="Дэд дүн" value={formatMNT(grandSubtotal)} bold />
                {synergy && (
                  <QuoteCalcRow
                    label="SQUAD Synergy хөнгөлөлт (−10% ажлын хөлс)"
                    value={'− ' + formatMNT(synergyDiscount)}
                    amber
                  />
                )}
                {synergy && (
                  <QuoteCalcRow label="Хөнгөлөлтийн дараа" value={formatMNT(afterDiscount)} bold />
                )}
                {vatEnabled && (
                  <QuoteCalcRow label="НӨАТ (+10%)" value={'+ ' + formatMNT(vat)} amber />
                )}
                <div className="border-t-2 border-slate-900 bg-blue-50 px-4 py-4 flex items-center justify-between">
                  <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
                    Эцсийн нийт дүн
                  </div>
                  <div className="font-display text-3xl font-extrabold text-blue-700 ticker">
                    {formatMNT(finalTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Auxiliary breakdown */}
            <div className="px-10 pb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-700 mb-3 font-semibold flex items-center gap-2">
                <Wrench className="w-3 h-3" /> Туслах материалын задаргаа (БНбД-ээр автомат)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['cctv', 'fire', 'intercom', 'electrical'] as SectionId[]).map((sk) => {
                  const sec = sectionTotals.find((s) => s.id === sk);
                  const items = auxiliaryData[sk] ?? [];
                  const total = auxTotals[sk] ?? 0;
                  if (!sec) return null;
                  return (
                    <div key={sk} className="p-3 border border-slate-200 bg-white">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4" style={{ background: sec.color }}></div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold truncate">
                          {sec.shortName}
                        </div>
                      </div>
                      <div className="font-mono-tab text-base font-bold text-emerald-700">
                        {formatShort(total)}₮
                      </div>
                      <div className="text-[10px] text-slate-500">{items.length} нэр төрөл</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms */}
            <div className="px-10 pb-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3 font-semibold flex items-center gap-2">
                <Info className="w-3 h-3" /> Тэмдэглэл · Нөхцөл
              </div>
              {changeLogCount > 0 && (
                <div className="mb-4 px-4 py-3 bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-900 leading-relaxed">
                  <strong>Анхааруулга.</strong> Энэхүү үнийн санал нь AI-ийн анхны үнэлгээнээс <strong>{changeLogCount} өөрчлөлттэй</strong>. Дэлгэрэнгүйг «Өөрчлөлт» цонхноос харна уу.
                </div>
              )}
              <div className="border-l-2 border-slate-900 pl-4 space-y-2 text-xs text-slate-700">
                <p>
                  • Үнэлгээ нь <strong>Улаанбаатар Q1 2026</strong> оны зах зээлийн үнэ, БНбД 43-101-18 болон БНбД 43-103-18 нормд тулгуурлан гаргав.
                </p>
                <p>
                  • Туслах материалын тоо хэмжээг үндсэн материалын тоо ширхэг, кабелийн уртаас автомат тооцоолсон (+15% нөөц).
                </p>
                <p>
                  • Материалын чанарын түвшин: <strong>{tierLabel}</strong> (×{tierMultiplier.toFixed(2)} үржигч).
                </p>
                {synergy && (
                  <p>
                    • SQUAD нэгдлийн гишүүн компаниар гүйцэтгэгч байгуулбал ажлын хөлснөөс 10% хасагдана.
                  </p>
                )}
                {vatEnabled && <p>• Эцсийн дүнд 10% НӨАТ нэмэгдсэн.</p>}
                <p>• Үнийн санал {validUntil.toLocaleDateString('mn-MN')} хүртэл хүчинтэй.</p>
                <p>
                  • Анализад ашигласан зураг:{' '}
                  {files.length > 0
                    ? files.map((f) => f.name).join(', ')
                    : 'Бросс-С блок ХД/ХТ/ДГ зураг'}
                  .
                </p>
              </div>
            </div>

            {/* Signature area */}
            <div className="px-10 py-8 bg-slate-50 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-8 font-semibold">
                  Гүйцэтгэгч
                </div>
                <div className="border-b border-slate-400 mb-1 h-8"></div>
                <div className="text-xs text-slate-700">(Гарын үсэг · Тамга)</div>
                <div className="text-xs text-slate-500 mt-4 font-mono-tab">
                  Murch Vision AI Estimator v3.0
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-8 font-semibold">
                  Захиалагч
                </div>
                <div className="border-b border-slate-400 mb-1 h-8"></div>
                <div className="text-xs text-slate-700">(Гарын үсэг · Тамга)</div>
                <div className="text-xs text-slate-500 mt-4">{project.meta.clients}</div>
              </div>
            </div>

            {/* Engineer seal — rendered when the project is signed */}
            {isSigned && latestApproval && (
              <div className="px-10 py-8 border-t-2 border-emerald-700 bg-emerald-50 flex justify-center">
                <ApprovalSeal record={latestApproval} size="lg" onCreamPaper />
              </div>
            )}

            {/* Footer — AI disclosure (always) + document metadata */}
            <div className="px-10 py-5 text-center border-t border-slate-200 bg-slate-100 space-y-1">
              <div className="text-[11px] text-slate-700 leading-relaxed">
                <strong>Энэхүү баримт бичгийг Murch Vision AI Estimator-ийн туслалцаатай боловсруулж, лицензтэй инженер хянан баталсан болно.</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Баримт № {docNo} · {today.toLocaleDateString('mn-MN')}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
