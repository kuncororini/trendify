"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah, formatCount } from "@/lib/utils";
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

export default function ArtistProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const [artist, setArtist]     = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Ambil profile artist
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .single();

      if (error || !profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setArtist(profile);

      // Ambil karya artist
      const { data: artworks } = await supabase
        .from("products")
        .select("id, title, price, thumbnail_url, likes_count, sales_count, category")
        .eq("artist_id", profile.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (artworks) setProducts(artworks);
      setLoading(false);
    }

    fetchData();
  }, [params.username]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-dark-border border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-bold text-2xl mb-3">Artist tidak ditemukan</h1>
          <p className="text-white/30 text-sm mb-6">Profile ini tidak ada atau sudah dihapus.</p>
          <Link href="/products" className="btn-primary">Browse Artworks</Link>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* HEADER */}
      <div className="border-b border-dark-border">
        <div className="container-main py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-yellow flex-shrink-0 flex items-center justify-center font-bold text-3xl text-dark-bg">
              {artist.username?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-bold text-2xl">
                  {artist.full_name ?? artist.username}
                </h1>
                {artist.is_verified && (
                  <span className="text-xs text-brand-blue border border-brand-blue/30 px-2.5 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-white/30 mb-3">
                @{artist.username}
              </p>
              {artist.bio && (
                <p className="text-sm text-white/40 max-w-lg leading-relaxed">
                  {artist.bio}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button className="btn-primary px-6 py-2.5 text-sm">Follow</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10 pt-8 border-t border-dark-border">
            {[
              { val: products.length,                                    label: "Total Karya"     },
              { val: formatCount(products.reduce((s, p) => s + (p.sales_count ?? 0), 0)), label: "Total Penjualan" },
              { val: formatCount(products.reduce((s, p) => s + (p.likes_count ?? 0), 0)), label: "Total Likes"     },
            ].map((s) => (
              <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-5">
                <p className="font-bold text-2xl">{s.val}</p>
                <p className="text-xs text-white/25 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ARTWORKS */}
      <section className="container-main py-12">
        <h2 className="font-bold text-xl mb-8">
          Semua Karya{" "}
          <span className="text-white/25 font-normal text-base">
            ({products.length})
          </span>
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/20 text-sm">Belum ada karya yang dipublish.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p, i) => (
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
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-white/25 mt-0.5">@{artist.username}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-brand-yellow text-sm">
                      {formatRupiah(p.price)}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-white/20">
                      <span>{formatCount(p.sales_count ?? 0)} sales</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}