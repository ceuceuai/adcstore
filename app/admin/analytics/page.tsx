'use client';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase';
import {AnalyticsEvent,Product} from '@/lib/types';

const periods=[7,30,90];

export default function AnalyticsPage(){
 const [days,setDays]=useState(30),[events,setEvents]=useState<AnalyticsEvent[]>([]),[products,setProducts]=useState<Record<string,string>>({}),[type,setType]=useState('all'),[q,setQ]=useState(''),[page,setPage]=useState(1),[size,setSize]=useState(10);
 useEffect(()=>{
  const s=createClient(); const from=new Date(Date.now()-days*86400000).toISOString();
  Promise.all([
   s.from('analytics_events').select('*').gte('created_at',from).order('created_at',{ascending:false}).limit(5000),
   s.from('products').select('id,name')
  ]).then(([a,b])=>{setEvents((a.data||[]) as AnalyticsEvent[]);const m:Record<string,string>={};(b.data||[]).forEach((x:any)=>m[x.id]=x.name);setProducts(m)})
 },[days]);

 const stats=useMemo(()=>{
   const count=(t:string)=>events.filter(e=>e.event_type===t).length;
   const unique=new Set(events.filter(e=>e.event_type==='page_view').map(e=>e.session_id).filter(Boolean)).size;
   return {views:count('page_view'),unique,product:count('product_view'),sales:count('salespage_click'),checkout:count('checkout_click'),wa:count('whatsapp_click'),banner:count('banner_click')};
 },[events]);

 const daily=useMemo(()=>{
   const map=new Map<string,number>();
   for(let i=days-1;i>=0;i--){const d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);map.set(d,0)}
   events.filter(e=>e.event_type==='page_view').forEach(e=>{const d=e.created_at.slice(0,10);if(map.has(d))map.set(d,(map.get(d)||0)+1)});
   return Array.from(map.entries());
 },[events,days]);
 const max=Math.max(1,...daily.map(x=>x[1]));

 const topProducts=useMemo(()=>{
   const m=new Map<string,{views:number;checkout:number;sales:number}>();
   events.forEach(e=>{if(!e.product_id)return;const v=m.get(e.product_id)||{views:0,checkout:0,sales:0};if(e.event_type==='product_view')v.views++;if(e.event_type==='checkout_click')v.checkout++;if(e.event_type==='salespage_click')v.sales++;m.set(e.product_id,v)});
   return Array.from(m.entries()).map(([id,v])=>({id,name:products[id]||'Produk',...v,score:v.views+v.checkout*3+v.sales*2})).sort((a,b)=>b.score-a.score).slice(0,10);
 },[events,products]);

 const filtered=events.filter(e=>(type==='all'||e.event_type===type)&&`${e.event_type} ${e.page_path||''} ${e.utm_source||''} ${e.referrer||''} ${e.product_id?products[e.product_id]||'':''}`.toLowerCase().includes(q.toLowerCase()));
 const pages=Math.max(1,Math.ceil(filtered.length/size)),safe=Math.min(page,pages),rows=filtered.slice((safe-1)*size,safe*size);

 return <div className="adminPage">
  <div className="pageHead3d"><div><span className="eyebrow">INTERNAL ANALYTICS</span><h1>Analytics Website</h1><p>Analisa performa ADCStore tanpa harus memasang iklan.</p></div><select className="input" value={days} onChange={e=>setDays(Number(e.target.value))}>{periods.map(x=><option value={x} key={x}>{x} Hari</option>)}</select></div>

  <div className="statsGrid">
   {[['Page Views',stats.views],['Unique Visitor',stats.unique],['Product Views',stats.product],['Salespage Click',stats.sales],['Checkout Click',stats.checkout],['WhatsApp Click',stats.wa],['Banner Click',stats.banner]].map(([l,v])=><div className="stat3d" key={String(l)}><small>{l}</small><strong>{v}</strong></div>)}
  </div>

  <div className="panel3d" style={{padding:22,marginTop:18}}><div className="inlineHead"><div><span className="eyebrow">TRAFFIC</span><h2>Page Views {days} Hari</h2></div></div><div className="miniBars">{daily.map(([d,v])=><div className="miniBarWrap" key={d} title={`${d}: ${v}`}><div className="miniBar" style={{height:`${Math.max(6,(v/max)*100)}%`}}></div><small>{d.slice(5)}</small></div>)}</div></div>

  <div className="twoCols" style={{marginTop:18}}>
   <div className="panel3d" style={{padding:22}}><span className="eyebrow">TOP PRODUCTS</span><h2>Produk Paling Menarik</h2><div className="analyticsTopList">{topProducts.map((p,i)=><div className="analyticsTopRow" key={p.id}><b>#{i+1}</b><span>{p.name}</span><small>{p.views} view • {p.sales} salespage • {p.checkout} checkout</small></div>)}{!topProducts.length&&<div className="notice">Belum ada data.</div>}</div></div>
   <div className="panel3d" style={{padding:22}}><span className="eyebrow">INSIGHT</span><h2>Ringkasan</h2><div className="notice">CTR Checkout: <b>{stats.product?((stats.checkout/stats.product)*100).toFixed(1):'0.0'}%</b></div><div className="notice" style={{marginTop:10}}>CTR Salespage: <b>{stats.product?((stats.sales/stats.product)*100).toFixed(1):'0.0'}%</b></div><div className="notice" style={{marginTop:10}}>Klik WhatsApp: <b>{stats.wa}</b></div></div>
  </div>

  <div className="panel3d" style={{padding:22,marginTop:18}}><div className="inlineHead"><div><span className="eyebrow">EVENT LOG</span><h2>Aktivitas Pengunjung</h2></div></div>
   <div className="filterBar"><input className="input" placeholder="Cari event / halaman / source..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/><select className="input" value={type} onChange={e=>{setType(e.target.value);setPage(1)}}><option value="all">Semua Event</option>{['page_view','product_view','salespage_click','checkout_click','whatsapp_click','banner_click','purchase'].map(x=><option key={x}>{x}</option>)}</select><select className="input" value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}><option value="10">10 / halaman</option><option value="20">20 / halaman</option><option value="50">50 / halaman</option></select></div>
   <div className="analyticsEventList">{rows.map(e=><div className="analyticsEventRow" key={e.id}><strong>{e.event_type}</strong><span>{e.product_id?products[e.product_id]||'-':e.page_path||'-'}</span><span>{e.utm_source||e.referrer||'-'}</span><small>{new Date(e.created_at).toLocaleString('id-ID')}</small></div>)}</div>
   <div className="pager3d"><span>{filtered.length} event • Halaman {safe}/{pages}</span><div className="actions"><button className="btn alt" disabled={safe<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>←</button><button className="btn alt" disabled={safe>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>→</button></div></div>
  </div>
 </div>
}
