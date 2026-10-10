'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import StoreNav from '@/components/StoreNav';
import ThreeDArt from '@/components/ThreeDArt';
import ThemeProvider from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase';
import { HomeBanner, Product, StoreSettings, SocialLink, ProductCategory } from '@/lib/types';
import HomeBannerSlider from '@/components/HomeBannerSlider';
import { rupiah } from '@/lib/money';
import { trackEvent } from '@/lib/analytics';
import { Instagram, Facebook, Youtube, MessageCircle, Send, Music2, Globe2, Linkedin, Twitter } from 'lucide-react';

const fallback:StoreSettings={
 id:1,brand_name:'Digital Store',tagline:'Digital product store',logo_url:null,whatsapp:null,instagram_url:null,
 primary_color:'#8b5cf6',secondary_color:'#c4b5fd',accent_color:'#f9a8d4',theme_preset:'lavender',
 hero_badge:'BONUS EKSKLUSIF',hero_title:'Produk Digital Siap Jual untuk Member ADC',
 hero_subtitle:'Temukan produk digital pilihan, pelajari manfaatnya, lalu beli melalui link affiliate resmi.',
 hero_primary_cta_text:'Lihat Produk',hero_member_cta_text:'Masuk Member',hero_member_cta_enabled:true,
 hero_trust_1:'Produk siap promosi',hero_trust_2:'Link affiliate sendiri',hero_trust_3:'Tema bisa diganti',
 hero_visual_mode:'default',hero_image_url:null,hero_image_position:'right',hero_image_fit:'contain',hero_image_alt:'Hero image',
 catalog_eyebrow:'KATALOG DIGITAL',catalog_title:'Produk pilihan untuk mulai jualan',
 catalog_subtitle:'Produk ADC sudah tersedia. Pemilik toko tinggal mengatur link affiliate masing-masing.',
 highlight_section_enabled:true,highlight_section_eyebrow:'PILIHAN SPESIAL',highlight_section_title:'Promo & Produk Eksklusif',
 highlight_section_subtitle:'Produk pilihan yang sedang diprioritaskan untuk Anda.',
 floating_wa_enabled:false,floating_wa_number:null,floating_wa_message:'Halo, saya butuh bantuan tentang produk ini.',
 floating_wa_position:'right',floating_wa_style:'3d',floating_wa_icon_url:null,floating_wa_tooltip:'Butuh bantuan? Chat WhatsApp',
 floating_wa_show_on:'all',footer_text:'Digital Store',home_products_per_page:8,pwa_name:'Digital Store',pwa_short_name:'Store',pwa_icon_url:null
};

export default function Home(){
 const [settings,setSettings]=useState<StoreSettings>(fallback);
 const [products,setProducts]=useState<Product[]>([]);
 const [banners,setBanners]=useState<HomeBanner[]>([]);
 const [socials,setSocials]=useState<SocialLink[]>([]);
 const [categories,setCategories]=useState<ProductCategory[]>([]);
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('Semua');
 const [sort,setSort]=useState<'newest'|'oldest'|'low'|'high'>('newest');
 const [page,setPage]=useState(1);

 useEffect(()=>{
  const s=createClient();
  Promise.all([
   s.from('store_settings').select('*').eq('id',1).maybeSingle(),
   s.from('products').select('*').eq('is_active',true).order('created_at',{ascending:false}),
   s.from('homepage_banners').select('*').eq('is_active',true).order('sort_order'),
   s.from('social_links').select('*').eq('is_active',true).order('sort_order'),
   s.from('product_categories').select('*').eq('is_active',true).order('sort_order').order('name')
  ]).then(([a,b,c,d,e])=>{
   if(a.data)setSettings({...fallback,...a.data} as StoreSettings);
   if(d.error)console.error('[ADCStore Social] gagal membaca social_links:',d.error.message);
   if(b.data)setProducts(((b.data||[]) as Product[]).map(x=>({
    ...x,
    gallery_images:x.gallery_images||[],
    compare_at_price:Number(x.compare_at_price||0),
    show_discount_badge:x.show_discount_badge!==false,
    highlight_type:x.highlight_type||'none',
    highlight_label:x.highlight_label||null,
    highlight_sort_order:Number(x.highlight_sort_order||0)
   })));
   if(c.data)setBanners((c.data||[]) as HomeBanner[]);
   if(d.data)setSocials((d.data||[]) as SocialLink[]);
   if(e.data)setCategories((e.data||[]) as ProductCategory[]);
  });
 },[]);

 const categoryOptions=useMemo(()=>{const roots=categories.filter(x=>!x.parent_id);const ordered:ProductCategory[]=[];for(const r of roots){ordered.push(r,...categories.filter(x=>x.parent_id===r.id))}const legacy=Array.from(new Set(products.map(x=>x.category).filter(Boolean) as string[])).filter(x=>!categories.some(c=>c.name===x)).map(name=>({id:`legacy-${name}`,name,slug:'',parent_id:null,description:null,image_url:null,is_active:true,sort_order:9999} as ProductCategory));return [...ordered,...legacy]},[categories,products]);

 const filtered=useMemo(()=>{
  const list=products.filter(p=>(cat==='Semua'||p.category===cat)&&(`${p.name} ${p.short_description||''} ${p.category||''}`.toLowerCase().includes(q.toLowerCase())));
  return [...list].sort((a:any,b:any)=>
   sort==='oldest'?new Date(a.created_at||0).getTime()-new Date(b.created_at||0).getTime():
   sort==='low'?Number(a.price)-Number(b.price):
   sort==='high'?Number(b.price)-Number(a.price):
   new Date(b.created_at||0).getTime()-new Date(a.created_at||0).getTime()
  );
 },[products,q,cat,sort]);

 const highlighted=useMemo(()=>products
  .filter(p=>(p.highlight_type||'none')!=='none')
  .sort((a,b)=>Number(a.highlight_sort_order||0)-Number(b.highlight_sort_order||0) || Number(a.sort_order||0)-Number(b.sort_order||0))
  .slice(0,8),[products]);

 const size=settings.home_products_per_page||8;
 const pages=Math.max(1,Math.ceil(filtered.length/size));
 const safePage=Math.min(page,pages);
 const shown=filtered.slice((safePage-1)*size,safePage*size);

 const heroVisual=settings.hero_visual_mode==='none'
  ?null
  :settings.hero_visual_mode==='default'
   ?<ThreeDArt/>
   :settings.hero_image_url
    ?<img src={settings.hero_image_url} alt={settings.hero_image_alt||settings.brand_name} className="heroVisualImage" style={{objectFit:settings.hero_image_fit}}/>
    :<ThreeDArt/>;

 function highlightText(p:Product){
  if(p.highlight_type==='custom')return p.highlight_label?.trim()||'SPESIAL';
  if(p.highlight_type==='exclusive')return 'EXCLUSIVE';
  if(p.highlight_type==='promo')return 'PROMO';
  return '';
 }

 function socialIcon(x:SocialLink){
  const key=(x.platform||x.label||'').toLowerCase();
  if(x.icon_url)return <img src={x.icon_url} alt="" className="socialFooterCustomIcon"/>;
  if(key.includes('instagram'))return <Instagram size={18}/>;
  if(key.includes('facebook'))return <Facebook size={18}/>;
  if(key.includes('youtube'))return <Youtube size={18}/>;
  if(key.includes('whatsapp'))return <MessageCircle size={18}/>;
  if(key.includes('telegram'))return <Send size={18}/>;
  if(key.includes('tiktok'))return <Music2 size={18}/>;
  if(key.includes('linkedin'))return <Linkedin size={18}/>;
  if(key.includes('twitter')||key==='x')return <Twitter size={18}/>;
  return <Globe2 size={18}/>;
 }

 function productCard(p:Product,special=false){
  const salesSource=p.homepage_salespage_source||'auto';
  const checkoutSource=p.homepage_checkout_source||'auto';
  const affiliateSales=p.affiliate_salespage_url?.trim()||'';
  const internalSales=p.internal_salespage_html?.trim()?`/salespage/${p.slug}`:'';
  const affiliateCheckout=p.affiliate_url?.trim()||'';
  const internalCheckout=(p.sale_mode==='internal'||p.sale_mode==='both')?`/checkout/${p.slug}`:'';
  const salesUrl=salesSource==='hidden'?'':salesSource==='affiliate'?affiliateSales:salesSource==='internal'?internalSales:(affiliateSales||internalSales);
  const checkoutUrl=checkoutSource==='hidden'?'':checkoutSource==='affiliate'?affiliateCheckout:checkoutSource==='internal'?internalCheckout:(affiliateCheckout||internalCheckout);
  const specialText=special?highlightText(p):'';

  return <article className={`card productCard ${special?'specialProductCard':''}`} key={p.id}>
   {specialText&&<div className={`specialProductBadge type-${p.highlight_type}`}>{specialText}</div>}
   <div className="categoryFloat">{p.category||'Produk Digital'}</div>
   <Link href={`/product/${p.slug}`} className="productImageLink">
    {p.image_url
     ?<div className="productSquareFrame compact"><img src={p.image_url} className="productSquareImage" alt={p.name}/></div>
     :<div className="productSquareFrame compact placeholderArt"><span>{(settings.brand_name||'S').charAt(0)}</span></div>}
   </Link>
   <div className="cardBody">
    <Link href={`/product/${p.slug}`} className="productTitleLink"><h3>{p.name}</h3></Link>
    <p className="muted">{p.short_description}</p>
    <div className="priceStack">
     {p.compare_at_price>p.price&&<span className="comparePrice">{rupiah(p.compare_at_price)}</span>}
     <div className="price">{rupiah(p.price)}</div>
     {p.show_discount_badge&&p.compare_at_price>p.price&&<span className="discountBadge">{p.discount_badge_text||`HEMAT ${Math.round((1-p.price/p.compare_at_price)*100)}%`}</span>}
    </div>
    <div className="homeProductCtas">
     {salesUrl&&(salesUrl.startsWith('/salespage/')
      ?<a className="btn alt" href={salesUrl} target="_blank" rel="noopener" onClick={()=>trackEvent('salespage_click',{product_id:p.id,metadata:{location:special?'highlight':'homepage',source:'internal'}})}>Salespage</a>
      :salesUrl.startsWith('/')
       ?<Link className="btn alt" href={salesUrl} onClick={()=>trackEvent('salespage_click',{product_id:p.id,metadata:{location:special?'highlight':'homepage',source:'internal'}})}>Salespage</Link>
       :<a className="btn alt" href={salesUrl} target="_blank" rel="nofollow sponsored" onClick={()=>trackEvent('salespage_click',{product_id:p.id,metadata:{location:special?'highlight':'homepage',source:'official'}})}>Salespage</a>)}
     {checkoutUrl&&(checkoutUrl.startsWith('/')
      ?<Link className="btn" href={checkoutUrl} onClick={()=>trackEvent('checkout_click',{product_id:p.id,metadata:{location:special?'highlight':'homepage',source:'internal'}})}>Checkout</Link>
      :<a className="btn" href={checkoutUrl} target="_blank" rel="nofollow sponsored" onClick={()=>trackEvent('checkout_click',{product_id:p.id,metadata:{location:special?'highlight':'homepage',source:'official'}})}>Checkout</a>)}
    </div>
   </div>
  </article>;
 }

 return <ThemeProvider preset={settings.theme_preset} primary={settings.primary_color} secondary={settings.secondary_color} accent={settings.accent_color}>
  <StoreNav brand={settings.brand_name} logoUrl={settings.logo_url}/>
  <header className="hero">
   <div className={`container heroGrid ${settings.hero_image_position==='left'?'visualLeft':''}`}>
    <div className="heroCopy">
     {settings.hero_badge&&<span className="badge">{settings.hero_badge}</span>}
     <h1>{settings.hero_title}</h1><p>{settings.hero_subtitle}</p>
     <div className="actions">
      <a href="#produk" className="btn">{settings.hero_primary_cta_text||'Lihat Produk'}</a>
      {settings.hero_member_cta_enabled&&<Link href="/member/login" className="btn soft">{settings.hero_member_cta_text||'Masuk Member'}</Link>}
     </div>
     <div className="trustRow">{settings.hero_trust_1&&<span>✦ {settings.hero_trust_1}</span>}{settings.hero_trust_2&&<span>✦ {settings.hero_trust_2}</span>}{settings.hero_trust_3&&<span>✦ {settings.hero_trust_3}</span>}</div>
    </div>
    {heroVisual&&<div className="heroVisualWrap">{heroVisual}</div>}
   </div>
  </header>

  <HomeBannerSlider items={banners}/>

  {settings.highlight_section_enabled!==false&&highlighted.length>0&&
   <section className="section specialProductsSection" id="pilihan-spesial">
    <div className="container">
     <div className="sectionHead">
      <div>
       {settings.highlight_section_eyebrow&&<span className="eyebrow">{settings.highlight_section_eyebrow}</span>}
       <h2>{settings.highlight_section_title||'Promo & Produk Eksklusif'}</h2>
       {settings.highlight_section_subtitle&&<p className="muted">{settings.highlight_section_subtitle}</p>}
      </div>
     </div>
     <div className={`specialProductGrid specialCount${Math.min(highlighted.length,4)}`}>{highlighted.map(p=>productCard(p,true))}</div>
    </div>
   </section>}

  <section className="section" id="produk">
   <div className="container">
    <div className="sectionHead"><div>
     {settings.catalog_eyebrow&&<span className="eyebrow">{settings.catalog_eyebrow}</span>}
     <h2>{settings.catalog_title}</h2><p className="muted">{settings.catalog_subtitle}</p>
    </div></div>
    <div className="filterBar">
     <input className="input" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} placeholder="Cari produk..."/>
     <select className="input" value={cat} onChange={e=>{setCat(e.target.value);setPage(1)}}><option value="Semua">Semua Kategori</option>{categoryOptions.map(c=>{const parent=c.parent_id?categories.find(x=>x.id===c.parent_id):null;return <option key={c.id} value={c.name}>{parent?`${parent.name} › ${c.name}`:c.name}</option>})}</select>
     <select className="input" value={sort} onChange={e=>{setSort(e.target.value as typeof sort);setPage(1)}}>
      <option value="newest">Terbaru</option><option value="oldest">Terlama</option><option value="low">Harga Termurah</option><option value="high">Harga Termahal</option>
     </select>
    </div>
    <div className="grid productGrid">{shown.map(p=>productCard(p,false))}{shown.length===0&&<div className="notice">Belum ada produk yang cocok.</div>}</div>
    {filtered.length>0&&<div className="pager3d" style={{marginTop:24}}>
     <span>{filtered.length} produk • Halaman {safePage}/{pages} • {size} produk/halaman</span>
     <div className="actions">
      <button type="button" className="btn alt" disabled={safePage<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>← Sebelumnya</button>
      <button type="button" className="btn alt" disabled={safePage>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>Berikutnya →</button>
     </div>
    </div>}
   </div>
  </section>

  <footer className="footer">
   <div className="container footerInner">
    <div className="footerText">{settings.footer_text}</div>
    {socials.length>0&&<div className="socialFooter" aria-label="Social Media">
     {socials.map(x=><a key={x.id} href={x.url} target="_blank" rel="noopener noreferrer" title={x.label||x.platform}>
      {socialIcon(x)}
      <span>{x.label||x.platform}</span>
     </a>)}
    </div>}
   </div>
  </footer>
 </ThemeProvider>;
}
