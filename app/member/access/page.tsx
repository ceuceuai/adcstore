'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Order, OrderItem, ProductAccess } from '@/lib/types';
import { KeyRound, ExternalLink } from 'lucide-react';

type PurchasedItem={key:string;order_number:string;product_id:string;product_name:string;product_slug?:string};

export default function MemberAccess(){
 const router=useRouter();
 const [items,setItems]=useState<PurchasedItem[]>([]);
 const [access,setAccess]=useState<Record<string,ProductAccess>>({});
 const [loading,setLoading]=useState(true); const [loadError,setLoadError]=useState('');
 const [q,setQ]=useState(''),[page,setPage]=useState(1),[size,setSize]=useState(10);

 useEffect(()=>{
  const s=createClient();
  s.auth.getUser().then(async({data})=>{
   if(!data.user)return router.replace('/member/login');
   const email=data.user.email||'';
   const {data:os,error:ordersError}=await s.from('orders').select('id,order_number,product_id,products(name,slug)').eq('customer_email',email).in('status',['paid','completed']).order('created_at',{ascending:false});
   if(ordersError){setLoadError(`Order tidak bisa dibaca: ${ordersError.message}`);setLoading(false);return}
   const orders=(os||[]) as any[];
   const orderIds=orders.map(o=>o.id);

   let purchased:PurchasedItem[]=[];
   if(orderIds.length){
    const {data:oi,error:itemsError}=await s.from('order_items').select('id,order_id,product_id,product_name,products(name,slug)').in('order_id',orderIds);
    if(itemsError){setLoadError(`Item order tidak bisa dibaca: ${itemsError.message}`);setLoading(false);return}
    const orderMap=new Map(orders.map(o=>[o.id,o]));
    purchased=(oi||[]).map((x:any)=>{
     const o=orderMap.get(x.order_id);
     return {key:x.id,order_number:o?.order_number||'',product_id:x.product_id,product_name:x.product_name||x.products?.name||'Produk',product_slug:x.products?.slug};
    });

    const withItems=new Set((oi||[]).map((x:any)=>x.order_id));
    orders.filter(o=>!withItems.has(o.id)).forEach(o=>purchased.push({key:`legacy-${o.id}`,order_number:o.order_number,product_id:o.product_id,product_name:o.products?.name||'Produk',product_slug:o.products?.slug}));
   }

   setItems(purchased);
   const ids=Array.from(new Set(purchased.map(x=>x.product_id)));
   if(ids.length){
    const {data:acs,error:accessError}=await s.from('product_access').select('*').in('product_id',ids).eq('is_active',true);
    if(accessError){setLoadError(`Akses produk tidak bisa dibaca: ${accessError.message}`);setLoading(false);return}
    const map:Record<string,ProductAccess>={};
    (acs||[]).forEach((x:any)=>map[x.product_id]={...x,buttons:x.buttons||[]});
    setAccess(map);
   }
   setLoading(false);
  });
 },[router]);

 const filtered=useMemo(()=>items.filter(o=>`${o.product_name} ${o.order_number}`.toLowerCase().includes(q.toLowerCase())),[items,q]);
 const pages=Math.max(1,Math.ceil(filtered.length/size)),safePage=Math.min(page,pages),shown=filtered.slice((safePage-1)*size,safePage*size);

 if(loading)return <div style={{padding:40}}>Memuat akses produk...</div>;

 return <div className="memberAccessPage"><div className="container">
  {loadError&&<div className="notice" style={{marginBottom:16}}>{loadError}</div>}
  <div className="pageHead3d"><div><span className="eyebrow">MEMBER ACCESS</span><h1>Akses Produk Saya</h1><p>Semua produk dalam order yang sudah diverifikasi akan muncul di sini.</p></div><Link href="/member" className="btn soft">← Dashboard</Link></div>
  <div className="filterPanel3d"><input className="input" placeholder="Cari produk atau nomor order..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/><select className="input" value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}><option value="10">10 / halaman</option><option value="20">20 / halaman</option><option value="50">50 / halaman</option></select></div>
  <div className="memberAccessGrid">{shown.map(o=>{const a=access[o.product_id];return <article className="memberAccessCard" key={o.key}><div className="memberAccessIcon"><KeyRound/></div><h2>{o.product_name}</h2><small>{o.order_number}</small>{a?<><div className="htmlPreview" dangerouslySetInnerHTML={{__html:a.access_type!=='buttons'?(a.html_content||''):''}}/>{a.access_type!=='html'&&<div className="accessButtons">{a.buttons.map(b=><a key={b.id} className={b.style==='primary'?'btn':'btn soft'} href={b.url} target="_blank"><ExternalLink size={16}/>{b.label}</a>)}</div>}</>:<div className="notice">Akses produk belum diatur oleh owner.</div>}</article>})}{!shown.length&&<div className="panel3d empty3d">Belum ada produk yang cocok.</div>}</div>
  <div className="pager3d"><span>{filtered.length} produk • Halaman {safePage}/{pages}</span><div className="actions"><button type="button" className="btn alt" disabled={safePage<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>←</button><button type="button" className="btn alt" disabled={safePage>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>→</button></div></div>
 </div></div>
}
