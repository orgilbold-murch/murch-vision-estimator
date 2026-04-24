// ═══════════════════════════════════════════════════════════════════════════
// NEW PROJECT ROUTE — combined upload + processing screens
//
// This single route component represents two visual states:
//   1. 'upload'     — file intake UI
//   2. 'processing' — animated AI pipeline
// After the pipeline finishes, onComplete() is invoked with the uploaded
// files so the caller can navigate the user to the Dashboard.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  X,
  ArrowRight,
  Sparkles,
  ScanLine,
  Calculator,
  Ruler,
  Boxes,
  Loader2,
  Check,
  Eye,
  CircleDot,
  Database,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Logo } from '@/components/primitives/Logo';
import { FeatureCard } from '@/components/primitives/FeatureCard';
import { StatCell } from '@/components/primitives/StatCell';
import { useStore } from '@/store';
import type { ProjectFile } from '@/types';

// ─── Pipeline stage definitions (scripted AI animation) ──────────────────

interface PipelineStageDef {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  duration: number;
  stats: { label: string; value: string; unit: string }[];
}

const PIPELINE_STAGES: readonly PipelineStageDef[] = [
  {
    id: 'ocr',
    icon: ScanLine,
    title: 'OCR + Page Extraction',
    subtitle: 'PDF хуудас тус бүрийг visual parser-ээр боловсруулж, техникийн тэмдэглэгээг ялгаж байна',
    duration: 1400,
    stats: [
      { label: 'Боловсруулсан', value: '44/44', unit: 'хуудас' },
      { label: 'DPI', value: '300', unit: 'px/in' },
      { label: 'Тэмдэглэгээ', value: '128', unit: 'OCR-match' },
    ],
  },
  {
    id: 'legend',
    icon: Eye,
    title: 'Legend + Symbol Recognition',
    subtitle: 'Зургийн тэмдэглэгээний жагсаалт, мэдрэгч, камер, гэрэлтүүлгийн симбол бүрийг визуал таньж байна',
    duration: 1200,
    stats: [
      { label: 'CCTV symbols', value: '10', unit: 'таньсан' },
      { label: 'Fire sensors', value: '65', unit: 'таньсан' },
      { label: 'Switches/sockets', value: '1,770+', unit: 'таньсан' },
    ],
  },
  {
    id: 'takeoff',
    icon: Calculator,
    title: 'Material Takeoff',
    subtitle: 'Давхрын план бүрээс материал, тоо ширхэгийг тоолж, спецификацийн хүснэгттэй тулгаж байна',
    duration: 1500,
    stats: [
      { label: 'Материал мөр', value: '120', unit: 'нэр' },
      { label: 'Гэрэлтүүлэгч', value: '730', unit: 'иж бүрдэл' },
      { label: 'Самбар', value: '108', unit: 'иж' },
    ],
  },
  {
    id: 'cable',
    icon: Ruler,
    title: 'Cable Route Measurement',
    subtitle: 'Scale-ийг таньж, кабелийн маршрутын уртыг 2D дээр тооцоолж, +15% waste нэмж байна',
    duration: 1300,
    stats: [
      { label: 'ПВ утас', value: '31.5К', unit: 'м' },
      { label: 'ВВГ кабель', value: '958', unit: 'м' },
      { label: 'Low-voltage', value: '5.9К', unit: 'м' },
    ],
  },
  {
    id: 'aux',
    icon: Boxes,
    title: 'Auxiliary Materials · БНбД',
    subtitle: 'Кабелийн клипс, ратан, WAGO холбогч, хаван цэрц — БНбД 3.02-2016 нормативд тулгуурлан автомат тооцоолж байна',
    duration: 1400,
    stats: [
      { label: 'Кабелийн клипс', value: '~82К', unit: 'ш' },
      { label: 'Холбогч клемм', value: '~3.2К', unit: 'ш' },
      { label: 'Хоолойн fittings', value: '~4.1К', unit: 'ш' },
    ],
  },
  {
    id: 'pricing',
    icon: Database,
    title: 'Market Price Lookup',
    subtitle: 'Улаанбаатарын 2026 Q1 зах зээлийн мэдээлэлд суурилсан нэгж үнээр үнэлгээ хийж дуусгаж байна',
    duration: 1200,
    stats: [
      { label: 'Үнэ шинэчлэгдсэн', value: '2026 Q1', unit: '' },
      { label: 'Брэндийн түвшин', value: 'Standard', unit: '' },
      { label: 'Нийт дүн', value: '~497М', unit: '₮' },
    ],
  },
] as const;

// ─── Top-level route component ──────────────────────────────────────────

export function NewProjectRoute() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'upload' | 'processing'>('upload');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const projects = useStore((s) => s.projects);

  const startAnalysis = (nextFiles: ProjectFile[]) => {
    setFiles(nextFiles);
    setScreen('processing');
  };

  // onDemo hook is preserved from the v3 artifact for behavioural parity;
  // the upstream never wired a visible button to it.
  const startDemo = () => {
    setFiles([
      { name: 'Бросс-С_блок-ХД_2026_04_07.pdf',    size: '4.2 MB',  pages: 14, type: 'Холбоо-дохиолол' },
      { name: 'Бросс-С_блок-ХТ_ДГ_2026_04_07.pdf', size: '12.8 MB', pages: 30, type: 'Цахилгаан + Дотор гэрэлтүүлэг' },
    ]);
    setScreen('processing');
  };

  const onComplete = () => {
    // Phase 3: route to the seeded demo project. Phase 8 will spawn a new
    // project record from the uploaded files instead.
    const targetProject = projects[0];
    if (targetProject) navigate(`/projects/${targetProject.id}/overview`);
    else navigate('/projects');
  };

  if (screen === 'upload') {
    return <UploadScreen onStart={startAnalysis} onDemo={startDemo} />;
  }
  return <ProcessingScreen files={files} onComplete={onComplete} />;
}

// ─── UploadScreen ───────────────────────────────────────────────────────

interface UploadScreenProps {
  onStart: (files: ProjectFile[]) => void;
  onDemo: () => void;
}

function UploadScreen({ onStart }: UploadScreenProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: ProjectFile[] = Array.from(fileList).map((f) => {
      const lowerName = f.name.toLowerCase();
      return {
        name: f.name,
        size: f.size < 1_048_576
          ? (f.size / 1024).toFixed(0) + ' KB'
          : (f.size / 1_048_576).toFixed(1) + ' MB',
        pages: Math.max(1, Math.floor(f.size / 300_000)),
        type: lowerName.includes('хд')
          ? 'Холбоо-дохиолол'
          : lowerName.includes('хт')
            ? 'Цахилгаан'
            : 'Тодорхойгүй',
      };
    });
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-12 md:mb-20">
          <Logo height={28} />
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-slate-500">
            <span className="hidden md:inline">Платформ</span>
            <span className="hidden md:inline">Гарын авлага</span>
            <div className="px-3 py-1.5 border border-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full pulse-soft"></span>
              Beta · v1.0
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-10 md:mb-14 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-block mb-5 px-3 py-1.5 border border-blue-500/30 bg-blue-500/5">
            <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> AI-powered estimation · БНбД нийцэлтэй
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-[1.05] mb-4">
            Ажлын зургаас<br />
            <span style={{ color: '#4d7fff' }}>BOQ</span> секундын дотор
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            PDF ажлын зургаа оруулахад л AI нь тэмдэглэгээ, зуурмаг, кабелийн урт, туслах материал бүрийг автоматаар таних ба Улаанбаатарын зах зээлийн үнэлгээгээр тооцно.
          </p>
        </div>

        {/* Upload zone */}
        <div className="max-w-3xl mx-auto slide-up" style={{ animationDelay: '0.2s' }}>
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={onDrop}
            className={`relative border-2 border-dashed p-10 md:p-14 text-center transition-all blueprint-corner ${
              dragActive
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.dwg,.dxf"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div
                className="relative w-16 h-16 mb-4 flex items-center justify-center"
                style={{
                  background: 'rgba(0, 65, 255, 0.1)',
                  border: '1px solid rgba(0, 65, 255, 0.3)',
                }}
              >
                <Upload className="w-7 h-7 text-blue-400" />
                {dragActive && (
                  <div className="absolute inset-0 border-2 border-blue-500 ping-ring"></div>
                )}
              </div>
              <div className="font-display text-xl font-semibold text-white mb-1.5">
                Ажлын зургаа энд чирж оруулах
              </div>
              <div className="text-slate-500 text-sm mb-5">
                эсвэл товчоор сонгон байршуулах · PDF, DWG, DXF · max 50 MB
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-6 py-2.5 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Файл сонгох
              </button>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 border border-slate-800 bg-slate-950/40 fade-in">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Байршуулсан файлууд · {files.length}
                </div>
                <button
                  onClick={() => setFiles([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider"
                >
                  Бүгдийг устгах
                </button>
              </div>
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0"
                >
                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{f.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono-tab">
                      {f.size} · ~{f.pages} хуудас · {f.type}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Primary CTA */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {files.length > 0 && (
              <button
                onClick={() => onStart(files)}
                className="group relative px-10 py-4 font-display font-semibold text-base text-white transition-all overflow-hidden"
                style={{ background: '#0041ff' }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  AI-р анализ хийж эхлэх{' '}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 shimmer"></span>
              </button>
            )}
          </div>
        </div>

        {/* Feature strip */}
        <div
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <FeatureCard
            icon={<ScanLine className="w-5 h-5" />}
            title="Тэмдэглэгээ таних"
            desc="Legend, condlegend, symbol бүгдийг AI visual parser-ээр ялгах"
          />
          <FeatureCard
            icon={<Calculator className="w-5 h-5" />}
            title="Автомат тоолоо"
            desc="Камер, мэдрэгч, унтраалга, розетк бүрийг давхрын план дээр тоолох"
          />
          <FeatureCard
            icon={<Ruler className="w-5 h-5" />}
            title="Кабелийн уртын тооцоо"
            desc="Zuurmag-ийн маршрут хэмжиж scale-тайгаар метр гаргах"
          />
          <FeatureCard
            icon={<Boxes className="w-5 h-5" />}
            title="Туслах материал"
            desc="Клипс, анкер, холбогч, терминал – БНбД-ийн нормоор автомат"
          />
        </div>

        {/* Stats strip */}
        <div
          className="mt-10 pt-10 border-t border-slate-800/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-center slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <StatCell value="60+" label="сек. доторх боловсруулалт" />
          <StatCell value="15%" label="зах зээлийн үнийн нарийвчлал" />
          <StatCell value="БНбД" label="нормативд нийцсэн" />
          <StatCell value="Монгол" label="хэл, зах зээлд зориулсан" />
        </div>

        <footer className="mt-16 text-center text-[11px] text-slate-600">
          © Murch Vision AI · Ажлын зураг уншигч · Монголын эхний AI Estimator
        </footer>
      </div>
    </div>
  );
}

// ─── ProcessingScreen ───────────────────────────────────────────────────

interface ProcessingScreenProps {
  files: ProjectFile[];
  onComplete: () => void;
}

function ProcessingScreen({ files, onComplete }: ProcessingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    if (currentStage >= PIPELINE_STAGES.length) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const stage = PIPELINE_STAGES[currentStage];
    if (!stage) return;
    const step = 50;
    const increment = 100 / (stage.duration / step);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCompletedStages((cs) => [...cs, currentStage]);
          setCurrentStage((c) => c + 1);
          return 0;
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(interval);
  }, [currentStage, onComplete]);

  const overallProgress =
    (completedStages.length / PIPELINE_STAGES.length) * 100 +
    progress / PIPELINE_STAGES.length;

  return (
    <div className="grid-bg min-h-screen fade-in">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Logo height={24} />
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-blue-500/40 bg-blue-500/5">
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
              <span className="text-blue-400 uppercase tracking-[0.2em] font-semibold">
                Analysing
              </span>
            </div>
            <div className="font-mono-tab text-slate-500">
              {overallProgress.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-2">
            {files.length} файл · боловсруулж байна
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
            AI Vision parser ажиллаж байна
          </h1>
          <p className="text-slate-400 text-sm">
            {files.map((f) => f.name).join(' · ')}
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-slate-800 overflow-hidden relative">
            <div
              className="h-full transition-all duration-100"
              style={{
                width: overallProgress + '%',
                background: 'linear-gradient(90deg, #0041ff, #4d7fff)',
              }}
            />
            <div className="absolute inset-0 shimmer pointer-events-none"></div>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mt-2 font-mono-tab">
            <span>0%</span>
            <span>
              {completedStages.length} / {PIPELINE_STAGES.length} stage дууссан
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="space-y-2 mb-8">
          {PIPELINE_STAGES.map((stage, i) => (
            <PipelineStage
              key={stage.id}
              stage={stage}
              state={
                completedStages.includes(i)
                  ? 'done'
                  : currentStage === i
                    ? 'active'
                    : 'pending'
              }
              progress={currentStage === i ? progress : completedStages.includes(i) ? 100 : 0}
              index={i}
            />
          ))}
        </div>

        {/* Live discovery panel */}
        <div className="border border-slate-800 bg-slate-950/60 p-4 relative overflow-hidden blueprint-corner">
          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-3 flex items-center gap-2">
            <CircleDot className="w-3 h-3 pulse-soft" /> Live discoveries · бодит цагийн таньсан хэсгүүд
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <DiscoveryCell active={currentStage >= 0} label="ХД-03"     value="Холбоо-дохиолол" />
            <DiscoveryCell active={currentStage >= 1} label="ХТ-4"      value="Зурган тайлбар" />
            <DiscoveryCell active={currentStage >= 1} label="ХТ-5"      value="Нэгж шугам" />
            <DiscoveryCell active={currentStage >= 2} label="ХТ-6"      value="Материалын жагсаалт" />
            <DiscoveryCell active={currentStage >= 2} label="FACP"      value="17+ бүсийн станц" />
            <DiscoveryCell active={currentStage >= 2} label="Wall pads" value="25 айл × 1" />
            <DiscoveryCell active={currentStage >= 3} label="Riser"     value="16 давхар босоо" />
            <DiscoveryCell active={currentStage >= 4} label="БНбД"      value="3.02-2016 зэрэгтэй" />
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-8 text-center text-xs text-slate-500 font-mono-tab">
          Murch Vision Engine v0.9 · Бодит систем нь DWG/DXF анализ хийх чадвартай бөгөөд одоогоор демо горимд ажиллаж байна
        </div>
      </div>
    </div>
  );
}

// ─── PipelineStage helper ───────────────────────────────────────────────

interface PipelineStageProps {
  stage: PipelineStageDef;
  state: 'done' | 'active' | 'pending';
  progress: number;
  index: number;
}

function PipelineStage({ stage, state, progress, index }: PipelineStageProps) {
  const Icon = stage.icon;
  const isActive = state === 'active';
  const isDone = state === 'done';

  return (
    <div
      className={`relative border transition-all slide-up ${
        isActive
          ? 'border-blue-500/60 bg-blue-500/5'
          : isDone
            ? 'border-slate-800 bg-slate-950/40'
            : 'border-slate-800/50 bg-slate-950/20'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {isActive && <div className="absolute inset-0 scanline pointer-events-none"></div>}

      <div className="relative p-4 flex items-center gap-4">
        {/* Status icon */}
        <div
          className={`w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all ${
            isActive ? 'glow' : ''
          }`}
          style={{
            background: isDone
              ? 'rgba(132, 204, 22, 0.1)'
              : isActive
                ? 'rgba(0, 65, 255, 0.15)'
                : 'rgba(30, 41, 59, 0.4)',
            border: `1px solid ${isDone ? '#84cc16' : isActive ? '#0041ff' : '#1e293b'}`,
          }}
        >
          {isDone ? (
            <Check className="w-5 h-5 text-lime-400" />
          ) : isActive ? (
            <Icon className="w-5 h-5 text-blue-400" />
          ) : (
            <Icon className="w-5 h-5 text-slate-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`font-display font-semibold text-sm ${
                isActive || isDone ? 'text-white' : 'text-slate-600'
              }`}
            >
              {stage.title}
            </div>
            {isActive && (
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-blue-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Боловсруулж байна
              </div>
            )}
          </div>
          <div
            className={`text-[11px] mt-0.5 ${
              isActive ? 'text-slate-300' : isDone ? 'text-slate-500' : 'text-slate-700'
            }`}
          >
            {stage.subtitle}
          </div>

          {/* Per-stage stats when active or done */}
          {(isActive || isDone) && (
            <div className="mt-2 flex flex-wrap gap-3">
              {stage.stats.map((s, i) => (
                <div
                  key={i}
                  className="flex items-baseline gap-1.5 text-xs count-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-slate-500">{s.label}:</span>
                  <span
                    className={`font-mono-tab font-semibold ${
                      isDone ? 'text-lime-400' : 'text-blue-400'
                    }`}
                  >
                    {s.value}
                  </span>
                  {s.unit && <span className="text-[10px] text-slate-500">{s.unit}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stage index */}
        <div
          className={`font-mono-tab text-[10px] uppercase tracking-wider ${
            isActive ? 'text-blue-400' : isDone ? 'text-lime-400' : 'text-slate-700'
          }`}
        >
          {String(index + 1).padStart(2, '0')} / {String(PIPELINE_STAGES.length).padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      {(isActive || isDone) && (
        <div className="h-0.5 bg-slate-800/50">
          <div
            className="h-full transition-all"
            style={{
              width: progress + '%',
              background: isDone ? '#84cc16' : 'linear-gradient(90deg, #0041ff, #4d7fff)',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── DiscoveryCell helper ───────────────────────────────────────────────

interface DiscoveryCellProps {
  active: boolean;
  label: string;
  value: string;
}

function DiscoveryCell({ active, label, value }: DiscoveryCellProps) {
  return (
    <div
      className={`p-2 border transition-all ${
        active ? 'border-blue-500/40 bg-blue-500/5' : 'border-slate-800/50 opacity-40'
      }`}
    >
      <div
        className={`text-[9px] uppercase tracking-wider font-semibold ${
          active ? 'text-blue-400' : 'text-slate-600'
        }`}
      >
        {label}
      </div>
      <div className={`text-[11px] mt-0.5 ${active ? 'text-white' : 'text-slate-600'}`}>
        {value}
      </div>
    </div>
  );
}
