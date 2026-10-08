export interface CategoryDefinition {
  slug: string;
  name: string;
  icon: string;
  aliases: string[];
}

export const STANDARD_CATEGORIES: CategoryDefinition[] = [
  { slug: 'all', name: 'All Categories', icon: 'border_all', aliases: ['all', 'all categories', 'all items'] },
  { slug: 'writing', name: 'Writing & Pens', icon: 'edit_note', aliases: ['writing', 'writing & pens', 'writing-pens', 'writing_pens', 'writing supplies', 'pens', 'pens & ballpoints'] },
  { slug: 'paper', name: 'Paper & Envelopes', icon: 'description', aliases: ['paper', 'paper & envelopes', 'paper-envelopes', 'paper_envelopes', 'office paper products', 'office paper', 'copy & printing paper'] },
  { slug: 'machines', name: 'Office Machines', icon: 'print', aliases: ['machines', 'office machines', 'office-machines', 'office_machines', 'office machines & tech'] },
  { slug: 'furniture', name: 'Executive Furniture', icon: 'desk', aliases: ['furniture', 'executive furniture', 'executive-furniture', 'executive_furniture'] },
  { slug: 'eco', name: 'Eco Friendly Picks', icon: 'eco', aliases: ['eco', 'eco-friendly', 'eco friendly', 'eco-friendly-picks', 'eco friendly picks'] },
  { slug: 'kawaii', name: 'Kawaii Stationery', icon: 'favorite', aliases: ['kawaii', 'kawaii stationery', 'kawaii-stationery', 'kawaii_stationery'] },
  { slug: 'books', name: 'Books & Novels', icon: 'menu_book', aliases: ['books', 'books & novels', 'books-novels', 'books_novels'] },
  { slug: 'toys', name: 'Toys & Games', icon: 'toys', aliases: ['toys', 'toys & games', 'toys-games', 'toys_games'] },
  { slug: 'crafts', name: 'Arts & Crafts', icon: 'palette', aliases: ['crafts', 'arts & crafts', 'school & crafts', 'arts-crafts', 'school-crafts', 'arts_crafts'] },
  { slug: 'labels', name: 'Labels & Tapes', icon: 'label', aliases: ['labels', 'labels & tapes', 'labels-tapes', 'labels_tapes'] },
  { slug: 'binders', name: 'Binders & Filing', icon: 'folder_open', aliases: ['binders', 'binders & filing', 'binders-filing', 'binders_filing'] },
  { slug: 'basics', name: 'Office Supplies', icon: 'inventory_2', aliases: ['basics', 'office supplies', 'office-supplies', 'office_supplies', 'office basics'] },
  { slug: 'boards', name: 'Boards & Easels', icon: 'dashboard', aliases: ['boards', 'boards & easels', 'boards-easels', 'boards_easels', 'boards & displays'] },
  { slug: 'storage', name: 'Storage Solutions', icon: 'inventory', aliases: ['storage', 'storage solutions', 'storage-solutions', 'storage_solutions'] },
  { slug: 'shipping', name: 'Mailing & Shipping', icon: 'local_shipping', aliases: ['shipping', 'mailing & shipping', 'mailing-shipping', 'mailing_shipping'] },
  { slug: 'print-copy', name: 'Print Room', icon: 'file_copy', aliases: ['print-copy', 'print-room', 'print room', 'print_room', 'printroom', 'print room & services', 'print-copy-room'] },
  { slug: 'computers', name: 'Computers & Tech', icon: 'laptop_mac', aliases: ['computers', 'computers & tech', 'computers-tech', 'computers_tech'] },
];

export function normalizeCategorySlug(inputCat: string): string {
  if (!inputCat) return 'writing';
  const clean = inputCat.trim().toLowerCase();
  
  for (const catDef of STANDARD_CATEGORIES) {
    if (catDef.slug === clean) return catDef.slug;
    if (catDef.aliases.some(a => a.toLowerCase() === clean)) {
      return catDef.slug;
    }
  }
  
  return clean.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export function getCategoryAliases(slug: string): string[] {
  const norm = normalizeCategorySlug(slug);
  const def = STANDARD_CATEGORIES.find(c => c.slug === norm);
  if (def) {
    return Array.from(new Set([norm, def.slug, def.name.toLowerCase(), ...def.aliases]));
  }
  return [slug];
}

export function isCategoryMatch(productCat: string, targetSlug: string): boolean {
  if (!targetSlug || targetSlug === 'all') return true;
  const prodNorm = normalizeCategorySlug(productCat);
  const targetNorm = normalizeCategorySlug(targetSlug);
  return prodNorm === targetNorm;
}
