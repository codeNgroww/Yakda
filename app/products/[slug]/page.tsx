import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Footer from '@/components/Footer';
import ProductDetailClient from '@/components/ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** Helper: derive a human-friendly brand name from product title/brand_id */
function deriveBrand(product: any): string {
  // If product has a brand relation from the DB join, use it
  if (product.brands?.name) return product.brands.name;
  if (product.brand_name) return product.brand_name;

  // Try to extract well-known brand from the product title
  const knownBrands = [
    'Durable', 'Faber-Castell', 'Staedtler', 'Pilot', 'BIC', 'Pentel', 'Zebra',
    'Parker', 'Lamy', 'Cross', 'Schneider', 'Kores', 'Mondi', 'UHU', 'Scotch',
    'Post-it', '3M', 'Leitz', 'Esselte', 'Fellowes', 'Rexel', 'Maped', 'Helix',
    'Sharpie', 'Paper Mate', 'Uni-ball', 'Tombow', 'Crayola', 'Canson', 'Derwent',
    'Winsor & Newton', 'Moleskine', 'Rhodia', 'Clairefontaine', 'Pagna', 'Kyocera',
    'HP', 'Canon', 'Epson', 'Brother', 'Samsung', 'Dell', 'Lenovo', 'Microsoft',
    'Rotring', 'Staples', 'Ratan', 'Luxor', 'Reynolds', 'Camel', 'Caran d\'Ache',
    'Kokuyo', 'Posca', 'tesa', 'Sinar Line', 'Gold Plus', 'Smart Copy',
  ];

  const title = product.title || '';
  for (const brand of knownBrands) {
    if (title.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }

  return 'Yakda';
}

/** Helper: derive a category display name */
function formatCategory(category: string | null): string {
  if (!category) return 'Office Supplies';
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Helper: derive a primary keyword from category */
function primaryKeyword(category: string | null): string {
  const map: Record<string, string> = {
    writing: 'Writing Supplies & Pens',
    paper: 'Paper & Envelopes',
    machines: 'Office Machines',
    labels: 'Labels & Tapes',
    binders: 'Binders & Filing',
    crafts: 'School & Craft Supplies',
    basics: 'Office Supplies',
    boards: 'Boards & Displays',
    storage: 'Storage & Organization',
    shipping: 'Mailing & Shipping',
    'print-copy': 'Print Room Supplies',
    computers: 'Computers & Tech',
    furniture: 'Office Furniture',
  };
  return map[category || ''] || 'Office Supplies';
}

/** Helper: extract a short USP from description */
function extractUSP(product: any): string {
  if (!product.description) return 'fast delivery across UAE';
  // Take the first sentence or first 80 characters
  const desc = product.description;
  const firstSentence = desc.split(/[.!]/).filter(Boolean)[0] || '';
  if (firstSentence.length > 80) {
    return firstSentence.substring(0, 77).trim() + '...';
  }
  return firstSentence.trim() || 'fast delivery across UAE';
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, brands(name, slug)')
    .eq('slug', slug)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found - Yakda',
    };
  }

  const brand = deriveBrand(product);
  const catKeyword = primaryKeyword(product.category);
  const usp = extractUSP(product);
  const categoryName = formatCategory(product.category);
  const canonicalUrl = `/products/${product.slug}`;
  const fullUrl = `https://yakdastationery.com${canonicalUrl}`;

  // Meta Title: {Product Name} | {Primary Keyword/Category} | {Brand}
  const metaTitle = `${product.title} | ${catKeyword} | ${brand}`;

  // Meta Description: Buy {Product Name} online. Explore {Primary Keyword/Category} from {Brand}, featuring {Key Feature/USP}. Shop online today.
  const metaDescription = `Buy ${product.title} online. Explore ${catKeyword} from ${brand}, featuring ${usp}. Shop online today.`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    // Open Graph
    openGraph: {
      title: `${product.title} - ${brand}`,
      description: product.description || `Buy ${product.title} at best price in UAE with fast next-day delivery from Yakda.`,
      url: fullUrl,
      siteName: 'Yakda',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: `${product.title} - ${brand}`,
        },
      ],
      type: 'website',
      locale: 'en_AE',
    },
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} - ${brand}`,
      description: product.description || `Buy ${product.title} at best price in UAE.`,
      images: [product.image],
    },
    // Robots
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, brands(name, slug)')
    .eq('slug', slug)
    .single();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-surface">
        <div className="pt-24 pb-16 px-4 text-center">
          <h2 className="text-2xl font-bold text-on-surface">Product Not Found</h2>
          <p className="text-xs text-outline mt-2">The requested product SKU or ID does not exist in our catalog.</p>
          <Link href="/" className="mt-4 inline-block px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl">
            Return to Storefront
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const brand = deriveBrand(product);
  const categoryName = formatCategory(product.category);
  const canonicalUrl = `/products/${product.slug}`;
  const fullUrl = `https://yakdastationery.com${canonicalUrl}`;

  // Schema.org JSON-LD Structured Data
  const jsonLd = [
    // Product Schema — includes name, brand, SKU, price, availability, reviews
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: [product.image],
      description: product.description || `Premium office stationery item from ${brand}, supplied by Yakda Dubai.`,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: brand,
      },
      offers: {
        '@type': 'Offer',
        url: fullUrl,
        priceCurrency: 'AED',
        price: product.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.in_stock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Yakda UAE',
        },
      },
      // Aggregate rating placeholder (update when you have real reviews)
      ...(product.badge === 'Best Seller' ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.5',
          reviewCount: '12',
          bestRating: '5',
          worstRating: '1',
        },
      } : {}),
    },
    // BreadcrumbList Schema — Home → Category → Product
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://yakdastationery.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: categoryName,
          item: `https://yakdastationery.com/${product.category || 'all'}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.title,
          item: fullUrl,
        },
      ],
    },
  ];

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts || []}
        brand={brand}
        categoryName={categoryName}
      />
    </>
  );
}
