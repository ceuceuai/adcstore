'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid2X2, UserRound, KeyRound, Store } from 'lucide-react';

export default function MobileBottomNav(){
 const path=usePathname();
 const items=[
  {href:'/',label:'Home',icon:Home,active:path==='/'},
  {href:'/#produk',label:'Produk',icon:Grid2X2,active:path.startsWith('/product')||path.startsWith('/checkout')},
  {href:'/member',label:'Member',icon:UserRound,active:path==='/member'},
  {href:'/member/access',label:'Akses',icon:KeyRound,active:path.startsWith('/member/access')},
  {href:'/',label:'Toko',icon:Store,active:false},
 ];
 return <nav className="mobileBottomNav" aria-label="Navigasi mobile">{items.map(({href,label,icon:Icon,active},i)=><Link key={`${href}-${i}`} href={href} className={active?'active':''}><Icon size={20}/><span>{label}</span></Link>)}</nav>
}
