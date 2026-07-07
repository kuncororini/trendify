/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sqmsgiwmziqumrokpjnr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://snap-assets.sandbox.midtrans.com https://api.sandbox.midtrans.com https://pay.google.com https://gwk.gopayapi.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://snap-assets.sandbox.midtrans.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://snap-assets.sandbox.midtrans.com https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.sandbox.midtrans.com https://app.sandbox.midtrans.com",
              "frame-src 'self' https://app.sandbox.midtrans.com https://pay.google.com https://gwk.gopayapi.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;