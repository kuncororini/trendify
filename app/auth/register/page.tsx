"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);
  const [form, setForm]                 = useState({
    full_name: "",
    username:  "",
    email:     "",
    password:  "",
  });

  const passwordChecks = [
    { label: "Minimal 8 karakter",    pass: form.password.length >= 8   },
    { label: "Mengandung angka",       pass: /\d/.test(form.password)    },
    { label: "Mengandung huruf besar", pass: /[A-Z]/.test(form.password) },
  ];

  const passwordValid = passwordChecks.every((c) => c.pass);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordValid) return;

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", form.username)
      .single();

    if (existingUser) {
      setError("Username sudah dipakai. Coba username lain.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          username:  form.username,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-brand-mint/15 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-bold text-2xl mb-3">Cek email kamu</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Kami sudah kirim link verifikasi ke{" "}
            <span className="text-white">{form.email}</span>.
            Klik link tersebut untuk mengaktifkan akun kamu.
          </p>
          <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2">
            Ke halaman login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-2xl">
            Trend<span className="text-brand-yellow">ify</span>
          </Link>
          <p className="text-white/30 text-sm mt-2">Buat akun baru</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="label">Nama Lengkap</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm">@</span>
                <input
                  type="text"
                  className="input pl-8"
                  placeholder="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value.toLowerCase().replace(/\s/g, ""),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-3">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        check.pass ? "bg-brand-mint/20" : "bg-dark-border"
                      }`}>
                        {check.pass && <Check size={10} className="text-brand-mint" />}
                      </div>
                      <span className={`text-xs ${check.pass ? "text-brand-mint" : "text-white/25"}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-white/25 leading-relaxed">
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="/terms" className="text-white/50 hover:text-white underline">
                Terms of Service
              </Link>{" "}
              dan{" "}
              <Link href="/privacy" className="text-white/50 hover:text-white underline">
                Privacy Policy
              </Link>{" "}
              kami.
            </p>

            <button
              type="submit"
              disabled={loading || !passwordValid}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
              ) : (
                <>Buat Akun <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/25 mt-6">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-brand-yellow hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}