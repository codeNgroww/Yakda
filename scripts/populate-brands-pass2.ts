/**
 * Script: Populate additional brands (second pass)
 * Catches brands that were missed in the first pass
 * 
 * Usage: npx tsx scripts/populate-brands-pass2.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aljcnbyzixcqfhqmcqqn.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_UXTg0SKcG9ErZPj53XaLeg_HtpUc_EK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Additional brands found in the unmatched products
const ADDITIONAL_BRANDS = [
  'Double A', 'Dymo', 'Deluxe', 'Atlas', 'Eagle', 'edding', 'Cassida',
  'dufco', 'Artmate', 'CEDON', 'Blitz', 'ALIFE', 'Cello', 'Dors',
  'Datacard', 'Anchor',
].sort((a, b) => b.length - a.length);

function extractBrand(title: string): string | null {
  const titleLower = title.toLowerCase();
  
  for (const brand of ADDITIONAL_BRANDS) {
    const brandLower = brand.toLowerCase();
    if (titleLower.startsWith(brandLower)) {
      const nextChar = title[brand.length];
      if (!nextChar || /[\s,\-\/]/.test(nextChar)) {
        return brand;
      }
    }
  }
  return null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🔍 Fetching products without brands...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, brand_id')
    .is('brand_id', null)
    .order('title');
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log(`📦 Found ${products.length} unbranded products\n`);
  
  const brandMap = new Map<string, string[]>();
  
  for (const product of products) {
    const brand = extractBrand(product.title);
    if (brand) {
      if (!brandMap.has(brand)) brandMap.set(brand, []);
      brandMap.get(brand)!.push(product.id);
    }
  }
  
  console.log(`🏷️  Detected ${brandMap.size} additional brands\n`);
  
  const brandSummary = [...brandMap.entries()].sort((a, b) => b[1].length - a[1].length);
  brandSummary.forEach(([name, ids]) => console.log(`  ${name}: ${ids.length} products`));
  
  // Upsert brands
  const brandsToInsert = [...brandMap.keys()].map(name => ({
    name,
    slug: slugify(name),
  }));
  
  const { error: brandError } = await supabase
    .from('brands')
    .upsert(brandsToInsert, { onConflict: 'slug' });
  
  if (brandError) {
    console.error('❌ Error inserting brands:', brandError.message);
    process.exit(1);
  }
  
  // Fetch brand IDs
  const { data: allBrands } = await supabase.from('brands').select('id, name, slug');
  const brandIdLookup = new Map<string, string>();
  for (const b of allBrands || []) {
    brandIdLookup.set(b.slug, b.id);
  }
  
  // Link products
  console.log('\n🔗 Linking products...');
  let updated = 0;
  
  for (const [brandName, productIds] of brandMap) {
    const brandId = brandIdLookup.get(slugify(brandName));
    if (!brandId) continue;
    
    for (const productId of productIds) {
      await supabase
        .from('products')
        .update({ brand_id: brandId })
        .eq('id', productId);
      updated++;
    }
    console.log(`  ✅ ${brandName}: linked ${productIds.length} products`);
  }
  
  console.log(`\n🎉 Done! Updated ${updated} more products.`);
  
  // Count remaining unbranded
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .is('brand_id', null);
  
  console.log(`📊 Remaining unbranded products: ${count}`);
}

main().catch(console.error);
