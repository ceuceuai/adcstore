# ADCStore v1.0.3
**Digital Store & Affiliate Website for ADC Members**

Bonus eksklusif berupa website toko digital siap pakai. Produk ADC dapat disiapkan di katalog dan pemilik toko cukup mengganti link affiliate milik sendiri.

## Stack
- Next.js 14
- Supabase Auth + Database
- GitHub
- Vercel

## Yang baru di v1.0.3
- Redesign homepage dengan gaya 3D soft pastel.
- Member Area baru dengan login/daftar terpisah dari Owner.
- Owner login tetap privat di `/owner/login` dan tidak ditampilkan di navbar publik.
- 10 preset tema warna + custom Primary / Secondary / Accent.
- Theme setting global toko dari Admin.
- Setiap member dapat memilih tema pribadi untuk member area.
- Security admin ditingkatkan memakai tabel `admin_users` + RPC `is_admin()`; user member tidak bisa masuk dashboard admin.
- Homepage, product detail, member area, dan form/login sudah responsive.

## Fresh Install
1. Buat project Supabase.
2. Buka SQL Editor lalu jalankan seluruh isi `sql/INSTALL_ADCSTORE_v1.0.3.sql`.
3. Buat akun owner di **Authentication > Users > Add user**.
4. Salin UUID akun owner lalu jalankan satu query berikut di SQL Editor:
   ```sql
   insert into public.admin_users(user_id)
   values ('PASTE-OWNER-USER-UUID')
   on conflict do nothing;
   ```
5. Di Vercel isi Environment Variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
   ```
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` tetap didukung sebagai fallback untuk project Supabase lama.
6. Deploy / Redeploy Vercel.
7. Owner login melalui `/owner/login`.

## Upgrade dari v1.0.2
Jalankan `sql/UPGRADE_v1.0.2_TO_v1.0.3.sql`, lalu masukkan UUID akun owner ke `admin_users` menggunakan query pada langkah Fresh Install nomor 4. Setelah itu push source v1.0.3 dan redeploy Vercel.

## URL penting
- `/` — Homepage / storefront
- `/member/login` — Login dan daftar member
- `/member` — Dashboard member
- `/owner/login` — Login privat owner
- `/admin` — Dashboard owner
- `/admin/products` — CRUD katalog ADC
- `/admin/settings` — Branding + 10 preset tema + custom warna

## Catatan
Katalog contoh masih memakai Produk ADC 01–06 sebagai placeholder. Ganti nama, gambar, deskripsi, harga, kategori, CTA, dan link affiliate melalui dashboard owner.
