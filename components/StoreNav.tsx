'use client';
import Link from 'next/link';
export default function StoreNav({brand='Digital Store',logoUrl}:{brand?:string;logoUrl?:string|null}){
 const initial=brand.trim().charAt(0).toUpperCase()||'S';
 return <nav className="nav"><div className="container navin"><Link href="/" className="brand">{logoUrl?<img src={logoUrl} alt={brand} style={{maxWidth:42,maxHeight:42,objectFit:'contain',borderRadius:10}}/>:<span className="logo">{initial}</span>}<span>{brand}</span></Link><div className="actions"><Link className="navLink" href="/#produk">Produk</Link><Link className="btn soft" href="/member/login">Member Area</Link></div></div></nav>
}
