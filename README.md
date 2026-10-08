# ADCStore v1.0.11

ADCStore — Digital Store & Affiliate Website for ADC Members.

## Highlight v1.0.11
- Harga promo lengkap: Harga Normal/Coret + Harga Publish/Jual.
- Badge diskon otomatis (HEMAT xx%) dan teks badge custom optional.
- Homepage Slide Banner responsive: upload/URL desktop 1600×600 dan mobile 1080×1350.
- Banner punya URL tujuan, CTA optional, urutan, aktif/nonaktif, autoplay, arrow, dots, dan swipe-friendly layout.
- Admin Slide Banner dilengkapi search, filter status, pagination, dan page size 10/20/50.
- Mobile Bottom Navbar untuk pengalaman seperti aplikasi.
- PWA: service worker, manifest dinamis, install ke Home Screen, nama aplikasi dan icon bisa diatur dari dashboard.
- Icon PWA bisa upload sendiri; rekomendasi 512×512 px.
- Semua fitur sebelumnya tetap ada: multi-image, video VSL, internal/affiliate salespage & checkout, akses produk, pembayaran bank/e-wallet/QRIS, 10 tema + custom color, hero custom, Floating WhatsApp.

## Fresh Install
1. Buat project Supabase.
2. Jalankan `sql/INSTALL_ADCSTORE_v1.0.11.sql` sekali di SQL Editor.
3. Buat akun pertama di Supabase Authentication. Akun pertama otomatis menjadi OWNER.
4. Set environment variable Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Push source ke GitHub lalu deploy di Vercel.
6. Login owner melalui `/owner/login`.

## Upgrade dari v1.0.10
1. Jalankan `sql/UPGRADE_v1.0.10_TO_v1.0.11.sql` sekali.
2. Deploy seluruh source v1.0.11.
3. Atur banner dari `Owner Console > Slide Banner`.
4. Atur PWA dari `Pengaturan Toko > PWA / Install App`.

## Rekomendasi Banner
- Desktop: **1600 × 600 px** (rasio 8:3).
- Mobile: **1080 × 1350 px** (rasio 4:5).
- Bila mobile banner kosong, sistem otomatis memakai banner desktop.

## Catatan
Bucket `store-assets` dipakai untuk QRIS, gambar produk, hero, floating WA, banner, dan icon PWA. Upload/delete hanya owner.
