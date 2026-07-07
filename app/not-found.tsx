import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* 404 display */}
        <div className="relative mb-8 select-none">
          <p className="font-bold text-[120px] leading-none text-dark-card tracking-tighter">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center font-bold text-[120px] leading-none tracking-tighter text-transparent"
            style={{
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            }}
          >
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
              <Search size={32} className="text-white/20" />
            </div>
          </div>
        </div>

        <h1 className="font-bold text-2xl mb-3">Halaman tidak ditemukan</h1>
        <p className="text-white/30 text-sm leading-relaxed mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
          Coba cek URL atau kembali ke halaman utama.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={15} /> Ke Homepage
          </Link>
          <Link href="/products" className="btn-ghost flex items-center gap-2">
            Browse Artworks
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-dark-border">
          <p className="text-xs text-white/20 mb-4">Atau coba halaman ini</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Illustration", href: "/products?category=illustration" },
              { label: "3D Art",       href: "/products?category=3d"           },
              { label: "Pixel Art",    href: "/products?category=pixel"        },
              { label: "Top Artists",  href: "/artists"                        },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs border border-dark-border text-white/30 px-3 py-1.5 rounded-full hover:border-white/20 hover:text-white/60 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}