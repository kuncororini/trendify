// Tipe data untuk User / Artist
export type User = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
};

// Tipe data untuk Produk / Artwork
export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;              // harga personal (Rupiah)
  price_commercial: number;   // harga lisensi komersial
  price_extended: number;     // harga lisensi extended
  category: ProductCategory;
  tags: string[];
  thumbnail_url: string;
  file_url: string;           // file asli, hanya bisa diakses setelah beli
  file_format: string;        // contoh: "PNG, PSD"
  resolution: string;         // contoh: "4096x4096"
  artist_id: string;
  artist: User;
  likes_count: number;
  sales_count: number;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  created_at: string;
};

export type ProductCategory =
  | "illustration"
  | "3d"
  | "pixel"
  | "wallpaper"
  | "abstract"
  | "motion"
  | "sketch"
  | "other";

// Tipe data untuk Order (transaksi)
export type Order = {
  id: string;
  buyer_id: string;
  product_id: string;
  product: Product;
  license: LicenseType;
  amount: number;
  status: OrderStatus;
  midtrans_order_id: string;
  payment_token: string | null;
  download_url: string | null; // dibuat otomatis setelah bayar
  created_at: string;
};

export type LicenseType = "personal" | "commercial" | "extended";
export type OrderStatus  = "pending" | "paid" | "failed" | "refunded";

// Item di keranjang belanja (disimpan di state)
export type CartItem = {
  product: Product;
  license: LicenseType;
  price: number;
};

// Tipe data untuk Review
export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  user: User;
  rating: number;   // 1–5
  comment: string;
  created_at: string;
};