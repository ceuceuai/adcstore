'use client';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { createClient } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { rupiah } from '@/lib/money';
export default function Orders(){
 const [rows,setRows]=useState<Order[]>([]); const [filter,setFilter]=useState('all'); const [msg,setMsg]=useState('');
 async function load(){const {data}=await createClient().from('orders').select('*,products(name,slug)').order('created_at',{ascending:false});setRows((data||[]) as Order[])} useEffect(()=>{load()},[]);
 async function status(id:string,v:Order['status']){const {error}=await createClient().from('orders').update({status:v}).eq('id',id);setMsg(error?error.message:'Status order diperbarui.');await load()}
 const shown=rows.filter(x=>filter==='all'||x.status===filter);
 return <AdminShell><div className="pageHead3d"><div><span className="eyebrow">INTERNAL CHECKOUT</span><h1>Order / Checkout</h1><p>Kelola pembayaran customer yang checkout langsung di website.</p></div><select className="input compactSelect" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Semua Status</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><div className="orderCards3d">{shown.map(o=><article className="orderCard3d" key={o.id}><div className="orderMain"><div><span className={`statusPill ${o.status}`}>{o.status}</span><h3>{o.products?.name||'Produk'}</h3><p>{o.customer_name} • {o.customer_email}</p><small>{o.order_number} • {new Date(o.created_at).toLocaleString('id-ID')}</small></div><div className="orderAmount"><strong>{rupiah(o.amount)}</strong><span>{o.payment_method}</span></div></div><div className="orderActions"><a className="btn alt" href={`https://wa.me/${o.customer_whatsapp.replace(/\D/g,'')}`} target="_blank">WhatsApp</a>{o.payment_proof_url&&<a className="btn alt" href={o.payment_proof_url} target="_blank">Bukti Bayar</a>}<select className="input" value={o.status} onChange={e=>status(o.id,e.target.value as Order['status'])}><option value="pending">Pending</option><option value="paid">Paid</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div></article>)}{!shown.length&&<div className="empty3d panel3d">Belum ada order.</div>}</div>{msg&&<div className="notice floatingNotice">{msg}</div>}</AdminShell>
}
