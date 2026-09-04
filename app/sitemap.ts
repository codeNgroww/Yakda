import { MetadataRoute } from 'next';
import { fetchProducts, fetchCategories } from '@/lib/actions/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yakda.ae';
  const products = await fetchProducts();
  const categories = await fetchCategories();

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(product.updated_at || product.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Eco-friendly pseudo-category
  categoryUrls.push({
    url: `${baseUrl}/category/eco`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
