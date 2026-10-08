# ADCStore v1.0.8

**Digital Store & Affiliate Website for ADC Members**

Versi 1.0.8 melanjutkan Owner Dashboard 3D dan menyempurnakan katalog produk, salespage, gambar, checkout, serta akses produk.

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
2. Jalankan **`sql/INSTALL_ADCSTORE_v1.0.8.sql`** sekali.
3. Buat akun Authentication pertama untuk owner. Akun Auth pertama otomatis menjadi owner.
4. Isi env Vercel dari `.env.example`.
5. Deploy ke GitHub/Vercel.
6. Login owner di `/owner/login`.

## Upgrade v1.0.4 -> v1.0.8
Jalankan **`sql/UPGRADE_v1.0.4_TO_v1.0.8.sql`** sekali, lalu deploy source v1.0.8.

## Environment
Gunakan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Source masih mendukung fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk project lama.

## v1.0.8
- Upload gambar produk atau URL image address.
- Salespage affiliate/official terpisah dari link checkout affiliate.
- Salespage internal optional memakai HTML code.
- CTA checkout website dan CTA official bisa tampil bersamaan pada mode Both.
- Menu Akses Produk sekarang memiliki tombol Tambah Akses dan pilihan produk yang akan dihubungkan.
