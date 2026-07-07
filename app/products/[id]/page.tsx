"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Share2, ShieldCheck, Download, RefreshCw } from "lucide-react";
import { formatRupiah, formatCount } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

const CATEGORY_COLORS: Record<string, string> = {
  "3d":         "bg-purple-500/15 text-purple-300",
  illustration: "bg-yellow-500/15 text-yellow-300",
  wallpaper:    "bg-green-500/15  text-green-300",
  pixel:        "bg-red-500/15    text-red-300",
  abstract:     "bg-blue-500/15   text-blue-400",
  motion:       "bg-pink-500/15   text-pink-300",
};

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { addItem } = useCart();
  const router      = useRouter();

  const [product, setProduct]         = useState<any>(null);
  const [reviews, setReviews]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted]   = useState(false);

  // Fetch produk + reviews dari Supabase
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select(`*, profiles ( id, username, full_name, is_verified )`)
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(data);

      // Fetch reviews
      const { data: reviewData } = await supabase
        .from("reviews")
        .select(`*, profiles ( username, full_name )`)
        .eq("product_id", params.id)
        .order("created_at", { ascending: false })
        .limit(6);

      setReviews(reviewData ?? []);
      setLoading(false);
    }

    fetchData();
  }, [params.id]);

  // Cek wishlist setelah produk loaded
  useEffect(() => {
    if (!product) return;
    const saved = JSON.parse(localStorage.getItem("trendify_wishlist") ?? "[]");
    setWishlisted(saved.includes(product.id));
  }, [product]);

  function handleWishlist() {
    const saved: string[] = JSON.parse(localStorage.getItem("trendify_wishlist") ?? "[]");
    let updated: string[];
    if (wishlisted) {
      updated = saved.filter((id) => id !== product.id);
    } else {
      updated = [...saved, product.id];
    }
    localStorage.setItem("trendify_wishlist", JSON.stringify(updated));
    setWishlisted(!wishlisted);
  }

  function handleAddToCart() {
    if (!product) return;
    addItem(product, "personal", product.price);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    if (!product) return;
    addItem(product, "personal", product.price);
    router.push("/checkout");
  }

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
          <h1 className="font-bold text-2xl mb-3">Karya tidak ditemukan</h1>
          <p className="text-white/30 text-sm mb-6">Karya ini mungkin sudah dihapus atau tidak tersedia.</p>
          <Link href="/products" className="btn-primary">Browse Artworks</Link>
        </div>
      </div>
    );
  }

  const p      = product;
  const artist = p.profiles;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="container-main pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-white/25">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition-colors">Explore</Link>
          <span>/</span>
          <Link href={`/products?category=${p.category}`} className="hover:text-white transition-colors capitalize">
            {p.category}
          </Link>
          <span>/</span>
          <span className="text-white/50">{p.title}</span>
        </nav>
      </div>

      {/* Main grid */}
      <div className="container-main py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

        {/* KIRI */}
        <div>
          <div className="rounded-2xl aspect-square w-full relative overflow-hidden bg-dark-card">
            {p.thumbnail_url ? (
              <Image
                src={p.thumbnail_url}
                alt={p.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a0533] via-[#6d28d9] to-[#f59e0b]" />
            )}
            <div className="absolute top-4 left-4">
              <span className={`tag ${CATEGORY_COLORS[p.category] ?? "bg-white/10 text-white/50"}`}>
                {p.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <button className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors backdrop-blur-sm">
                <Share2 size={14} />
              </button>
            </div>
            <span className="absolute bottom-4 right-4 text-[10px] tracking-[4px] text-white/10 font-bold uppercase select-none">
              TRENDIFY PREVIEW
            </span>
          </div>

      {/* Description */}
          <div className="mt-10">
            <h3 className="text-sm font-medium text-white mb-4">Description</h3>
            <p className="text-sm text-white/40 leading-relaxed max-w-lg">
              {p.description ?? "Tidak ada deskripsi."}
            </p>
            {p.tags && p.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {p.tags.map((tag: string) => (
                  <span key={tag} className="tag bg-white/5 text-white/30">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KANAN */}
        <div className="flex flex-col gap-5">

          <div>
            <span className={`tag ${CATEGORY_COLORS[p.category] ?? "bg-white/10 text-white/50"}`}>
              {p.category}
            </span>
          </div>

          <div>
            <h1 className="font-bold text-3xl tracking-tight leading-tight">{p.title}</h1>
            {p.resolution && (
              <p className="text-white/30 text-sm mt-2">
                {p.resolution} &middot; {p.file_format}
              </p>
            )}
          </div>

          {/* Artist */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-yellow flex-shrink-0 flex items-center justify-center font-bold text-dark-bg text-sm">
                {artist?.username?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div>
                <p className="font-semibold text-sm">{artist?.full_name ?? artist?.username ?? "Artist"}</p>
                <p className="text-xs text-white/30">@{artist?.username ?? "unknown"}</p>
                {artist?.is_verified && (
                  <p className="text-[11px] text-brand-blue mt-0.5">Verified Artist</p>
                )}
              </div>
            </div>
            <Link
              href={`/artists/${artist?.username}`}
              className="border border-dark-border text-white/40 text-xs px-4 py-2 rounded-full hover:border-brand-yellow hover:text-brand-yellow transition-all"
            >
              Lihat Profil
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border border-dark-border rounded-2xl overflow-hidden">
            {[
              { val: p.rating_avg?.toFixed(1) ?? "0.0", label: "Rating" },
              { val: formatCount(p.sales_count ?? 0),   label: "Sales"  },
              { val: formatCount(p.likes_count ?? 0),   label: "Likes"  },
            ].map((s) => (
              <div key={s.label} className="py-3 text-center border-r border-dark-border last:border-r-0">
                <p className="font-bold text-lg">{s.val}</p>
                <p className="text-[11px] text-white/25 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-xs text-white/25 mb-2">Harga</p>
            <span className="font-bold text-3xl text-brand-yellow">
              {formatRupiah(p.price)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleBuyNow}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              Beli Sekarang
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleAddToCart}
                className="btn-ghost flex items-center justify-center gap-2 py-3 text-sm"
              >
                {addedToCart ? "Ditambahkan!" : "Keranjang"}
              </button>
              <button
                onClick={handleWishlist}
                className={`btn-ghost flex items-center justify-center gap-2 py-3 text-sm ${
                  wishlisted
                    ? "border-brand-coral text-brand-coral"
                    : "hover:border-brand-coral hover:text-brand-coral"
                }`}
              >
                <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
          </div>

          {/* Included */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-[11px] text-white/25 uppercase tracking-widest mb-4">Yang kamu dapat</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: Download,    label: "File karya dalam format " + (p.file_format ?? "digital"), color: "bg-green-500/10  text-green-400"  },
                { icon: RefreshCw,   label: "Free update seumur hidup",                                color: "bg-blue-500/10   text-blue-400"   },
                { icon: Download,    label: "Instant download setelah bayar",                          color: "bg-purple-500/10 text-purple-400" },
                { icon: ShieldCheck, label: "Garansi refund 7 hari",                                   color: "bg-yellow-500/10 text-yellow-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-white/50">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon size={13} />
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Reviews */}
      <section className="container-main py-12 border-t border-dark-border">
        <h2 className="font-bold text-xl mb-6">
          Reviews{" "}
          <span className="text-white/25 font-normal text-base">({reviews.length})</span>
        </h2>

        {reviews.length === 0 ? (
          <p className="text-white/20 text-sm">Belum ada review untuk karya ini.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-dark-card border border-dark-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-yellow flex-shrink-0 flex items-center justify-center font-bold text-dark-bg text-xs">
                      {r.profiles?.username?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {r.profiles?.full_name ?? r.profiles?.username ?? "User"}
                      </p>
                      <p className="text-xs text-white/25">
                        @{r.profiles?.username ?? "unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < r.rating ? "text-brand-yellow" : "text-white/15"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}