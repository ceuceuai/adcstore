import type { MetadataRoute } from 'next';
export default async function manifest():Promise<MetadataRoute.Manifest>{
 let name='ADCStore',shortName='ADCStore',icon='';
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(url&&key){
   const r=await fetch(`${url}/rest/v1/store_settings?id=eq.1&select=brand_name,pwa_name,pwa_short_name,pwa_icon_url,logo_url`,{headers:{apikey:key,Authorization:`Bearer ${key}`},next:{revalidate:300}});
   const rows=await r.json(); const s=rows?.[0];
   if(s){name=s.pwa_name||s.brand_name||name;shortName=s.pwa_short_name||s.brand_name||shortName;icon=s.pwa_icon_url||s.logo_url||''}
  }
 }catch{}
 const icons=icon?[{src:icon,sizes:'any',purpose:'any' as const}]:[{src:'/pwa-default.svg',sizes:'512x512',type:'image/svg+xml',purpose:'any' as const}];
 return {name,short_name:shortName,description:'Digital Store & Affiliate Website for ADC Members',start_url:'/',display:'standalone',background_color:'#f5efff',theme_color:'#8b5cf6',icons};
}
