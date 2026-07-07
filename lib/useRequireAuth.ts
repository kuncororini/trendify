"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export function useRequireAuth(redirectTo = "/auth/login") {
  const router    = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Cek session saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace(`${redirectTo}?next=${window.location.pathname}`);
      } else {
        setIsLoggedIn(true);
      }
    });

    // Listen perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace(`${redirectTo}?next=${window.location.pathname}`);
        } else {
          setIsLoggedIn(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, redirectTo]);

  return isLoggedIn === true;
}