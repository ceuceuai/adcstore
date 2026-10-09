'use client';
import Script from 'next/script';
import { useEffect,useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { StoreSettings } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

export default function AnalyticsTracker(){
  const path=usePathname(); const [s,setS]=useState<Partial<StoreSettings>>({});
  useEffect(()=>{createClient().from('store_settings').select('meta_pixel_enabled,meta_pixel_id,tiktok_pixel_enabled,tiktok_pixel_id,ga4_enabled,ga4_measurement_id,gtm_enabled,gtm_container_id').eq('id',1).maybeSingle().then(({data})=>{if(data)setS(data as Partial<StoreSettings>)})},[]);
  useEffect(()=>{trackEvent('page_view',{page_path:path})},[path]);
  return <>
    {s.ga4_enabled&&s.ga4_measurement_id&&<>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.ga4_measurement_id}`} strategy="afterInteractive"/>
      <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${s.ga4_measurement_id}');`}</Script>
    </>}
    {s.gtm_enabled&&s.gtm_container_id&&<Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtm_container_id}');`}</Script>}
    {s.meta_pixel_enabled&&s.meta_pixel_id&&<Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.meta_pixel_id}');fbq('track','PageView');`}</Script>}
    {s.tiktok_pixel_enabled&&s.tiktok_pixel_id&&<Script id="tiktok-pixel" strategy="afterInteractive">{`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('${s.tiktok_pixel_id}');ttq.page();}(window,document,'ttq');`}</Script>}
  </>
}
