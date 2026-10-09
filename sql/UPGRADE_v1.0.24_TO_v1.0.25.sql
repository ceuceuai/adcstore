-- ADCStore v1.0.24 -> v1.0.25 FINAL
-- Tidak ada perubahan schema database.
-- Hanya memperbaiki tampilan category badge dan membuat data DEMO bawaan lebih informatif.
-- UPDATE di bawah HANYA menyentuh slug demo bawaan jika deskripsinya masih template.

update public.products
set
  internal_salespage_html = '<section style="padding:24px"><h2>Demo Salespage Internal</h2><p>Ini contoh salespage internal ADCStore. Edit HTML ini dari dashboard produk.</p></section>',
  affiliate_salespage_url = null,
  affiliate_url = null,
  sale_mode = 'internal',
  homepage_salespage_source = 'internal',
  homepage_checkout_source = 'internal',
  internal_cta_text = 'Checkout di Website Ini'
where slug='produk-adc-01'
  and short_description like 'Template produk pertama.%';

update public.products
set
  affiliate_salespage_url = 'https://example.com/adc-salespage-demo',
  affiliate_url = 'https://example.com/adc-checkout-demo',
  internal_salespage_html = null,
  sale_mode = 'affiliate',
  homepage_salespage_source = 'affiliate',
  homepage_checkout_source = 'affiliate',
  affiliate_salespage_cta_text = 'Salespage Official',
  cta_text = 'Checkout Official'
where slug='produk-adc-02'
  and short_description like 'Template produk kedua.%';

update public.products
set
  affiliate_salespage_url = 'https://example.com/adc-salespage-demo',
  affiliate_url = 'https://example.com/adc-checkout-demo',
  internal_salespage_html = '<section style="padding:24px"><h2>Demo Salespage Internal Hybrid</h2><p>Produk ini mempunyai jalur official dan internal sekaligus.</p></section>',
  sale_mode = 'both',
  homepage_salespage_source = 'affiliate',
  homepage_checkout_source = 'internal',
  affiliate_salespage_cta_text = 'Salespage Official',
  cta_text = 'Checkout Official',
  internal_cta_text = 'Checkout di Website Ini'
where slug='produk-adc-03'
  and short_description like 'Template produk ketiga%';

select 'ADCStore v1.0.25 upgrade complete' as status;
