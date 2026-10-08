'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Order, ProductAccess } from '@/lib/types';
import { KeyRound, ExternalLink } from 'lucide-react';
export default function MemberAccess(){
 const router=useRouter();const [orders,setOrders]=useState<Order[]>([]);const [access,setAccess]=useState<Record<string,ProductAccess>>({});const [loading,setLoading]=useState(true);
 useEffect(()=>{const s=createClient();s.auth.getUser().then(async({data})=>{if(!data.user)return router.replace('/member/login');const email=data.user.email||'';const {data:os}=await s.from('orders').select('*,products(name,slug)').eq('customer_email',email).in('status',['paid','completed']).order('created_at',{ascending:false});const list=(os||[]) as Order[];setOrders(list);const ids=Array.from(new Set(list.map(x=>x.product_id)));if(ids.length){const {data:acs}=await s.from('product_access').select('*').in('product_id',ids).eq('is_active',true);const map:Record<string,ProductAccess>={};(acs||[]).forEach((x:any)=>map[x.product_id]={...x,buttons:x.buttons||[]});setAccess(map)}setLoading(false)})},[router]);
 if(loading)return <div style={{padding:40}}>Memuat akses produk...</div>;
 return <div className="memberAccessPage"><div className="container"><div className="pageHead3d"><div><span className="eyebrow">MEMBER ACCESS</span><h1>Akses Produk Saya</h1><p>Produk yang sudah diverifikasi pembayarannya akan muncul di sini.</p></div><Link href="/member" className="btn soft">← Dashboard</Link></div><div className="memberAccessGrid">{orders.map(o=>{const a=access[o.product_id];return <article className="memberAccessCard" key={o.id}><div className="memberAccessIcon"><KeyRound/></div><h2>{o.products?.name||'Produk'}</h2><small>{o.order_number}</small>{a?<><div className="htmlPreview" dangerouslySetInnerHTML={{__html:a.access_type!=='buttons'?(a.html_content||''):''}}/>{a.access_type!=='html'&&<div className="accessButtons">{a.buttons.map(b=><a key={b.id} className={b.style==='primary'?'btn':'btn soft'} href={b.url} target="_blank"><ExternalLink size={16}/>{b.label}</a>)}</div>}</>:<div className="notice">Akses produk belum diatur oleh owner.</div>}</article>})}{!orders.length&&<div className="panel3d empty3d">Belum ada produk berstatus paid/completed untuk email akun ini.</div>}</div></div></div>
}
