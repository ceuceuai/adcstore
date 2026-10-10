'use client';
import {FormEvent,useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase';
import ConfirmDialog from '@/components/ConfirmDialog';
import {Copy,Download,Eye,EyeOff,KeyRound,MessageCircle,Pencil,Plus,RefreshCw,Search,Trash2,Users,X} from 'lucide-react';
import * as XLSX from 'xlsx';

type MemberRow={
 id:string;
 email:string;
 full_name:string;
 whatsapp:string;
 email_confirmed_at:string|null;
 created_at:string;
 last_sign_in_at:string|null;
 order_count:number;
 paid_count:number;
};

type MemberForm={id?:string;full_name:string;email:string;whatsapp:string;password:string};
type Credential={name:string;email:string;whatsapp:string;password:string};

const emptyForm:MemberForm={full_name:'',email:'',whatsapp:'',password:''};

function generatePassword(){
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
 const bytes=new Uint32Array(12);
 crypto.getRandomValues(bytes);
 return Array.from(bytes,x=>alphabet[x%alphabet.length]).join('');
}

function waNumber(raw:string){
 let n=String(raw||'').replace(/\D/g,'');
 if(n.startsWith('0'))n=`62${n.slice(1)}`;
 return n;
}

export default function MembersPage(){
 const [rows,setRows]=useState<MemberRow[]>([]);
 const [q,setQ]=useState('');
 const [status,setStatus]=useState<'all'|'confirmed'|'unconfirmed'>('all');
 const [page,setPage]=useState(1);
 const [size,setSize]=useState(10);
 const [loading,setLoading]=useState(true);
 const [msg,setMsg]=useState('');
 const [form,setForm]=useState<MemberForm>(emptyForm);
 const [modal,setModal]=useState(false);
 const [passwordModal,setPasswordModal]=useState<MemberRow|null>(null);
 const [newPassword,setNewPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState<MemberRow|null>(null);
 const [credential,setCredential]=useState<Credential|null>(null);

 async function token(){
  const {data}=await createClient().auth.getSession();
  return data.session?.access_token||'';
 }

 async function api(body?:unknown){
  const t=await token();
  const res=await fetch('/api/admin/members',{
   method:body?'POST':'GET',
   headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
   body:body?JSON.stringify(body):undefined,
   cache:'no-store'
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||'Permintaan gagal.');
  return data;
 }

 async function load(){
  setLoading(true);
  try{
   const data=await api();
   setRows(data.members||[]);
   setMsg('');
  }catch(e:any){
   setMsg(e.message);
  }finally{
   setLoading(false);
  }
 }

 useEffect(()=>{void load()},[]);

 const filtered=useMemo(()=>rows.filter(x=>{
  const statusOk=status==='all'||(status==='confirmed'?!!x.email_confirmed_at:!x.email_confirmed_at);
  const needle=`${x.full_name} ${x.email} ${x.whatsapp}`.toLowerCase();
  return statusOk&&needle.includes(q.toLowerCase());
 }),[rows,q,status]);

 const pages=Math.max(1,Math.ceil(filtered.length/size));
 const safePage=Math.min(page,pages);
 const shown=filtered.slice((safePage-1)*size,safePage*size);

 function openCreate(){
  setForm({...emptyForm,password:generatePassword()});
  setShowPassword(true);
  setModal(true);
  setMsg('');
 }
 function openEdit(x:MemberRow){
  setForm({id:x.id,full_name:x.full_name,email:x.email,whatsapp:x.whatsapp,password:''});
  setModal(true);
  setMsg('');
 }
 function openPassword(x:MemberRow){
  setPasswordModal(x);
  setNewPassword(generatePassword());
  setShowPassword(true);
  setMsg('');
 }

 async function save(e:FormEvent){
  e.preventDefault();
  if(busy)return;
  setBusy(true);setMsg('');
  try{
   const isEdit=!!form.id;
   await api({
    action:isEdit?'update':'create',
    id:form.id,
    full_name:form.full_name,
    email:form.email,
    whatsapp:form.whatsapp,
    password:form.password
   });

   if(!isEdit){
    setCredential({
     name:form.full_name,
     email:form.email.trim().toLowerCase(),
     whatsapp:form.whatsapp,
     password:form.password
    });
    setMsg('Member berhasil dibuat. Kirim data login ke member melalui WhatsApp.');
   }else{
    setMsg('Data member berhasil diperbarui.');
   }

   setModal(false);
   await load();
  }catch(e:any){
   setMsg(e.message);
  }finally{
   setBusy(false);
  }
 }

 async function savePassword(e:FormEvent){
  e.preventDefault();
  if(!passwordModal||busy)return;
  setBusy(true);setMsg('');
  try{
   await api({action:'set_password',id:passwordModal.id,password:newPassword});
   setCredential({
    name:passwordModal.full_name,
    email:passwordModal.email,
    whatsapp:passwordModal.whatsapp,
    password:newPassword
   });
   setPasswordModal(null);
   setMsg('Password member berhasil diubah. Kirim data login baru melalui WhatsApp.');
  }catch(e:any){
   setMsg(e.message);
  }finally{
   setBusy(false);
  }
 }

 async function remove(){
  if(!deleteTarget||busy)return;
  setBusy(true);
  try{
   await api({action:'delete',id:deleteTarget.id});
   setDeleteTarget(null);
   setMsg('Member berhasil dihapus.');
   await load();
  }catch(e:any){
   setMsg(e.message);
  }finally{
   setBusy(false);
  }
 }

 function credentialText(c:Credential){
  return `Halo ${c.name||'Member'}, akun member Anda sudah aktif.\n\nLogin: ${window.location.origin}/member/login\nEmail: ${c.email}\nPassword: ${c.password}\n\nSilakan login dan Anda bisa mengganti password dari Dashboard Member > Keamanan.`;
 }

 async function copyCredential(){
  if(!credential)return;
  await navigator.clipboard.writeText(credentialText(credential));
  setMsg('Data login berhasil dicopy.');
 }

 function whatsappCredential(){
  if(!credential)return '#';
  const n=waNumber(credential.whatsapp);
  const text=encodeURIComponent(credentialText(credential));
  return n?`https://wa.me/${n}?text=${text}`:`https://wa.me/?text=${text}`;
 }

 function exportExcel(){
  const data=filtered.map((x,i)=>({
   No:i+1,
   Nama:x.full_name,
   Email:x.email,
   WhatsApp:x.whatsapp,
   'Email Terkonfirmasi':x.email_confirmed_at?'Ya':'Belum',
   'Total Order':x.order_count,
   'Order Paid/Completed':x.paid_count,
   'Tanggal Daftar':new Date(x.created_at).toLocaleString('id-ID'),
   'Login Terakhir':x.last_sign_in_at?new Date(x.last_sign_in_at).toLocaleString('id-ID'):'Belum login'
  }));
  const ws=XLSX.utils.json_to_sheet(data);
  ws['!cols']=[{wch:6},{wch:26},{wch:32},{wch:18},{wch:20},{wch:14},{wch:22},{wch:22},{wch:22}];
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Member');
  XLSX.writeFile(wb,`ADCStore-Member-${new Date().toISOString().slice(0,10)}.xlsx`);
 }

 return <>
  <ConfirmDialog
   open={!!deleteTarget}
   title="Hapus Member?"
   message={deleteTarget?`Akun ${deleteTarget.full_name||deleteTarget.email} akan dihapus. Data order historis tetap tersimpan.`:''}
   confirmText="Ya, Hapus Member"
   busy={busy}
   onCancel={()=>!busy&&setDeleteTarget(null)}
   onConfirm={remove}
  />

  <div className="pageHead3d">
   <div><span className="eyebrow">MEMBER DATABASE</span><h1>Member</h1><p>Kelola akun, buat password langsung, kirim data login via WhatsApp, dan export database member.</p></div>
   <div className="actions">
    <button type="button" className="btn alt" onClick={exportExcel}><Download size={17}/> Export Excel</button>
    <button type="button" className="btn" onClick={openCreate}><Plus size={17}/> Tambah Member</button>
   </div>
  </div>

  <div className="adminStats3d memberStatsCompact">
   <div className="metric3d"><div className="metricIcon"><Users size={22}/></div><div><small>Total Member</small><strong>{rows.length}</strong><p>Semua akun member</p></div></div>
   <div className="metric3d"><div className="metricIcon"><KeyRound size={22}/></div><div><small>Email Confirmed</small><strong>{rows.filter(x=>x.email_confirmed_at).length}</strong><p>Siap login</p></div></div>
   <div className="metric3d"><div className="metricIcon"><Users size={22}/></div><div><small>Pernah Order</small><strong>{rows.filter(x=>x.order_count>0).length}</strong><p>Terhubung ke checkout</p></div></div>
  </div>

  <div className="filterPanel3d memberFilterPanel">
   <div className="memberSearch"><Search size={17}/><input className="input" placeholder="Cari nama, email, WhatsApp..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div>
   <select className="input" value={status} onChange={e=>{setStatus(e.target.value as any);setPage(1)}}>
    <option value="all">Semua Status</option>
    <option value="confirmed">Email Confirmed</option>
    <option value="unconfirmed">Belum Confirmed</option>
   </select>
   <select className="input" value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}>
    <option value="10">10 / halaman</option><option value="20">20 / halaman</option><option value="50">50 / halaman</option>
   </select>
  </div>

  {msg&&<div className="notice" style={{marginBottom:14}}>{msg}</div>}

  {credential&&<div className="memberCredentialBox">
   <div><span className="eyebrow">DATA LOGIN SIAP DIKIRIM</span><h3>{credential.name||credential.email}</h3><p>Email: <b>{credential.email}</b><br/>Password sementara: <b>{credential.password}</b></p><small>Password ini tidak disimpan di dashboard. Kirim sekarang lalu tutup panel.</small></div>
   <div className="memberCredentialActions">
    <button type="button" className="btn alt" onClick={()=>void copyCredential()}><Copy size={16}/> Copy</button>
    <a className="btn" href={whatsappCredential()} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/> Kirim WhatsApp</a>
    <button type="button" className="btn alt" onClick={()=>setCredential(null)}><X size={16}/> Tutup</button>
   </div>
  </div>}

  {loading?<div className="panel3d">Memuat database member...</div>:
   <div className="memberAdminList">
    {shown.map(x=><article className="memberAdminCard" key={x.id}>
     <div className="memberAdminIdentity">
      <div className="memberAvatar">{(x.full_name||x.email||'M').charAt(0).toUpperCase()}</div>
      <div>
       <div className="memberAdminTitle"><h3>{x.full_name||'Tanpa Nama'}</h3><span className={`statusPill ${x.email_confirmed_at?'paid':'pending'}`}>{x.email_confirmed_at?'Confirmed':'Belum Confirmed'}</span></div>
       <p>{x.email}</p>
       <small>WA: {x.whatsapp||'-'} • {x.order_count} order • {x.paid_count} paid/completed</small>
      </div>
     </div>
     <div className="memberAdminActions">
      <button type="button" className="btn alt" onClick={()=>openPassword(x)}><KeyRound size={16}/> Set Password</button>
      <button type="button" className="btn alt" onClick={()=>openEdit(x)}><Pencil size={16}/> Edit</button>
      <button type="button" className="btn alt dangerBtn" onClick={()=>setDeleteTarget(x)}><Trash2 size={16}/> Hapus</button>
     </div>
    </article>)}
    {!shown.length&&<div className="empty3d panel3d">Belum ada member yang sesuai filter.</div>}
   </div>
  }

  <div className="pager3d">
   <span>{filtered.length} member • Halaman {safePage}/{pages}</span>
   <div className="actions">
    <button type="button" className="btn alt" disabled={safePage<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>←</button>
    <button type="button" className="btn alt" disabled={safePage>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>→</button>
   </div>
  </div>

  {modal&&<div className="modalOverlay" onMouseDown={e=>{if(e.currentTarget===e.target&&!busy)setModal(false)}}>
   <div className="modalCard memberModalCard">
    <button type="button" className="modalClose" onClick={()=>!busy&&setModal(false)}><X size={18}/></button>
    <span className="eyebrow">{form.id?'EDIT MEMBER':'MEMBER BARU'}</span>
    <h2>{form.id?'Edit Data Member':'Tambah Member'}</h2>
    <p className="muted">{form.id?'Email tidak diubah agar akses order tetap terhubung.':'Buat akun member dan password langsung. Setelah tersimpan, kirim data login via WhatsApp.'}</p>
    <form className="form" onSubmit={save}>
     <div className="field"><label>Nama</label><input className="input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} required/></div>
     <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required disabled={!!form.id}/></div>
     <div className="field"><label>WhatsApp</label><input className="input" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="62812xxxx"/></div>
     {!form.id&&<div className="field"><label>Password Member</label><div className="memberPasswordAdminRow"><input className="input" type={showPassword?'text':'password'} minLength={6} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><button type="button" className="btn alt" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button><button type="button" className="btn alt" onClick={()=>setForm({...form,password:generatePassword()})}><RefreshCw size={16}/> Generate</button></div><small className="muted">Minimal 6 karakter. Bisa dibuat manual atau klik Generate.</small></div>}
     <button type="submit" className="btn" disabled={busy}>{busy?'Menyimpan...':form.id?'Simpan Perubahan':'Tambah Member'}</button>
    </form>
   </div>
  </div>}

  {passwordModal&&<div className="modalOverlay" onMouseDown={e=>{if(e.currentTarget===e.target&&!busy)setPasswordModal(null)}}>
   <div className="modalCard memberModalCard">
    <button type="button" className="modalClose" onClick={()=>!busy&&setPasswordModal(null)}><X size={18}/></button>
    <span className="eyebrow">SET PASSWORD MEMBER</span>
    <h2>{passwordModal.full_name||passwordModal.email}</h2>
    <p className="muted">Owner bisa membuat password baru tanpa menunggu email reset. Setelah disimpan, kirim data login melalui WhatsApp.</p>
    <form className="form" onSubmit={savePassword}>
     <div className="field"><label>Password Baru</label><div className="memberPasswordAdminRow"><input className="input" type={showPassword?'text':'password'} minLength={6} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required/><button type="button" className="btn alt" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button><button type="button" className="btn alt" onClick={()=>setNewPassword(generatePassword())}><RefreshCw size={16}/> Generate</button></div></div>
     <button type="submit" className="btn" disabled={busy}>{busy?'Menyimpan...':'Simpan Password Baru'}</button>
    </form>
   </div>
  </div>}
 </>
}
