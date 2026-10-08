'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { LayoutDashboard, Package2, CreditCard, KeyRound, Settings, LogOut, ShoppingBag, ExternalLink } from 'lucide-react';

export default function AdminShell({children}:{children:React.ReactNode}){
 const router=useRouter(); const path=usePathname(); const [checking,setChecking]=useState(true);
 useEffect(()=>{const s=createClient();s.auth.getSession().then(async({data})=>{if(!data.session)return router.replace('/owner/login');const {data:isAdmin}=await s.rpc('is_admin');if(!isAdmin){await s.auth.signOut();return router.replace('/owner/login')}setChecking(false)})},[router]);
 async function logout(){await createClient().auth.signOut();router.replace('/owner/login')}
 if(checking)return <div className="adminLoading">Memeriksa akses owner...</div>;
 const links=[
  {href:'/admin',label:'Dashboard',icon:LayoutDashboard},
  {href:'/admin/products',label:'Produk ADC',icon:Package2},
  {href:'/admin/orders',label:'Order / Checkout',icon:ShoppingBag},
  {href:'/admin/access',label:'Akses Produk',icon:KeyRound},
  {href:'/admin/payments',label:'Pembayaran',icon:CreditCard},
  {href:'/admin/settings',label:'Pengaturan',icon:Settings},
 ];
 return <div className="adminShell"><aside className="sidebar3d"><div className="adminBrand"><span className="logo">A</span><div><strong>ADCStore</strong><small>Owner Console</small></div></div><nav className="adminNav">{links.map(({href,label,icon:Icon})=>{const active=href==='/admin'?path===href:path.startsWith(href);return <Link key={href} href={href} className={active?'active':''}><Icon size={19}/><span>{label}</span></Link>})}</nav><div className="sidebarBottom"><a href="/" target="_blank" className="storeShortcut"><ExternalLink size={18}/><span>Lihat Toko</span></a><button onClick={logout}><LogOut size={18}/><span>Keluar</span></button></div></aside><main className="adminContent">{children}</main></div>
}
