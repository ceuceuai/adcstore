export type Product = {
  id: string; name: string; slug: string; short_description: string | null; description: string | null;
  image_url: string | null; gallery_images: string[]; video_url: string | null; price: number; category: string | null;
  affiliate_salespage_url: string | null; internal_salespage_html: string | null; affiliate_url: string | null;
  cta_text: string; internal_cta_text: string; affiliate_salespage_cta_text: string;
  sale_mode: 'affiliate' | 'internal' | 'both'; featured: boolean; is_active: boolean; sort_order: number;
};
export type StoreSettings = {
  id:number; brand_name:string; tagline:string; logo_url:string|null; whatsapp:string|null; instagram_url:string|null;
  primary_color:string; secondary_color:string; accent_color:string; theme_preset:string;
  hero_title:string; hero_subtitle:string; footer_text:string; home_products_per_page:number;
};
export type Profile = { id:string; full_name:string|null; role:'member'|'owner'; theme_preset:string; custom_primary:string|null; custom_secondary:string|null; custom_accent:string|null };
export type BankAccount = { id:string; bank:string; account_number:string; account_name:string; enabled:boolean };
export type EWallet = { id:string; provider:string; number:string; account_name:string; enabled:boolean };
export type PaymentSettings = { id:number; banks:BankAccount[]; ewallets:EWallet[]; qris_enabled:boolean; qris_label:string; qris_image_url:string|null; instructions:string };
export type AccessButton = { id:string; label:string; url:string; style:'primary'|'secondary' };
export type ProductAccess = { id:string; product_id:string; access_type:'html'|'buttons'|'both'; html_content:string|null; buttons:AccessButton[]; is_active:boolean; updated_at?:string; products?:Pick<Product,'name'|'slug'> };
export type Order = { id:string; order_number:string; product_id:string; customer_name:string; customer_email:string; customer_whatsapp:string; amount:number; payment_method:string; status:'pending'|'paid'|'completed'|'cancelled'; payment_proof_url:string|null; notes:string|null; created_at:string; products?:Pick<Product,'name'|'slug'> };
