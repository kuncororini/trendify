"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

const FALLBACK_GRADIENTS = [
  "from-[#1a0533] via-[#6d28d9] to-[#f59e0b]",
  "from-[#0f0c29] via-[#302b63] to-[#24243e]",
  "from-[#134e4a] via-[#065f46] to-[#d97706]",
  "from-[#ec4899] via-[#8b5cf6] to-[#06b6d4]",
  "from-[#f7971e] to-[#ffd200]",
  "from-[#ee9ca7] to-[#ffdde1]",
];

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      // Ambil wishlist dari localStorage
      const saved: string[] = JSON.parse(
        localStorage.getItem("trendify_wishlist") ?? "[]"
      );

      if (saved.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch data produk dari Supabase
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select(`id, title, category, price, thumbnail_url, profiles ( username )`)
        .in("id", saved)
        .eq("status", "published");

      setProducts(data ?? []);
      setLoading(false);
    }

    loadWishlist();
  }, []);

  function removeFromWishlist(productId: string) {
    const saved: string[] = JSON.parse(
      localStorage.getItem("trendify_wishlist") ?? "[]"
    );
    const updated = saved.filter((id) => id !== productId);
    localStorage.setItem("trendify_wishlist", JSON.stringify(updated));
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  return (
    <div className="container-main py-10">

      <div className="mb-8">
        <h1 className="font-bold text-2xl tracking-tight mb-1">Wishlist</h1>
        <p className="text-white/30 text-sm">
          {loading ? "..." : `${products.length} karya tersimpan`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-dark-border border-t-white rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center mx-auto mb-6">
            <Heart size={24} className="text-white/20" />
          </div>
          <h2 className="font-bold text-xl mb-2">Wishlist kosong</h2>
          <p className="text-white/30 text-sm mb-6">
            Belum ada karya yang kamu simpan ke wishlist.
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Browse Artworks <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <div key={p.id} className="card group relative">
              {/* Tombol hapus dari wishlist */}
              <button
                onClick={() => removeFromWishlist(p.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-brand-coral hover:bg-black/70 transition-colors backdrop-blur-sm"
                aria-label="Hapus dari wishlist"
              >
                <Heart size={14} fill="currentColor" />
              </button>

              <Link href={`/products/${p.id}`}>
                <div className="aspect-square relative overflow-hidden">
                  {p.thumbnail_url ? (
                    <Image
                      src={p.thumbnail_url}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}`} />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    @{p.profiles?.username ?? "unknown"}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-brand-yellow text-sm">
                      {formatRupiah(p.price)}
                    </span>
                    <span className="text-xs text-white/20 capitalize">{p.category}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}