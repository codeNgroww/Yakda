import { Metadata } from 'next';
import { fetchProducts, fetchCategories } from '@/lib/actions/products';
import StorefrontView from '@/app/StorefrontView';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug || slug === 'all') {
    return {
      title: 'Shop All Categories - Yakda UAE',
    };
  }

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `${categoryName} Stationery & Supplies - Yakda UAE`,
    description: `Shop the best ${categoryName} stationery, office supplies, and furniture in Dubai with fast delivery from Yakda.`,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: `${categoryName} Supplies - Yakda`,
      description: `Shop the best ${categoryName} stationery in Dubai.`,
      url: `https://yakda.ae/category/${slug}`,
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  const products = await fetchProducts();
  const categories = await fetchCategories();

  // Validate if it's a real category (or pseudo-category like 'eco')
  const isValidCategory = 
    slug === 'eco' || 
    slug === 'all' || 
    categories.some(c => c.slug.toLowerCase() === slug.toLowerCase());

  if (!isValidCategory) {
    notFound();
  }

  return (
    <StorefrontView
      initialProducts={products}
      initialCategories={categories}
      initialActiveCategory={slug}
    />
  );
}
