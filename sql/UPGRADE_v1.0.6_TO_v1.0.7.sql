-- ADCStore v1.0.6 -> v1.0.7
-- Tambahan salespage + CTA internal/official. Aman dijalankan satu kali.

alter table public.products add column if not exists affiliate_salespage_url text;
alter table public.products add column if not exists internal_salespage_html text;
alter table public.products add column if not exists internal_cta_text text not null default 'Checkout di Website';
alter table public.products add column if not exists affiliate_salespage_cta_text text not null default 'Lihat Salespage Official';

update public.products set cta_text='Beli di Official Website' where cta_text is null or btrim(cta_text)='';
