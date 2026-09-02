import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found - Yakda',
    };
  }

  return {
    title: `${product.title} - Yakda UAE`,
    description: product.description || `Buy ${product.title} at best price in UAE with fast next-day delivery from Yakda.`,
    openGraph: {
      title: `${product.title} - Yakda`,
      description: product.description || `Buy ${product.title} at best price in UAE.`,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
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

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.image],
    description: product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: `https://yakda.ae/products/${product.id}`,
      priceCurrency: 'AED',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <Header
        cartCount={0}
        wishlistCount={0}
        currentUser={null}
        isAdmin={false}
        activeCategory="all"
        onSelectCategory={() => {}}
        onOpenSearch={() => {}}
        onOpenCart={() => {}}
        onOpenAuth={() => {}}
        onOpenProfile={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-margin-mobile md:px-gutter pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-outline mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* Product Details Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-6 bg-white rounded-2xl border border-outline-variant/60 p-6 flex items-center justify-center aspect-square">
            <img src={product.image || '/images/hero-desk.png'} alt={product.title} className="max-h-full object-contain" />
          </div>

          <div className="md:col-span-6 flex flex-col gap-4">
            {product.badge && (
              <span className="self-start px-3 py-1 bg-[#004d40] text-white text-xs font-black uppercase rounded shadow-xs">
                {product.badge}
              </span>
            )}
            <span className="text-xs text-outline font-semibold">SKU Code: {product.sku}</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#003833]">{product.title}</h1>
            <div className="text-3xl font-black text-[#003833]">AED {Number(product.price).toFixed(2)}</div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed border-t border-b border-outline-variant/40 py-4 my-2">
              {product.description || 'Premium office stationery item supplied by Yakda Dubai with next day express delivery across the UAE.'}
            </p>

            {/* Tabby & Tamara Installment Teaser */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 my-1">
              <span>Pay 4 interest-free payments of <strong>AED {(Number(product.price) / 4).toFixed(2)}</strong> with</span>
              <span className="px-1.5 py-0.5 bg-[#00F5D4] text-[#1A2A4E] font-black text-[9px] rounded uppercase">tabby</span>
              <span>or</span>
              <span className="px-1.5 py-0.5 bg-[#FFD6A5] text-[#1A2A4E] font-black text-[9px] rounded uppercase">tamara</span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <Link href="/" className="px-6 py-3.5 bg-[#D93630] hover:bg-[#b82a25] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span> Order on Storefront
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3 pb-safe">
        <div>
          <span className="text-[10px] text-gray-400 font-bold block">Total Price</span>
          <span className="text-lg font-black text-[#D93630]">AED {Number(product.price).toFixed(2)}</span>
        </div>
        <Link
          href="/"
          className="flex-1 py-3 bg-[#D93630] hover:bg-[#b82a25] text-white font-black text-xs rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span> Add to Cart
        </Link>
      </div>

      <Footer />
    </div>
  );
}
