"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, TrendingUp, ShoppingBag, Star, Eye, Trash2 } from "lucide-react";
import { formatRupiah, formatCount } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useRequireAuth } from "@/lib/useRequireAuth";
import Image from "next/image";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-green-500/10 text-green-400",
  review:    "bg-yellow-500/10 text-yellow-400",
};

const TABS = ["Overview", "Karya Saya", "Penjualan", "Pengaturan"];

export default function DashboardPage() {
  const isLoggedIn = useRequireAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [username, setUsername]   = useState("");
  const [userId, setUserId]       = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders]     = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setUsername(user.user_metadata?.username ?? user.email?.split("@")[0] ?? "");

      // Karya milik user
      const { data: myProducts } = await supabase
        .from("products")
        .select("id, title, status, price, sales_count, likes_count, thumbnail_url")
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });

      setProducts(myProducts ?? []);

      // Penjualan dari karya milik user
      const productIds = (myProducts ?? []).map((p) => p.id);
      if (productIds.length > 0) {
        const { data: myOrders } = await supabase
          .from("orders")
          .select(`
            id, license, amount, status, created_at,
            products ( title ),
            profiles ( username )
          `)
          .in("product_id", productIds)
          .order("created_at", { ascending: false });

        setOrders(myOrders ?? []);
      }

      setLoadingData(false);
    }
    load();
  }, []);

  // ⬇️ TAMBAHIN FUNCTION BARU DI SINI
  async function handleDelete(productId: string, productTitle: string) {
    const confirmed = window.confirm(`Yakin mau hapus "${productTitle}"? Aksi ini ga bisa dibatalkan.`);
    if (!confirmed) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert("Gagal menghapus karya: " + error.message);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-dark-border border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Hitung stats real
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amount, 0);

  const totalSales   = orders.filter((o) => o.status === "paid").length;
  const totalProducts = products.length;
  const pendingReview = products.filter((p) => p.status === "review").length;

  const topProducts = [...products]
    .sort((a, b) => (b.sales_count ?? 0) - (a.sales_count ?? 0))
    .slice(0, 3);

  return (
    <div className="container-main py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/30 text-sm mb-1">Selamat datang kembali,</p>
          <h1 className="font-bold text-2xl tracking-tight">{username || "..."}</h1>
        </div>
        <Link href="/upload" className="btn-primary flex items-center gap-2 text-sm">
          <Upload size={15} /> Upload Karya
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-border flex mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-brand-yellow text-white font-medium"
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-dark-border border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>

          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="flex flex-col gap-8">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Pendapatan", value: formatRupiah(totalRevenue), icon: TrendingUp  },
                  { label: "Total Penjualan",  value: String(totalSales),         icon: ShoppingBag },
                  { label: "Total Karya",      value: String(totalProducts),      icon: Upload      },
                  { label: "Pending Review",   value: String(pendingReview),      icon: Star        },
                ].map((s) => (
                  <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <p className="text-xs text-white/30">{s.label}</p>
                      <div className="w-8 h-8 rounded-lg bg-dark-surface flex items-center justify-center">
                        <s.icon size={15} className="text-white/30" />
                      </div>
                    </div>
                    <p className="font-bold text-2xl">{s.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="font-semibold text-base mb-4">Penjualan Terbaru</h2>
                {orders.length === 0 ? (
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
                    <p className="text-white/20 text-sm">Belum ada penjualan.</p>
                  </div>
                ) : (
                  <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dark-border">
                          <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Karya</th>
                          <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Pembeli</th>
                          <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Lisensi</th>
                          <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Status</th>
                          <th className="text-right px-5 py-3.5 text-xs text-white/25 font-medium">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-dark-border last:border-b-0">
                            <td className="px-5 py-4 font-medium text-sm">{order.products?.title}</td>
                            <td className="px-5 py-4 text-white/40 text-sm">@{order.profiles?.username}</td>
                            <td className="px-5 py-4">
                              <span className="text-[11px] bg-white/5 text-white/30 px-2.5 py-1 rounded-full capitalize">
                                {order.license}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[11px] px-2.5 py-1 rounded-full capitalize ${
                                order.status === "paid" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right font-semibold text-brand-yellow text-sm">
                              {formatRupiah(order.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {topProducts.length > 0 && (
                <div>
                  <h2 className="font-semibold text-base mb-4">Karya Terlaris</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {topProducts.map((art) => (
  <Link key={art.id} href={`/products/${art.id}`} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
    <div className="aspect-video relative bg-dark-surface">
      {art.thumbnail_url ? (
        <Image src={art.thumbnail_url} alt={art.title} fill sizes="33vw" className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-purple to-brand-yellow" />
      )}
    </div>
    <div className="p-4">
      <p className="font-semibold text-sm">{art.title}</p>
      <div className="flex items-center justify-between mt-3 text-xs text-white/30">
        <span>{formatCount(art.sales_count ?? 0)} sales</span>
        <span>{formatCount(art.likes_count ?? 0)} likes</span>
      </div>
    </div>
  </Link>
))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* KARYA SAYA */}
          {activeTab === "Karya Saya" && (
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              {products.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white/20 text-sm mb-3">Kamu belum upload karya apapun.</p>
                  <Link href="/upload" className="text-brand-yellow text-sm hover:underline">Upload sekarang</Link>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Karya</th>
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Harga</th>
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Penjualan</th>
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Likes</th>
                      <th className="text-right px-5 py-3.5 text-xs text-white/25 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((art) => (
                      <tr key={art.id} className="border-b border-dark-border last:border-b-0 hover:bg-dark-surface/50 transition-colors">
                        <td className="px-5 py-4">
  <div className="flex items-center gap-3">
    <Link href={`/products/${art.id}`} className="w-10 h-10 rounded-lg bg-dark-surface relative overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
      {art.thumbnail_url ? (
        <Image src={art.thumbnail_url} alt={art.title} fill sizes="40px" className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-purple to-brand-yellow" />
      )}
    </Link>
    <Link href={`/products/${art.id}`} className="font-medium text-sm hover:text-brand-yellow transition-colors">
      {art.title}
    </Link>
  </div>
</td>
                        <td className="px-5 py-4">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[art.status] ?? "bg-white/5 text-white/40"}`}>
                            {art.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white/40">{formatRupiah(art.price)}</td>
                        <td className="px-5 py-4 text-white/40">{formatCount(art.sales_count ?? 0)}</td>
                        <td className="px-5 py-4 text-white/40">{formatCount(art.likes_count ?? 0)}</td>
                        <td className="px-5 py-4">
                         <div className="flex items-center justify-end gap-2">
  <Link
    href={`/products/${art.id}`}
    className="w-8 h-8 rounded-lg border border-dark-border flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all"
  >
    <Eye size={14} />
  </Link>
  <button
    onClick={() => handleDelete(art.id, art.title)}
    className="w-8 h-8 rounded-lg border border-dark-border flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/50 transition-all"
  >
    <Trash2 size={14} />
  </button>
</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PENJUALAN */}
          {activeTab === "Penjualan" && (
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white/20 text-sm">Belum ada penjualan.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Karya</th>
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Pembeli</th>
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Lisensi</th>
                      <th className="text-left px-5 py-3.5 text-xs text-white/25 font-medium">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs text-white/25 font-medium">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-dark-border last:border-b-0">
                        <td className="px-5 py-4 font-medium">{order.products?.title}</td>
                        <td className="px-5 py-4 text-white/40">@{order.profiles?.username}</td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] bg-white/5 text-white/30 px-2.5 py-1 rounded-full capitalize">
                            {order.license}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full capitalize ${
                            order.status === "paid" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-brand-yellow">
                          {formatRupiah(order.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PENGATURAN */}
          {activeTab === "Pengaturan" && (
            <div className="max-w-xl flex flex-col gap-6">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col gap-5">
                <h2 className="font-semibold text-base">Profil Publik</h2>
                <div>
                  <label className="label">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm">@</span>
                    <input type="text" className="input pl-8" defaultValue={username} disabled />
                  </div>
                  <p className="text-xs text-white/20 mt-2">Username tidak bisa diubah saat ini.</p>
                </div>
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
}