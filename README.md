# ADCStore v1.0.10

ADCStore — Digital Store & Affiliate Website for ADC Members.

## Highlight v1.0.10
- Hero homepage sekarang configurable penuh dari dashboard, tidak hardcode.
- Hero visual: default 3D, upload image, image URL, atau disembunyikan.
- Posisi hero image kiri/kanan, object-fit contain/cover, alt text.
- Badge, judul, subjudul, CTA, highlight, judul katalog, dan subjudul katalog dapat diedit owner.
- Floating WhatsApp optional dengan style 3D/bulat/custom image.
- Floating WA bisa upload icon/image sendiri atau pakai URL image.
- Nomor WA, pesan default, tooltip, posisi, dan halaman tampil dapat diatur.
- Semua fitur v1.0.9 tetap dipertahankan: multi-image produk, video VSL, search/filter/pagination, checkout internal/affiliate, akses produk, pembayaran bank/e-wallet/QRIS.

## Fresh Install
1. Buat project Supabase.
2. Jalankan `sql/INSTALL_ADCSTORE_v1.0.10.sql` sekali di SQL Editor.
3. Buat akun pertama di Supabase Authentication. Akun pertama otomatis menjadi owner.
4. Set environment variable di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Deploy ke GitHub/Vercel.
6. Login owner lewat `/owner/login`.

## Upgrade dari v1.0.9
1. Jalankan `sql/UPGRADE_v1.0.9_TO_v1.0.10.sql` sekali.
2. Deploy seluruh source v1.0.10.
3. Buka `Pengaturan Toko` untuk mengatur Hero dan Floating WhatsApp.

## Catatan
Bucket `store-assets` digunakan untuk upload aset toko seperti QRIS, gambar produk, hero image, dan icon Floating WhatsApp. Upload/delete hanya diizinkan untuk owner.
