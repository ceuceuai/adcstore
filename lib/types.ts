export type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  price: number;
  category: string | null;
  affiliate_url: string | null;
  cta_text: string;
  sale_mode: 'affiliate' | 'internal' | 'both';
  featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type StoreSettings = {
  id: number;
  brand_name: string;
  tagline: string;
  logo_url: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  primary_color: string;
  hero_title: string;
  hero_subtitle: string;
  footer_text: string;
};
