import { Check, ShieldCheck } from 'lucide-react';
import { formatDateTimeMN } from '@/lib/date';
import type { ApprovalRecord } from '@/types';

export interface ApprovalSealProps {
  record: ApprovalRecord;
  // Visual sizes — 'lg' is quote-page size, 'sm' is project-card corner.
  size?: 'sm' | 'md' | 'lg';
  // On cream-paper quote, invert text colors.
  onCreamPaper?: boolean;
}

export function ApprovalSeal({ record, size = 'md', onCreamPaper = false }: ApprovalSealProps) {
  const isSigned = record.status === 'signed';
  const when = record.signedAt ?? record.decidedAt ?? record.submittedAt;

  const padding = size === 'lg' ? 'p-6' : size === 'md' ? 'p-4' : 'p-2.5';
  const iconSize = size === 'lg' ? 'w-12 h-12' : size === 'md' ? 'w-8 h-8' : 'w-5 h-5';
  const headingSize =
    size === 'lg' ? 'text-xl' : size === 'md' ? 'text-sm' : 'text-[10px]';

  const border = onCreamPaper ? 'border-emerald-700' : 'border-emerald-500/60';
  const bg = onCreamPaper ? 'bg-emerald-50' : 'bg-emerald-500/10';
  const textPrimary = onCreamPaper ? 'text-emerald-900' : 'text-emerald-300';
  const textSecondary = onCreamPaper ? 'text-slate-700' : 'text-slate-300';
  const textMeta = onCreamPaper ? 'text-slate-500' : 'text-slate-500';

  return (
    <div
      className={`relative border-2 ${border} ${bg} ${padding} inline-block`}
      role="img"
      aria-label={`Баталгаажсан: ${record.engineerName}, ${record.licenseNumber}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`${iconSize} flex items-center justify-center border-2 ${onCreamPaper ? 'border-emerald-700 bg-emerald-100' : 'border-emerald-500 bg-emerald-500/20'} flex-shrink-0`}
        >
          {isSigned ? (
            <ShieldCheck className={`${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} ${textPrimary}`} />
          ) : (
            <Check className={`${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} ${textPrimary}`} />
          )}
        </div>
        <div className="min-w-0">
          <div
            className={`font-display font-extrabold uppercase tracking-[0.15em] ${textPrimary} ${headingSize}`}
          >
            {isSigned ? 'Баталгаажсан' : 'Зөвшөөрөгдсөн'}
          </div>
          <div className={`text-sm font-semibold mt-1 ${textSecondary}`}>
            {record.engineerName}
          </div>
          <div className={`font-mono-tab text-[11px] ${textMeta} mt-0.5`}>
            Лиценз: {record.licenseNumber}
            {record.licenseExpires ? ` · ${record.licenseExpires} хүртэл` : ''}
          </div>
          <div className={`font-mono-tab text-[10px] ${textMeta} mt-1.5`}>
            {formatDateTimeMN(when)}
          </div>
          <div className={`font-mono-tab text-[9px] ${textMeta} mt-0.5 opacity-70`}>
            ID: {record.id}
          </div>
        </div>
      </div>
    </div>
  );
}
