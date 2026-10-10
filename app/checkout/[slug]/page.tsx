'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { PaymentSettings, Product, StoreSettings } from '@/lib/types';
import { rupiah } from '@/lib/money';
import ThemeProvider from '@/components/ThemeProvider';
import { trackEvent } from '@/lib/analytics';
import { Building2, WalletCards, QrCode, CheckCircle2, Plus, Trash2, ShoppingBag } from 'lucide-react';

const fallback:StoreSettings={
 id:1,brand_name:'Digital Store',tagline:'Digital product store',logo_url:null,whatsapp:null,instagram_url:null,
 primary_color:'#8b5cf6',secondary_color:'#c4b5fd',accent_color:'#f9a8d4',theme_preset:'lavender',
 hero_badge:'BONUS EKSKLUSIF',hero_title:'Produk Digital Siap Jual untuk Member ADC',hero_subtitle:'',
 hero_primary_cta_text:'Lihat Produk',hero_member_cta_text:'Masuk Member',hero_member_cta_enabled:true,
 hero_trust_1:'Produk siap promosi',hero_trust_2:'Link affiliate sendiri',hero_trust_3:'Tema bisa diganti',
 hero_visual_mode:'default',hero_image_url:null,hero_image_position:'right',hero_image_fit:'contain',hero_image_alt:'Hero image',
 catalog_eyebrow:'KATALOG DIGITAL',catalog_title:'Produk pilihan untuk mulai jualan',catalog_subtitle:'Produk ADC sudah tersedia.',
 floating_wa_enabled:false,floating_wa_number:null,floating_wa_message:'Halo, saya butuh bantuan tentang produk ini.',
 floating_wa_position:'right',floating_wa_style:'3d',floating_wa_icon_url:null,floating_wa_tooltip:'Butuh bantuan? Chat WhatsApp',
 floating_wa_show_on:'all',checkout_success_action:'whatsapp',checkout_success_url:null,footer_text:'Digital Store',home_products_per_page:8,pwa_name:'Digital Store',pwa_short_name:'Store',pwa_icon_url:null
};
const payBase:PaymentSettings={id:1,banks:[],ewallets:[],qris_enabled:false,qris_label:'QRIS',qris_image_url:null,instructions:''};

export default function Checkout(){
 const {slug}=useParams<{slug:string}>();
 const [p,setP]=useState<Product|null>(null);
 const [allProducts,setAllProducts]=useState<Product[]>([]);
 const [cart,setCart]=useState<Product[]>([]);
 const [s,setS]=useState(fallback);
 const [pay,setPay]=useState(payBase);
 const [method,setMethod]=useState('');
 const [form,setForm]=useState({name:'',email:'',wa:''});
 const [done,setDone]=useState('');
 const [msg,setMsg]=useState('');
 const [busy,setBusy]=useState(false);
 const [addProductId,setAddProductId]=useState('');

 useEffect(()=>{
  const c=createClient();
  Promise.all([
   c.from('products').select('*').eq('slug',slug).maybeSingle(),
   c.from('products').select('*').eq('is_active',true).in('sale_mode',['internal','both']).order('name'),
   c.from('store_settings').select('*').eq('id',1).maybeSingle(),
   c.from('payment_settings').select('*').eq('id',1).maybeSingle()
  ]).then(([a,ap,b,d])=>{
   const main=a.data as Product|null;
   setP(main);
   if(main)setCart([main]);
   setAllProducts((ap.data||[]) as Product[]);
   if(b.data)setS({...fallback,...b.data} as StoreSettings);
   if(d.data){
    const x={...payBase,...d.data,banks:d.data.banks||[],ewallets:d.data.ewallets||[]} as PaymentSettings;
    setPay(x);
    const first=x.banks.find(v=>v.enabled);
    const w=x.ewallets.find(v=>v.enabled);
    setMethod(first?`bank:${first.id}`:w?`wallet:${w.id}`:x.qris_enabled?'qris':'');
   }
  });
 },[slug]);

 const total=useMemo(()=>cart.reduce((sum,x)=>sum+Number(x.price||0),0),[cart]);
 const available=allProducts.filter(x=>!cart.some(c=>c.id===x.id));

 function addAnother(){
  if(!addProductId)return;
  const item=allProducts.find(x=>x.id===addProductId);
  if(item&&!cart.some(c=>c.id===item.id))setCart(v=>[...v,item]);
  setAddProductId('');
 }

 function removeItem(id:string){
  if(cart.length<=1)return;
  setCart(v=>v.filter(x=>x.id!==id));
 }

 function paymentLabel(){
  const bank=pay.banks.find(x=>method===`bank:${x.id}`);
  const wallet=pay.ewallets.find(x=>method===`wallet:${x.id}`);
  if(bank)return `${bank.bank} • ${bank.account_number}`;
  if(wallet)return `${wallet.provider} • ${wallet.number}`;
  if(method==='qris')return pay.qris_label||'QRIS';
  return method;
 }

 function successRedirectUrl(order:string){
  if((s.checkout_success_action||'whatsapp')==='url'){
   const raw=(s.checkout_success_url||'').trim();
   if(!raw)return '';
   try{
    const u=new URL(raw,window.location.origin);
    u.searchParams.set('order',order);
    u.searchParams.set('total',String(total));
    return u.toString();
   }catch{return raw}
  }
  if((s.checkout_success_action||'whatsapp')==='whatsapp')return ownerWaUrl(order);
  return '';
 }

 function ownerWaUrl(order:string){
  const number=(s.whatsapp||s.floating_wa_number||'').replace(/\D/g,'');
  if(!number)return '';
  const productLines=cart.map((x,i)=>`${i+1}. ${x.name} — ${rupiah(x.price)}`).join('\n');
  const text=[
   `Halo, saya baru membuat pesanan di ${s.brand_name}.`,
   ``,
   `No. Order: ${order}`,
   `Nama: ${form.name}`,
   `Produk:`,
   productLines,
   ``,
   `Total: ${rupiah(total)}`,
   `Pembayaran: ${paymentLabel()}`,
   ``,
   `Saya akan mengirim bukti transfer/pembayaran di chat ini. Mohon konfirmasinya.`,
   ``,
   `Buat/Login akun member dengan email checkout: ${window.location.origin}/member/login?email=${encodeURIComponent(form.email)}`
  ].join('\n');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
 }

 async function submit(e:FormEvent){
  e.preventDefault();
  if(!p||!cart.length||!method){setMsg('Pilih metode pembayaran dulu.');return}
  if(!form.name.trim()||!form.email.trim()||!form.wa.trim()){setMsg('Nama, email, dan WhatsApp wajib diisi.');return}

  setBusy(true);setMsg('');
  const order=`ADC-${Date.now().toString().slice(-8)}`;
  const c=createClient();

  const {data,error}=await c.rpc('create_checkout_order',{
   p_order_number:order,
   p_customer_name:form.name.trim(),
   p_customer_email:form.email.trim().toLowerCase(),
   p_customer_whatsapp:form.wa.trim(),
   p_payment_method:method,
   p_product_ids:cart.map(x=>x.id)
  });

  if(error){
   setBusy(false);
   setMsg(`Checkout gagal: ${error.message}`);
   return;
  }

  const result=Array.isArray(data)?data[0]:data;
  const savedOrder=result?.order_number||order;
  const savedTotal=Number(result?.total_amount||total);

  await trackEvent('purchase',{product_id:cart[0].id,metadata:{order_number:savedOrder,item_count:cart.length,total:savedTotal}});
  setDone(savedOrder);setBusy(false);

  const redirect=successRedirectUrl(savedOrder);
  if(redirect)window.setTimeout(()=>{window.location.href=redirect},800);
 }

 if(!p)return <div style={{padding:50}}>Memuat checkout...</div>;

 const bank=pay.banks.find(x=>method===`bank:${x.id}`);
 const wallet=pay.ewallets.find(x=>method===`wallet:${x.id}`);

 return <ThemeProvider preset={s.theme_preset} primary={s.primary_color} secondary={s.secondary_color} accent={s.accent_color}>
  <main className="checkoutPage3d">
   <div className="checkoutShell3d multiCheckoutShell">
    <section className="checkoutProduct3d">
     <span className="eyebrow">CHECKOUT INTERNAL</span>
     <h1>{cart.length>1?`${cart.length} Produk Pilihan`:p.name}</h1>
     <p>{cart.length>1?'Periksa kembali produk yang akan dibeli sebelum membuat pesanan.':p.short_description}</p>

     <div className="checkoutCartList">
      {cart.map((item,index)=><div className="checkoutCartItem" key={item.id}>
       <div className="checkoutCartThumb">
        {item.image_url?<img src={item.image_url} alt={item.name}/>:<div className="checkoutCartFallback">{(item.name||'P').charAt(0)}</div>}
       </div>
       <div className="checkoutCartInfo"><strong>{item.name}</strong><span>{rupiah(item.price)}</span></div>
       {cart.length>1&&<button type="button" className="checkoutCartRemove" onClick={()=>removeItem(item.id)} aria-label="Hapus produk"><Trash2 size={16}/></button>}
      </div>)}
     </div>

     {available.length>0&&<div className="checkoutAddProduct">
      <label>Tambah produk lain</label>
      <div>
       <select value={addProductId} onChange={e=>setAddProductId(e.target.value)}>
        <option value="">Pilih produk...</option>
        {available.map(x=><option value={x.id} key={x.id}>{x.name} — {rupiah(x.price)}</option>)}
       </select>
       <button type="button" onClick={addAnother} disabled={!addProductId}><Plus size={17}/> Tambah</button>
      </div>
     </div>}

     <div className="checkoutTotalBox"><span>Total Pembelian</span><strong>{rupiah(total)}</strong></div>
     <Link href={`/product/${p.slug}`} className="btn soft">← Kembali ke Produk</Link>
    </section>

    <section className="checkoutForm3d">
     {done
      ?<div className="success3d">
       <CheckCircle2 size={64}/><h2>Pesanan berhasil dibuat</h2><p>Nomor order Anda:</p><strong>{done}</strong>
       <p className="muted">{(s.checkout_success_action||'whatsapp')==='whatsapp'&&ownerWaUrl(done)?'Membuka WhatsApp untuk konfirmasi dan kirim bukti pembayaran...':(s.checkout_success_action==='url'&&s.checkout_success_url)?'Mengarahkan ke halaman lanjutan...':'Lakukan pembayaran sesuai metode yang dipilih. Owner akan memverifikasi pembayaran Anda.'}</p>
       <div className="checkoutMemberAccessCard">
        <span className="eyebrow">AKSES PRODUK</span>
        <h3>Buat akun member dengan email checkout</h3>
        <p>Gunakan <b>{form.email}</b>. Setelah pembayaran berstatus Paid/Completed, produk otomatis muncul di Member Area.</p>
        <div className="checkoutMemberActions">
         <Link href={`/member/login?mode=signup&email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}&wa=${encodeURIComponent(form.wa)}`} className="btn">Buat Akun & Password</Link>
         <Link href={`/member/login?email=${encodeURIComponent(form.email)}`} className="btn soft">Sudah Punya Akun? Login</Link>
        </div>
       </div>
       {(s.checkout_success_action||'whatsapp')==='whatsapp'&&ownerWaUrl(done)&&<a href={ownerWaUrl(done)} className="btn">Konfirmasi via WhatsApp</a>}
       {s.checkout_success_action==='url'&&s.checkout_success_url&&<a href={successRedirectUrl(done)} className="btn">Lanjutkan</a>}
      </div>
      :<form className="form" onSubmit={submit}>
       <div className="checkoutFormTitle"><ShoppingBag size={22}/><div><h2>Data Pembeli</h2><small>{cart.length} produk • {rupiah(total)}</small></div></div>
       <div className="field"><label>Nama</label><input className="input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
       <div className="twoCols">
        <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="field"><label>WhatsApp</label><input className="input" required value={form.wa} onChange={e=>setForm({...form,wa:e.target.value})}/></div>
       </div>

       <h2>Pilih Pembayaran</h2>
       <div className="checkoutMethods">
        {pay.banks.filter(x=>x.enabled).map(x=><button type="button" key={x.id} onClick={()=>setMethod(`bank:${x.id}`)} className={method===`bank:${x.id}`?'active':''}><Building2/><span><b>{x.bank}</b><small>Transfer Bank</small></span></button>)}
        {pay.ewallets.filter(x=>x.enabled).map(x=><button type="button" key={x.id} onClick={()=>setMethod(`wallet:${x.id}`)} className={method===`wallet:${x.id}`?'active':''}><WalletCards/><span><b>{x.provider}</b><small>E-Wallet</small></span></button>)}
        {pay.qris_enabled&&<button type="button" onClick={()=>setMethod('qris')} className={method==='qris'?'active':''}><QrCode/><span><b>{pay.qris_label}</b><small>QRIS Statis</small></span></button>}
       </div>

       {bank&&<div className="payDetail3d"><b>{bank.bank}</b><strong>{bank.account_number}</strong><span>a.n. {bank.account_name}</span></div>}
       {wallet&&<div className="payDetail3d"><b>{wallet.provider}</b><strong>{wallet.number}</strong><span>a.n. {wallet.account_name}</span></div>}
       {method==='qris'&&pay.qris_image_url&&<div className="qrisCheckout3d"><img src={pay.qris_image_url} alt="QRIS"/></div>}

       <div className="notice">{pay.instructions}</div>
       {(s.checkout_success_action||'whatsapp')==='whatsapp'&&(s.whatsapp||s.floating_wa_number)&&<div className="checkoutWaHint">Setelah order dibuat, Anda akan diarahkan ke WhatsApp toko untuk konfirmasi dan mengirim bukti pembayaran.</div>}
       {s.checkout_success_action==='url'&&s.checkout_success_url&&<div className="checkoutWaHint">Setelah order dibuat, Anda akan diarahkan ke halaman lanjutan / Thank You Page.</div>}
       {msg&&<div className="notice">{msg}</div>}
       <button type="submit" className="btn full" disabled={busy}>{busy?'Membuat Pesanan...':`Buat Pesanan • ${rupiah(total)}`}</button>
      </form>}
    </section>
   </div>
  </main>
 </ThemeProvider>
}
