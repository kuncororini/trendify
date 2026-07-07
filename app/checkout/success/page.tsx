import Link from "next/link";
import { Check, Download, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const ORDER = {
  id: "TRD-20240512-001",
  date: "12 Mei 2024, 14:23",
  items: [
    {
      id: "1",
      title: "Cosmic Drift #07",
      artist: "Nova Studio",
      license: "Personal",
      price: 195000,
      gradient: "from-[#1a0533] via-[#6d28d9] to-[#f59e0b]",
    },
    {
      id: "2",
      title: "Sakura Pixel Kit",
      artist: "Bitgarden",
      license: "Commercial",
      price: 310000,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
    },
  ],
  discount: 50000,
};

const subtotal = ORDER.items.reduce((sum, i) => sum + i.price, 0);
const total    = subtotal - ORDER.discount;

export default function OrderSuccessPage() {
  return (
    <div className="container-main py-16 max-w-xl">

      {/* Icon & heading */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center mx-auto mb-5">
          <Check size={34} className="text-brand-mint" strokeWidth={2.5} />
        </div>
        <h1 className="font-bold text-2xl mb-2">Pembayaran Berhasil</h1>
        <p className="text-white/30 text-sm leading-relaxed">
          Terima kasih sudah berbelanja di Trendify.
        </p>
        <div className="inline-flex items-center gap-2 mt-3 bg-dark-card border border-dark-border px-4 py-2 rounded-full text-xs text-white/25">
          <span>Order ID:</span>
          <span className="text-white/50 font-medium">{ORDER.id}</span>
        </div>
      </div>

      {/* Item list */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-dark-border">
          <p className="text-xs text-white/25 uppercase tracking-widest">Karya yang Dibeli</p>
        </div>
        <div className="flex flex-col divide-y divide-dark-border">
          {ORDER.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-white/25 mt-0.5">{item.artist}</p>
                <span className="text-[11px] bg-white/5 text-white/25 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Lisensi {item.license}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-sm text-brand-yellow">
                  {formatRupiah(item.price)}
                </p>
                <button className="flex items-center gap-1 text-[11px] text-brand-blue hover:underline mt-1">
                  <Download size={11} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rincian harga */}
        <div className="px-5 py-4 border-t border-dark-border bg-dark-surface/50 flex flex-col gap-2">
          <div className="flex justify-between text-sm text-white/30">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-brand-mint">
            <span>Diskon</span>
            <span>- {formatRupiah(ORDER.discount)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold mt-1 pt-2 border-t border-dark-border">
            <span>Total Dibayar</span>
            <span className="text-brand-yellow">{formatRupiah(total)}</span>
          </div>
        </div>
      </div>

      {/* Info email */}
      <div className="bg-dark-card border border-dark-border rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-yellow/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium">Cek email kamu</p>
          <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
            Bukti pembayaran dan link download sudah dikirim ke email kamu. Cek folder spam jika tidak ada di inbox.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/purchases" className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Download size={15} /> Lihat Downloads
        </Link>
        <Link href="/products" className="btn-ghost flex-1 flex items-center justify-center gap-2">
          Belanja Lagi <ArrowRight size={15} />
        </Link>
      </div>

    </div>
  );
}