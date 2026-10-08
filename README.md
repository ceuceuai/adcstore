# ADCStore v1.0.1
**Digital Store & Affiliate Website for ADC Members**

BONUS EKSKLUSIF: ADCStore — Website toko digital siap pakai. Produk ADC sudah tersedia. Tinggal ganti link affiliate Anda sendiri dan mulai promosi.

## Isi Paket
- Next.js storefront mobile-friendly
- Detail produk + tombol affiliate
- Admin login menggunakan Supabase Auth
- Dashboard ringkas
- CRUD produk lengkap
- Search, filter, pagination, page size
- Setting brand/hero/WA/Instagram/warna/footer
- Ganti password owner
- Master SQL installer tunggal
- Sample katalog siap diganti dengan katalog ADC resmi
- `.env.example` untuk deployment Vercel

## Instalasi Singkat
1. Buat project Supabase.
2. Buka SQL Editor lalu jalankan `sql/INSTALL_ADCSTORE_v1.0.1.sql` seluruhnya.
3. Supabase > Authentication > Users > Add user. Buat email/password owner.
4. Copy Project URL dan anon/public key dari Supabase.
5. Rename `.env.example` menjadi `.env.local` saat lokal, atau isi Environment Variables di Vercel.
6. Push seluruh isi ZIP ke repository GitHub (jangan bungkus lagi dalam subfolder jika ingin root-ready).
7. Import repository ke Vercel dan tambahkan:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

   ADCStore v1.0.1 memakai Publishable Key Supabase terbaru. Source tetap mendukung NEXT_PUBLIC_SUPABASE_ANON_KEY sebagai fallback untuk project Supabase lama.
8. Deploy.
9. Buka `/admin/login` lalu login dengan akun owner Supabase.
10. Masuk menu Produk ADC dan isi link affiliate masing-masing produk.

## Catatan Penting
Katalog seed di SQL menggunakan placeholder Produk ADC 01-06 karena katalog/nama/link resmi ADC tidak disertakan dalam source ini. Jangan menganggap placeholder sebagai katalog resmi. Ganti dari dashboard setelah instalasi.

## Mode Penjualan
Struktur database sudah menyediakan `sale_mode`: affiliate / internal / both. v1.0.1 storefront mengaktifkan alur affiliate sebagai fokus utama bonus ADCStore. Field disiapkan agar checkout internal dapat ditambahkan pada versi berikutnya tanpa migrasi ulang struktur produk.

## Keamanan
Public hanya dapat SELECT produk aktif dan settings. CRUD produk/settings membutuhkan sesi Supabase Auth. Untuk model single-user, jangan aktifkan self-signup bila tidak diperlukan.
