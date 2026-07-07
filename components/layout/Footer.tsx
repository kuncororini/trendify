import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-dark-border mt-20">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="font-syne font-extrabold text-2xl">
              Trend<span className="text-brand-yellow">ify</span>
            </Link>
            <p className="text-white/40 text-sm mt-3 max-w-xs leading-relaxed">
              Marketplace digital art terbaik di Indonesia. Dukung seniman independen dan temukan karya yang kamu sukai.
            </p>
          </div>

          {/* Explore links */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Explore</p>
            <ul className="space-y-3 text-sm text-white/50">
              {[
                { label: "All Artworks",  href: "/products" },
                { label: "Illustration",  href: "/products?category=illustration" },
                { label: "3D Art",        href: "/products?category=3d" },
                { label: "Pixel Art",     href: "/products?category=pixel" },
                { label: "Top Artists",   href: "/artists" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-3 text-sm text-white/50">
              {[
                { label: "Sell on Trendify", href: "/upload" },
                { label: "Help Center",      href: "/help" },
                { label: "Privacy Policy",   href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-dark-border">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Trendify. All rights reserved.
          </p>
          <p className="text-xs text-white/25">Made with ❤️ in Indonesia</p>
        </div>
      </div>
    </footer>
  );
}