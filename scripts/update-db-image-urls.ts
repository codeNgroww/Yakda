import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'yakda';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function sanitizeFileName(sku: string, id: string): string {
  const cleanSku = (sku || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${cleanSku || id}.jpg`;
}

async function updateDbImageUrlsToSupabase() {
  console.log('=====================================================');
  console.log('UPDATING DATABASE PRODUCTS "image" COLUMN TO SUPABASE STORAGE');
  console.log('=====================================================');

  // Fetch all products
  const allProducts: any[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data: chunk, error } = await supabase
      .from('products')
      .select('id, sku, image')
      .range(from, from + step - 1);

    if (error || !chunk || chunk.length === 0) break;
    allProducts.push(...chunk);
    if (chunk.length < step) break;
    from += step;
  }

  console.log(`Fetched ${allProducts.length} total products from database.`);

  let updatedCount = 0;
  let alreadyUpdatedCount = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    const batch = allProducts.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (product) => {
        const fileName = sanitizeFileName(product.sku, product.id);
        const supabaseStorageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/products/${fileName}`;

        if (product.image === supabaseStorageUrl) {
          alreadyUpdatedCount++;
          return;
        }

        const { error: updateErr } = await supabase
          .from('products')
          .update({ image: supabaseStorageUrl })
          .eq('id', product.id);

        if (!updateErr) {
          updatedCount++;
        }
      })
    );
  }

  console.log('\n=============================================');
  console.log('DATABASE IMAGE URL SYNC SUMMARY');
  console.log('=============================================');
  console.log(`Total Products:                  ${allProducts.length}`);
  console.log(`Updated to Supabase Storage URL: ${updatedCount}`);
  console.log(`Already Supabase Storage URL:   ${alreadyUpdatedCount}`);
  console.log('=============================================\n');
}

updateDbImageUrlsToSupabase().catch((e) => {
  console.error('Fatal DB Update Error:', e);
  process.exit(1);
});
