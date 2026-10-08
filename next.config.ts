import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aljcnbyzixcqfhqmcqqn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // Scripts: self, inline (for GTM/JSON-LD), eval (GTM needs it), and Google domains
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://ssl.google-analytics.com https://tagmanager.google.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
              // Styles: self, inline (for injected styles), Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com",
              // Fonts: self, Google Fonts static CDN, data URIs
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self, data URIs, blob, Google domains, Supabase, and any https source
              "img-src 'self' data: blob: https: http:",
              // Connect (fetch/XHR): self, Google analytics/GTM, Supabase
              "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://stats.g.doubleclick.net https://aljcnbyzixcqfhqmcqqn.supabase.co https://*.supabase.co",
              // Frames: self, GTM preview, Google
              "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://td.doubleclick.net",
              // Default fallback
              "default-src 'self'",
              // Media
              "media-src 'self'",
              // Object (plugins)
              "object-src 'none'",
              // Base URI
              "base-uri 'self'",
              // Form actions
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
