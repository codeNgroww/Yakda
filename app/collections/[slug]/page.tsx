import { Metadata } from 'next';
import { fetchProducts, fetchCollections } from '@/lib/actions/products';
import StorefrontView from '@/app/StorefrontView';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return {
      title: 'Shop Collections - Yakda UAE',
    };
  }

  const collectionName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${collectionName} - Yakda UAE`,
    description: `Shop the best ${collectionName} in Dubai with fast delivery from Yakda.`,
    alternates: {
      canonical: `/collections/${slug}`,
    },
    openGraph: {
      title: `${collectionName} - Yakda`,
      description: `Shop the best ${collectionName} in Dubai.`,
      url: `https://yakdastationery.com/collections/${slug}`,
    }
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  const products = await fetchProducts();
  const collections = await fetchCollections();

  const isValidCollection = collections.some(c => c.slug.toLowerCase() === slug.toLowerCase());

  if (!isValidCollection) {
    notFound();
  }

  return (
    <StorefrontView
      initialProducts={products}
      initialCategories={[]}
      initialActiveCategory={slug}
    />
  );
}
