'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { LayoutDashboard, Package2, CreditCard, KeyRound, Settings, LogOut, ShoppingBag, ExternalLink, Images } from 'lucide-react';

export default function AdminShell({children}:{children:React.ReactNode}){
 const router=useRouter(); const path=usePathname(); const [checking,setChecking]=useState(true); const [navPending,setNavPending]=useState(false); const [brand,setBrand]=useState('Digital Store'); const [logo,setLogo]=useState<string|null>(null); const [consoleLabel,setConsoleLabel]=useState('Owner Console');
 useEffect(()=>{const s=createClient();s.auth.getSession().then(async({data})=>{if(!data.session)return router.replace('/owner/login');const {data:isAdmin}=await s.rpc('is_admin');if(!isAdmin){await s.auth.signOut();return router.replace('/owner/login')}setChecking(false)})},[router]);
 useEffect(()=>{setNavPending(false)},[path]);
 useEffect(()=>{createClient().from('store_settings').select('brand_name,logo_url,admin_console_label').eq('id',1).maybeSingle().then(({data})=>{if(data){setBrand(data.brand_name||'Digital Store');setLogo(data.logo_url||null);setConsoleLabel(data.admin_console_label||'Owner Console')}})},[]);
 useEffect(()=>{['/admin','/admin/products','/admin/banners','/admin/orders','/admin/access','/admin/payments','/admin/settings'].forEach(href=>router.prefetch(href))},[router]);
 async function logout(){await createClient().auth.signOut();router.replace('/owner/login')}
 if(checking)return <div className="adminLoading">Memeriksa akses owner...</div>;
 const links=[
  {href:'/admin',label:'Dashboard',icon:LayoutDashboard},
  {href:'/admin/products',label:'Produk ADC',icon:Package2},
  {href:'/admin/banners',label:'Slide Banner',icon:Images},
  {href:'/admin/orders',label:'Order / Checkout',icon:ShoppingBag},
  {href:'/admin/access',label:'Akses Produk',icon:KeyRound},
  {href:'/admin/payments',label:'Pembayaran',icon:CreditCard},
  {href:'/admin/settings',label:'Pengaturan',icon:Settings},
 ];
 return <div className="adminShell"><aside className="sidebar3d"><div className="adminBrand">{logo?<img src={logo} alt={brand} style={{maxWidth:42,maxHeight:42,objectFit:'contain',borderRadius:10}}/>:<span className="logo">{brand.trim().charAt(0).toUpperCase()||'S'}</span>}<div><strong>{brand}</strong><small>{consoleLabel}</small></div></div><nav className="adminNav">{links.map(({href,label,icon:Icon})=>{const active=href==='/admin'?path===href:path.startsWith(href);return <Link key={href} href={href} prefetch className={active?'active':''} onClick={()=>{if(!active)setNavPending(true)}}><Icon size={19}/><span>{label}</span></Link>})}</nav><div className="sidebarBottom"><a href="/" target="_blank" className="storeShortcut"><ExternalLink size={18}/><span>Lihat Toko</span></a><button onClick={logout}><LogOut size={18}/><span>Keluar</span></button></div></aside><main className={`adminContent ${navPending?'isNavigating':''}`}><div className="adminNavProgress" aria-hidden="true"></div>{children}</main></div>
}
