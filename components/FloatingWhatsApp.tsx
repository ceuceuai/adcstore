'use client';
import { StoreSettings } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
type Props={settings:StoreSettings; page:'home'|'product'|'all'};
function buildTarget(settings:StoreSettings){
  if(settings.floating_wa_target_type==='url') return (settings.floating_wa_target_url||'').trim();
  const number=(settings.floating_wa_number||settings.whatsapp||'').replace(/\D/g,'');
  return number?`https://wa.me/${number}?text=${encodeURIComponent(settings.floating_wa_message||'Halo, saya butuh bantuan tentang produk ini.')}`:'';
}
export default function FloatingWhatsApp({settings,page}:Props){
  if(!settings.floating_wa_enabled) return null;
  if(settings.floating_wa_show_on!=='all' && settings.floating_wa_show_on!==page) return null;
  const href=buildTarget(settings); if(!href)return null;
  const side=settings.floating_wa_position==='left'?'left':'right';
  const custom=settings.floating_wa_style==='custom' && settings.floating_wa_icon_url;
  const mobileMode=settings.floating_wa_mobile_mode||'above_nav';
  return <a href={href} target="_blank" rel="noreferrer" onClick={()=>trackEvent('whatsapp_click',{metadata:{target_type:settings.floating_wa_target_type||'number'}})} className={`floatingWa ${side} style-${settings.floating_wa_style} mobile-${mobileMode}`} aria-label="Buka WhatsApp">
    {settings.floating_wa_tooltip&&<span className="floatingWaTip">{settings.floating_wa_tooltip}</span>}
    {custom?<img src={settings.floating_wa_icon_url!} alt="WhatsApp"/>:<span className="waBubble"><span className="waText">WA</span></span>}
  </a>
}
