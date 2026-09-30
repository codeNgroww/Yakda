import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleBlogs = [
  {
    title: "The Power of a Well-Planned Day",
    slug: "power-well-planned-day",
    content: "<p>Discover how the right stationery can help you stay organized, focused and make every day more productive. Using a planner is not just about keeping track of appointments—it’s about setting intentions and mapping out a path to achieve your goals.</p><p>We highly recommend starting your day by writing down three core objectives. Not only does this clear your mind, but putting pen to paper solidifies your commitment.</p><h2>Top Planner Recommendations for 2026</h2><ul><li>The Executive Leather Bound Daily Planner</li><li>Eco-Friendly Minimalist Weekly Agenda</li><li>The Creative Bullet Journal</li></ul>",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000",
    author: "Lifestyle",
    published: true,
  },
  {
    title: "Must-Have Office Supplies for 2026",
    slug: "must-have-office-supplies-2026",
    content: "<p>From notebooks to desk essentials, here are the must-have office supplies to boost your productivity and style.</p><p>Upgrading your workspace with high-quality tools can transform your workflow. Let's dive into some of the most innovative and aesthetically pleasing products arriving this year.</p><h3>1. Ergonomic Gel Pens</h3><p>Gone are the days of hand fatigue. The latest ergonomic gel pens offer smooth, skip-free writing with contoured grips that mold to your hand perfectly.</p><h3>2. Smart Notebooks</h3><p>Bridging the gap between analog and digital, smart notebooks allow you to write on paper and instantly sync your notes to the cloud.</p>",
    image: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?auto=format&fit=crop&q=80&w=2000",
    author: "Office Tips",
    published: true,
  },
  {
    title: "How to Choose the Perfect Notebook",
    slug: "how-to-choose-perfect-notebook",
    content: "<p>Notebooks come in many styles and formats. Here's a simple guide to help you find the one that fits your needs.</p><p>Whether you are bullet journaling, sketching, or taking meeting minutes, the paper quality and binding matter significantly.</p><blockquote><p>\"The blank page is a playground for the mind.\"</p></blockquote><p>Consider the GSM (grams per square meter) of the paper. For fountain pens, you'll want at least 90gsm to prevent bleeding and ghosting. For quick jotting, standard 70gsm might suffice.</p>",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=2000",
    author: "Product Guide",
    published: true,
  },
  {
    title: "Top 5 Stationery Essentials for Every Student",
    slug: "top-5-stationery-essentials-student",
    content: "<p>From notebooks to highlighters, discover the must-have items to make studying easier and more fun.</p><ul><li><strong>Color-coded Highlighters:</strong> Essential for organizing complex notes.</li><li><strong>Sticky Notes:</strong> Perfect for quick reminders and page marking.</li><li><strong>Index Cards:</strong> The ultimate tool for flashcard memorization.</li><li><strong>Durable Backpack:</strong> To carry your supplies comfortably.</li><li><strong>Mechanical Pencils:</strong> No sharpening required, always ready to go.</li></ul><p>Equipping yourself with these essentials can make a noticeable difference in your academic performance.</p>",
    image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&q=80&w=2000",
    author: "Stationery",
    published: true,
  },
  {
    title: "Creating an Inspiring Workspace",
    slug: "creating-inspiring-workspace",
    content: "<p>Simple changes can make a big difference. Here are some easy ways to turn your workspace into a place of inspiration and focus.</p><p>Lighting, organization, and a touch of personalization are the keys.</p><h2>Decluttering Your Desk</h2><p>A cluttered desk leads to a cluttered mind. Invest in sleek desk organizers to keep your pens, paperclips, and sticky notes neatly tucked away.</p><h2>Adding Greenery</h2><p>A small potted plant can reduce stress and increase productivity. Succulents and snake plants are excellent low-maintenance options.</p>",
    image: "https://images.unsplash.com/photo-1497215848122-4d658252277d?auto=format&fit=crop&q=80&w=2000",
    author: "Workspace",
    published: true,
  },
  {
    title: "Back to School: Essentials You'll Love",
    slug: "back-to-school-essentials",
    content: "<p>Get ready for a productive school season with these handpicked stationery and office essentials.</p><p>The back-to-school season is an exciting time to refresh your supplies. This year, we're seeing a huge trend in eco-friendly and sustainable products.</p><p>Consider swapping out your plastic folders for recycled cardboard alternatives, and look for pens made from biodegradable materials.</p>",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=2000",
    author: "Trending",
    published: true,
  },
  {
    title: "The Art of Fountain Pens",
    slug: "art-of-fountain-pens",
    content: "<p>Fountain pens are not just writing instruments; they are a statement of elegance. Discover the history and mechanics behind these classic tools.</p><p>From the nib to the ink converter, every part of a fountain pen is meticulously designed to provide a smooth writing experience.</p><h2>Choosing Your First Fountain Pen</h2><p>If you're new to fountain pens, start with a medium or fine nib. It offers a good balance of ink flow and precision. Don't be afraid to experiment with different ink colors!</p>",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=2000",
    author: "Lifestyle",
    published: true,
  },
  {
    title: "Organizing Your Office for Maximum Efficiency",
    slug: "organizing-office-efficiency",
    content: "<p>A well-organized office is the foundation of a successful business. Learn how to optimize your layout and storage solutions.</p><p>Filing cabinets, labeling systems, and ergonomic furniture all play a crucial role in maintaining order.</p><ul><li>Implement a color-coded filing system.</li><li>Keep everyday items within arm's reach.</li><li>Archive old documents systematically.</li></ul>",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2000",
    author: "Office Tips",
    published: true,
  },
  {
    title: "Sustainable Stationery: A Step Towards a Greener Planet",
    slug: "sustainable-stationery-greener-planet",
    content: "<p>The stationery industry is evolving. Discover the latest eco-friendly products that help reduce waste without compromising on quality.</p><p>Recycled paper, biodegradable pens, and refillable markers are just the beginning.</p><blockquote><p>\"Sustainability is no longer a choice; it's a necessity.\"</p></blockquote><p>By choosing sustainable options, you contribute to a healthier planet while still enjoying premium writing materials.</p>",
    image: "https://images.unsplash.com/photo-1603525281489-35c8b74ff6db?auto=format&fit=crop&q=80&w=2000",
    author: "Trending",
    published: true,
  },
  {
    title: "Creative Ways to Use Washi Tape",
    slug: "creative-ways-washi-tape",
    content: "<p>Washi tape is incredibly versatile. From decorating your planner to creating custom wall art, explore unique ways to use this colorful tape.</p><p>Originating from Japan, washi tape is made from natural fibers and is easily removable without leaving residue.</p><h2>Decorate Your Keyboard</h2><p>Add a pop of color to your laptop by placing strips of washi tape on your keys. It's a simple DIY project that instantly personalizes your workspace.</p>",
    image: "https://images.unsplash.com/photo-1518330751912-870020297cd9?auto=format&fit=crop&q=80&w=2000",
    author: "Stationery",
    published: true,
  }
];

async function seedBlogs() {
  console.log('Clearing existing blogs...');
  const { error: deleteError } = await supabase.from('blogs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('Error clearing blogs:', deleteError);
  }

  console.log('Inserting 10 sample blogs...');
  const { data, error } = await supabase
    .from('blogs')
    .insert(sampleBlogs)
    .select();

  if (error) {
    console.error('Error inserting blogs:', error);
  } else {
    console.log(`Successfully inserted ${data.length} blogs!`);
  }
}

seedBlogs();
