import { Metadata } from 'next';
import { fetchProducts, fetchSubCategories } from '@/lib/actions/products';
import StorefrontView from '@/app/StorefrontView';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface SubCategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export async function generateMetadata({ params }: SubCategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  
  if (!subcategory) {
    return {
      title: 'Shop All Categories - Yakda UAE',
    };
  }

  // Very basic title generation. In a full implementation, we'd fetch the SEO title from the database.
  const subCategoryName = subcategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${subCategoryName} - Yakda UAE`,
    description: `Shop the best ${subCategoryName} in Dubai with fast delivery from Yakda.`,
    alternates: {
      canonical: `/${category}/${subcategory}`,
    },
    openGraph: {
      title: `${subCategoryName} - Yakda`,
      description: `Shop the best ${subCategoryName} in Dubai.`,
      url: `https://yakda.ae/${category}/${subcategory}`,
    }
  };
}

export default async function SubCategoryPage({ params }: SubCategoryPageProps) {
  const { subcategory } = await params;
  
  const products = await fetchProducts();
  const subcategories = await fetchSubCategories();

  // Validate if it's a real subcategory
  const isValidSubCategory = subcategories.some(sc => sc.slug.toLowerCase() === subcategory.toLowerCase());

  if (!isValidSubCategory) {
    // If it's not a real subcategory, it might just be an invalid route.
    notFound();
  }

  return (
    <StorefrontView
      initialProducts={products}
      initialCategories={[]} 
      initialActiveCategory={subcategory}
    />
  );
}
