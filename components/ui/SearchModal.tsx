"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

const QUICK_LINKS = [
  { label: "3D Art",        href: "/products?category=3d"           },
  { label: "Illustration",  href: "/products?category=illustration" },
  { label: "Pixel Art",     href: "/products?category=pixel"        },
  { label: "Wallpaper",     href: "/products?category=wallpaper"    },
  { label: "Abstract",      href: "/products?category=abstract"     },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);

  // Auto focus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Tutup dengan Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Search dari Supabase dengan debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select(`id, title, category, price, thumbnail_url, profiles ( username )`)
        .eq("status", "published")
        .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(5);

      setResults(data ?? []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-2xl">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-dark-border">
            <Search size={16} className="text-white/30 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari karya atau kategori..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-white/25 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Results */}
          {query.trim().length >= 2 ? (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-4 h-4 border-2 border-dark-border border-t-white rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="flex flex-col">
                    {results.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-dark-surface transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-dark-surface flex-shrink-0 relative overflow-hidden">
                          {p.thumbnail_url ? (
                            <Image
                              src={p.thumbnail_url}
                              alt={p.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-purple to-brand-yellow" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.title}</p>
                          <p className="text-xs text-white/30 mt-0.5">
                            @{p.profiles?.username} &middot; {p.category}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-brand-yellow flex-shrink-0">
                          {formatRupiah(p.price)}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/products?search=${query}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 border-t border-dark-border text-xs text-white/30 hover:text-white hover:bg-dark-surface transition-all"
                  >
                    <span>Lihat semua hasil untuk "{query}"</span>
                    <ArrowRight size={13} />
                  </Link>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-white/30">Tidak ada hasil untuk "{query}"</p>
                  <p className="text-xs text-white/20 mt-1">Coba kata kunci lain</p>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-4">
              <p className="text-[11px] text-white/25 uppercase tracking-widest mb-3">
                Browse Kategori
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="text-xs border border-dark-border text-white/40 px-3 py-1.5 rounded-full hover:border-white/30 hover:text-white transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-white/15 mt-3">
          Tekan Esc untuk tutup
        </p>
      </div>
    </>
  );
}