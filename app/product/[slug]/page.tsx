'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {useParams} from 'next/navigation';
import StoreNav from '@/components/StoreNav';
import ThemeProvider from '@/components/ThemeProvider';
import {createClient} from '@/lib/supabase';
import {Product,StoreSettings} from '@/lib/types';
import {rupiah} from '@/lib/money';
import {trackEvent} from '@/lib/analytics';

const fallback:StoreSettings={id:1,brand_name:'Digital Store',tagline:'Digital product store',logo_url:null,whatsapp:null,instagram_url:null,primary_color:'#8b5cf6',secondary_color:'#c4b5fd',accent_color:'#f9a8d4',theme_preset:'lavender',hero_badge:'BONUS EKSKLUSIF',hero_title:'Produk Digital Siap Jual untuk Member ADC',hero_subtitle:'',hero_primary_cta_text:'Lihat Produk',hero_member_cta_text:'Masuk Member',hero_member_cta_enabled:true,hero_trust_1:'Produk siap promosi',hero_trust_2:'Link affiliate sendiri',hero_trust_3:'Tema bisa diganti',hero_visual_mode:'default',hero_image_url:null,hero_image_position:'right',hero_image_fit:'contain',hero_image_alt:'Hero image',catalog_eyebrow:'KATALOG DIGITAL',catalog_title:'Produk pilihan untuk mulai jualan',catalog_subtitle:'Produk ADC sudah tersedia.',floating_wa_enabled:false,floating_wa_number:null,floating_wa_message:'Halo, saya butuh bantuan tentang produk ini.',floating_wa_position:'right',floating_wa_style:'3d',floating_wa_icon_url:null,floating_wa_tooltip:'Butuh bantuan? Chat WhatsApp',floating_wa_show_on:'all',footer_text:'Digital Store',home_products_per_page:8,pwa_name:'Digital Store',pwa_short_name:'Store',pwa_icon_url:null};

function videoEmbed(url:string){
 try{
  const u=new URL(url);
  if(u.hostname.includes('youtube.com')){const id=u.searchParams.get('v');return id?`https://www.youtube.com/embed/${id}`:null}
  if(u.hostname==='youtu.be')return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
  if(u.hostname.includes('vimeo.com')){const id=u.pathname.split('/').filter(Boolean).pop();return id?`https://player.vimeo.com/video/${id}`:null}
 }catch{}
 return null
}

export default function ProductDetail(){
 const {slug}=useParams<{slug:string}>();
 const[p,setP]=useState<Product|null>(null),[settings,setSettings]=useState(fallback),[loading,setLoading]=useState(true),[activeImage,setActiveImage]=useState(''),[related,setRelated]=useState<Product[]>([]);
 useEffect(()=>{
  const s=createClient();
  Promise.all([
   s.from('products').select('*').eq('slug',slug).eq('is_active',true).maybeSingle(),
   s.from('store_settings').select('*').eq('id',1).maybeSingle()
  ]).then(async([a,b])=>{
   const product=a.data as Product|null;
   if(product){
    product.gallery_images=product.gallery_images||[];
    setP(product);setActiveImage(product.image_url||product.gallery_images[0]||'');trackEvent('product_view',{product_id:product.id});
    let rq=s.from('products').select('*').eq('is_active',true).neq('id',product.id);
    if(product.category)rq=rq.eq('category',product.category);
    let {data:rdata}=await rq.order('created_at',{ascending:false}).limit(4);
    if((rdata||[]).length<4){
      const existing=new Set((rdata||[]).map((x:any)=>x.id));
      existing.add(product.id);
      const {data:fallbackRows}=await s.from('products').select('*').eq('is_active',true).order('created_at',{ascending:false}).limit(8);
      rdata=[...(rdata||[]),...(fallbackRows||[]).filter((x:any)=>!existing.has(x.id))].slice(0,4);
    }
    setRelated(((rdata||[]) as Product[]).map(x=>({...x,gallery_images:x.gallery_images||[],compare_at_price:Number(x.compare_at_price||0)})));
   }
   if(b.data)setSettings({...fallback,...b.data} as StoreSettings);
   setLoading(false)
  })
 },[slug]);

 const gallery=useMemo(()=>p?Array.from(new Set([p.image_url,...(p.gallery_images||[])].filter(Boolean) as string[])):[],[p]);
 if(loading)return <div style={{padding:60}}>Memuat produk...</div>;
 if(!p)return <div style={{padding:60}}><h1>Produk tidak ditemukan</h1><Link className="btn" href="/">Kembali</Link></div>;

 const embed=p.video_url?videoEmbed(p.video_url):null;
 const hasInternalSalespage=Boolean(p.internal_salespage_html?.trim());
 const hasOfficialSalespage=Boolean(p.affiliate_salespage_url?.trim());
 const hasOfficialCheckout=Boolean(p.affiliate_url?.trim());
 const hasInternalCheckout=p.sale_mode==='internal'||p.sale_mode==='both';

 return <ThemeProvider preset={settings.theme_preset} primary={settings.primary_color} secondary={settings.secondary_color} accent={settings.accent_color}>
  <StoreNav brand={settings.brand_name} logoUrl={settings.logo_url}/>
  <section className="section">
   <div className="container">
    <div className="productDetail3d">
     <div>
      {activeImage?<div className="productSquareFrame"><img src={activeImage} className="productSquareImage" alt={p.name}/></div>:<div className="productSquareFrame placeholderArt"><span>{(settings.brand_name||'Store').trim().charAt(0).toUpperCase()}</span></div>}
      {gallery.length>1&&<div className="productThumbGrid">{gallery.map(url=><button type="button" key={url} onClick={()=>setActiveImage(url)} className={`productThumb ${activeImage===url?'active':''}`}><img src={url} alt="Thumbnail"/></button>)}</div>}
     </div>
     <div className="productDetailCopy">
      <div className="badge">{p.category||'Produk Digital'}</div>
      <h1>{p.name}</h1>
      <div className="priceStack detailPrice">
       {p.compare_at_price>p.price&&<span className="comparePrice">{rupiah(p.compare_at_price)}</span>}
       <div className="price">{rupiah(p.price)}</div>
       {p.show_discount_badge&&p.compare_at_price>p.price&&<span className="discountBadge">{p.discount_badge_text||`HEMAT ${Math.round((1-p.price/p.compare_at_price)*100)}%`}</span>}
      </div>
      <p>{p.description||p.short_description}</p>
      <div className="detailCtaGrid">
       {hasOfficialSalespage&&<a className="btn alt" href={p.affiliate_salespage_url!} target="_blank" rel="nofollow sponsored" onClick={()=>trackEvent('salespage_click',{product_id:p.id,metadata:{source:'official'}})}>{p.affiliate_salespage_cta_text||'Lihat Salespage Official'}</a>}
       {hasInternalSalespage&&<a className="btn alt" href={`/salespage/${p.slug}`} target="_blank" rel="noopener" onClick={()=>trackEvent('salespage_click',{product_id:p.id,metadata:{source:'internal'}})}>Lihat Salespage Internal</a>}
       {hasOfficialCheckout&&<a className="btn soft" href={p.affiliate_url!} target="_blank" rel="nofollow sponsored" onClick={()=>trackEvent('checkout_click',{product_id:p.id,metadata:{source:'official'}})}>{p.cta_text||'Checkout di Website Resmi'}</a>}
       {hasInternalCheckout&&<Link className="btn" href={`/checkout/${p.slug}`} onClick={()=>trackEvent('checkout_click',{product_id:p.id,metadata:{source:'internal'}})}>{p.internal_cta_text||'Checkout di Website Ini'}</Link>}
      </div>
      <div style={{marginTop:14}}><Link className="btn alt" href="/">← Kembali ke Produk</Link></div>
     </div>
    </div>

    {p.video_url&&<div className="panel3d productSectionPanel"><span className="eyebrow">VIDEO SALES LETTER</span><div className="videoFrame">{embed?<iframe src={embed} title={`Video ${p.name}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>:<video controls src={p.video_url}/>}</div></div>}

    {related.length>0&&<section className="relatedSection"><div className="sectionHead"><div><span className="eyebrow">PRODUK TERKAIT</span><h2>Rekomendasi Produk Lainnya</h2><p className="muted">Produk dari kategori yang sama atau produk terbaru lainnya.</p></div></div><div className="grid relatedProductGrid">{related.map(r=><article className="card productCard relatedProductCard" key={r.id}><Link href={`/product/${r.slug}`} className="relatedImageLink">{r.image_url?<div className="productSquareFrame compact"><img src={r.image_url} className="productSquareImage" alt={r.name}/></div>:<div className="productSquareFrame compact placeholderArt"><span>{(settings.brand_name||'S').charAt(0)}</span></div>}</Link><div className="cardBody"><div className="badge small">{r.category||'Produk Digital'}</div><Link href={`/product/${r.slug}`} className="productTitleLink"><h3>{r.name}</h3></Link><div className="priceStack">{r.compare_at_price>r.price&&<span className="comparePrice">{rupiah(r.compare_at_price)}</span>}<div className="price">{rupiah(r.price)}</div></div><Link className="btn full" href={`/product/${r.slug}`}>Lihat Produk</Link></div></article>)}</div></section>}
   </div>
  </section>
 </ThemeProvider>
}
