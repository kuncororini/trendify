"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { formatRupiah, formatCount } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnail_url: string | null;
  likes_count: number;
  sales_count: number;
  profiles: { username: string } | null;
};

const CATEGORIES = [
  { label: "Semua",        slug: "all"          },
  { label: "Illustration", slug: "illustration" },
  { label: "3D Art",       slug: "3d"           },
  { label: "Pixel Art",    slug: "pixel"        },
  { label: "Abstract",     slug: "abstract"     },
  { label: "Wallpaper",    slug: "wallpaper"    },
  { label: "Motion",       slug: "motion"       },
  { label: "Sketch",       slug: "sketch"       },
];

const SORT_OPTIONS = [
  { label: "Terbaru",    value: "newest"     },
  { label: "Terlaris",   value: "best"       },
  { label: "Termurah",   value: "price_asc"  },
  { label: "Termahal",   value: "price_desc" },
  { label: "Terpopuler", value: "likes"      },
];

const PRICE_RANGES = [
  { label: "Semua harga",    min: 0,      max: 999999999 },
  { label: "Di bawah 100rb", min: 0,      max: 100000    },
  { label: "100rb - 200rb",  min: 100000, max: 200000    },
  { label: "200rb - 300rb",  min: 200000, max: 300000    },
  { label: "Di atas 300rb",  min: 300000, max: 999999999 },
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
  "from-[#0f0c29] via-[#302b63] to-[#24243e]",
  "from-[#134e4a] via-[#065f46] to-[#d97706]",
  "from-[#ec4899] via-[#8b5cf6] to-[#06b6d4]",
  "from-[#f7971e] to-[#ffd200]",
  "from-[#ee9ca7] to-[#ffdde1]",
];

export default function ProductsPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("all");
  const [sort, setSort]             = useState("newest");
  const [priceRange, setPriceRange] = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [category, sort, priceRange]);

  async function fetchProducts() {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("products")
      .select(`
        id, title, category, price,
        thumbnail_url, likes_count, sales_count,
        profiles ( username )
      `)
      .eq("status", "published")
      .gte("price", PRICE_RANGES[priceRange].min)
      .lte("price", PRICE_RANGES[priceRange].max);

    if (category !== "all") query = query.eq("category", category);

    if (sort === "price_asc")  query = query.order("price",        { ascending: true  });
    if (sort === "price_desc") query = query.order("price",        { ascending: false });
    if (sort === "likes")      query = query.order("likes_count",  { ascending: false });
    if (sort === "best")       query = query.order("sales_count",  { ascending: false });
    if (sort === "newest")     query = query.order("created_at",   { ascending: false });

    const { data, error } = await query;
    if (!error && data) setProducts(data as any);
    setLoading(false);
  }

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.profiles?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const activeFilters = [
    category !== "all" && CATEGORIES.find((c) => c.slug === category)?.label,
    priceRange !== 0   && PRICE_RANGES[priceRange].label,
  ].filter(Boolean) as string[];

  return (
    <div className="container-main py-10">

      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight mb-1">Explore Artworks</h1>
        <p className="text-white/30 text-sm">{filtered.length} karya ditemukan</p>
      </div>

      {/* Search & sort */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Cari karya atau artist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-40 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`btn-ghost flex items-center gap-2 text-sm px-4 ${
            showFilter ? "border-brand-yellow text-brand-yellow" : ""
          }`}
        >
          <SlidersHorizontal size={15} />
          Filter
          {activeFilters.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-yellow text-dark-bg text-[10px] font-bold flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Kategori</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`text-sm px-4 py-2 rounded-full border transition-all ${
                    category === cat.slug
                      ? "border-brand-yellow text-brand-yellow"
                      : "border-dark-border text-white/30 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Rentang Harga</p>
            <div className="flex flex-col gap-2">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setPriceRange(i)}
                  className={`text-sm text-left px-4 py-2.5 rounded-xl border transition-all ${
                    priceRange === i
                      ? "border-brand-yellow text-brand-yellow"
                      : "border-dark-border text-white/30 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {activeFilters.map((f) => (
            <span
              key={f}
              className="flex items-center gap-2 text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 px-3 py-1.5 rounded-full"
            >
              {f}
              <button
                onClick={() => {
                  if (CATEGORIES.find((c) => c.label === f)) setCategory("all");
                  if (PRICE_RANGES.find((r) => r.label === f)) setPriceRange(0);
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={() => { setCategory("all"); setPriceRange(0); }}
            className="text-xs text-white/25 hover:text-white transition-colors px-2"
          >
            Reset semua
          </button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={`text-sm px-4 py-2 rounded-full border whitespace-nowrap transition-all flex-shrink-0 ${
              category === cat.slug
                ? "border-brand-yellow text-brand-yellow bg-brand-yellow/5"
                : "border-dark-border text-white/30 hover:border-white/20 hover:text-white/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-dark-surface" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 bg-dark-surface rounded w-1/3" />
                <div className="h-4 bg-dark-surface rounded w-3/4" />
                <div className="h-3 bg-dark-surface rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
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
                <p className="text-xs text-white/30 mt-0.5">
                  @{p.profiles?.username ?? "unknown"}
                </p>
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
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-white/20 text-sm">
            {products.length === 0
              ? "Belum ada karya. Upload karya pertamamu!"
              : "Tidak ada karya yang cocok dengan filter kamu."}
          </p>
          {products.length === 0 ? (
            <Link href="/upload" className="text-brand-yellow text-sm mt-3 hover:underline inline-block">
              Upload sekarang
            </Link>
          ) : (
            <button
              onClick={() => { setSearch(""); setCategory("all"); setPriceRange(0); }}
              className="text-brand-yellow text-sm mt-3 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>
      )}

    </div>
  );
}