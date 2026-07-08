"use client";

import { useState } from "react";
import { Upload, X, ImagePlus, FileText, Tag } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "illustration", "3d", "pixel", "wallpaper", "abstract", "motion", "sketch", "other",
];

export default function UploadPage() {
  const isLoggedIn = useRequireAuth();
  const router     = useRouter();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    title:       "",
    description: "",
    category:    "",
    tags:        "",
    price:       "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [artFile, setArtFile]     = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thumbnail || !artFile) return;

    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      // Ambil user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kamu harus login terlebih dahulu.");

      // Upload thumbnail
      const thumbExt  = thumbnail.name.split(".").pop();
      const thumbPath = `${user.id}/${Date.now()}-thumb.${thumbExt}`;

      const { error: thumbError } = await supabase.storage
        .from("thumbnails")
        .upload(thumbPath, thumbnail);

      if (thumbError) throw new Error("Gagal upload thumbnail: " + thumbError.message);

      const { data: thumbData } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(thumbPath);

      // Upload file karya
      const artExt  = artFile.name.split(".").pop();
      const artPath = `${user.id}/${Date.now()}-art.${artExt}`;

      const { error: artError } = await supabase.storage
        .from("artworks")
        .upload(artPath, artFile);

      if (artError) throw new Error("Gagal upload file karya: " + artError.message);

      const priceValue = parseInt(form.price);

      // Simpan ke database
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          artist_id:        user.id,
          title:            form.title,
          description:      form.description,
          category:         form.category,
          tags:             form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          price:            priceValue,
          price_commercial: priceValue,
          price_extended:   priceValue,
          thumbnail_url:    thumbData.publicUrl,
          file_url:         artPath,
          file_format:      artExt?.toUpperCase() ?? "",
          status:           "published",
        });

      if (insertError) throw new Error("Gagal menyimpan data: " + insertError.message);

      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan, coba lagi.");
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

  return (
    <div className="container-main py-12 max-w-3xl">

      <div className="mb-10">
        <h1 className="font-bold text-3xl tracking-tight mb-2">Upload Karya</h1>
        <p className="text-white/30 text-sm">Isi detail karya kamu untuk mulai berjualan.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[
          { num: 1, label: "File & Thumbnail" },
          { num: 2, label: "Detail & Harga"   },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step >= s.num
                  ? "bg-brand-yellow text-dark-bg"
                  : "bg-dark-card border border-dark-border text-white/30"
              }`}>
                {s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? "text-white" : "text-white/30"}`}>
                {s.label}
              </span>
            </div>
            {i === 0 && (
              <div className={`w-12 h-px ${step >= 2 ? "bg-brand-yellow" : "bg-dark-border"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-6">

            {/* Thumbnail */}
            <div>
              <label className="label">Thumbnail / Preview Karya</label>
              <p className="text-xs text-white/25 mb-3">
                Gambar yang ditampilkan di marketplace. Gunakan versi watermark atau low-res.
              </p>
              <label className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all ${
                thumbnail
                  ? "border-brand-yellow/50 bg-brand-yellow/5"
                  : "border-dark-border hover:border-white/20"
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) setThumbnail(e.target.files[0]); }}
                />
                {thumbnail ? (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-brand-yellow/15 flex items-center justify-center mx-auto mb-3">
                      <ImagePlus size={20} className="text-brand-yellow" />
                    </div>
                    <p className="text-sm font-medium">{thumbnail.name}</p>
                    <p className="text-xs text-white/30 mt-1">
                      {(thumbnail.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setThumbnail(null); }}
                      className="text-xs text-white/30 hover:text-brand-coral mt-2 flex items-center gap-1 mx-auto"
                    >
                      <X size={12} /> Hapus
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center mx-auto mb-3">
                      <ImagePlus size={20} className="text-white/30" />
                    </div>
                    <p className="text-sm text-white/50">Klik untuk upload thumbnail</p>
                    <p className="text-xs text-white/25 mt-1">PNG, JPG, WEBP — maks 5 MB</p>
                  </div>
                )}
              </label>
            </div>

            {/* File karya */}
            <div>
              <label className="label">File Karya Asli</label>
              <p className="text-xs text-white/25 mb-3">
                File yang diterima pembeli setelah bayar. Resolusi penuh, tanpa watermark.
              </p>
              <label className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all ${
                artFile
                  ? "border-brand-blue/50 bg-brand-blue/5"
                  : "border-dark-border hover:border-white/20"
              }`}>
                <input
                  type="file"
                  accept=".png,.jpg,.psd,.zip,.pdf,.ai"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) setArtFile(e.target.files[0]); }}
                />
                {artFile ? (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/15 flex items-center justify-center mx-auto mb-3">
                      <FileText size={20} className="text-brand-blue" />
                    </div>
                    <p className="text-sm font-medium">{artFile.name}</p>
                    <p className="text-xs text-white/30 mt-1">
                      {(artFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setArtFile(null); }}
                      className="text-xs text-white/30 hover:text-brand-coral mt-2 flex items-center gap-1 mx-auto"
                    >
                      <X size={12} /> Hapus
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center mx-auto mb-3">
                      <Upload size={20} className="text-white/30" />
                    </div>
                    <p className="text-sm text-white/50">Klik untuk upload file karya</p>
                    <p className="text-xs text-white/25 mt-1">PNG, PSD, ZIP, PDF, AI — maks 100 MB</p>
                  </div>
                )}
              </label>
            </div>

            <button
              type="button"
              disabled={!thumbnail || !artFile}
              onClick={() => setStep(2)}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Lanjut ke Detail
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-6">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="label">Judul Karya</label>
              <input
                type="text"
                className="input"
                placeholder="Contoh: Cosmic Drift #07"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Deskripsi</label>
              <textarea
                className="input min-h-[120px] resize-none"
                placeholder="Ceritakan tentang karya ini..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Kategori</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`border rounded-xl py-2.5 text-sm capitalize transition-all ${
                      form.category === cat
                        ? "border-brand-yellow text-brand-yellow"
                        : "border-dark-border text-white/30 hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                Tags <span className="text-white/25 font-normal">(pisahkan dengan koma)</span>
              </label>
              <div className="relative">
                <Tag size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="space, abstract, dark"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Harga</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm">Rp</span>
                <input
                  type="number"
                  className="input pl-9"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-ghost px-6"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading || !form.title || !form.category || !form.price}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <><Upload size={15} /> Publish Karya</>
                )}
              </button>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}