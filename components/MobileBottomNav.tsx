'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect,useState } from 'react';
import { Home, Grid2X2, UserRound, KeyRound, Store, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { StoreSettings } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

function waTarget(s:Partial<StoreSettings>){
  if(s.floating_wa_target_type==='url') return (s.floating_wa_target_url||'').trim();
  const number=(s.floating_wa_number||s.whatsapp||'').replace(/\D/g,'');
  return number?`https://wa.me/${number}?text=${encodeURIComponent(s.floating_wa_message||'Halo, saya butuh bantuan.')}`:'';
}
export default function MobileBottomNav(){
 const path=usePathname(); const [s,setS]=useState<Partial<StoreSettings>>({});
 useEffect(()=>{createClient().from('store_settings').select('floating_wa_enabled,floating_wa_target_type,floating_wa_target_url,floating_wa_mobile_mode,floating_wa_number,floating_wa_message,whatsapp').eq('id',1).maybeSingle().then(({data})=>{if(data)setS(data as Partial<StoreSettings>)})},[]);
 const wa=waTarget(s); const waInNav=Boolean(s.floating_wa_enabled&&s.floating_wa_mobile_mode==='nav_item'&&wa);
 const items=[
  {href:'/',label:'Home',icon:Home,active:path==='/'},
  {href:'/#produk',label:'Produk',icon:Grid2X2,active:path.startsWith('/product')||path.startsWith('/checkout')},
  {href:'/member',label:'Member',icon:UserRound,active:path==='/member'},
  {href:'/member/access',label:'Akses',icon:KeyRound,active:path.startsWith('/member/access')}
 ];
 return <nav className="mobileBottomNav" aria-label="Navigasi mobile">
   {items.map(({href,label,icon:Icon,active},i)=><Link key={`${href}-${i}`} href={href} className={active?'active':''}><Icon size={20}/><span>{label}</span></Link>)}
   {waInNav?<a href={wa} target="_blank" rel="noreferrer" onClick={()=>trackEvent('whatsapp_click',{metadata:{location:'mobile_nav'}})} className="mobileWaNav"><MessageCircle size={20}/><span>WhatsApp</span></a>:<Link href="/"><Store size={20}/><span>Toko</span></Link>}
 </nav>
}
