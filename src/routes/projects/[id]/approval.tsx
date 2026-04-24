// ═══════════════════════════════════════════════════════════════════════════
// /projects/:id/approval — engineer approval workflow
//
// Content is (role × status) dependent:
//   sales/admin + draft      → submission form
//   sales        + in_review → read-only "under review" panel
//   engineer     + in_review → BOQ preview + approve/reject buttons
//   engineer     + approved  → "Sign with PIN" button
//   everyone     + signed    → read-only approval record + seal
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  ShieldCheck,
  FilePlus2,
  AlertTriangle,
} from 'lucide-react';

import { Logo } from '@/components/primitives/Logo';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { ApprovalSeal } from '@/components/primitives/ApprovalSeal';
import { PinModal } from '@/components/primitives/PinModal';
import { useStore } from '@/store';
import { useComputedProject } from '@/selectors/useComputedProject';
import { jsonHash } from '@/lib/hash';
import { formatMNT, formatShort } from '@/lib/format';
import { formatDateTimeMN } from '@/lib/date';
import type { ApprovalRecord, User } from '@/types';

function makeId(): string {
  return 'apr-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function ApprovalRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  const items = useStore((s) => s.items);
  const approvals = useStore((s) => s.approvals);
  const addApproval = useStore((s) => s.addApproval);
  const updateApproval = useStore((s) => s.updateApproval);
  const setProjectStatus = useStore((s) => s.setProjectStatus);
  const cloneProjectAsRevision = useStore((s) => s.cloneProjectAsRevision);
  const pushToast = useStore((s) => s.pushToast);
  const computed = useComputedProject(id ?? '');

  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [note, setNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showPin, setShowPin] = useState(false);

  if (!id) return <Navigate to="/projects" replace />;
  if (!computed) return <Navigate to="/projects" replace />;

  const currentUser = users.find((u) => u.id === currentUserId);
  if (!currentUser) return <Navigate to="/projects" replace />;

  const engineers = users.filter((u) => u.role === 'engineer');

  const projectApprovals = approvals
    .filter((a) => a.projectId === id)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  const latestApproval = projectApprovals[0];

  const status = computed.project.status;
  const itemsSnapshot = items.filter((i) => i.projectId === id);

  // ─── Action handlers ────────────────────────────────────────────────
  const onSubmitForReview = () => {
    if (!selectedEngineerId) {
      pushToast({ kind: 'warn', text: 'Инженер сонгоно уу' });
      return;
    }
    const engineer = users.find((u) => u.id === selectedEngineerId);
    if (!engineer) return;
    const now = new Date().toISOString();
    const record: ApprovalRecord = {
      id: makeId(),
      projectId: id,
      status: 'pending',
      engineerId: engineer.id,
      engineerName: engineer.name,
      licenseNumber: engineer.licenseNumber ?? '',
      licenseExpires: engineer.licenseExpires ?? '',
      submittedBy: currentUserId ?? '',
      submittedAt: now,
      note: note || undefined,
      snapshotHash: jsonHash(itemsSnapshot),
    };
    addApproval(record);
    setProjectStatus(id, 'in_review');
    pushToast({ kind: 'success', text: 'Хянуулахаар илгээлээ' });
    setNote('');
  };

  const onApprove = () => {
    if (!latestApproval) return;
    const now = new Date().toISOString();
    updateApproval(latestApproval.id, { status: 'approved', decidedAt: now });
    setProjectStatus(id, 'approved');
    pushToast({ kind: 'success', text: 'Зөвшөөрөгдлөө' });
  };

  const onReject = () => {
    if (!latestApproval) return;
    if (!rejectReason.trim()) {
      pushToast({ kind: 'warn', text: 'Буцаах шалтгаанаа бичнэ үү' });
      return;
    }
    const now = new Date().toISOString();
    updateApproval(latestApproval.id, {
      status: 'rejected',
      decidedAt: now,
      rejectionReason: rejectReason.trim(),
    });
    setProjectStatus(id, 'draft');
    pushToast({ kind: 'info', text: 'Буцаагдлаа' });
    setShowReject(false);
    setRejectReason('');
  };

  const onSignConfirmed = () => {
    if (!latestApproval) return;
    const now = new Date().toISOString();
    updateApproval(latestApproval.id, { status: 'signed', signedAt: now });
    setProjectStatus(id, 'signed');
    setShowPin(false);
    pushToast({ kind: 'success', text: 'Цахим гарын үсэг баталгаажлаа' });
  };

  const onCreateRevision = () => {
    if (!currentUserId) return;
    const newId = cloneProjectAsRevision(id, currentUserId);
    if (newId) {
      pushToast({ kind: 'success', text: 'Шинэ хувилбар үүсгэлээ' });
      navigate(`/projects/${newId}/overview`);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-5xl mx-auto px-6 py-5">
        {/* Top nav */}
        <header className="mb-6 pb-4 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-3">
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

        {/* Status header */}
        <div className="mb-6">
          <StatusHeader status={status} project={computed.project.meta} />
        </div>

        {/* Main action area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {/* ─── Draft: sales/admin submits */}
            {status === 'draft' && (currentUser.role === 'sales' || currentUser.role === 'admin') && (
              <div className="border border-slate-800 bg-slate-950/60 p-6">
                <h2 className="font-display text-lg font-bold text-white mb-2">
                  Инженерээр хянуулах
                </h2>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  BOQ-г баталгаажуулахын тулд лицензтэй цахилгаан инженерт илгээнэ. Хянуулах хугацаа 1–2 ажлын өдөр.
                </p>

                <div className="mb-4">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">
                    Хянах инженер
                  </label>
                  <select
                    value={selectedEngineerId}
                    onChange={(e) => setSelectedEngineerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Сонгоно уу...</option>
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} · {eng.licenseNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">
                    Нэмэлт тэмдэглэл (сонголттой)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Жишээ нь: Хурдан хянаж өгнө үү, захиалагч 2026-05-01-нээс өмнө шаардаж байна."
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={onSubmitForReview}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" /> Хянуулахаар илгээх
                </button>

                {latestApproval && latestApproval.status === 'rejected' && (
                  <div className="mt-5 p-4 border border-red-500/40 bg-red-500/10 text-xs text-red-300">
                    <div className="font-semibold text-red-200 mb-1 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Өмнөх удаад буцаасан:
                    </div>
                    <div className="text-slate-300">{latestApproval.rejectionReason}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono-tab">
                      {latestApproval.engineerName} · {formatDateTimeMN(latestApproval.decidedAt ?? latestApproval.submittedAt)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── In review: sales sees waiting state */}
            {status === 'in_review' && currentUser.role === 'sales' && latestApproval && (
              <div className="border border-amber-500/40 bg-amber-500/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-amber-400 pulse-soft" />
                  <h2 className="font-display text-lg font-bold text-white">
                    Хянагдаж байна
                  </h2>
                </div>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Үнийн санал <strong className="text-white">{latestApproval.engineerName}</strong> инженерт (лиценз {latestApproval.licenseNumber}) очсон бөгөөд одоо хянагдаж байна.
                </p>
                <div className="text-[11px] text-slate-400 font-mono-tab">
                  Илгээсэн: {formatDateTimeMN(latestApproval.submittedAt)}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Хянах дундаж хугацаа: <strong>1–2 ажлын өдөр</strong>. Инженер зөвшөөрсний дараа цахим гарын үсэг зурж баталгаажуулна.
                </p>
              </div>
            )}

            {/* ─── In review: engineer approves/rejects */}
            {status === 'in_review' && currentUser.role === 'engineer' && latestApproval && (
              <div className="space-y-4">
                <div className="border border-blue-500/40 bg-blue-500/5 p-5">
                  <h2 className="font-display text-lg font-bold text-white mb-1">
                    Инженерийн хяналт
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    BOQ-г бүрэн хянасны дараа зөвшөөрөх эсвэл тайлбартайгаар буцаана уу.
                  </p>
                  {latestApproval.note && (
                    <div className="mt-3 p-3 bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                        Борлуулалтын тэмдэглэл:
                      </div>
                      {latestApproval.note}
                    </div>
                  )}
                </div>

                {/* Totals mini-preview */}
                <div className="border border-slate-800 bg-slate-950/60 p-5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3 font-semibold">
                    Эцсийн дүнгийн тойм
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniTotal label="Үндсэн материал" value={formatShort(computed.totalMaterial) + '₮'} />
                    <MiniTotal label="Ажлын хөлс" value={formatShort(computed.totalLabor) + '₮'} />
                    <MiniTotal label="Туслах материал" value={formatShort(computed.auxSubtotal) + '₮'} />
                    <MiniTotal label="Эцсийн дүн" value={formatMNT(computed.finalTotal)} highlight />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      {computed.totalItems} BOQ мөр · {computed.modifiedItemCount} өөрчлөлт
                    </div>
                    <button
                      onClick={() => navigate(`/projects/${id}/overview`)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 uppercase tracking-wider font-semibold"
                    >
                      Бүрэн харах →
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onApprove}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Зөвшөөрөх
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    className="flex-1 px-4 py-3 border-2 border-red-500/60 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Буцаах
                  </button>
                </div>

                {showReject && (
                  <div className="border border-red-500/40 bg-red-500/5 p-5">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">
                      Буцаах шалтгаан (заавал)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Жишээ нь: ВВГ 5x6мм² тоо хэмжээ зурагтай тохирохгүй байна. Дахин шалгаарай."
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none resize-none mb-3"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowReject(false)}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                      >
                        Цуцлах
                      </button>
                      <button
                        onClick={onReject}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                      >
                        Буцаах бичгийг илгээх
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Approved: engineer signs */}
            {status === 'approved' && currentUser.role === 'engineer' && latestApproval && (
              <div className="border border-emerald-500/40 bg-emerald-500/5 p-6">
                <h2 className="font-display text-lg font-bold text-white mb-2">
                  Гарын үсгээр баталгаажуулах
                </h2>
                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                  Та үнийн саналыг зөвшөөрсөн. Одоо цахим гарын үсгээр баталгаажуулж, үйлчлүүлэгчид албан ёсоор хүлээлгэн өгөх боломжтой.
                </p>
                <button
                  onClick={() => setShowPin(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Гарын үсгээр баталгаажуулах
                </button>
              </div>
            )}

            {/* ─── Approved: sales sees waiting for sign */}
            {status === 'approved' && currentUser.role !== 'engineer' && latestApproval && (
              <div className="border border-emerald-500/40 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-display text-lg font-bold text-white">
                    Зөвшөөрөгдсөн
                  </h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Үнийн саналыг <strong className="text-white">{latestApproval.engineerName}</strong> инженер зөвшөөрсөн. Одоо цахим гарын үсгийг хүлээж байна.
                </p>
              </div>
            )}

            {/* ─── Signed: full seal + revision */}
            {status === 'signed' && latestApproval && (
              <div className="space-y-4">
                <ApprovalSeal record={latestApproval} size="lg" />
                <div className="border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Энэ төсөл албан ёсоор баталгаажсан тул засварлах боломжгүй. Өөрчлөлт оруулахын тулд шинэ хувилбар үүсгэнэ үү.
                    </div>
                  </div>
                  {(currentUser.role === 'admin' || currentUser.role === 'sales') && (
                    <button
                      onClick={onCreateRevision}
                      className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                    >
                      <FilePlus2 className="w-4 h-4" /> Шинэ хувилбар үүсгэх
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column: history */}
          <div>
            <ApprovalHistoryPanel records={projectApprovals} users={users} />
          </div>
        </div>
      </div>

      {showPin && currentUser.licenseNumber && (
        <PinModal
          engineerName={currentUser.name}
          licenseNumber={currentUser.licenseNumber}
          onCancel={() => setShowPin(false)}
          onSubmit={onSignConfirmed}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

interface StatusHeaderProps {
  status: 'draft' | 'in_review' | 'approved' | 'signed' | 'archived';
  project: { code: string; name: string; subtitle: string };
}

function StatusHeader({ status, project }: StatusHeaderProps) {
  const labels: Record<StatusHeaderProps['status'], { label: string; color: string; icon: typeof FileCheck }> = {
    draft: { label: 'Ноорог', color: '#64748b', icon: FileCheck },
    in_review: { label: 'Хянагдаж буй', color: '#f59e0b', icon: Clock },
    approved: { label: 'Зөвшөөрөгдсөн', color: '#84cc16', icon: CheckCircle2 },
    signed: { label: 'Гарын үсэг бүхий', color: '#4d7fff', icon: ShieldCheck },
    archived: { label: 'Архивласан', color: '#475569', icon: FileCheck },
  };
  const info = labels[status];
  const Icon = info.icon;

  return (
    <div className="flex items-end justify-between flex-wrap gap-4 pb-5 border-b border-slate-800/60">
      <div>
        <div
          className="flex items-center gap-2 mb-2 px-3 py-1.5 inline-flex border text-xs font-semibold uppercase tracking-wider"
          style={{
            color: info.color,
            background: info.color + '14',
            borderColor: info.color + '55',
          }}
        >
          <Icon className="w-3.5 h-3.5" /> {info.label}
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
          {project.name}{' '}
          <span className="text-slate-500 font-normal text-2xl">/{project.subtitle}/</span>
        </h1>
        <div className="text-slate-400 text-sm mt-1 font-mono-tab">{project.code}</div>
      </div>
    </div>
  );
}

interface MiniTotalProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function MiniTotal({ label, value, highlight }: MiniTotalProps) {
  return (
    <div className="p-3 bg-slate-900/60 border border-slate-800">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div
        className={`font-mono-tab font-bold ${
          highlight ? 'text-blue-400 text-lg' : 'text-white text-sm'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

interface ApprovalHistoryPanelProps {
  records: ApprovalRecord[];
  users: User[];
}

function ApprovalHistoryPanel({ records, users }: ApprovalHistoryPanelProps) {
  if (records.length === 0) {
    return (
      <div className="border border-slate-800 bg-slate-950/60 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold mb-3">
          Батлах түүх
        </div>
        <div className="text-xs text-slate-500">Одоогоор бүртгэл байхгүй</div>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 bg-slate-950/60 sticky top-4">
      <div className="px-4 py-3 border-b border-slate-800 text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
        Батлах түүх
      </div>
      <div className="divide-y divide-slate-900">
        {records.map((r) => {
          const submitter = users.find((u) => u.id === r.submittedBy);
          const statusLabel: Record<string, { label: string; color: string }> = {
            pending:  { label: 'Хүлээгдэж буй',   color: 'text-amber-400' },
            approved: { label: 'Зөвшөөрөгдсөн',    color: 'text-emerald-400' },
            rejected: { label: 'Буцаагдсан',       color: 'text-red-400' },
            signed:   { label: 'Гарын үсэг бүхий', color: 'text-blue-400' },
          };
          const s = statusLabel[r.status] ?? { label: r.status, color: 'text-slate-400' };
          return (
            <div key={r.id} className="px-4 py-3 text-xs">
              <div className={`font-semibold ${s.color} mb-1`}>{s.label}</div>
              <div className="text-slate-300">{r.engineerName}</div>
              <div className="text-[10px] text-slate-500 font-mono-tab mt-0.5">
                {r.licenseNumber}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Илгээсэн: {formatDateTimeMN(r.submittedAt)}
                {submitter ? ` · ${submitter.name}` : ''}
              </div>
              {r.rejectionReason && (
                <div className="text-[10px] text-red-300 mt-1">{r.rejectionReason}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
