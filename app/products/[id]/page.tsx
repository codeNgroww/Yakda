import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Footer from '@/components/Footer';
import ProductDetailClient from '@/components/ProductDetailClient';

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
    alternates: {
      canonical: `/products/${product.id}`,
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
  const jsonLd = [
    {
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
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://yakda.ae',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: product.category ? (product.category.charAt(0).toUpperCase() + product.category.slice(1)) : 'Products',
          item: `https://yakda.ae/category/${product.category || 'all'}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.title,
        },
      ],
    }
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
      <ProductDetailClient product={product} relatedProducts={relatedProducts || []} />
    </>
  );
}
