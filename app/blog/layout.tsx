import React from 'react';
import GlobalNav from '@/components/GlobalNav';
import Footer from '@/components/Footer';
import { fetchCategories, fetchProducts } from '@/lib/actions/products';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await fetchCategories();
  const allProducts = await fetchProducts();

  return (
    <>
      <GlobalNav categories={categories} allProducts={allProducts} />
      {children}
      <Footer />
    </>
  );
}
