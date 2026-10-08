# ADCStore v1.0.16

Digital Store & Affiliate Website for ADC Members.

## Highlight v1.0.16 — Settings Save Fix & Transparent Branding
- Fix tombol **Simpan Pengaturan** yang gagal karena permission `store_settings`.
- Simpan settings sekarang memakai UPDATE row `id=1`, bukan UPSERT yang tidak diperlukan.
- Tambahan SQL privilege eksplisit + RLS owner tetap aktif.
- Success/error menggunakan modal popup di tengah.
- Logo brand, logo login, sidebar owner, navbar, member area, serta preview PWA mempertahankan background transparan dari file asli.
- Fitur CSV Catalog Distribution v1.0.15 tetap dipertahankan.

## Highlight v1.0.15 — CSV Catalog Distribution
- Import produk massal dari CSV dengan Preview + Validasi sebelum masuk database.
- Export semua produk atau hanya hasil filter/search.
- Download template `ADCStore-PRODUCT-IMPORT-TEMPLATE.csv` langsung dari dashboard.
- Link affiliate bisa diedit massal di Excel / Google Sheets sebelum CSV diimport.
- Duplicate slug: pilih **Update existing** atau **Skip existing**.
- Preview import 10 baris per halaman dengan status New / Update / Skip / Error.
- Multi-image CSV memakai pemisah `|`.
- Optional product access ikut CSV melalui `access_type`, `access_html`, dan `access_buttons` (JSON array).
- Seluruh fitur v1.0.14 tetap dipertahankan.

## Fresh Install
1. Buat project Supabase.
2. Jalankan `sql/INSTALL_ADCSTORE_v1.0.16.sql` sekali di SQL Editor.
3. Buat user pertama di Supabase Authentication; user pertama otomatis menjadi owner.
4. Isi ENV Vercel: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Push source ke GitHub lalu deploy ke Vercel.

## Upgrade dari v1.0.15
Jalankan `sql/UPGRADE_v1.0.15_TO_v1.0.16.sql` sekali, lalu deploy source v1.0.16.

## CSV penting
Kolom affiliate utama: `affiliate_salespage_url`, `affiliate_checkout_url`, `affiliate_cta_text`.
`gallery_images` dapat berisi beberapa URL yang dipisah `|`.
`access_buttons` harus berupa JSON array valid bila dipakai.

## Catatan
Admin/owner tetap wajib dibuat melalui Supabase Authentication. Branding, favicon, logo, homepage copy, CTA, hero, dan elemen brand UI tetap dinamis dari Settings/DB.
