"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRequireAuth } from "@/lib/useRequireAuth";

const CATEGORIES = [
  { label: "Illustration", slug: "illustration" },
  { label: "3D Art",       slug: "3d"           },
  { label: "Pixel Art",    slug: "pixel"        },
  { label: "Abstract",     slug: "abstract"     },
  { label: "Wallpaper",    slug: "wallpaper"    },
  { label: "Motion",       slug: "motion"       },
  { label: "Sketch",       slug: "sketch"       },
];

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const isLoggedIn = useRequireAuth();
  const router = useRouter();

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [notFound, setNotFound]   = useState(false);
  const [error, setError]         = useState("");

  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]             = useState("");
  const [category, setCategory]       = useState("illustration");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("id, title, description, price, category, artist_id")
        .eq("id", params.id)
        .maybeSingle();

      if (fetchError || !data || data.artist_id !== user.id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setPrice(String(data.price ?? ""));
      setCategory(data.category ?? "illustration");
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Judul tidak boleh kosong.");
      return;
    }
    const priceNumber = Number(price);
    if (!priceNumber || priceNumber <= 0) {
      setError("Harga harus lebih dari 0.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("products")
      .update({
        title:            title.trim(),
        description:      description.trim(),
        price:            priceNumber,
        price_commercial: priceNumber,
        price_extended:   priceNumber,
        category,
      })
      .eq("id", params.id);

    setSaving(false);

    if (updateError) {
      setError("Gagal menyimpan perubahan: " + updateError.message);
      return;
    }

    router.push("/dashboard");
  }

  if (!isLoggedIn || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-dark-border border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-bold text-2xl mb-3">Karya tidak ditemukan</h1>
          <p className="text-white/30 text-sm mb-6">
            Karya ini mungkin sudah dihapus, atau bukan milik kamu.
          </p>
          <Link href="/dashboard" className="btn-primary">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-10 max-w-xl">

      <Link
        href="/dashboard"
        className="text-xs text-white/25 hover:text-white transition-colors mb-4 inline-block"
      >
        ← Dashboard
      </Link>

      <h1 className="font-bold text-2xl tracking-tight mb-8">Edit Karya</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-5">

        <div>
          <label className="label">Judul</label>
          <input
            type="text"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Deskripsi</label>
          <textarea
            className="input min-h-[120px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Kategori</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Harga (Rp)</label>
          <input
            type="number"
            className="input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link href="/dashboard" className="btn-ghost flex-1 text-center">
            Batal
          </Link>
        </div>

      </form>
    </div>
  );
}