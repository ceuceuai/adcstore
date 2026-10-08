'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminShell({children}:{children:React.ReactNode}){
  const router=useRouter(); const path=usePathname(); const [checking,setChecking]=useState(true);
  useEffect(()=>{const supabase=createClient(); supabase.auth.getSession().then(({data})=>{if(!data.session) router.replace('/owner/login'); else setChecking(false)});},[router]);
  async function logout(){const supabase=createClient(); await supabase.auth.signOut(); router.replace('/owner/login')}
  if(checking) return <div className="container" style={{padding:'60px 0'}}>Memeriksa sesi admin...</div>;
  const links=[['/admin','Dashboard'],['/admin/products','Produk ADC'],['/admin/settings','Pengaturan']];
  return <div className="adminShell"><aside className="sidebar"><div className="brand" style={{marginBottom:24}}><span className="logo">A</span><span>ADCStore</span></div>{links.map(([href,label])=><Link key={href} href={href} style={path===href?{background:'rgba(255,255,255,.09)'}:{}}>{label}</Link>)}<button className="btn alt" style={{marginTop:10}} onClick={logout}>Keluar</button></aside><main className="content">{children}</main></div>
}
