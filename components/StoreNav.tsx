'use client';
import Link from 'next/link';
export default function StoreNav({brand='ADCStore'}:{brand?:string}){
 return <nav className="nav"><div className="container navin"><Link href="/" className="brand"><span className="logo">A</span><span>{brand}</span></Link><div className="actions"><Link className="navLink" href="/#produk">Produk</Link><Link className="btn soft" href="/member/login">Member Area</Link></div></div></nav>
}
