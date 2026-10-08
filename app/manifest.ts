import type { MetadataRoute } from 'next';
export default async function manifest():Promise<MetadataRoute.Manifest>{
 let name='Digital Store',shortName='Store',icon='',description='Digital product store',theme='#8b5cf6';
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(url&&key){
   const r=await fetch(`${url}/rest/v1/store_settings?id=eq.1&select=brand_name,tagline,pwa_name,pwa_short_name,pwa_icon_url,logo_url,favicon_url,primary_color`,{headers:{apikey:key,Authorization:`Bearer ${key}`},next:{revalidate:300}});
   const rows=await r.json(); const s=rows?.[0];
   if(s){name=s.pwa_name||s.brand_name||name;shortName=s.pwa_short_name||s.brand_name||shortName;description=s.tagline||description;icon=s.pwa_icon_url||s.favicon_url||s.logo_url||'';theme=s.primary_color||theme}
  }
 }catch{}
 const icons=icon?[{src:icon,sizes:'any',purpose:'any' as const}]:[{src:'/pwa-default.svg',sizes:'512x512',type:'image/svg+xml',purpose:'any' as const}];
 return {name,short_name:shortName,description,start_url:'/',display:'standalone',background_color:'#f5efff',theme_color:theme,icons};
}
