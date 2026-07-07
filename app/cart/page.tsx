"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";

export default function CartPage() {
  const { items, removeItem, totalPrice } = useCart();
  const [coupon, setCoupon]               = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const discount = couponApplied ? Math.floor(totalPrice * 0.1) : 0;
  const total    = totalPrice - discount;

  function applyCoupon() {
    if (coupon.toLowerCase() === "trendify10") {
      setCouponApplied(true);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="font-bold text-xl mb-2">Keranjang kosong</h2>
          <p className="text-white/30 text-sm mb-6">
            Belum ada karya yang kamu tambahkan ke keranjang.
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Browse Artworks <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-12">
      <h1 className="font-bold text-2xl tracking-tight mb-8">
        Keranjang{" "}
        <span className="text-white/25 font-normal text-lg">({items.length} item)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

        {/* KIRI — daftar item */}
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-dark-card border border-dark-border rounded-2xl p-5 flex gap-5">
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-purple to-brand-yellow flex-shrink-0 overflow-hidden">
                {item.product.thumbnail_url ? (
                  <img
                    src={item.product.thumbnail_url}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#6d28d9] to-[#f59e0b]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.product.title}</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {(item.product as any).artist?.handle ?? "@artist"}
                </p>
                <span className="inline-block mt-2 text-[11px] bg-white/5 text-white/30 px-2.5 py-1 rounded-full capitalize">
                  Lisensi {item.license}
                </span>
              </div>

              {/* Harga & hapus */}
              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-white/20 hover:text-brand-coral transition-colors"
                  aria-label="Hapus item"
                >
                  <X size={16} />
                </button>
                <span className="font-bold text-brand-yellow text-sm">
                  {formatRupiah(item.price)}
                </span>
              </div>
            </div>
          ))}

          <Link
            href="/products"
            className="text-sm text-white/30 hover:text-white transition-colors mt-2"
          >
            + Tambah karya lain
          </Link>
        </div>

        {/* KANAN — ringkasan */}
        <div className="flex flex-col gap-4">

          {/* Coupon */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <label className="label">Kode Promo</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  className="input pl-9 text-sm"
                  placeholder="Masukkan kode"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={couponApplied}
                />
              </div>
              <button
                onClick={applyCoupon}
                disabled={couponApplied || !coupon}
                className="btn-ghost px-4 text-sm disabled:opacity-40"
              >
                {couponApplied ? "Aktif" : "Pakai"}
              </button>
            </div>
            {couponApplied && (
              <p className="text-xs text-brand-mint mt-2">
                Kode berhasil dipakai — diskon 10%
              </p>
            )}
            {!couponApplied && (
              <p className="text-xs text-white/20 mt-2">Coba kode: TRENDIFY10</p>
            )}
          </div>

          {/* Ringkasan harga */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-4">Ringkasan</p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Subtotal</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-brand-mint">
                  <span>Diskon (10%)</span>
                  <span>- {formatRupiah(discount)}</span>
                </div>
              )}
              <div className="h-px bg-dark-border my-1" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-brand-yellow">{formatRupiah(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-2 mt-5"
            >
              Lanjut ke Checkout <ArrowRight size={15} />
            </Link>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/20">
              <ShieldCheck size={13} />
              Pembayaran aman & terenkripsi
            </div>
          </div>

          {/* Yang didapat */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Setelah bayar</p>
            <div className="flex flex-col gap-2 text-xs text-white/40">
              <p>— Instant download file karya</p>
              <p>— Akses permanen di dashboard</p>
              <p>— Garansi refund 7 hari</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}