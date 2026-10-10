# ADCStore v1.0.51

Digital Store & Affiliate Website for ADC Members.

## Highlight v1.0.51 — Dynamic Social Media & PWA Icon Preview Fix
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
2. Jalankan `sql/INSTALL_ADCSTORE_v1.0.51.sql` sekali di SQL Editor.
3. Buat user pertama di Supabase Authentication; user pertama otomatis menjadi owner.
4. Isi ENV Vercel: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Push source ke GitHub lalu deploy ke Vercel.

## Upgrade dari v1.0.16
Jalankan `sql/UPGRADE_v1.0.16_TO_v1.0.51.sql` sekali, lalu deploy source v1.0.51.

## CSV penting
Kolom affiliate utama: `affiliate_salespage_url`, `affiliate_checkout_url`, `affiliate_cta_text`.
`gallery_images` dapat berisi beberapa URL yang dipisah `|`.
`access_buttons` harus berupa JSON array valid bila dipakai.

## Catatan
Admin/owner tetap wajib dibuat melalui Supabase Authentication. Branding, favicon, logo, homepage copy, CTA, hero, dan elemen brand UI tetap dinamis dari Settings/DB.


## v1.0.51
- Master Kategori Produk dinamis dengan CRUD, search, status filter, dan pagination (default 10).
- Form produk memakai dropdown kategori master.
- Import CSV otomatis membuat kategori yang belum ada.
- Homepage: filter kategori dinamis + sorting pengunjung (Terbaru, Terlama, Termurah, Termahal).
- Default homepage: produk terbaru lebih dulu.

## v1.0.51 — Media Library
- Media Library terpusat untuk image reusable.
- Sebelum upload baru, user bisa memilih image yang sudah pernah diupload.
- Upload baru memakai SHA-256 dedupe: file identik tidak diupload ulang.
- Media Library punya search + pagination 20/40/80 per halaman.
- Semua modul utama image memakai picker yang sama: produk, kategori, banner, QRIS, logo, favicon, hero, floating WhatsApp, PWA icon, dan social icon.
- Aset lama didaftarkan otomatis ke Media Library lewat SQL upgrade.
- Delete media diblok jika image masih dipakai modul lain.
- Upgrade langsung dari v1.0.17 ke v1.0.51 tersedia karena v1.0.18 belum perlu dideploy.

## v1.0.51 — Permission Audit / Banner Hotfix
- Fix `permission denied for table homepage_banners`.
- Audit explicit PostgREST GRANT untuk seluruh tabel utama; RLS tetap menjadi lapisan otorisasi.
- Public storefront mendapat read grant yang diperlukan.
- Public checkout mendapat insert grant order.
- Admin/authenticated mendapat table privileges yang diperlukan, lalu dibatasi kembali oleh RLS.
- Tersedia upgrade langsung v1.0.17 -> v1.0.51 agar v1.0.18/v1.0.19 bisa dilewati.
- Tersedia `HOTFIX_BANNER_PERMISSION_v1.0.51.sql` bila hanya ingin memperbaiki database yang sedang live dulu.


## v1.0.51 — Safe Live Hotfix
- Memperbaiki paket hotfix untuk user yang database-nya masih v1.0.17.
- `HOTFIX_CURRENT_v1.0.17_BANNER_PERMISSION_v1.0.51.sql` hanya menyentuh `homepage_banners` sehingga tidak gagal karena tabel fitur v1.0.18/v1.0.19 belum dibuat.
- Untuk upgrade penuh dari v1.0.17 langsung ke versi terbaru gunakan `UPGRADE_v1.0.17_TO_v1.0.51.sql`.


## IMPORTANT - ONE SHOT UPGRADE FROM v1.0.17
If your live ADCStore database is still v1.0.17, run ONLY:
`sql/UPGRADE_v1.0.17_TO_v1.0.51_ONE_SHOT.sql`

That single SQL includes:
- category master
- homepage sorting/filter prerequisites
- media library
- permission audit
- banner permission fix
- final verification

Do not run separate hotfix SQL first.

## v1.0.51 — Hybrid Product Storefront
- Product image standard: square 1:1, recommended 1080×1080 px.
- Product/gallery images use `object-fit: contain` so artwork is not cropped.
- Homepage product cards show at most 2 CTA: Salespage + Checkout.
- Homepage Salespage priority: Affiliate/Official Salespage -> Internal Salespage.
- Homepage Checkout priority: Official/Affiliate Checkout -> Internal ADCStore Checkout.
- Product detail shows every available hybrid route independently: Official Salespage, Internal Salespage, Official Checkout, Internal Checkout.
- Missing routes are simply hidden; no dead-button warning.
- Product detail adds related/recommended products, prioritizing the same category.
- Related products use square image cards, 4 desktop / 2 mobile.

## v1.0.51 — Dynamic Homepage CTA Source
- Setiap produk bisa memilih sumber tombol Salespage di homepage: Auto, Affiliate/Official, Internal, atau Hidden.
- Setiap produk bisa memilih sumber tombol Checkout di homepage: Auto, Affiliate/Official, Internal, atau Hidden.
- Homepage tetap maksimal 2 tombol: Salespage + Checkout.
- Jika sumber yang dipilih belum tersedia, tombol disembunyikan otomatis.
- Detail produk tetap menampilkan semua jalur hybrid yang memang terisi.
- Export/Import CSV membawa dua field baru agar master katalog bisa didistribusikan konsisten.

## v1.0.51 FINAL — Product Card Cleanup & Demo Hybrid Examples
- Hardcoded decorative icons `✦`, `♥`, `↗` removed from homepage product cards.
- Dynamic category label now appears as the badge at the top-right of each product image.
- Duplicate category badge below the image removed.
- Fresh installer demo data now demonstrates 3 real flows:
  - Product 01: Internal Salespage + Internal Checkout.
  - Product 02: Affiliate/Official Salespage + Affiliate/Official Checkout (example.com placeholder URLs).
  - Product 03: Hybrid Official + Internal flow.
- Upgrade SQL only modifies exact untouched demo slugs; real edited products are not overwritten.
- Image product standard remains square 1:1, recommended 1080×1080 px.

## v1.0.51 — Theme-Synced Homepage CTA
- Homepage Salespage and Checkout buttons now derive colors from the selected theme variables.
- Checkout uses the active Primary/Secondary theme palette.
- Salespage uses the active Secondary/Accent palette.
- No fixed purple CTA colors are used on homepage product cards.
- Custom Primary / Secondary / Accent colors also update these CTA buttons automatically.

## v1.0.51
- Floating WhatsApp target can be phone number or direct WhatsApp URL.
- URL can point to WhatsApp Group, Channel, Community, or another WhatsApp destination.
- Mobile mode can be floating above the bottom navbar or appear as the fifth navbar item.
- Default mobile floating mode sits above the navbar so the icon never overlaps the menu.

## v1.0.51 FINAL — Analytics & Tracking
- Internal analytics works even when no ads/pixels are configured.
- Dashboard analytics: page views, unique anonymous sessions, product views, salespage clicks, checkout clicks, WhatsApp clicks, banner clicks, CTR, top products, and event log.
- Time range: 7 / 30 / 90 days.
- Event log includes search, filter, pagination (10/20/50).
- Anonymous session ID only; no raw visitor name/email/phone/IP is stored for analytics.
- UTM source/medium/campaign and referrer are captured when available.
- Optional providers: Meta Pixel, TikTok Pixel, GA4, Google Tag Manager.
- All external tracking providers are OFF by default and configured from Settings/DB (no hardcode).

## v1.0.51 — Modern Confirmation + Bulk Product Actions
- Browser-native confirm/alert dialogs removed from admin delete flows.
- All delete confirmations now use centered 3D modal dialogs consistent with Settings save feedback.
- Products support per-item checkbox selection.
- Select current page or all products in current filter.
- Bulk delete selected products with one centered confirmation.
- Category delete dependency notice uses custom modal instead of browser alert.
- Media, Product Access, Banner, Category, and Product delete flows use custom modal confirmation.

## v1.0.51 HOTFIX
- Fixed Vercel TypeScript build error on `app/page.tsx`: missing `trackEvent` import.
- Homepage Salespage/Checkout analytics event tracking remains active.
- No database migration is required.

## v1.0.51 HOTFIX
- Fixed global Next.js prerender failure caused by useSearchParams() in AnalyticsTracker.
- Internal analytics still captures UTM parameters inside the browser event helper, without useSearchParams().
- No database schema change.

## v1.0.51 — Category Management Final Fix
- Category Edit modal now uses the same centered 3D modal system as the rest of admin.
- Fixed category Edit action that previously used obsolete/unavailable modal CSS classes.
- Checkbox per category.
- Select current page or all categories in current filter.
- Bulk delete selected categories.
- Deletion is blocked when a category is still used by products, with a centered information modal.
- Single and bulk delete use the same custom confirmation modal; no browser-native confirm.

## v1.0.51 — Category JSX Syntax Fix
- Fixed missing closing brace in category delete button onClick handler.
- No database schema change.

## v1.0.51 — Dynamic Member & Owner Login Visual
- Removed the fixed ThreeDArt illustration from Member and Owner login pages.
- Member login visual and Owner login visual can be configured separately.
- Per login page: use Brand Logo, Custom Image from Media Library/URL, or No Visual.
- Fresh default uses the dynamic Brand Logo, not a hardcoded illustration.
- Custom transparent PNG/WebP is supported.

## v1.0.51 — Dynamic Promo / Exclusive Homepage Section
- New homepage special-products section below Slide Banner and above full product catalog.
- Product can be marked: None, Promo, Exclusive, or Custom Label.
- Custom label supports labels such as Best Seller, Hot, Limited, etc.
- Special section automatically shows maximum 8 active products.
- If more than 8 are marked, the lowest Highlight Sort Order wins.
- Responsive centered grid stays balanced with 1, 2, 3, or up to 8 products.
- Section title, eyebrow, subtitle, and ON/OFF are editable in Settings.
- If no product is marked, the section automatically disappears.
- CSV import/export supports highlight_type, highlight_label, and highlight_sort_order.

## v1.0.51 — Featured Cleanup
- Legacy `Featured` checkbox removed from Product form.
- Legacy `featured` column removed from fresh database schema and upgrade.
- Featured removed from CSV import/export/template.
- Admin dashboard no longer queries the legacy featured field.
- Homepage highlighting now has one clear system only: Promo / Exclusive / Custom Label with Highlight Sort Order.

## v1.0.51 — Professional Analytics UI
- Analytics redesigned from scratch into a compact professional dashboard.
- 7 KPI cards with icons and clear hierarchy.
- Traffic chart uses compact bar visualization with daily totals.
- Quick Insight panel: checkout CTR, salespage CTR, WhatsApp clicks, average daily views.
- Top Products and Traffic Source sections.
- Event Log redesigned into a clean responsive data table.
- 7/30/90-day period selector integrated into page header.
- Mobile/tablet responsive layouts.
- No database schema changes.

## v1.0.51 — Dynamic Owner Dashboard Hero
- Owner dashboard badge, title, and description are editable from Settings.
- Dashboard hero visual can use Brand Logo, Custom Image, or be hidden.
- Custom dashboard image can be selected from Media Library or entered by URL.
- Brand logo keeps transparent background; no forced background is added.
- If Brand Logo is empty, dashboard uses a dynamic brand-initial fallback instead of a hardcoded ADC graphic.

## v1.0.51 — Payment Save Hardening
- Payment save flow rewritten to use explicit UPDATE by id=1, then re-read the saved row from Supabase.
- Save button has explicit `type=button`, loading state, error handling, and verified success modal.
- Added second sticky Save Payment action at bottom for long pages.
- Active bank/e-wallet validation prevents incomplete payment methods from being saved.
- QRIS enabled without an image is blocked with a clear custom error modal.
- Bank/e-wallet removal now uses centered custom confirmation instead of immediate destructive action.
- No browser-native confirm/alert calls remain in admin source.

## v1.0.51 — Full UI Action QA Hardening
- Explicit button type on every button to prevent accidental form submission/non-response ambiguity.
- Social media delete confirmation added.
- Order status confirmation added.
- Banner delete error handling improved.
- Settings save now verifies persisted database data before success.
- Full static route/button/action audit documented in QA-REPORT-v1.0.51.txt.

## v1.0.51 — Product Image URL Fix
- URL pasted into `Tambah URL Image Address` is automatically processed when `Simpan Produk` is clicked, even if `Tambah Image URL` was not pressed.
- Direct image URL is validated before being accepted.
- Invalid/private/page URLs show a clear message instead of silently leaving the product without an image.
- The first valid URL becomes the product cover when no cover exists.
- Pressing Enter also adds the URL.
- Added live URL preview and validation status.
- No database schema changes.

## v1.0.51 — Multi-Product Checkout + WhatsApp Confirmation
- Internal checkout no longer uses hardcoded ADC artwork; it displays each product's real image.
- If a product image is empty, checkout uses a dynamic initial fallback.
- Customer can add multiple internal-checkout products into one order.
- Total is calculated automatically across all selected products.
- New `order_items` table stores each product in a multi-product order.
- Admin Order page shows all products contained in each order.
- Member Access supports all products from a paid/completed multi-product order.
- After an order is successfully created, customer is automatically redirected to the store's registered WhatsApp number.
- WhatsApp message is prefilled with order number, buyer name, item list, total, payment method, and request to send payment proof.
- Uses Store Settings `whatsapp`, with `floating_wa_number` as fallback.

## v1.0.51 — Flexible Post-Checkout Redirect
- Owner can choose what happens after a successful internal checkout:
  - Redirect to Store WhatsApp with prefilled order confirmation.
  - Redirect to a custom URL / Thank You Page.
  - Stay on the success page without automatic redirect.
- Custom URL is configured in Settings and can point to a thank-you page, membership page, form, channel, or other destination.
- For custom URL redirects, `order` and `total` are appended as query parameters.
- This package includes the v1.0.42 multi-product checkout features.
- Because the current deployment is still v1.0.41, use the included one-shot `UPGRADE_v1.0.41_TO_v1.0.51.sql`. Do not install v1.0.42 first.

## v1.0.51 — Mobile Homepage Compact Grid + Full Banner
- Homepage product catalog uses a 2-column grid on mobile instead of one large card per row.
- Promo / Exclusive section also stays 2 columns on mobile, including phones <= 420px.
- Mobile product cards are compacted: smaller typography, padding, badges, prices, and CTA buttons.
- Slide Banner no longer forces `object-fit: cover` or a fixed mobile aspect ratio.
- Desktop and mobile banner images are displayed at their real aspect ratio with `object-fit: contain`, so the artwork is not cropped.
- This package still includes the v1.0.42/v1.0.43 database features.
- Since the current live deployment is still v1.0.41, use only `UPGRADE_v1.0.41_TO_v1.0.51.sql`.

## v1.0.51 — Store Settings Schema Repair
- Fixes `Could not find the 'ga4_enabled' column of 'store_settings' in the schema cache`.
- One-shot upgrade now repairs every `store_settings` column expected by the current frontend using `ADD COLUMN IF NOT EXISTS`.
- Also fixes a fresh-installer mismatch where `floating_wa_target_type`, `floating_wa_target_url`, and `floating_wa_mobile_mode` were used by the frontend but missing from the SQL schema.
- PostgREST schema cache is explicitly reloaded with `NOTIFY pgrst, 'reload schema'`.
- Settings page now shows a clear database-sync message if schema drift is detected.
- Since the live database is still based on the older upgrade path, use only `UPGRADE_v1.0.41_TO_v1.0.51.sql`.

## v1.0.51 — Standalone Internal Salespage
- Internal Salespage HTML no longer renders inside Product Detail.
- New standalone public route: `/salespage/[slug]`.
- The stored HTML is served as a full HTML document, preserving its own layout/CSS instead of being squeezed inside the ADCStore product-detail container.
- Homepage Salespage CTA opens the standalone internal salespage in a new tab.
- When a product has an Internal Salespage, clicking its homepage image/title also opens that standalone salespage in a new tab.
- Product Detail still exists for products without an Internal Salespage.
- Internal Salespage buttons from Product Detail also open the standalone page in a new tab.
- No database schema changes.

## v1.0.51 — Homepage Navigation Refinement
- Homepage product image always opens Product Detail.
- Homepage product name always opens Product Detail.
- Only the Internal Salespage button opens `/salespage/[slug]` in a new tab.
- Related-product image, name, and `Lihat Produk` also return to Product Detail.
- Standalone Internal Salespage remains available and still opens in a new tab from the dedicated Salespage button.
- No database schema changes.

## v1.0.51 — Analytics Repair + Near-Realtime Refresh
- Analytics dashboard refreshes automatically every 5 seconds.
- Added LIVE indicator and last-updated time.
- Database read errors are now visible in the Analytics page instead of silently showing all zeros.
- `trackEvent()` now checks Supabase insert errors and logs a useful browser-console diagnostic instead of silently swallowing failures.
- Banner target clicks now record `banner_click`.
- Added one required database repair file: `sql/REPAIR_ANALYTICS_REQUIRED.sql`.
- The repair creates/repairs `analytics_events`, indexes, grants, RLS insert/read policies, and reloads PostgREST schema cache.

## v1.0.51 — Homepage Product Card Alignment
- Product short descriptions are clamped to exactly 2 visible lines.
- Longer descriptions end visually with CSS ellipsis behavior.
- Product cards use equal-height flex layout.
- Price area is pushed consistently to the bottom of each card body.
- Salespage / Checkout button rows line up across neighboring cards.
- Applies to both the normal catalog grid and Promo / Exclusive section.
- No database schema changes. No upgrade SQL required.

## v1.0.51 — Balanced Promo / Exclusive Grid
- Promo / Exclusive homepage section now uses count-aware desktop columns.
- 1 product: centered.
- 2 products: centered pair.
- 3 products: exactly 3 equal columns.
- 4 products: exactly 4 equal columns in one row.
- 5–8 products: four columns per row for a clean balanced layout.
- Tablet uses two columns.
- Mobile remains two columns.
- No database schema changes. No upgrade SQL required.

## v1.0.51 — Excel Product Import / Export
- Product bulk workflow now defaults to Microsoft Excel `.xlsx`, not CSV.
- Export All and Export Filtered generate `.xlsx`.
- Import Template is `.xlsx`.
- Affiliate Salespage and Affiliate Checkout links can be edited directly in spreadsheet cells.
- Existing CSV files are still accepted for backwards compatibility.
- No database schema changes. No upgrade SQL required.
