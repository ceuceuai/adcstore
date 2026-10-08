'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StoreNav from '@/components/StoreNav';
import { createClient } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { rupiah } from '@/lib/money';
export default function ProductDetail(){const {slug}=useParams<{slug:string}>(); const [p,setP]=useState<Product|null>(null); const [loading,setLoading]=useState(true);
useEffect(()=>{createClient().from('products').select('*').eq('slug',slug).eq('is_active',true).maybeSingle().then(({data})=>{setP(data as Product|null);setLoading(false)})},[slug]);
if(loading)return <div className="container" style={{padding:60}}>Memuat produk...</div>; if(!p)return <div className="container" style={{padding:60}}><h1>Produk tidak ditemukan</h1><Link className="btn" href="/">Kembali</Link></div>;
return <><StoreNav/><section className="section"><div className="container"><div className="glass" style={{borderRadius:28,padding:24,display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:26}}>{p.image_url?<img src={p.image_url} className="productImage" style={{borderRadius:20}} alt={p.name}/>:<div className="productImage" style={{borderRadius:20}}/>}<div><div className="badge">{p.category||'Produk Digital'}</div><h1 style={{fontSize:44,marginBottom:10}}>{p.name}</h1><div className="price">{rupiah(p.price)}</div><p className="muted" style={{lineHeight:1.8}}>{p.description||p.short_description}</p><div className="actions" style={{marginTop:22}}>{p.affiliate_url&&<a className="btn" href={p.affiliate_url} target="_blank" rel="nofollow sponsored">{p.cta_text||'Beli Sekarang'}</a>}<Link className="btn alt" href="/">Kembali ke Katalog</Link></div>{!p.affiliate_url&&<div className="notice" style={{marginTop:18}}>Link affiliate produk ini belum diatur oleh pemilik toko.</div>}</div></div></div></section></>}
