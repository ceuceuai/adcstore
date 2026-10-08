'use client';
import { StoreSettings } from '@/lib/types';

type Props={settings:StoreSettings; page:'home'|'product'|'all'};
export default function FloatingWhatsApp({settings,page}:Props){
  if(!settings.floating_wa_enabled) return null;
  if(settings.floating_wa_show_on!=='all' && settings.floating_wa_show_on!==page) return null;
  const number=(settings.floating_wa_number||settings.whatsapp||'').replace(/\D/g,'');
  if(!number) return null;
  const href=`https://wa.me/${number}?text=${encodeURIComponent(settings.floating_wa_message||'Halo, saya butuh bantuan tentang produk ini.')}`;
  const side=settings.floating_wa_position==='left'?'left':'right';
  const custom=settings.floating_wa_style==='custom' && settings.floating_wa_icon_url;
  return <a href={href} target="_blank" rel="noreferrer" className={`floatingWa ${side} style-${settings.floating_wa_style}`} aria-label="Chat WhatsApp">
    {settings.floating_wa_tooltip&&<span className="floatingWaTip">{settings.floating_wa_tooltip}</span>}
    {custom?<img src={settings.floating_wa_icon_url!} alt="WhatsApp"/>:<span className="waBubble"><span className="waText">WA</span></span>}
  </a>
}
