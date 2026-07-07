"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { formatRupiah, formatCount } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

const MARQUEE_ITEMS = [
  "Illustration", "3D Art", "Pixel Art", "Wallpapers",
  "Motion Graphics", "Character Design", "Abstract", "Sketch",
];

const CATEGORY_COLORS: Record<string, string> = {
  "3d":         "bg-purple-500/15 text-purple-300",
  illustration: "bg-yellow-500/15 text-yellow-300",
  wallpaper:    "bg-green-500/15  text-green-300",
  pixel:        "bg-red-500/15    text-red-300",
  abstract:     "bg-blue-500/15   text-blue-300",
  motion:       "bg-pink-500/15   text-pink-300",
};

const FALLBACK_GRADIENTS = [
  "from-[#1a0533] via-[#6d28d9] to-[#f59e0b]",
  "from-[#f7971e] to-[#ffd200]",
  "from-[#0f0c29] via-[#302b63] to-[#24243e]",
  "from-[#ee9ca7] to-[#ffdde1]",
];

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnail_url: string | null;
  likes_count: number;
  profiles: { username: string } | null;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select(`id, title, category, price, thumbnail_url, likes_count, profiles ( username )`)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(4);

      if (data) setProducts(data as any);
    }
    fetchProducts();
  }, []);

  return (
    <div>

      {/* HERO */}
      <section className="container-main pt-20 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-bold text-5xl md:text-6xl leading-[1.08] tracking-tight mb-5">
            Buy & Sell<br />
            <span className="text-brand-yellow">Digital Art</span><br />
            You Love
          </h1>

          <p className="text-white/40 text-base leading-relaxed max-w-md mb-8">
            Temukan ribuan karya digital unik dari seniman independen. Upload karyamu dan mulai hasilkan pendapatan.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary flex items-center gap-2">
              Browse Artworks <ArrowRight size={15} />
            </Link>
            <Link href="/upload" className="btn-ghost flex items-center gap-2">
              <Upload size={15} /> Start Selling
            </Link>
          </div>

          <div className="flex gap-10 mt-12 pt-10 border-t border-dark-border">
            {[
              { num: "12K+", label: "Artworks" },
              { num: "3.4K", label: "Artists"  },
              { num: "28K",  label: "Buyers"   },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-bold text-2xl">{s.num}</p>
                <p className="text-xs text-white/30 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero art preview */}
        <div className="grid grid-cols-2 gap-3">
          {products.length > 0 ? (
            <>
              {/* Card besar */}
              <Link
                href={`/products/${products[0].id}`}
                className="rounded-2xl row-span-2 min-h-[280px] relative overflow-hidden flex flex-col justify-end p-4 bg-dark-card hover:opacity-90 transition-opacity"
              >
                {products[0].thumbnail_url ? (
                  <Image src={products[0].thumbnail_url} alt={products[0].title} fill className="object-cover" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[0]}`} />
                )}
                <div className="relative z-10">
                  <p className="font-semibold text-sm text-white">{products[0].title}</p>
                  <p className="text-xs text-white/50 mt-0.5">@{products[0].profiles?.username}</p>
                </div>
                <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                  {formatRupiah(products[0].price)}
                </span>
              </Link>

              {/* 2 card kecil */}
              {products.slice(1, 3).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="rounded-2xl aspect-square relative overflow-hidden bg-dark-card hover:opacity-90 transition-opacity"
                >
                  {p.thumbnail_url ? (
                    <Image src={p.thumbnail_url} alt={p.title} fill className="object-cover" />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[i + 1]}`} />
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {formatRupiah(p.price)}
                  </span>
                </Link>
              ))}
            </>
          ) : (
            // Fallback kalau belum ada produk
            <>
              <div className="bg-gradient-to-br from-[#1a0533] via-[#6d28d9] to-[#f59e0b] rounded-2xl row-span-2 min-h-[280px]" />
              <div className="bg-gradient-to-br from-[#f7971e] to-[#ffd200] rounded-2xl aspect-square" />
              <div className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] rounded-2xl aspect-square" />
            </>
          )}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-dark-border py-3.5 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-sm text-white/25">
              <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* BROWSE */}
      <section className="container-main py-16">
        <p className="text-xs text-white/25 uppercase tracking-widest mb-2">Browse by type</p>
        <h2 className="font-bold text-3xl tracking-tight mb-8">Explore Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length > 0 ? (
            products.map((p, i) => (
              <Link key={p.id} href={`/products/${p.id}`} className="card group">
                <div className="aspect-square relative overflow-hidden">
                  {p.thumbnail_url ? (
                    <Image
                      src={p.thumbnail_url}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}`} />
                  )}
                </div>
                <div className="p-4">
                  <span className={`tag mb-2 ${CATEGORY_COLORS[p.category] ?? "bg-white/10 text-white/50"}`}>
                    {p.category}
                  </span>
                  <p className="font-semibold text-sm mt-1">{p.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">@{p.profiles?.username}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-brand-yellow text-sm">
                      {formatRupiah(p.price)}
                    </span>
                    <span className="text-xs text-white/20">
                      {formatCount(p.likes_count)} likes
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-10">
              <p className="text-white/20 text-sm">Belum ada karya.</p>
              <Link href="/upload" className="text-brand-yellow text-sm mt-2 hover:underline inline-block">
                Upload sekarang
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link href="/products" className="btn-ghost inline-flex items-center gap-2">
            Lihat Semua <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="container-main pb-20">
        <div className="bg-brand-yellow rounded-3xl px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-bold text-3xl md:text-4xl text-dark-bg leading-tight max-w-sm tracking-tight">
              Karyamu layak dihargai.
            </h2>
            <p className="text-dark-bg/50 mt-3 text-sm max-w-sm leading-relaxed">
              Upload karya digital kamu dan mulai jual ke ribuan pembeli yang menghargai seni.
            </p>
          </div>
          <Link
            href="/upload"
            className="bg-dark-bg text-brand-yellow font-semibold px-8 py-4 rounded-full text-sm flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <Upload size={16} /> Mulai Upload
          </Link>
        </div>
      </section>

    </div>
  );
}