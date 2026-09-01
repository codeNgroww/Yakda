-- ===================================================
-- SUB-CATEGORIES MIGRATION & SEED DATA FOR YAKDA
-- ===================================================

CREATE TABLE IF NOT EXISTS public.sub_categories (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON public.sub_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_sub_categories_slug ON public.sub_categories(slug);

ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Manage SubCategories" ON public.sub_categories;
CREATE POLICY "Public Manage SubCategories" ON public.sub_categories FOR ALL USING (true) WITH CHECK (true);

-- Insert Seed Sub-Categories (mapped to existing main category slugs: writing, paper, machines, furniture)
INSERT INTO public.sub_categories (category_id, name, slug, description)
SELECT c.id, s.name, s.slug, s.description
FROM (VALUES
  ('writing', 'Pens & Ballpoints', 'writing-pens', 'Ballpoint, rollerball, and fountain pens'),
  ('writing', 'Pencils & Lead', 'writing-pencils', 'Graphite pencils, mechanical pencils, and lead refills'),
  ('writing', 'Markers & Highlighters', 'markers', 'Permanent markers, dry erase markers, and highlighters'),
  ('writing', 'Correction & Erasers', 'basics', 'Correction tapes, liquids, and rubber erasers'),

  ('paper', 'Copy & Printing Paper', 'paper-copy', 'A4 and A3 multi-purpose printer and copy paper'),
  ('paper', 'Notebooks & Pads', 'paper-notebooks', 'Spiral notebooks, legal pads, and writing pads'),
  ('paper', 'Envelopes & Mailers', 'paper-envelopes', 'Office envelopes, padded mailers, and shipping bags'),
  ('paper', 'Files & Folders', 'binders', 'Ring binders, lever arch files, and expanding folders'),
  ('paper', 'Labels & Tapes', 'labels', 'Laser labels, shipping labels, and packaging tapes'),

  ('machines', 'Printers & Multifunction', 'machines-printers', 'Inkjet, laser, and label printers'),
  ('machines', 'Shredders & Cutters', 'machines-shredders', 'Paper shredders, trimmers, and guillotine cutters'),
  ('machines', 'Calculators', 'machines-calculators', 'Scientific, desktop, and printing calculators'),
  ('machines', 'Laminators & Binding', 'machines-binding', 'Thermal laminators and comb binding machines'),
  ('machines', 'Toner & Cartridges', 'machines-toner', 'Original and compatible ink cartridges and toner'),

  ('furniture', 'Executive & Ergonomic Chairs', 'furniture-chairs', 'Ergonomic mesh chairs and executive leather seating'),
  ('furniture', 'Desks & Workstations', 'furniture-desks', 'Standing desks, executive desks, and computer tables'),
  ('furniture', 'Boards & Easels', 'boards', 'Magnetic whiteboards, cork noticeboards, and flipchart easels'),
  ('furniture', 'Storage & Cabinets', 'storage', 'Filing cabinets, storage lockers, and shelving units')
) AS s(cat_slug, name, slug, description)
JOIN public.categories c ON c.slug = s.cat_slug
ON CONFLICT (slug) DO NOTHING;
