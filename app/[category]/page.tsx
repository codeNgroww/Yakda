import { Metadata } from 'next';
import { fetchProducts, fetchCategories } from '@/lib/actions/products';
import StorefrontView from '@/app/StorefrontView';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  
  if (!category || category === 'all') {
    return {
      title: 'Shop All Categories - Yakda UAE',
    };
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${categoryName} Stationery & Supplies - Yakda UAE`,
    description: `Shop the best ${categoryName} stationery, office supplies, and furniture in Dubai with fast delivery from Yakda.`,
    alternates: {
      canonical: `/${category}`,
    },
    openGraph: {
      title: `${categoryName} Supplies - Yakda`,
      description: `Shop the best ${categoryName} stationery in Dubai.`,
      url: `https://yakda.ae/${category}`,
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  
  const products = await fetchProducts();
  const categories = await fetchCategories();

  // Validate if it's a real category (or pseudo-category like 'eco')
  const isValidCategory = 
    category === 'eco' || 
    category === 'all' || 
    categories.some(c => c.slug.toLowerCase() === category.toLowerCase());

  if (!isValidCategory) {
    notFound();
  }

  return (
    <StorefrontView
      initialProducts={products}
      initialCategories={categories}
      initialActiveCategory={category}
    />
  );
}
