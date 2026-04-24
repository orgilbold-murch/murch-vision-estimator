import { Link } from 'react-router-dom';
import { Logo } from '@/components/primitives/Logo';

export function NotFoundRoute() {
  return (
    <div className="grid-bg min-h-screen flex items-center justify-center fade-in">
      <div className="max-w-lg text-center px-6">
        <Logo height={28} />
        <div className="mt-8 inline-block mb-5 px-3 py-1.5 border border-blue-500/30 bg-blue-500/5">
          <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-semibold">
            404 · Олдсонгүй
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-[1.05] mb-4">
          Хуудас олдсонгүй
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Таны хайсан хаяг байхгүй байна. URL зөв эсэхийг шалгах, эсвэл эх хуудас руу буцна уу.
        </p>
        <Link
          to="/projects"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
        >
          Төслийн жагсаалт руу буцах
        </Link>
      </div>
    </div>
  );
}
