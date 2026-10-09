# ADCStore v1.0.31

Digital Store & Affiliate Website for ADC Members.

## Highlight v1.0.31 — Dynamic Social Media & PWA Icon Preview Fix
- Field Instagram fixed diganti sistem **Sosial Media dinamis**: Instagram, Facebook, TikTok, YouTube, Telegram, LinkedIn, X/Twitter, Website, Marketplace, atau Custom.
- Sosial media sepenuhnya optional; jika kosong tidak ditampilkan di storefront.
- CRUD sosial media + icon custom + status + urutan.
- List sosial media memiliki search, filter platform, pagination, dan page size 10/20/50.
- Instagram lama otomatis dimigrasikan ke `social_links` saat upgrade.
- Preview Icon PWA di Settings dikunci 96×96 agar file 512×512/1024×1024 tidak membesar memenuhi panel.
- Icon PWA tetap menggunakan file resolusi tinggi saat install; pembatasan 96×96 hanya untuk preview dashboard.

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
2. Jalankan `sql/INSTALL_ADCSTORE_v1.0.31.sql` sekali di SQL Editor.
3. Buat user pertama di Supabase Authentication; user pertama otomatis menjadi owner.
4. Isi ENV Vercel: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Push source ke GitHub lalu deploy ke Vercel.

## Upgrade dari v1.0.16
Jalankan `sql/UPGRADE_v1.0.16_TO_v1.0.31.sql` sekali, lalu deploy source v1.0.31.

## CSV penting
Kolom affiliate utama: `affiliate_salespage_url`, `affiliate_checkout_url`, `affiliate_cta_text`.
`gallery_images` dapat berisi beberapa URL yang dipisah `|`.
`access_buttons` harus berupa JSON array valid bila dipakai.

## Catatan
Admin/owner tetap wajib dibuat melalui Supabase Authentication. Branding, favicon, logo, homepage copy, CTA, hero, dan elemen brand UI tetap dinamis dari Settings/DB.


## v1.0.31
- Master Kategori Produk dinamis dengan CRUD, search, status filter, dan pagination (default 10).
- Form produk memakai dropdown kategori master.
- Import CSV otomatis membuat kategori yang belum ada.
- Homepage: filter kategori dinamis + sorting pengunjung (Terbaru, Terlama, Termurah, Termahal).
- Default homepage: produk terbaru lebih dulu.

## v1.0.31 — Media Library
- Media Library terpusat untuk image reusable.
- Sebelum upload baru, user bisa memilih image yang sudah pernah diupload.
- Upload baru memakai SHA-256 dedupe: file identik tidak diupload ulang.
- Media Library punya search + pagination 20/40/80 per halaman.
- Semua modul utama image memakai picker yang sama: produk, kategori, banner, QRIS, logo, favicon, hero, floating WhatsApp, PWA icon, dan social icon.
- Aset lama didaftarkan otomatis ke Media Library lewat SQL upgrade.
- Delete media diblok jika image masih dipakai modul lain.
- Upgrade langsung dari v1.0.17 ke v1.0.31 tersedia karena v1.0.18 belum perlu dideploy.

## v1.0.31 — Permission Audit / Banner Hotfix
- Fix `permission denied for table homepage_banners`.
- Audit explicit PostgREST GRANT untuk seluruh tabel utama; RLS tetap menjadi lapisan otorisasi.
- Public storefront mendapat read grant yang diperlukan.
- Public checkout mendapat insert grant order.
- Admin/authenticated mendapat table privileges yang diperlukan, lalu dibatasi kembali oleh RLS.
- Tersedia upgrade langsung v1.0.17 -> v1.0.31 agar v1.0.18/v1.0.19 bisa dilewati.
- Tersedia `HOTFIX_BANNER_PERMISSION_v1.0.31.sql` bila hanya ingin memperbaiki database yang sedang live dulu.


## v1.0.31 — Safe Live Hotfix
- Memperbaiki paket hotfix untuk user yang database-nya masih v1.0.17.
- `HOTFIX_CURRENT_v1.0.17_BANNER_PERMISSION_v1.0.31.sql` hanya menyentuh `homepage_banners` sehingga tidak gagal karena tabel fitur v1.0.18/v1.0.19 belum dibuat.
- Untuk upgrade penuh dari v1.0.17 langsung ke versi terbaru gunakan `UPGRADE_v1.0.17_TO_v1.0.31.sql`.


## IMPORTANT - ONE SHOT UPGRADE FROM v1.0.17
If your live ADCStore database is still v1.0.17, run ONLY:
`sql/UPGRADE_v1.0.17_TO_v1.0.31_ONE_SHOT.sql`

That single SQL includes:
- category master
- homepage sorting/filter prerequisites
- media library
- permission audit
- banner permission fix
- final verification

Do not run separate hotfix SQL first.

## v1.0.31 — Hybrid Product Storefront
- Product image standard: square 1:1, recommended 1080×1080 px.
- Product/gallery images use `object-fit: contain` so artwork is not cropped.
- Homepage product cards show at most 2 CTA: Salespage + Checkout.
- Homepage Salespage priority: Affiliate/Official Salespage -> Internal Salespage.
- Homepage Checkout priority: Official/Affiliate Checkout -> Internal ADCStore Checkout.
- Product detail shows every available hybrid route independently: Official Salespage, Internal Salespage, Official Checkout, Internal Checkout.
- Missing routes are simply hidden; no dead-button warning.
- Product detail adds related/recommended products, prioritizing the same category.
- Related products use square image cards, 4 desktop / 2 mobile.

## v1.0.31 — Dynamic Homepage CTA Source
- Setiap produk bisa memilih sumber tombol Salespage di homepage: Auto, Affiliate/Official, Internal, atau Hidden.
- Setiap produk bisa memilih sumber tombol Checkout di homepage: Auto, Affiliate/Official, Internal, atau Hidden.
- Homepage tetap maksimal 2 tombol: Salespage + Checkout.
- Jika sumber yang dipilih belum tersedia, tombol disembunyikan otomatis.
- Detail produk tetap menampilkan semua jalur hybrid yang memang terisi.
- Export/Import CSV membawa dua field baru agar master katalog bisa didistribusikan konsisten.

## v1.0.31 FINAL — Product Card Cleanup & Demo Hybrid Examples
- Hardcoded decorative icons `✦`, `♥`, `↗` removed from homepage product cards.
- Dynamic category label now appears as the badge at the top-right of each product image.
- Duplicate category badge below the image removed.
- Fresh installer demo data now demonstrates 3 real flows:
  - Product 01: Internal Salespage + Internal Checkout.
  - Product 02: Affiliate/Official Salespage + Affiliate/Official Checkout (example.com placeholder URLs).
  - Product 03: Hybrid Official + Internal flow.
- Upgrade SQL only modifies exact untouched demo slugs; real edited products are not overwritten.
- Image product standard remains square 1:1, recommended 1080×1080 px.

## v1.0.31 — Theme-Synced Homepage CTA
- Homepage Salespage and Checkout buttons now derive colors from the selected theme variables.
- Checkout uses the active Primary/Secondary theme palette.
- Salespage uses the active Secondary/Accent palette.
- No fixed purple CTA colors are used on homepage product cards.
- Custom Primary / Secondary / Accent colors also update these CTA buttons automatically.

## v1.0.31
- Floating WhatsApp target can be phone number or direct WhatsApp URL.
- URL can point to WhatsApp Group, Channel, Community, or another WhatsApp destination.
- Mobile mode can be floating above the bottom navbar or appear as the fifth navbar item.
- Default mobile floating mode sits above the navbar so the icon never overlaps the menu.

## v1.0.31 FINAL — Analytics & Tracking
- Internal analytics works even when no ads/pixels are configured.
- Dashboard analytics: page views, unique anonymous sessions, product views, salespage clicks, checkout clicks, WhatsApp clicks, banner clicks, CTR, top products, and event log.
- Time range: 7 / 30 / 90 days.
- Event log includes search, filter, pagination (10/20/50).
- Anonymous session ID only; no raw visitor name/email/phone/IP is stored for analytics.
- UTM source/medium/campaign and referrer are captured when available.
- Optional providers: Meta Pixel, TikTok Pixel, GA4, Google Tag Manager.
- All external tracking providers are OFF by default and configured from Settings/DB (no hardcode).

## v1.0.31 — Modern Confirmation + Bulk Product Actions
- Browser-native confirm/alert dialogs removed from admin delete flows.
- All delete confirmations now use centered 3D modal dialogs consistent with Settings save feedback.
- Products support per-item checkbox selection.
- Select current page or all products in current filter.
- Bulk delete selected products with one centered confirmation.
- Category delete dependency notice uses custom modal instead of browser alert.
- Media, Product Access, Banner, Category, and Product delete flows use custom modal confirmation.

## v1.0.31 HOTFIX
- Fixed Vercel TypeScript build error on `app/page.tsx`: missing `trackEvent` import.
- Homepage Salespage/Checkout analytics event tracking remains active.
- No database migration is required.

## v1.0.31 HOTFIX
- Fixed global Next.js prerender failure caused by useSearchParams() in AnalyticsTracker.
- Internal analytics still captures UTM parameters inside the browser event helper, without useSearchParams().
- No database schema change.
