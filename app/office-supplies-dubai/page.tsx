import { Metadata } from 'next';
import { fetchProducts } from '@/lib/actions/products';
import StorefrontView from '@/app/StorefrontView';
import Breadcrumbs from '@/components/Breadcrumbs';
import SeoContent from '@/components/SeoContent';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Office Supplies in Dubai | Buy Office Stationery Online | Yakda',
  description: 'Shop office supplies and stationery in Dubai from Yakda. Find pens, notebooks, filing supplies, paper, office machines, labels, storage products and everyday workplace essentials.',
  alternates: {
    canonical: '/office-supplies-dubai',
  },
  openGraph: {
    title: 'Office Supplies in Dubai | Yakda',
    description: 'Shop office supplies and stationery in Dubai from Yakda.',
    url: 'https://yakdastationery.com/office-supplies-dubai',
  }
};

export default async function OfficeSuppliesDubaiPage() {
  const products = await fetchProducts();

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Office Supplies Dubai' }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-margin-mobile py-6">
        <Breadcrumbs items={breadcrumbItems} />

        <SeoContent
          h1="Office Supplies in Dubai"
          description="Yakda provides top-tier office supplies across Dubai, catering to corporate needs with fast delivery. Discover our extensive range of filing solutions, office machines, writing instruments, and desk essentials designed for the modern workspace."
          className="mb-8"
        />

        {/* Reuse the StorefrontView component or a custom layout to show products. 
            We pass 'all' since this is a general landing page, but could be filtered down. */}
      </div>

      <StorefrontView
        initialProducts={products}
        initialCategories={[]}
        initialActiveCategory="all"
      />
    </div>
  );
}
