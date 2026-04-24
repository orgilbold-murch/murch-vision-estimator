// ═══════════════════════════════════════════════════════════════════════════
// PinModal — 4-box PIN entry (phone-verification style)
//
// Used only for the engineer signing ceremony in Phase 5. Any 4 digits are
// accepted in v1 — this is ceremony, not security.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export interface PinModalProps {
  engineerName: string;
  licenseNumber: string;
  onCancel: () => void;
  onSubmit: (pin: string) => void;
}

export function PinModal({ engineerName, licenseNumber, onCancel, onSubmit }: PinModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    // Focus the first box on mount.
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [onCancel]);

  const setDigit = (idx: number, value: string) => {
    // Strip to last digit character only.
    const d = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = d;
      return next;
    });
    if (d && idx < 3) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        inputs.current[idx - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[idx - 1] = '';
          return next;
        });
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < 3) {
      inputs.current[idx + 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'Enter' && digits.every((d) => d !== '')) {
      submit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    const next = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]!;
    setDigits(next);
    inputs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const complete = digits.every((d) => d !== '');

  const submit = () => {
    if (!complete) return;
    onSubmit(digits.join(''));
  };

  return (
    <div className="fixed inset-0 z-50 fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onCancel} />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full border-2 border-blue-500/60 bg-slate-950 shadow-2xl slide-up">
          <div className="px-5 py-4 border-b border-blue-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <div className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Гарын үсэг баталгаажуулах
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
          <div className="p-6">
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              PIN код оруулж үнийн саналыг <span className="font-semibold text-white">цахим гарын үсгээр</span> баталгаажуулна уу.
            </p>

            <div className="flex justify-center gap-3 mb-4">
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="w-14 h-16 bg-slate-900 border-2 border-slate-700 text-center text-2xl font-bold font-mono-tab text-white focus:border-blue-500 focus:outline-none focus:bg-slate-900/60 transition-colors"
                  aria-label={`PIN код ${idx + 1}-р орон`}
                />
              ))}
            </div>

            <div className="text-center mt-5 pt-4 border-t border-slate-800">
              <div className="text-sm font-semibold text-white">{engineerName}</div>
              <div className="font-mono-tab text-[11px] text-slate-500 mt-0.5">
                Лиценз {licenseNumber}
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Цуцлах
            </button>
            <button
              onClick={submit}
              disabled={!complete}
              className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors ${
                complete
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Гарын үсэг зурах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
