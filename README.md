# ADCStore v1.0.6

**Digital Store & Affiliate Website for ADC Members**

Versi 1.0.6 merombak Owner Dashboard menjadi UI 3D soft pastel dan menambah checkout internal lengkap.

## Fitur utama
- Homepage & member area 3D soft pastel
- 10 preset tema + custom color
- Produk: Affiliate Only / Internal Checkout / Both
- Pembayaran internal: banyak Bank, banyak E-Wallet, QRIS statis dengan upload image
- Order / Checkout owner: pending, paid, completed, cancelled
- Akses Produk: HTML, button link, atau kombinasi
- Member hanya melihat akses produk setelah order berstatus paid/completed dan email order sama dengan email akun
- Owner login privat `/owner/login` dan akun owner berasal dari Supabase Authentication

## Fresh install
1. Buat project Supabase.
2. Jalankan **`sql/INSTALL_ADCSTORE_v1.0.6.sql`** sekali.
3. Buat akun Authentication pertama untuk owner. Akun Auth pertama otomatis menjadi owner.
4. Isi env Vercel dari `.env.example`.
5. Deploy ke GitHub/Vercel.
6. Login owner di `/owner/login`.

## Upgrade v1.0.4 -> v1.0.6
Jalankan **`sql/UPGRADE_v1.0.4_TO_v1.0.6.sql`** sekali, lalu deploy source v1.0.6.

## Environment
Gunakan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Source masih mendukung fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk project lama.
