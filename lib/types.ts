export type Product = {
  id: string; name: string; slug: string; short_description: string | null; description: string | null;
  image_url: string | null; gallery_images: string[]; video_url: string | null; price: number; compare_at_price: number; show_discount_badge: boolean; discount_badge_text: string | null; category: string | null;
  affiliate_salespage_url: string | null; internal_salespage_html: string | null; affiliate_url: string | null;
  cta_text: string; internal_cta_text: string; affiliate_salespage_cta_text: string;
  sale_mode: 'affiliate' | 'internal' | 'both'; homepage_salespage_source:'auto'|'affiliate'|'internal'|'hidden'; homepage_checkout_source:'auto'|'affiliate'|'internal'|'hidden'; featured: boolean; is_active: boolean; sort_order: number; created_at?: string; updated_at?: string;
};
export type StoreSettings = {
  id:number; brand_name:string; tagline:string; logo_url:string|null; favicon_url?:string|null; whatsapp:string|null; instagram_url?:string|null;
  primary_color:string; secondary_color:string; accent_color:string; theme_preset:string;
  hero_badge:string; hero_title:string; hero_subtitle:string;
  hero_primary_cta_text:string; hero_member_cta_text:string; hero_member_cta_enabled:boolean;
  hero_trust_1:string; hero_trust_2:string; hero_trust_3:string;
  hero_visual_mode:'default'|'upload'|'url'|'none'; hero_image_url:string|null; hero_image_position:'left'|'right'; hero_image_fit:'contain'|'cover'; hero_image_alt:string;
  catalog_eyebrow:string; catalog_title:string; catalog_subtitle:string;
  floating_wa_enabled:boolean; floating_wa_number:string|null; floating_wa_target_type?:'number'|'url'; floating_wa_target_url?:string|null; floating_wa_mobile_mode?:'above_nav'|'nav_item'; floating_wa_message:string; floating_wa_position:'left'|'right'; floating_wa_style:'3d'|'round'|'custom'; floating_wa_icon_url:string|null; floating_wa_tooltip:string; floating_wa_show_on:'all'|'home'|'product';
  footer_text:string; home_products_per_page:number; pwa_name:string; pwa_short_name:string; pwa_icon_url:string|null;
  member_login_label?:string; member_login_heading?:string; member_login_description?:string; member_signup_heading?:string; member_signup_description?:string;
  owner_login_label?:string; owner_login_heading?:string; owner_login_description?:string; admin_console_label?:string;
};
export type Profile = { id:string; full_name:string|null; role:'member'|'owner'; theme_preset:string; custom_primary:string|null; custom_secondary:string|null; custom_accent:string|null };
export type BankAccount = { id:string; bank:string; account_number:string; account_name:string; enabled:boolean };
export type EWallet = { id:string; provider:string; number:string; account_name:string; enabled:boolean };
export type PaymentSettings = { id:number; banks:BankAccount[]; ewallets:EWallet[]; qris_enabled:boolean; qris_label:string; qris_image_url:string|null; instructions:string };
export type AccessButton = { id:string; label:string; url:string; style:'primary'|'secondary' };
export type ProductAccess = { id:string; product_id:string; access_type:'html'|'buttons'|'both'; html_content:string|null; buttons:AccessButton[]; is_active:boolean; updated_at?:string; products?:Pick<Product,'name'|'slug'> };
export type Order = { id:string; order_number:string; product_id:string; customer_name:string; customer_email:string; customer_whatsapp:string; amount:number; payment_method:string; status:'pending'|'paid'|'completed'|'cancelled'; payment_proof_url:string|null; notes:string|null; created_at:string; products?:Pick<Product,'name'|'slug'> };

export type HomeBanner = { id:string; title:string|null; desktop_image_url:string; mobile_image_url:string|null; target_url:string|null; cta_text:string|null; is_active:boolean; sort_order:number; created_at?:string; updated_at?:string };

export type SocialLink = { id:string; platform:string; label:string; url:string; icon_url:string|null; is_active:boolean; sort_order:number; created_at?:string; updated_at?:string };

export type ProductCategory = { id:string; name:string; slug:string; description:string|null; image_url:string|null; is_active:boolean; sort_order:number; created_at?:string; updated_at?:string };

export type MediaAsset = {
  id:string;
  file_name:string;
  storage_path:string|null;
  public_url:string;
  mime_type:string|null;
  size_bytes:number|null;
  sha256:string|null;
  source:'upload'|'legacy'|string;
  created_at:string;
  uploaded_by?:string|null;
};
