import { Metadata } from 'next';
import { fetchProducts } from '@/lib/actions/products';
import StorefrontView from '@/app/StorefrontView';
import Breadcrumbs from '@/components/Breadcrumbs';
import SeoContent from '@/components/SeoContent';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Stationery Shop in Dubai | Buy Stationery Online UAE | Yakda',
  description: 'Discover the finest stationery shop in Dubai. Buy premium writing supplies, paper, executive furniture, and school stationery online at Yakda with next-day delivery.',
  alternates: {
    canonical: '/stationery-dubai',
  },
  openGraph: {
    title: 'Stationery Shop in Dubai | Yakda',
    description: 'Buy premium writing supplies, paper, and school stationery online at Yakda.',
    url: 'https://yakda.ae/stationery-dubai',
  }
};

export default async function StationeryDubaiPage() {
  const products = await fetchProducts();
  
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Stationery Dubai' }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-margin-mobile py-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <SeoContent 
          h1="Stationery Shop in Dubai"
          description="Yakda is your premier destination for high-quality stationery in Dubai and the wider UAE. Whether you're equipping a corporate office, preparing for the school year, or searching for the perfect writing instrument, our curated selection offers unparalleled quality and value."
          className="mb-8"
        />
      </div>
      
      <StorefrontView
        initialProducts={products}
        initialCategories={[]} 
        initialActiveCategory="all"
      />
    </div>
  );
}
