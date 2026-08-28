import { fetchProducts, fetchCategories } from '@/lib/actions/products';
import StorefrontView from './StorefrontView';

export const revalidate = 0; // Ensure fresh data from Supabase

export default async function HomePage() {
  const products = await fetchProducts();
  const categories = await fetchCategories();

  return (
    <StorefrontView
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
