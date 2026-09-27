/**
 * Script: Populate brands table and link products to brands
 * 
 * 1. Fetches all products from Supabase
 * 2. Extracts brand names from product titles
 * 3. Inserts unique brands into the `brands` table
 * 4. Updates each product's `brand_id` foreign key
 * 
 * Usage: npx tsx scripts/populate-brands.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aljcnbyzixcqfhqmcqqn.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_UXTg0SKcG9ErZPj53XaLeg_HtpUc_EK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Known brands sorted longest-first so multi-word brands match before single-word prefixes
const KNOWN_BRANDS = [
  // Multi-word brands (must come first)
  'Winsor & Newton', 'Caran d\'Ache', 'Daler Rowney', 'Paper Mate', 'Sinar Line',
  'Gold Plus', 'Smart Copy', 'Kuru Toga', 'Jong Ie Nara', 'Van Gogh',
  'Faber-Castell', 'Faber Castell', 'Schneider Electric',
  // Two-word brands
  'Uni-ball', 'Uni Ball', 'Office Max', 'OfficeMax',
  // Single-word brands (alphabetical)
  '3M', 'Arches', 'BIC', 'Brother', 'Camel', 'Cambridge', 'Canon', 'Canson',
  'Casio', 'Clairefontaine', 'Copic', 'Crayola', 'Cross', 'Dell', 'Deli',
  'Derwent', 'Durable', 'Energel', 'Epson', 'Esselte', 'Fellowes',
  'GlueDots', 'HP', 'Helix', 'Kangaro', 'Kinokuniya', 'Kokuyo', 'Kores',
  'Kyocera', 'LAMY', 'Lamy', 'Leitz', 'Lenovo', 'Leuchtturm', 'Luxor',
  'Maped', 'Microsoft', 'Moleskine', 'Monami', 'Mondi', 'Olympia',
  'Pagna', 'Parker', 'Pentel', 'Pilot', 'Posca', 'Post-it',
  'Ratan', 'Rexel', 'Reynolds', 'Rhodia', 'Rotring', 'SAX', 'Sax',
  'Samsung', 'Schneider', 'Scotch', 'Sharpie', 'Sharp',
  'Staedtler', 'Staples', 'Tombow', 'UHU', 'Uni', 'Unimax',
  'WinPlus', 'Winplus', 'Zebra', 'tesa', 'Nobo', 'Dahle', 'Herlitz',
  'Elba', 'Hamelin', 'Oxford', 'Clairefontaine', 'Bantex', 'Rapid',
  'Tipp-Ex', 'Artline', 'Pelikan', 'Trodat', 'Sigel', 'Avery',
  'Herma', 'Exacompta', 'Bi-silque', 'Bi-Office', 'Quartet',
  'Swingline', 'Acco', 'GBC', 'Franken', 'Dahle', 'Ideal',
  'Securit', 'Apli', 'Q-Connect', 'Initiative', 'Niceday', 'Viking',
].sort((a, b) => b.length - a.length);

function extractBrand(title: string): string | null {
  const titleLower = title.toLowerCase();
  
  for (const brand of KNOWN_BRANDS) {
    const brandLower = brand.toLowerCase();
    
    // Check if the title starts with this brand name
    if (titleLower.startsWith(brandLower)) {
      // Make sure it's a word boundary (followed by space, comma, dash, or end)
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
  console.log('🔍 Fetching all products...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, brand_id')
    .order('title');
  
  if (error) {
    console.error('❌ Error fetching products:', error.message);
    process.exit(1);
  }
  
  console.log(`📦 Found ${products.length} products\n`);
  
  // Step 1: Extract unique brands from product titles
  const brandMap = new Map<string, string[]>(); // brand name -> product ids
  let unmatched = 0;
  
  for (const product of products) {
    const brand = extractBrand(product.title);
    if (brand) {
      // Normalize brand name (capitalize consistently)
      const normalized = brand;
      if (!brandMap.has(normalized)) {
        brandMap.set(normalized, []);
      }
      brandMap.get(normalized)!.push(product.id);
    } else {
      unmatched++;
    }
  }
  
  console.log(`🏷️  Detected ${brandMap.size} unique brands across ${products.length - unmatched} products`);
  console.log(`⚠️  ${unmatched} products had no brand match\n`);
  
  // Print brand summary
  const brandSummary = [...brandMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, ids]) => `  ${name}: ${ids.length} products`);
  
  console.log('📊 Brand distribution:');
  brandSummary.forEach(line => console.log(line));
  console.log('');
  
  // Step 2: Upsert brands into the brands table
  console.log('💾 Inserting brands into database...');
  
  const brandsToInsert = [...brandMap.keys()].map(name => ({
    name,
    slug: slugify(name),
  }));
  
  const { data: insertedBrands, error: brandError } = await supabase
    .from('brands')
    .upsert(brandsToInsert, { onConflict: 'slug' })
    .select('id, name, slug');
  
  if (brandError) {
    console.error('❌ Error inserting brands:', brandError.message);
    process.exit(1);
  }
  
  console.log(`✅ Upserted ${insertedBrands.length} brands\n`);
  
  // Step 3: Fetch all brands back to get their IDs
  const { data: allBrands, error: fetchError } = await supabase
    .from('brands')
    .select('id, name, slug');
  
  if (fetchError) {
    console.error('❌ Error fetching brands:', fetchError.message);
    process.exit(1);
  }
  
  // Build slug -> id lookup
  const brandIdLookup = new Map<string, string>();
  for (const b of allBrands) {
    brandIdLookup.set(b.slug, b.id);
    brandIdLookup.set(b.name.toLowerCase(), b.id);
  }
  
  // Step 4: Update each product's brand_id
  console.log('🔗 Linking products to brands...');
  
  let updated = 0;
  let errors = 0;
  
  for (const [brandName, productIds] of brandMap) {
    const brandSlug = slugify(brandName);
    const brandId = brandIdLookup.get(brandSlug);
    
    if (!brandId) {
      console.error(`  ⚠️  No brand ID found for "${brandName}" (slug: ${brandSlug})`);
      errors++;
      continue;
    }
    
    // Batch update all products for this brand
    for (const productId of productIds) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ brand_id: brandId })
        .eq('id', productId);
      
      if (updateError) {
        console.error(`  ❌ Failed to update product ${productId}: ${updateError.message}`);
        errors++;
      } else {
        updated++;
      }
    }
    
    console.log(`  ✅ ${brandName}: linked ${productIds.length} products`);
  }
  
  console.log(`\n🎉 Done! Updated ${updated} products, ${errors} errors.`);
  
  // Print unmatched products for review
  if (unmatched > 0) {
    console.log(`\n📋 ${unmatched} unmatched product titles (no brand detected):`);
    for (const product of products) {
      const brand = extractBrand(product.title);
      if (!brand) {
        console.log(`  - ${product.title}`);
      }
    }
  }
}

main().catch(console.error);
