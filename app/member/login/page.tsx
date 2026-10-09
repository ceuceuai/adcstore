'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { StoreSettings } from '@/lib/types';

export default function MemberLogin(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
 const [mode,setMode]=useState<'login'|'signup'>('login'); const [msg,setMsg]=useState(''); const router=useRouter();
 const [settings,setSettings]=useState<Partial<StoreSettings>>({});
 useEffect(()=>{createClient().from('store_settings').select('brand_name,logo_url,member_login_label,member_login_heading,member_login_description,member_signup_heading,member_signup_description,member_login_visual_mode,member_login_visual_url').eq('id',1).maybeSingle().then(({data})=>{if(data)setSettings(data)})},[]);
 async function submit(e:FormEvent){e.preventDefault();setMsg('Memproses...');const s=createClient();if(mode==='login'){const {error}=await s.auth.signInWithPassword({email,password});if(error)return setMsg(error.message);const {data:admin}=await s.rpc('is_admin');if(admin){await s.auth.signOut();return setMsg('Akun owner/admin harus masuk melalui halaman owner.')}router.replace('/member')}else{const {error}=await s.auth.signUp({email,password,options:{data:{full_name:name}}});setMsg(error?error.message:'Pendaftaran berhasil. Cek email bila konfirmasi email aktif, lalu login sebagai member.')}}
 const brand=settings.brand_name||'Digital Store'; const initial=brand.trim().charAt(0).toUpperCase()||'S';
 const brandLabel=`${brand} ${settings.member_login_label||'Member'}`;
 const visualMode=settings.member_login_visual_mode||'brand';
 const visualUrl=visualMode==='custom'?settings.member_login_visual_url:settings.logo_url;
 const visual=visualMode==='none'?null:(visualUrl?<img src={visualUrl} alt={`${brand} login visual`} className="authVisualImage"/>:<div className="authBrandFallback">{initial}</div>);
 return <div className="themeRoot authPage"><div className={`authCard glass ${visualMode==='none'?'noAuthArt':''}`}>{visual&&<div className="authArt">{visual}</div>}<div className="authForm"><div className="brand">{settings.logo_url?<img src={settings.logo_url} alt={brand} className="brandLogoTransparent" style={{maxWidth:46,maxHeight:46,objectFit:'contain'}}/>:<span className="logo">{initial}</span>}<span>{brandLabel}</span></div><h1 style={{fontSize:42,marginBottom:8}}>{mode==='login'?(settings.member_login_heading||'Welcome Back!'):(settings.member_signup_heading||'Buat Akun Member')}</h1><p className="muted">{mode==='login'?(settings.member_login_description||'Masuk untuk membuka member area.'):(settings.member_signup_description||'Daftar untuk mengakses member area.')}</p><form className="form" onSubmit={submit}>{mode==='signup'&&<div className="field"><label>Nama</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required/></div>}<div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="field"><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/></div><button className="btn">{mode==='login'?'Login Member':'Daftar Member'}</button>{msg&&<div className="notice">{msg}</div>}</form><button className="btn alt" style={{marginTop:12,width:'100%'}} onClick={()=>{setMode(mode==='login'?'signup':'login');setMsg('')}}>{mode==='login'?'Belum punya akun? Daftar':'Sudah punya akun? Login'}</button><div style={{marginTop:20,textAlign:'center'}}><Link className="muted" href="/">← Kembali ke toko</Link></div></div></div></div>}
