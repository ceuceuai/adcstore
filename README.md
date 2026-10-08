# ADCStore v1.0.9

ADCStore — Digital Store & Affiliate Website for ADC Members.

## Highlight v1.0.9
- Multi-image gallery per produk.
- Upload beberapa gambar sekaligus atau tambah URL gambar.
- Bisa pilih cover/thumbnail utama produk.
- Video Sales Letter via URL YouTube, Vimeo, atau direct video URL.
- Homepage memiliki pagination dan jumlah produk per halaman dapat diatur owner.
- Produk Admin: search, filter kategori, filter mode penjualan, filter status, page size 10/20/50, pagination.
- Order Admin: search, filter status, page size 10/20/50, pagination.
- Akses Produk Admin: search, filter tipe akses, filter status, page size 10/20/50, pagination.
- Member Akses: search, page size, pagination.

## Fresh Install
1. Buat project Supabase.
2. Jalankan `sql/INSTALL_ADCSTORE_v1.0.9.sql` sekali di SQL Editor.
3. Buat akun pertama di Supabase Authentication. Akun pertama otomatis menjadi owner.
4. Set environment variable di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Push source ke GitHub dan deploy ke Vercel.

## Upgrade dari v1.0.8
Jalankan `sql/UPGRADE_v1.0.8_TO_v1.0.9.sql` sekali, lalu deploy semua source v1.0.9.

## Homepage Pagination
Owner dapat mengatur jumlah produk per halaman melalui **Pengaturan Toko → Jumlah Produk per Halaman Homepage**. Pilihan: 6, 8, 10, 12, 16, atau 20 produk.

## Media Produk
Di **Produk ADC → Tambah/Edit Produk**:
- upload beberapa image sekaligus;
- tambah image dari URL;
- pilih salah satu gambar sebagai cover;
- isi URL Video Sales Letter bila produk memiliki video penjualan.
