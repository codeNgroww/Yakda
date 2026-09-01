import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import sharp from 'sharp';

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

// Target size bounds: ~90KB to 150KB (Optimal JPEG quality)
const TARGET_MAX_BYTES = 120 * 1024; // 120 KB

async function processImageToTargetSize(inputBuffer: Buffer): Promise<Buffer> {
  let quality = 80;
  let width = 1000;

  let processed = await sharp(inputBuffer)
    .resize(width, width, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toBuffer();

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

function sanitizeFileName(sku: string, id: number | string): string {
  const cleanSku = (sku || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${cleanSku || id}.jpg`;
}

function normalizeImageUrl(url: string | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('//')) {
    cleanUrl = `https:${cleanUrl}`;
  }
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return null;
  }
  return cleanUrl;
}

async function syncAllImagesFromCatalogToSupabase() {
  console.log('=====================================================');
  console.log('STARTING CATALOG CDN IMAGE DOWNLOAD & SUPABASE STORAGE UPLOAD');
  console.log('=====================================================');

  let page = 1;
  let totalCatalogProducts = 0;
  let successCount = 0;
  let failedCount = 0;
  const CONCURRENCY = 6;

  while (true) {
    console.log(`Fetching Catalog Page ${page} from officeoneuae.com...`);
    try {
      const response = await fetch(`https://www.officeoneuae.com/products.json?limit=250&page=${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
      });

      if (!response.ok) break;
      const data = await response.json();
      const rawProducts = data.products || [];
      if (rawProducts.length === 0) break;

      totalCatalogProducts += rawProducts.length;

      // Process batch of products
      for (let i = 0; i < rawProducts.length; i += CONCURRENCY) {
        const chunk = rawProducts.slice(i, i + CONCURRENCY);

        await Promise.all(
          chunk.map(async (p: any) => {
            try {
              const variant = p.variants?.[0];
              const rawSku = (variant?.sku || '').trim();
              const sku = rawSku.length > 0 ? rawSku : `OFFICEONE-${p.id}`;

              const cdnImgUrl = normalizeImageUrl(p.images?.[0]?.src || variant?.featured_image?.src);
              if (!cdnImgUrl) return;

              const fileName = sanitizeFileName(sku, p.id);
              const storagePath = `products/${fileName}`;
              const supabasePublicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storagePath}`;

              // Download original CDN image
              const imgRes = await fetch(cdnImgUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
              });

              if (!imgRes.ok) {
                failedCount++;
                return;
              }

              const arrayBuf = await imgRes.arrayBuffer();
              const inputBuf = Buffer.from(arrayBuf);

              // Compress & Resize
              const compressedBuf = await processImageToTargetSize(inputBuf);

              // Upload to Supabase Storage
              const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(storagePath, compressedBuf, {
                  contentType: 'image/jpeg',
                  upsert: true,
                  cacheControl: '3600000',
                });

              if (uploadError) {
                console.error(`Upload error SKU ${sku}:`, uploadError.message);
                failedCount++;
                return;
              }

              // Update database row matching SKU
              const { error: updateError } = await supabase
                .from('products')
                .update({ image: supabasePublicUrl })
                .eq('sku', sku);

              if (updateError) {
                // Try matching by title if SKU not found
                await supabase
                  .from('products')
                  .update({ image: supabasePublicUrl })
                  .eq('title', p.title.trim());
              }

              successCount++;
            } catch (err: any) {
              failedCount++;
            }
          })
        );
      }

      console.log(`Page ${page} complete. Uploaded: ${successCount}`);
      page++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (e: any) {
      console.error(`Page ${page} failed:`, e.message);
      break;
    }
  }

  console.log('\n=============================================');
  console.log('SUPABASE STORAGE IMAGE SYNC SUMMARY');
  console.log('=============================================');
  console.log(`Total Products:              ${totalCatalogProducts}`);
  console.log(`Successfully Uploaded:       ${successCount}`);
  console.log(`Failed Downloads:            ${failedCount}`);
  console.log('=============================================\n');
}

syncAllImagesFromCatalogToSupabase().catch((e) => {
  console.error('Fatal Image Sync Exception:', e);
  process.exit(1);
});
