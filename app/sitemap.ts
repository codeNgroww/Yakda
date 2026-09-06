import { MetadataRoute } from 'next';
import { fetchProducts, fetchCategories, fetchSubCategories, fetchCollections } from '@/lib/actions/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yakda.ae';
  
  const [products, categories, subcategories, collections] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchSubCategories(),
    fetchCollections()
  ]);

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug || product.id}`,
    lastModified: new Date(product.updated_at || product.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const subcategoryUrls = subcategories.map((sc) => {
    // Find parent category slug for the URL structure
    const parent = categories.find(c => c.id === sc.category_id);
    return {
      url: `${baseUrl}/${parent?.slug || 'category'}/${sc.slug}`,
      lastModified: new Date(sc.updated_at || sc.created_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  const collectionUrls = collections.map((col) => ({
    url: `${baseUrl}/collections/${col.slug}`,
    lastModified: new Date(col.updated_at || col.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const uaeLandingPages = [
    {
      url: `${baseUrl}/office-supplies-dubai`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stationery-dubai`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryUrls,
    ...subcategoryUrls,
    ...collectionUrls,
    ...uaeLandingPages,
    ...productUrls,
  ];
}
