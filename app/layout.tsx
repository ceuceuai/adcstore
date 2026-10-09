import './globals.css';
import type { Metadata } from 'next';
import GlobalFloatingWhatsApp from '@/components/GlobalFloatingWhatsApp';
import MobileBottomNav from '@/components/MobileBottomNav';
import PwaRegister from '@/components/PwaRegister';
import AnalyticsTracker from '@/components/AnalyticsTracker';

async function getBranding(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return null;
 try{
  const r=await fetch(`${url}/rest/v1/store_settings?id=eq.1&select=brand_name,tagline,logo_url,favicon_url`,{headers:{apikey:key,Authorization:`Bearer ${key}`},next:{revalidate:60}});
  if(!r.ok)return null; const rows=await r.json(); return rows?.[0]||null;
 }catch{return null}
}
export async function generateMetadata():Promise<Metadata>{
 const s=await getBranding(); const title=s?.brand_name||'Digital Store'; const description=s?.tagline||'Digital product store'; const icon=s?.favicon_url||s?.logo_url||undefined;
 return {title,description,icons:icon?{icon,shortcut:icon,apple:icon}:undefined};
}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}<GlobalFloatingWhatsApp/><MobileBottomNav/><PwaRegister/><AnalyticsTracker/></body></html>}
