"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-white/40 hover:text-brand-coral transition-colors"
    >
      <LogOut size={15} /> Logout
    </button>
  );
}