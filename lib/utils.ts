import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Gabungkan class Tailwind dengan aman
// Contoh: cn("px-4", isActive && "bg-yellow-400")
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format angka ke Rupiah
// Contoh: formatRupiah(195000) → "Rp 195.000"
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format angka besar ke K/M
// Contoh: formatCount(1200) → "1.2K"
export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000)     return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

// Format tanggal ke bahasa Indonesia
// Contoh: formatDate("2024-01-15") → "15 Januari 2024"
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Waktu relatif
// Contoh: timeAgo("2024-06-01") → "2 hari lalu"
export function timeAgo(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (diff < 60)       return "Baru saja";
  if (diff < 3600)     return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400)    return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 2592000)  return `${Math.floor(diff / 86400)} hari lalu`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} bulan lalu`;
  return `${Math.floor(diff / 31536000)} tahun lalu`;
}

// Harga berdasarkan tipe lisensi
export function getPriceByLicense(
  product: { price: number; price_commercial: number; price_extended: number },
  license: LicenseType
): number {
  if (license === "commercial") return product.price_commercial;
  if (license === "extended")   return product.price_extended;
  return product.price;
}

// Import ini perlu ditambahkan di atas karena dipakai di fungsi terakhir
import type { LicenseType } from "@/types";