import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import sharp from 'sharp';

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'yakda';

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase URL or Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Target size bounds: ~100KB to 180KB (optimized for Supabase Storage limits)
const TARGET_MAX_BYTES = 120 * 1024; // 120 KB

/**
 * Resizes and compresses image buffer to fall safely within ~100KB - 160KB
 */
async function processImageToTargetSize(inputBuffer: Buffer): Promise<Buffer> {
  let quality = 80;
  let width = 1000;

  let processed = await sharp(inputBuffer)
    .resize(width, width, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toBuffer();

  // If file exceeds target limit, reduce quality & size incrementally
  while (processed.length > TARGET_MAX_BYTES && quality > 35) {
    quality -= 8;
    if (quality < 60) width = 800;
    processed = await sharp(inputBuffer)
      .resize(width, width, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();
  }

  return processed;
}

function sanitizeFileName(sku: string, id: string): string {
  const cleanSku = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${cleanSku || id}.jpg`;
}

async function syncProductImagesToSupabase() {
  console.log('=====================================================');
  console.log('STARTING CDN IMAGE DOWNLOAD & SUPABASE STORAGE SYNC');
  console.log('Target Size: ~100KB - 160KB per image (Optimized)');
  console.log('=====================================================');

  // Fetch all products from Supabase using pagination
  const allProducts: any[] = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data: chunk, error } = await supabase
      .from('products')
      .select('id, sku, title, image')
      .range(from, from + step - 1);

    if (error || !chunk || chunk.length === 0) break;
    allProducts.push(...chunk);
    if (chunk.length < step) break;
    from += step;
  }

  const products = allProducts;
  console.log(`Found ${products.length} total products in database.\n`);

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const CONCURRENCY = 6;

  // Process in concurrent pools
  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const chunk = products.slice(i, i + CONCURRENCY);

    await Promise.all(
      chunk.map(async (product) => {
        try {
          const rawUrl = product.image;
          if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
            failedCount++;
            return;
          }

          const fileName = sanitizeFileName(product.sku, product.id);
          const storagePath = `products/${fileName}`;
          const expectedPublicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storagePath}`;

          // Check if already processed and updated
          if (rawUrl === expectedPublicUrl) {
            skippedCount++;
            return;
          }

          // Fetch CDN image
          const response = await fetch(rawUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            },
          });

          if (!response.ok) {
            failedCount++;
            return;
          }

          const arrayBuffer = await response.arrayBuffer();
          const inputBuffer = Buffer.from(arrayBuffer);

          // Compress image
          const compressedBuffer = await processImageToTargetSize(inputBuffer);

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(storagePath, compressedBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
              cacheControl: '3600000',
            });

          if (uploadError) {
            console.error(`[UPLOAD ERROR] SKU ${product.sku}: ${uploadError.message}`);
            failedCount++;
            return;
          }

          // Update Product image URL in Database
          const { error: updateError } = await supabase
            .from('products')
            .update({ image: expectedPublicUrl })
            .eq('id', product.id);

          if (updateError) {
            console.error(`[DB UPDATE ERROR] SKU ${product.sku}: ${updateError.message}`);
            failedCount++;
            return;
          }

          successCount++;
        } catch (err: any) {
          console.error(`[ERROR] SKU ${product.sku}:`, err.message);
          failedCount++;
        }
      })
    );

    const progress = Math.min(i + CONCURRENCY, products.length);
    if (progress % 100 === 0 || progress === products.length) {
      console.log(`Progress: ${progress} / ${products.length} products processed... (Uploaded: ${successCount}, Skipped: ${skippedCount}, Failed: ${failedCount})`);
    }
  }

  console.log('\n=============================================');
  console.log('SUPABASE STORAGE IMAGE SYNC SUMMARY');
  console.log('=============================================');
  console.log(`Total Products:              ${products.length}`);
  console.log(`Successfully Uploaded & Updated: ${successCount}`);
  console.log(`Already In Supabase Storage:  ${skippedCount}`);
  console.log(`Failed Downloads/Uploads:     ${failedCount}`);
  console.log('=============================================\n');
}

syncProductImagesToSupabase().catch((e) => {
  console.error('Fatal Image Sync Exception:', e);
  process.exit(1);
});
