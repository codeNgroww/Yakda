import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase URL or Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ShopifyVariant {
  id: number;
  sku: string;
  price: string;
  compare_at_price: string | null;
  available: boolean;
  featured_image: { src: string } | null;
}

interface ShopifyImage {
  src: string;
}

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  product_type: string;
  tags: string[] | string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

// Non-Stationery & Furniture Exclusion Whitelist
const EXCLUDED_PRODUCT_TYPES = new Set([
  'pantry & janitorial',
  'sanitation technology',
  'apple retail',
  'safes',
  'production services',
  'lifestyle & more....',
  'food & beverages',
  'cleaning chemicals',
  'kitchen & dining',
  'home decor'
]);

// Detailed Sub-Category Mapping Logic matching user specifications
function mapToStationeryCategory(productType: string, title: string, tagsStr: string): string {
  const combined = `${productType} ${title} ${tagsStr}`.toLowerCase();

  // 1. Labels & Label Makers
  if (combined.includes('label')) {
    return 'labels';
  }

  // 2. Binders & Filing Accessories
  if (
    combined.includes('binder') ||
    combined.includes('file') ||
    combined.includes('folder') ||
    combined.includes('filing') ||
    combined.includes('index') ||
    combined.includes('divider')
  ) {
    return 'binders';
  }

  // 3. School, Crafts & Hobbies
  if (
    combined.includes('craft') ||
    combined.includes('hobby') ||
    combined.includes('art') ||
    combined.includes('school') ||
    combined.includes('color') ||
    combined.includes('paint') ||
    combined.includes('clay')
  ) {
    return 'crafts';
  }

  // 4. Boards & Easels
  if (
    combined.includes('board') ||
    combined.includes('easel') ||
    combined.includes('whiteboard') ||
    combined.includes('corkboard') ||
    combined.includes('noticeboard')
  ) {
    return 'boards';
  }

  // 5. Storage & Organization
  if (
    combined.includes('storage') ||
    combined.includes('organiz') ||
    combined.includes('rack') ||
    combined.includes('drawer') ||
    combined.includes('cabinet') ||
    combined.includes('tray')
  ) {
    return 'storage';
  }

  // 6. Mailing & Shipping Supplies
  if (
    combined.includes('mail') ||
    combined.includes('ship') ||
    combined.includes('packaging') ||
    combined.includes('bubble') ||
    combined.includes('wrap') ||
    combined.includes('tape') ||
    combined.includes('box')
  ) {
    return 'shipping';
  }

  // 7. Office Print & Copy Room
  if (
    combined.includes('copy') ||
    combined.includes('print room') ||
    combined.includes('ream') ||
    combined.includes('a4 paper') ||
    combined.includes('a3 paper')
  ) {
    return 'print-copy';
  }

  // 8. Computers & Accessories
  if (
    combined.includes('computer') ||
    combined.includes('laptop') ||
    combined.includes('mouse') ||
    combined.includes('keyboard') ||
    combined.includes('cable') ||
    combined.includes('adapter') ||
    combined.includes('usb') ||
    combined.includes('monitor')
  ) {
    return 'computers';
  }

  // 9. Office Paper Products
  if (
    combined.includes('paper') ||
    combined.includes('notebook') ||
    combined.includes('pad') ||
    combined.includes('envelope') ||
    combined.includes('sticky note') ||
    combined.includes('post-it')
  ) {
    return 'paper';
  }

  // 10. Office Machines
  if (
    combined.includes('printer') ||
    combined.includes('shredder') ||
    combined.includes('calculator') ||
    combined.includes('machine') ||
    combined.includes('laminat') ||
    combined.includes('toner') ||
    combined.includes('ink')
  ) {
    return 'machines';
  }

  // 11. Office Basics
  if (
    combined.includes('clip') ||
    combined.includes('stapler') ||
    combined.includes('scissor') ||
    combined.includes('punch') ||
    combined.includes('ruler') ||
    combined.includes('glue') ||
    combined.includes('stamp') ||
    combined.includes('rubber')
  ) {
    return 'basics';
  }

  // 12. Writing Supplies (Default fallback)
  return 'writing';
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function extractBadge(variant: ShopifyVariant, tagsStr: string): string | null {
  const price = parseFloat(variant.price || '0');
  const comparePrice = variant.compare_at_price ? parseFloat(variant.compare_at_price) : 0;

  if (comparePrice > price) {
    return 'Sale';
  }

  const tagsLower = tagsStr.toLowerCase();
  if (tagsLower.includes('bestseller') || tagsLower.includes('best seller') || tagsLower.includes('popular')) {
    return 'Best Seller';
  }
  if (tagsLower.includes('new arrival') || tagsLower.includes('new')) {
    return 'New Arrival';
  }

  return null;
}

async function scrapeOfficeOneStationery() {
  console.log('=====================================================');
  console.log('STARTING OFFICEONE UAE STATIONERY & SUB-CATEGORY SCRAPER');
  console.log('=====================================================');
  console.log(`Supabase URL: ${supabaseUrl}`);

  let page = 1;
  let totalScrapedCount = 0;
  let totalStationeryCount = 0;
  let totalUpsertedCount = 0;
  let totalFailedCount = 0;

  const validProductsToUpsert: Array<{
    sku: string;
    title: string;
    description: string;
    price: number;
    category: string;
    badge: string | null;
    image: string;
    in_stock: boolean;
  }> = [];

  while (true) {
    console.log(`Fetching Page ${page} from officeoneuae.com...`);
    try {
      const response = await fetch(`https://www.officeoneuae.com/products.json?limit=250&page=${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Page ${page} returned HTTP status ${response.status}. Stopping pagination.`);
        break;
      }

      const data = await response.json();
      const rawProducts: ShopifyProduct[] = data.products || [];

      if (rawProducts.length === 0) {
        console.log(`Page ${page} contains 0 products. Reached end of catalog.`);
        break;
      }

      totalScrapedCount += rawProducts.length;

      for (const p of rawProducts) {
        try {
          const typeLower = (p.product_type || '').toLowerCase().trim();
          const tagsStr = Array.isArray(p.tags) ? p.tags.join(' ') : p.tags || '';

          // Exclude non-stationery and furniture types
          if (EXCLUDED_PRODUCT_TYPES.has(typeLower) || typeLower.includes('furniture')) {
            continue;
          }

          const variant = p.variants?.[0];
          if (!variant) {
            totalFailedCount++;
            continue;
          }

          // Determine real, stable SKU
          const rawSku = (variant.sku || '').trim();
          const sku = rawSku.length > 0 ? rawSku : `OFFICEONE-${p.id}`;

          // Image URL validation (image is NOT NULL)
          const rawImgUrl = p.images?.[0]?.src || variant.featured_image?.src;
          const imageUrl = normalizeImageUrl(rawImgUrl);
          if (!imageUrl) {
            totalFailedCount++;
            continue;
          }

          // Price validation
          const numericPrice = parseFloat(variant.price || '0');
          if (isNaN(numericPrice) || numericPrice <= 0) {
            totalFailedCount++;
            continue;
          }

          // Clean Description
          const cleanDesc = stripHtml(p.body_html) || p.title;

          // Map to stationery sub-categories
          const category = mapToStationeryCategory(p.product_type || '', p.title, tagsStr);
          const badge = extractBadge(variant, tagsStr);
          const inStock = variant.available === true;

          validProductsToUpsert.push({
            sku,
            title: p.title.trim(),
            description: cleanDesc,
            price: numericPrice,
            category,
            badge,
            image: imageUrl,
            in_stock: inStock,
          });

          totalStationeryCount++;
        } catch (itemErr: any) {
          console.error(`Failed to process product ID ${p.id}:`, itemErr.message);
          totalFailedCount++;
        }
      }

      page++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: any) {
      console.error(`Error fetching page ${page}:`, err.message);
      break;
    }
  }

  console.log(`\nMatched ${validProductsToUpsert.length} stationery products across sub-categories.`);
  console.log('Upserting products into Supabase "products" table in batches of 100...\n');

  // Batch Upsert
  const BATCH_SIZE = 100;
  for (let i = 0; i < validProductsToUpsert.length; i += BATCH_SIZE) {
    const batch = validProductsToUpsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'sku' });

    if (error) {
      console.warn(`Batch ${Math.floor(i / BATCH_SIZE) + 1} warning (${error.message}). Retrying item by item...`);
      for (const item of batch) {
        const { error: singleError } = await supabase
          .from('products')
          .upsert(item, { onConflict: 'sku' });
        if (singleError) {
          totalFailedCount++;
        } else {
          totalUpsertedCount++;
        }
      }
    } else {
      totalUpsertedCount += batch.length;
      console.log(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} products).`);
    }
  }

  console.log('\n=============================================');
  console.log('STATIONERY SUB-CATEGORY SCRAPER SUMMARY');
  console.log('=============================================');
  console.log(`Total Products Scraped:    ${totalScrapedCount}`);
  console.log(`Stationery Products:       ${totalStationeryCount}`);
  console.log(`Products Upserted to DB:   ${totalUpsertedCount}`);
  console.log(`Products Failed/Skipped:   ${totalFailedCount}`);
  console.log('=============================================\n');
}

scrapeOfficeOneStationery().catch((e) => {
  console.error('Fatal Scraper Exception:', e);
  process.exit(1);
});
