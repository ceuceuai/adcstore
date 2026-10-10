'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { StoreSettings } from '@/lib/types';

export default function ForgotPassword(){
 const [email,setEmail]=useState('');
 const [busy,setBusy]=useState(false);
 const [msg,setMsg]=useState('');
 const [settings,setSettings]=useState<Partial<StoreSettings>>({});

 useEffect(()=>{
  createClient().from('store_settings').select('brand_name,logo_url').eq('id',1).maybeSingle().then(({data})=>{if(data)setSettings(data)});
 },[]);

 async function submit(e:FormEvent){
  e.preventDefault();
  if(busy)return;
  setBusy(true);setMsg('');
  const redirectTo=`${window.location.origin}/member/reset-password`;
  const {error}=await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo});
  setBusy(false);
  if(error){setMsg(error.message);return}
  setMsg('Link reset password sudah dikirim. Silakan cek inbox/spam email Anda.');
 }

 const brand=settings.brand_name||'Digital Store';
 return <div className="themeRoot authPage">
  <div className="authCard glass noAuthArt memberSingleAuth">
   <div className="authForm">
    <div className="brand">{settings.logo_url?<img src={settings.logo_url} alt={brand} className="brandLogoTransparent" style={{maxWidth:46,maxHeight:46,objectFit:'contain'}}/>:<span className="logo">{brand.charAt(0).toUpperCase()}</span>}<span>{brand} Member</span></div>
    <span className="eyebrow">RESET PASSWORD</span>
    <h1 style={{fontSize:42,marginBottom:8}}>Lupa Password?</h1>
    <p className="muted">Masukkan email akun member. Kami akan mengirim link untuk membuat password baru.</p>
    <form className="form" onSubmit={submit}>
     <div className="field"><label>Email Member</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></div>
     <button type="submit" className="btn" disabled={busy}>{busy?'Mengirim...':'Kirim Link Reset Password'}</button>
     {msg&&<div className="notice">{msg}</div>}
    </form>
    <div className="memberAuthLinks"><Link href="/member/login">← Kembali ke Login Member</Link></div>
   </div>
  </div>
 </div>
}
