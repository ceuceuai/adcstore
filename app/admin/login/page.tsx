'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
export default function Login(){const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState(''); const router=useRouter();
async function submit(e:FormEvent){e.preventDefault();setMsg('Memproses...'); const {error}=await createClient().auth.signInWithPassword({email,password}); if(error)setMsg(error.message);else router.replace('/admin')}
return <div className="container" style={{maxWidth:460,padding:'80px 0'}}><div className="glass" style={{padding:28,borderRadius:24}}><div className="brand"><span className="logo">A</span><span>ADCStore Admin</span></div><h1>Login Admin</h1><p className="muted">Masuk menggunakan akun owner yang dibuat di Supabase Auth.</p><form className="form" onSubmit={submit}><div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="field"><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div><button className="btn">Masuk</button>{msg&&<div className="notice">{msg}</div>}</form></div></div>}
