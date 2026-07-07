"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Check } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useCart } from "@/lib/CartContext";
import { createClient } from "@/lib/supabase";

const PAYMENT_METHODS = [
  { id: "bca",     label: "BCA Virtual Account",    logo: "BCA"  },
  { id: "mandiri", label: "Mandiri Virtual Account", logo: "MDR"  },
  { id: "bni",     label: "BNI Virtual Account",     logo: "BNI"  },
  { id: "gopay",   label: "GoPay",                   logo: "GP"   },
  { id: "ovo",     label: "OVO",                     logo: "OVO"  },
  { id: "qris",    label: "QRIS",                    logo: "QR"   },
];

export default function CheckoutPage() {
  const isLoggedIn = useRequireAuth();
  const { items, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("bca");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState(false);
  const [customerName, setCustomerName]   = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const total    = subtotal;

  // Ambil data user untuk pre-fill form
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCustomerEmail(user.email ?? "");
        setCustomerName(user.user_metadata?.full_name ?? "");
      }
    });
  }, []);

  async function handlePay() {
    if (!customerName || !customerEmail) {
      setError("Nama dan email harus diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Minta token dari API kita
      const res = await fetch("/api/payment/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id:      i.product.id,
            title:   i.product.title,
            price:   i.price,
            license: i.license,
          })),
          customer: {
            name:  customerName,
            email: customerEmail,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Buka Midtrans Snap popup
      (window as any).snap.pay(data.token, {
        onSuccess: () => {
          clearCart();
          setSuccess(true);
          setLoading(false);
        },
        onPending: () => {
          clearCart();
          setSuccess(true);
          setLoading(false);
        },
        onError: () => {
          setError("Pembayaran gagal. Coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });

    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-dark-border border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-brand-mint" />
          </div>
          <h1 className="font-bold text-2xl mb-2">Pembayaran Berhasil</h1>
          <p className="text-white/30 text-sm leading-relaxed mb-8">
            Terima kasih sudah berbelanja di Trendify. File karya sudah tersedia di dashboard kamu.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/purchases" className="btn-primary">
              Lihat Pembelian
            </Link>
            <Link href="/products" className="btn-ghost">
              Belanja Lagi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Kalau cart kosong
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="font-bold text-xl mb-2">Keranjang kosong</h2>
          <p className="text-white/30 text-sm mb-6">
            Tambahkan karya dulu sebelum checkout.
          </p>
          <Link href="/products" className="btn-primary inline-block">
            Browse Artworks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-12">

      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/cart"
          className="w-9 h-9 rounded-full border border-dark-border flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-bold text-2xl tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* KIRI */}
        <div className="flex flex-col gap-6">

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-5">Informasi Akun</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Nama</label>
                <input
                  type="text"
                  className="input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@kamu.com"
                />
                <p className="text-xs text-white/20 mt-2">
                  Bukti pembayaran akan dikirim ke email ini.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-5">Metode Pembayaran</h2>
            <div className="flex flex-col gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    paymentMethod === method.id
                      ? "border-brand-yellow bg-brand-yellow/5"
                      : "border-dark-border hover:border-white/20"
                  }`}
                >
                  <div className="w-12 h-8 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center text-[10px] font-bold text-white/40 flex-shrink-0">
                    {method.logo}
                  </div>
                  <span className="text-sm flex-1">{method.label}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    paymentMethod === method.id ? "border-brand-yellow" : "border-dark-border"
                  }`}>
                    {paymentMethod === method.id && (
                      <div className="w-2 h-2 rounded-full bg-brand-yellow" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* KANAN */}
        <div className="flex flex-col gap-4">

          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-4">
              Order ({items.length} item)
            </p>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-dark-surface flex-shrink-0 overflow-hidden">
                    {item.product.thumbnail_url ? (
                      <img
                        src={item.product.thumbnail_url}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-purple to-brand-yellow" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.title}</p>
                    <span className="text-[11px] bg-white/5 text-white/25 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                      Lisensi {item.license}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-brand-yellow flex-shrink-0">
                    {formatRupiah(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-xs text-white/25 uppercase tracking-widest mb-4">Rincian Harga</p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/25 text-xs">
                <span>Biaya transaksi</span>
                <span>Gratis</span>
              </div>
              <div className="h-px bg-dark-border my-1" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-brand-yellow">{formatRupiah(total)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
            ) : (
              <>Bayar {formatRupiah(total)}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-white/20">
            <ShieldCheck size={13} />
            Pembayaran diproses oleh Midtrans
          </div>

        </div>
      </div>
    </div>
  );
}