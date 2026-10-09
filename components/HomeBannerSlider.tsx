'use client';
import { useEffect, useState } from 'react';
import { HomeBanner } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
export default function HomeBannerSlider({items}:{items:HomeBanner[]}){
 const[index,setIndex]=useState(0);
 useEffect(()=>{if(items.length<2)return;const t=setInterval(()=>setIndex(i=>(i+1)%items.length),5000);return()=>clearInterval(t)},[items.length]);
 if(!items.length)return null;
 const item=items[Math.min(index,items.length-1)];
 const inner=<><picture><source media="(max-width: 700px)" srcSet={item.mobile_image_url||item.desktop_image_url}/><img src={item.desktop_image_url} alt={item.title||'Promo banner'}/></picture>{item.cta_text&&<span className="bannerCta">{item.cta_text}</span>}</>;
 return <section className="bannerSection"><div className="container"><div className="bannerSlider3d">{item.target_url?<a href={item.target_url}>{inner}</a>:<div>{inner}</div>}{items.length>1&&<><button type="button" className="bannerArrow prev" onClick={()=>setIndex(i=>(i-1+items.length)%items.length)} aria-label="Banner sebelumnya">‹</button><button type="button" className="bannerArrow next" onClick={()=>setIndex(i=>(i+1)%items.length)} aria-label="Banner berikutnya">›</button><div className="bannerDots">{items.map((_,i)=><button type="button" key={i} onClick={()=>setIndex(i)} className={i===index?'active':''} aria-label={`Banner ${i+1}`}/>)}</div></>}</div></div></section>
}
