'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { StoreSettings } from '@/lib/types';

export default function MemberLogin(){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [name,setName]=useState('');
 const [whatsapp,setWhatsapp]=useState('');
 const [mode,setMode]=useState<'login'|'signup'>('login');
 const [msg,setMsg]=useState('');
 const [busy,setBusy]=useState(false);
 const router=useRouter();
 const [settings,setSettings]=useState<Partial<StoreSettings>>({});

 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const requestedMode=params.get('mode');
  const prefillEmail=params.get('email');
  const prefillName=params.get('name');
  const prefillWa=params.get('wa');
  if(requestedMode==='signup')setMode('signup');
  if(prefillEmail)setEmail(prefillEmail);
  if(prefillName)setName(prefillName);
  if(prefillWa)setWhatsapp(prefillWa);

  createClient()
   .from('store_settings')
   .select('brand_name,logo_url,member_login_label,member_login_heading,member_login_description,member_signup_heading,member_signup_description,member_login_visual_mode,member_login_visual_url')
   .eq('id',1)
   .maybeSingle()
   .then(({data})=>{if(data)setSettings(data)});
 },[]);

 async function submit(e:FormEvent){
  e.preventDefault();
  if(busy)return;
  setBusy(true);
  setMsg('Memproses...');
  const s=createClient();

  if(mode==='login'){
   const {error}=await s.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
   if(error){setBusy(false);setMsg(error.message);return}
   const {data:admin}=await s.rpc('is_admin');
   if(admin){
    await s.auth.signOut();
    setBusy(false);
    setMsg('Akun owner/admin harus masuk melalui halaman owner.');
    return;
   }
   router.replace('/member');
   return;
  }

  if(name.trim().length<2){setBusy(false);setMsg('Nama member wajib diisi.');return}
  if(password.length<6){setBusy(false);setMsg('Password minimal 6 karakter.');return}

  const redirectTo=`${window.location.origin}/member`;
  const {data,error}=await s.auth.signUp({
   email:email.trim().toLowerCase(),
   password,
   options:{data:{full_name:name.trim(),whatsapp:whatsapp.trim()},emailRedirectTo:redirectTo}
  });

  setBusy(false);
  if(error){
   if(/already registered|already been registered|user already registered/i.test(error.message)){
    setMsg('Email ini sudah punya akun. Silakan Login Member atau gunakan Lupa Password.');
   }else{
    setMsg(error.message);
   }
   return;
  }

  if(data.session){
   setMsg('Akun berhasil dibuat. Anda akan masuk ke Member Area.');
   window.setTimeout(()=>router.replace('/member'),500);
  }else{
   setMsg('Akun berhasil dibuat. Jika konfirmasi email aktif di Supabase, cek inbox email Anda lalu login.');
   setMode('login');
  }
 }

 const brand=settings.brand_name||'Digital Store';
 const initial=brand.trim().charAt(0).toUpperCase()||'S';
 const brandLabel=`${brand} ${settings.member_login_label||'Member'}`;
 const visualMode=settings.member_login_visual_mode||'brand';
 const visualUrl=visualMode==='custom'?settings.member_login_visual_url:settings.logo_url;
 const visual=visualMode==='none'?null:(visualUrl?<img src={visualUrl} alt={`${brand} login visual`} className="authVisualImage"/>:<div className="authBrandFallback">{initial}</div>);

 return <div className="themeRoot authPage">
  <div className={`authCard glass ${visualMode==='none'?'noAuthArt':''}`}>
   {visual&&<div className="authArt">{visual}</div>}
   <div className="authForm">
    <div className="brand">
     {settings.logo_url?<img src={settings.logo_url} alt={brand} className="brandLogoTransparent" style={{maxWidth:46,maxHeight:46,objectFit:'contain'}}/>:<span className="logo">{initial}</span>}
     <span>{brandLabel}</span>
    </div>

    <h1 style={{fontSize:42,marginBottom:8}}>{mode==='login'?(settings.member_login_heading||'Welcome Back!'):(settings.member_signup_heading||'Buat Akun Member')}</h1>
    <p className="muted">{mode==='login'?(settings.member_login_description||'Masuk untuk membuka member area.'):(settings.member_signup_description||'Gunakan email yang sama dengan email checkout agar akses produk dapat terhubung otomatis.')}</p>

    <form className="form" onSubmit={submit}>
     {mode==='signup'&&<><div className="field"><label>Nama</label><input className="input" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required/></div><div className="field"><label>WhatsApp</label><input className="input" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="62812xxxx" autoComplete="tel"/></div></>}
     <div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></div>
     <div className="field">
      <div className="memberPasswordLabel"><label>Password</label>{mode==='login'&&<Link href="/member/forgot-password">Lupa Password?</Link>}</div>
      <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} required/>
     </div>

     {mode==='signup'&&<div className="notice">Penting: gunakan <b>email yang sama dengan saat checkout</b>. Setelah order berstatus Paid/Completed, produk otomatis muncul di Akses Produk Anda.</div>}

     <button type="submit" className="btn" disabled={busy}>{busy?'Memproses...':mode==='login'?'Login Member':'Buat Akun & Password'}</button>
     {msg&&<div className="notice">{msg}</div>}
    </form>

    <button type="button" className="btn alt" style={{marginTop:12,width:'100%'}} onClick={()=>{setMode(mode==='login'?'signup':'login');setMsg('')}}>
     {mode==='login'?'Belum punya akun? Buat Akun Member':'Sudah punya akun? Login'}
    </button>
    <div style={{marginTop:20,textAlign:'center'}}><Link className="muted" href="/">← Kembali ke toko</Link></div>
   </div>
  </div>
 </div>
}
