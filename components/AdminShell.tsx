'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
export default function AdminShell({children}:{children:React.ReactNode}){const router=useRouter();const path=usePathname();const [checking,setChecking]=useState(true);
 useEffect(()=>{const s=createClient();s.auth.getSession().then(async({data})=>{if(!data.session)return router.replace('/owner/login');const {data:isAdmin}=await s.rpc('is_admin');if(!isAdmin){await s.auth.signOut();return router.replace('/owner/login')}setChecking(false)})},[router]);
 async function logout(){await createClient().auth.signOut();router.replace('/owner/login')}
 if(checking)return <div className="container" style={{padding:'60px 0'}}>Memeriksa akses owner...</div>;
 const links=[['/admin','Dashboard'],['/admin/products','Produk ADC'],['/admin/settings','Pengaturan']];
 return <div className="adminShell"><aside className="sidebar"><div className="brand" style={{marginBottom:24}}><span className="logo">A</span><span>ADCStore</span></div>{links.map(([href,label])=><Link key={href} href={href} style={path===href?{background:'color-mix(in srgb,var(--secondary) 22%,transparent)',color:'var(--text)'}:{}}>{label}</Link>)}<button className="btn alt" style={{marginTop:10}} onClick={logout}>Keluar</button></aside><main className="content">{children}</main></div>}
