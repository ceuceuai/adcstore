'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function ResetPassword(){
 const router=useRouter();
 const [password,setPassword]=useState('');
 const [confirmPassword,setConfirmPassword]=useState('');
 const [ready,setReady]=useState(false);
 const [busy,setBusy]=useState(false);
 const [msg,setMsg]=useState('Memeriksa link reset password...');

 useEffect(()=>{
  let active=true;
  async function prepare(){
   const s=createClient();
   const params=new URLSearchParams(window.location.search);
   const code=params.get('code');

   if(code){
    const {error}=await s.auth.exchangeCodeForSession(code);
    if(error){
     if(active){setMsg(`Link reset tidak valid atau sudah kedaluwarsa: ${error.message}`);setReady(false)}
     return;
    }
   }

   const {data}=await s.auth.getSession();
   if(!active)return;
   if(data.session){
    setReady(true);
    setMsg('');
   }else{
    setReady(false);
    setMsg('Session reset password tidak ditemukan. Silakan minta link reset yang baru.');
   }
  }
  void prepare();
  return()=>{active=false};
 },[]);

 async function submit(e:FormEvent){
  e.preventDefault();
  if(!ready||busy)return;
  if(password.length<6){setMsg('Password minimal 6 karakter.');return}
  if(password!==confirmPassword){setMsg('Konfirmasi password tidak sama.');return}

  setBusy(true);setMsg('');
  const {error}=await createClient().auth.updateUser({password});
  setBusy(false);
  if(error){setMsg(error.message);return}
  setMsg('Password berhasil diubah. Mengarahkan ke Member Area...');
  window.setTimeout(()=>router.replace('/member'),700);
 }

 return <div className="themeRoot authPage">
  <div className="authCard glass noAuthArt memberSingleAuth">
   <div className="authForm">
    <span className="eyebrow">MEMBER SECURITY</span>
    <h1 style={{fontSize:42,marginBottom:8}}>Buat Password Baru</h1>
    <p className="muted">Gunakan minimal 6 karakter dan jangan gunakan password yang mudah ditebak.</p>
    <form className="form" onSubmit={submit}>
     <div className="field"><label>Password Baru</label><input className="input" type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" required disabled={!ready}/></div>
     <div className="field"><label>Ulangi Password Baru</label><input className="input" type="password" minLength={6} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" required disabled={!ready}/></div>
     <button type="submit" className="btn" disabled={!ready||busy}>{busy?'Menyimpan...':'Simpan Password Baru'}</button>
     {msg&&<div className="notice">{msg}</div>}
    </form>
    <div className="memberAuthLinks"><Link href="/member/forgot-password">Kirim ulang link reset</Link><Link href="/member/login">Login Member</Link></div>
   </div>
  </div>
 </div>
}
