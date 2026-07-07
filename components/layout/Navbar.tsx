"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Menu, X, Upload, LayoutDashboard, LogOut } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import SearchModal from "@/components/ui/SearchModal";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const [menuOpen, setMenuOpen]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [user, setUser]                 = useState<SupabaseUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/";
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md">
        <nav className="container-main flex items-center gap-4 h-16">

          {/* Logo */}
          <Link href="/" className="font-bold text-xl flex-shrink-0">
            Trend<span className="text-brand-yellow">ify</span>
          </Link>

          {/* Search bar — tengah, memanjang */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 flex items-center gap-3 bg-dark-card border border-dark-border rounded-full px-4 py-2.5 text-sm text-white/25 hover:border-white/20 transition-colors"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Cari karya atau artist...</span>
          </button>

          {/* Kanan — wishlist, cart, auth */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-dark-border hover:border-white/30 transition-colors"
            >
              <Heart size={16} className="text-white/60" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-dark-border hover:border-white/30 transition-colors relative"
            >
              <ShoppingCart size={16} className="text-white/60" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-yellow text-dark-bg text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 border border-dark-border rounded-full pl-2 pr-3 py-1.5 hover:border-white/30 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-purple to-brand-yellow flex items-center justify-center text-[11px] font-bold text-dark-bg">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white/70 max-w-[80px] truncate">
                    {user.user_metadata?.username ?? user.email?.split("@")[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-xl z-20">
                      <div className="px-4 py-3 border-b border-dark-border">
                        <p className="text-sm font-medium truncate">
                          {user.user_metadata?.full_name ?? "User"}
                        </p>
                        <p className="text-xs text-white/30 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-dark-surface transition-colors">
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        <Link href="/dashboard/purchases" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-dark-surface transition-colors">
                          <ShoppingCart size={15} /> My Purchases
                        </Link>
                        <Link href="/upload" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-dark-surface transition-colors">
                          <Upload size={15} /> Upload Karya
                        </Link>
                      </div>
                      <div className="border-t border-dark-border py-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/40 hover:text-brand-coral hover:bg-dark-surface transition-colors">
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm py-2 px-4">Log in</Link>
                <Link href="/upload" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                  <Upload size={14} /> Start Selling
                </Link>
              </>
            )}
          </div>

          {/* Hamburger mobile */}
          <button
            className="md:hidden p-2 flex-shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-dark-surface border-b border-dark-border px-6 py-4 flex flex-col gap-4 text-sm">
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white">Explore</Link>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white">Wishlist</Link>
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white">Cart</Link>
            <hr className="border-dark-border" />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white">Dashboard</Link>
                <Link href="/dashboard/purchases" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white">My Purchases</Link>
                <button onClick={handleLogout} className="text-left text-brand-coral">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-center" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link href="/upload" className="btn-primary text-center flex items-center justify-center gap-2" onClick={() => setMenuOpen(false)}>
                  <Upload size={14} /> Start Selling
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}