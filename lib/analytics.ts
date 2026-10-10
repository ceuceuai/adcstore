import { createClient } from '@/lib/supabase';

export type AnalyticsEventType='page_view'|'product_view'|'salespage_click'|'checkout_click'|'whatsapp_click'|'banner_click'|'purchase';

function getSessionId(){
  if(typeof window==='undefined') return null;
  const key='adcstore_session_id';
  let id=localStorage.getItem(key);
  if(!id){id=crypto.randomUUID();localStorage.setItem(key,id)}
  return id;
}

function getUtm(name:string){
  if(typeof window==='undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

export async function trackEvent(event_type:AnalyticsEventType,opts?:{
  product_id?:string|null;
  metadata?:Record<string,unknown>;
  page_path?:string|null;
}){
  if(typeof window==='undefined') return false;
  try{
    const {error}=await createClient().from('analytics_events').insert({
      event_type,
      product_id:opts?.product_id||null,
      page_path:opts?.page_path||window.location.pathname,
      referrer:document.referrer||null,
      utm_source:getUtm('utm_source'),
      utm_medium:getUtm('utm_medium'),
      utm_campaign:getUtm('utm_campaign'),
      session_id:getSessionId(),
      metadata:opts?.metadata||{}
    });
    if(error){
      console.error('[ADCStore Analytics] gagal menyimpan event',event_type,error.message);
      return false;
    }
    return true;
  }catch(error){
    console.error('[ADCStore Analytics] exception',event_type,error);
    return false;
  }
}
