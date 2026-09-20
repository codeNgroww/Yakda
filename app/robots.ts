import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
     # robots.txt for https://yakdastationery.com/
# Yakda Stationery — Next.js e-commerce site
# Review and adjust paths to match your actual route structure before deploying.

User-agent: *
Allow: /

# --- Next.js internals (build assets, no SEO value) ---
Disallow: /_next/
Disallow: /_next/static/chunks/
Allow: /_next/static/
Disallow: /_next/data/

# --- API routes (never crawlable, often sensitive) ---
Disallow: /api/

# --- Core e-commerce utility pages ---
Disallow: /cart
Disallow: /checkout
Disallow: /account
Disallow: /account/*
Disallow: /login
Disallow: /register
Disallow: /wishlist
Disallow: /order-confirmation
Disallow: /order-success
Disallow: /order-tracking

# --- Internal search & filter/sort query parameters ---
Disallow: /search
Disallow: /*?q=
Disallow: /*?sort=
Disallow: /*?filter=
Disallow: /*?page=
Disallow: /*?min_price=
Disallow: /*?max_price=
Disallow: /*?color=
Disallow: /*?size=

# --- Tracking / session parameters ---
Disallow: /*?utm_*
Disallow: /*?ref=
Disallow: /*?fbclid=
Disallow: /*?gclid=
Disallow: /*?sessionid=

# --- Preview / draft routes (common with headless CMS setups) ---
Disallow: /preview
Disallow: /draft

# --- Admin/CMS (adjust to your actual dashboard path if self-hosted) ---
Disallow: /admin
Disallow: /studio

# --- Explicitly allow key crawlable sections ---
Allow: /products
Allow: /product/
Allow: /category/
Allow: /collections/
Allow: /blog/
Allow: /about
Allow: /contact

# --- Sitemap ---
Sitemap: https://yakdastationery.com/sitemap.xml

  };
}
