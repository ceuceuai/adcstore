'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { StoreSettings } from '@/lib/types';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const fallback:StoreSettings={id:1,brand_name:'Digital Store',tagline:'',logo_url:null,whatsapp:null,instagram_url:null,primary_color:'#8b5cf6',secondary_color:'#c4b5fd',accent_color:'#f9a8d4',theme_preset:'lavender',hero_badge:'',hero_title:'',hero_subtitle:'',hero_primary_cta_text:'Lihat Produk',hero_member_cta_text:'Masuk Member',hero_member_cta_enabled:true,hero_trust_1:'',hero_trust_2:'',hero_trust_3:'',hero_visual_mode:'default',hero_image_url:null,hero_image_position:'right',hero_image_fit:'contain',hero_image_alt:'',catalog_eyebrow:'',catalog_title:'',catalog_subtitle:'',floating_wa_enabled:false,floating_wa_number:null,floating_wa_target_type:'number',floating_wa_target_url:null,floating_wa_mobile_mode:'above_nav',floating_wa_message:'Halo, saya butuh bantuan tentang produk ini.',floating_wa_position:'right',floating_wa_style:'3d',floating_wa_icon_url:null,floating_wa_tooltip:'Butuh bantuan? Chat WhatsApp',floating_wa_show_on:'all',footer_text:'',home_products_per_page:8,pwa_name:'Digital Store',pwa_short_name:'Store',pwa_icon_url:null};

export default function GlobalFloatingWhatsApp(){
 const path=usePathname();const[settings,setSettings]=useState<StoreSettings>(fallback);
 useEffect(()=>{createClient().from('store_settings').select('*').eq('id',1).maybeSingle().then(({data})=>{if(data)setSettings({...fallback,...data} as StoreSettings)})},[]);
 if(path.startsWith('/admin')||path.startsWith('/owner'))return null;
 const page=path==='/'?'home':path.startsWith('/product/')?'product':'all';
 return <FloatingWhatsApp settings={settings} page={page}/>;
}
