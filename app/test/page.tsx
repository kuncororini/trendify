import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function TestPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*");

  return (
    <div style={{ color: "white", padding: "40px" }}>
      <h1>Supabase Connection Test</h1>
      {error ? (
        <p style={{ color: "red" }}>Error: {error.message}</p>
      ) : (
        <p style={{ color: "lightgreen" }}>
          Koneksi berhasil! Jumlah profiles: {data?.length ?? 0}
        </p>
      )}
    </div>
  );
}