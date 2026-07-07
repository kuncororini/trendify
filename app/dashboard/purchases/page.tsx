"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useRequireAuth } from "@/lib/useRequireAuth";

function DownloadButton({ orderId }: { orderId: string }) {
  const [loading, setLoading]       = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/download?order_id=${orderId}`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {}
    setLoading(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  }

  if (downloaded) {
    return (
      <span className="flex items-center gap-1.5 text-xs bg-green-500/15 text-green-400 font-medium px-3 py-1.5 rounded-full">
        Download berhasil
      </span>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs bg-brand-yellow text-dark-bg font-medium px-3 py-1.5 rounded-full hover:opacity-85 transition-opacity disabled:opacity-50"
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
      ) : (
        <><Download size={11} /> Download</>
      )}
    </button>
  );
}

export default function PurchasesPage() {
  const isLoggedIn            = useRequireAuth();
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select(`
          id, license, amount, status, created_at,
          midtrans_order_id,
          products ( id, title, thumbnail_url, file_format )
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = orders.filter((o) =>
    (o.products?.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-dark-border border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-main py-10 max-w-3xl">

      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-white/25 hover:text-white transition-colors mb-4 inline-block"
        >
          Dashboard
        </Link>
        <h1 className="font-bold text-2xl tracking-tight">My Purchases</h1>
        <p className="text-white/30 text-sm mt-1">
          Semua karya yang sudah kamu beli.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <p className="font-bold text-xl">{orders.length}</p>
          <p className="text-xs text-white/25 mt-1">Total Order</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <p className="font-bold text-xl">
            {formatRupiah(
              orders
                .filter((o) => o.status === "paid")
                .reduce((s, o) => s + o.amount, 0)
            )}
          </p>
          <p className="text-xs text-white/25 mt-1">Total Dibelanjakan</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Cari karya..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-dark-border border-t-white rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/20 text-sm mb-3">
            {orders.length === 0
              ? "Kamu belum membeli karya apapun."
              : "Tidak ada hasil."}
          </p>
          {orders.length === 0 && (
            <Link href="/products" className="text-brand-yellow text-sm hover:underline">
              Browse Artworks
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden"
            >
              {/* Order header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-dark-border bg-dark-surface/50">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-white/25">Order ID</p>
                    <p className="text-sm font-medium truncate max-w-[180px]">
                      {order.midtrans_order_id}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-dark-border" />
                  <div>
                    <p className="text-xs text-white/25">Tanggal</p>
                    <p className="text-sm">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${
                  order.status === "paid"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}>
                  {order.status === "paid" ? "Lunas" : "Pending"}
                </span>
              </div>
{/* Item */}
<div className="flex items-center gap-4 px-5 py-4">
  <Link href={`/products/${order.products?.id}`} className="w-14 h-14 rounded-xl bg-dark-surface flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity">
    {order.products?.thumbnail_url ? (
      <img
        src={order.products.thumbnail_url}
        alt={order.products.title}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-brand-purple to-brand-yellow" />
    )}
  </Link>

  <div className="flex-1 min-w-0">
    <Link href={`/products/${order.products?.id}`} className="font-medium text-sm hover:text-brand-yellow transition-colors">
      {order.products?.title}
    </Link>
    <div className="flex items-center gap-2 mt-1.5">
      <span className="text-[11px] bg-white/5 text-white/25 px-2 py-0.5 rounded-full capitalize">
        Lisensi {order.license}
      </span>
      {order.products?.file_format && (
        <span className="text-[11px] bg-white/5 text-white/25 px-2 py-0.5 rounded-full">
          {order.products.file_format}
        </span>
      )}
    </div>
  </div>

  <div className="flex flex-col items-end gap-2 flex-shrink-0">
    <span className="font-semibold text-sm text-brand-yellow">
      {formatRupiah(order.amount)}
    </span>
    {order.status === "paid" ? (
      <DownloadButton orderId={order.id} />
    ) : (
      <span className="text-xs text-white/25">Menunggu pembayaran</span>
    )}
  </div>
</div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}