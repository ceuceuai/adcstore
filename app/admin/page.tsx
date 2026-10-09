'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { StoreSettings } from '@/lib/types';
import { Package2, Sparkles, Link2Off, ShoppingBag, CreditCard, KeyRound, ArrowUpRight } from 'lucide-react';

const fallback:Partial<StoreSettings>={
 brand_name:'ADCStore',
 logo_url:null,
 admin_dashboard_badge:'OWNER DASHBOARD',
 admin_dashboard_title:'Kelola toko digital tanpa ribet.',
 admin_dashboard_description:'Produk, checkout, pembayaran, dan akses member ada dalam satu tempat.',
 admin_dashboard_visual_mode:'brand',
 admin_dashboard_visual_url:null
};

export default function Admin(){
 const [stats,setStats]=useState({all:0,active:0,missing:0,orders:0,paid:0});
 const [settings,setSettings]=useState<Partial<StoreSettings>>(fallback);

 useEffect(()=>{
  const s=createClient();
  Promise.all([
   s.from('products').select('is_active,affiliate_url'),
   s.from('orders').select('status'),
   s.from('store_settings').select('brand_name,logo_url,admin_dashboard_badge,admin_dashboard_title,admin_dashboard_description,admin_dashboard_visual_mode,admin_dashboard_visual_url').eq('id',1).maybeSingle()
  ]).then(([p,o,st])=>{
   const d=p.data||[],orders=o.data||[];
   setStats({
    all:d.length,
    active:d.filter(x=>x.is_active).length,
    missing:d.filter(x=>!x.affiliate_url).length,
    orders:orders.length,
    paid:orders.filter(x=>x.status==='paid'||x.status==='completed').length
   });
   if(st.data)setSettings({...fallback,...st.data});
  });
 },[]);

 const cards=[
  {label:'Total Produk',value:stats.all,icon:Package2,sub:'Semua katalog'},
  {label:'Produk Aktif',value:stats.active,icon:Sparkles,sub:'Tampil di storefront'},
  {label:'Order Masuk',value:stats.orders,icon:ShoppingBag,sub:`${stats.paid} sudah dibayar`},
  {label:'Link Belum Diisi',value:stats.missing,icon:Link2Off,sub:'Perlu dilengkapi'},
 ];

 const visualMode=settings.admin_dashboard_visual_mode||'brand';
 const visualUrl=visualMode==='custom'
  ?settings.admin_dashboard_visual_url
  :visualMode==='brand'
   ?settings.logo_url
   :null;

 return <>
  <div className={`adminHero3d ${visualMode==='none'?'adminHeroNoVisual':''}`}>
   <div>
    {settings.admin_dashboard_badge&&<span className="eyebrow">{settings.admin_dashboard_badge}</span>}
    <h1>{settings.admin_dashboard_title||fallback.admin_dashboard_title}</h1>
    <p>{settings.admin_dashboard_description||fallback.admin_dashboard_description}</p>
   </div>
   {visualMode!=='none'&&<div className="adminHeroVisual">
    {visualUrl
     ?<img src={visualUrl} alt={settings.brand_name||'Dashboard visual'}/>
     :<div className="adminHeroBrandFallback"><span>{(settings.brand_name||'S').charAt(0)}</span><small>{settings.brand_name||'Store'}</small></div>}
   </div>}
  </div>

  <div className="adminStats3d">
   {cards.map(({label,value,icon:Icon,sub})=><div className="metric3d" key={label}><div className="metricIcon"><Icon size={22}/></div><div><small>{label}</small><strong>{value}</strong><p>{sub}</p></div></div>)}
  </div>

  <div className="dashboardSplit">
   <section className="panel3d">
    <div className="panelTitle"><div><span className="eyebrow">QUICK ACTION</span><h2>Yang sering dipakai</h2></div></div>
    <div className="quickGrid">
     <Link href="/admin/products" className="quick3d"><Package2/><span><b>Kelola Produk</b><small>Tambah & edit katalog ADC</small></span><ArrowUpRight/></Link>
     <Link href="/admin/payments" className="quick3d"><CreditCard/><span><b>Atur Pembayaran</b><small>Bank, e-wallet, QRIS</small></span><ArrowUpRight/></Link>
     <Link href="/admin/access" className="quick3d"><KeyRound/><span><b>Akses Produk</b><small>HTML & tombol akses</small></span><ArrowUpRight/></Link>
     <Link href="/admin/orders" className="quick3d"><ShoppingBag/><span><b>Kelola Order</b><small>Approve pembayaran customer</small></span><ArrowUpRight/></Link>
    </div>
   </section>
   <section className="panel3d tips3d">
    <span className="eyebrow">ALUR SINGKAT</span><h2>Siap jual dalam 3 langkah</h2>
    <ol><li><b>1</b><span>Isi link affiliate atau aktifkan checkout internal.</span></li><li><b>2</b><span>Atur bank, e-wallet, dan QRIS statis.</span></li><li><b>3</b><span>Isi akses produk: HTML, tombol, atau kombinasi.</span></li></ol>
   </section>
  </div>
 </>
}
