'use client';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase';
import {AnalyticsEvent} from '@/lib/types';
import {
  Eye, Users, PackageSearch, MousePointerClick, ShoppingCart, MessageCircle, Images,
  TrendingUp, Activity, ArrowUpRight, BarChart3, Search, CalendarDays
} from 'lucide-react';

const periods=[7,30,90];

const eventLabels:Record<string,string>={
  page_view:'Page View',
  product_view:'Product View',
  salespage_click:'Salespage Click',
  checkout_click:'Checkout Click',
  whatsapp_click:'WhatsApp Click',
  banner_click:'Banner Click',
  purchase:'Purchase'
};

export default function AnalyticsPage(){
 const [days,setDays]=useState(30);
 const [events,setEvents]=useState<AnalyticsEvent[]>([]);
 const [products,setProducts]=useState<Record<string,string>>({});
 const [type,setType]=useState('all');
 const [q,setQ]=useState('');
 const [page,setPage]=useState(1);
 const [size,setSize]=useState(10);
 const [lastUpdated,setLastUpdated]=useState<Date|null>(null);
 const [loadError,setLoadError]=useState('');

 useEffect(()=>{
  let active=true;
  let timer:ReturnType<typeof setInterval>|null=null;

  async function loadAnalytics(){
   const client=createClient();
   const from=new Date(Date.now()-days*86400000).toISOString();
   const [a,b]=await Promise.all([
    client.from('analytics_events').select('*').gte('created_at',from).order('created_at',{ascending:false}).limit(5000),
    client.from('products').select('id,name')
   ]);
   if(!active)return;
   if(a.error){
    setLoadError(a.error.message);
   }else{
    setLoadError('');
    setEvents((a.data||[]) as AnalyticsEvent[]);
    setLastUpdated(new Date());
   }
   const m:Record<string,string>={};
   (b.data||[]).forEach((x:any)=>m[x.id]=x.name);
   setProducts(m);
  }

  void loadAnalytics();
  timer=setInterval(()=>void loadAnalytics(),5000);

  return()=>{
   active=false;
   if(timer)clearInterval(timer);
  };
 },[days]);

 const stats=useMemo(()=>{
  const count=(t:string)=>events.filter(e=>e.event_type===t).length;
  const unique=new Set(events.filter(e=>e.event_type==='page_view').map(e=>e.session_id).filter(Boolean)).size;
  return {
   views:count('page_view'),unique,product:count('product_view'),
   sales:count('salespage_click'),checkout:count('checkout_click'),
   wa:count('whatsapp_click'),banner:count('banner_click')
  };
 },[events]);

 const daily=useMemo(()=>{
  const map=new Map<string,number>();
  for(let i=days-1;i>=0;i--){
   const d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);
   map.set(d,0);
  }
  events.filter(e=>e.event_type==='page_view').forEach(e=>{
   const d=e.created_at.slice(0,10);
   if(map.has(d))map.set(d,(map.get(d)||0)+1);
  });
  return Array.from(map.entries());
 },[events,days]);

 const max=Math.max(1,...daily.map(x=>x[1]));
 const activeDays=daily.filter(x=>x[1]>0).length;
 const avgViews=days?stats.views/days:0;
 const checkoutCtr=stats.product?stats.checkout/stats.product*100:0;
 const salesCtr=stats.product?stats.sales/stats.product*100:0;

 const topProducts=useMemo(()=>{
  const m=new Map<string,{views:number;checkout:number;sales:number}>();
  events.forEach(e=>{
   if(!e.product_id)return;
   const v=m.get(e.product_id)||{views:0,checkout:0,sales:0};
   if(e.event_type==='product_view')v.views++;
   if(e.event_type==='checkout_click')v.checkout++;
   if(e.event_type==='salespage_click')v.sales++;
   m.set(e.product_id,v);
  });
  return Array.from(m.entries())
   .map(([id,v])=>({id,name:products[id]||'Produk',...v,score:v.views+v.checkout*3+v.sales*2}))
   .sort((a,b)=>b.score-a.score)
   .slice(0,5);
 },[events,products]);

 const topSources=useMemo(()=>{
  const m=new Map<string,number>();
  events.filter(e=>e.event_type==='page_view').forEach(e=>{
   const source=(e.utm_source||e.referrer||'Direct / Unknown').trim();
   m.set(source,(m.get(source)||0)+1);
  });
  return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
 },[events]);

 const filtered=events.filter(e=>
  (type==='all'||e.event_type===type)&&
  `${e.event_type} ${e.page_path||''} ${e.utm_source||''} ${e.referrer||''} ${e.product_id?products[e.product_id]||'':''}`
   .toLowerCase().includes(q.toLowerCase())
 );
 const pages=Math.max(1,Math.ceil(filtered.length/size));
 const safe=Math.min(page,pages);
 const rows=filtered.slice((safe-1)*size,safe*size);

 const statCards=[
  {label:'Page Views',value:stats.views,sub:'Total halaman dilihat',icon:Eye},
  {label:'Unique Visitor',value:stats.unique,sub:'Sesi unik anonim',icon:Users},
  {label:'Product Views',value:stats.product,sub:'Produk dibuka',icon:PackageSearch},
  {label:'Salespage Click',value:stats.sales,sub:`CTR ${salesCtr.toFixed(1)}%`,icon:MousePointerClick},
  {label:'Checkout Click',value:stats.checkout,sub:`CTR ${checkoutCtr.toFixed(1)}%`,icon:ShoppingCart},
  {label:'WhatsApp Click',value:stats.wa,sub:'Interaksi WhatsApp',icon:MessageCircle},
  {label:'Banner Click',value:stats.banner,sub:'Interaksi banner',icon:Images}
 ];

 return <div className="analyticsPage">
  <div className="analyticsHero">
   <div>
    <span className="analyticsEyebrow"><BarChart3 size={15}/> INTERNAL ANALYTICS</span>
    <h1>Analytics Website</h1>
    <p>Pantau traffic, minat produk, dan klik penting langsung dari ADCStore — tanpa wajib pasang iklan.</p>
   </div>
   <div className="analyticsLiveTools">
    <div className="analyticsLiveBadge"><span></span> LIVE • refresh 5 detik</div>
    <div className="analyticsPeriod">
     <CalendarDays size={18}/>
     <select value={days} onChange={e=>setDays(Number(e.target.value))}>
      {periods.map(x=><option value={x} key={x}>{x} Hari</option>)}
     </select>
    </div>
   </div>
  </div>
  {loadError&&<div className="analyticsLoadError"><strong>Analytics belum bisa membaca database.</strong><span>{loadError}</span></div>}
  {!loadError&&lastUpdated&&<div className="analyticsLastUpdated">Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}</div>}

  <div className="analyticsStatsGrid">
   {statCards.map(({label,value,sub,icon:Icon})=>
    <div className="analyticsStatCard" key={label}>
     <div className="analyticsStatIcon"><Icon size={20}/></div>
     <div className="analyticsStatBody">
      <span>{label}</span>
      <strong>{Number(value).toLocaleString('id-ID')}</strong>
      <small>{sub}</small>
     </div>
    </div>
   )}
  </div>

  <div className="analyticsMainGrid">
   <section className="analyticsPanel analyticsTrafficPanel">
    <div className="analyticsPanelHead">
     <div><span className="analyticsKicker">TRAFFIC OVERVIEW</span><h2>Page Views</h2><p>{days} hari terakhir</p></div>
     <div className="analyticsTrafficSummary">
      <div><small>Rata-rata / hari</small><strong>{avgViews.toFixed(1)}</strong></div>
      <div><small>Hari aktif</small><strong>{activeDays}</strong></div>
     </div>
    </div>

    <div className="analyticsChart">
     <div className="analyticsChartGrid"><span></span><span></span><span></span><span></span></div>
     <div className="analyticsBars">
      {daily.map(([d,v])=>
       <div className="analyticsBarItem" key={d} title={`${d}: ${v} page view`}>
        <div className="analyticsBarValue">{v>0?v:''}</div>
        <div className="analyticsBarTrack"><div className="analyticsBarFill" style={{height:`${Math.max(v?8:2,(v/max)*100)}%`}}></div></div>
        <small>{d.slice(5)}</small>
       </div>
      )}
     </div>
    </div>
   </section>

   <aside className="analyticsPanel analyticsInsightPanel">
    <span className="analyticsKicker">QUICK INSIGHT</span>
    <h2>Ringkasan</h2>
    <div className="analyticsInsightList">
     <div><span><TrendingUp size={17}/> CTR Checkout</span><strong>{checkoutCtr.toFixed(1)}%</strong></div>
     <div><span><MousePointerClick size={17}/> CTR Salespage</span><strong>{salesCtr.toFixed(1)}%</strong></div>
     <div><span><Activity size={17}/> WhatsApp Click</span><strong>{stats.wa}</strong></div>
     <div><span><Eye size={17}/> Avg. Views / Hari</span><strong>{avgViews.toFixed(1)}</strong></div>
    </div>
   </aside>
  </div>

  <div className="analyticsSecondaryGrid">
   <section className="analyticsPanel">
    <div className="analyticsPanelHead compact"><div><span className="analyticsKicker">TOP PRODUCTS</span><h2>Produk Paling Menarik</h2></div></div>
    <div className="analyticsRankList">
     {topProducts.map((p,i)=>
      <div className="analyticsRankRow" key={p.id}>
       <span className="analyticsRankNo">{String(i+1).padStart(2,'0')}</span>
       <div><strong>{p.name}</strong><small>{p.views} view • {p.sales} salespage • {p.checkout} checkout</small></div>
       <ArrowUpRight size={18}/>
      </div>
     )}
     {!topProducts.length&&<div className="analyticsEmpty">Belum ada data produk.</div>}
    </div>
   </section>

   <section className="analyticsPanel">
    <div className="analyticsPanelHead compact"><div><span className="analyticsKicker">TRAFFIC SOURCE</span><h2>Sumber Kunjungan</h2></div></div>
    <div className="analyticsSourceList">
     {topSources.map(([name,count],i)=>
      <div className="analyticsSourceRow" key={`${name}-${i}`}>
       <div><span>{name}</span><small>{count} page view</small></div>
       <strong>{stats.views?((count/stats.views)*100).toFixed(0):0}%</strong>
      </div>
     )}
     {!topSources.length&&<div className="analyticsEmpty">Belum ada sumber traffic.</div>}
    </div>
   </section>
  </div>

  <section className="analyticsPanel analyticsEventPanel">
   <div className="analyticsPanelHead">
    <div><span className="analyticsKicker">EVENT LOG</span><h2>Aktivitas Pengunjung</h2><p>Detail event anonim yang terekam di website.</p></div>
   </div>

   <div className="analyticsFilters">
    <div className="analyticsSearch"><Search size={17}/><input placeholder="Cari event, halaman, source..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div>
    <select value={type} onChange={e=>{setType(e.target.value);setPage(1)}}>
     <option value="all">Semua Event</option>
     {Object.keys(eventLabels).map(x=><option value={x} key={x}>{eventLabels[x]}</option>)}
    </select>
    <select value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}>
     <option value="10">10 / halaman</option><option value="20">20 / halaman</option><option value="50">50 / halaman</option>
    </select>
   </div>

   <div className="analyticsEventTable">
    <div className="analyticsEventHead"><span>Event</span><span>Halaman / Produk</span><span>Source</span><span>Waktu</span></div>
    {rows.map(e=>
     <div className="analyticsEventRowNew" key={e.id}>
      <span><i className={`analyticsEventDot event-${e.event_type}`}></i>{eventLabels[e.event_type]||e.event_type}</span>
      <span>{e.product_id?products[e.product_id]||'-':e.page_path||'-'}</span>
      <span>{e.utm_source||e.referrer||'Direct / Unknown'}</span>
      <small>{new Date(e.created_at).toLocaleString('id-ID')}</small>
     </div>
    )}
    {!rows.length&&<div className="analyticsEmpty">Belum ada event pada periode ini.</div>}
   </div>

   <div className="analyticsPager">
    <span>{filtered.length} event • Halaman {safe}/{pages}</span>
    <div>
     <button type="button" disabled={safe<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>← Sebelumnya</button>
     <button type="button" disabled={safe>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>Berikutnya →</button>
    </div>
   </div>
  </section>
 </div>
}
