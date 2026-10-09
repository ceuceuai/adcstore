'use client';
import { FormEvent, useEffect, useState } from 'react';
import MediaPicker from '@/components/MediaPicker';
import ConfirmDialog from '@/components/ConfirmDialog';
import { createClient } from '@/lib/supabase';
import { BankAccount,EWallet,PaymentSettings } from '@/lib/types';
import { Building2, WalletCards, QrCode, Plus, Trash2, Save } from 'lucide-react';

const uid=()=>Math.random().toString(36).slice(2,10);
const base:PaymentSettings={
 id:1,banks:[],ewallets:[],qris_enabled:false,qris_label:'QRIS',
 qris_image_url:null,
 instructions:'Silakan lakukan pembayaran sesuai nominal pesanan, lalu simpan bukti pembayaran.'
};

type DeleteTarget={kind:'bank'|'wallet';index:number;label:string}|null;

export default function Payments(){
 const [d,setD]=useState(base);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [modal,setModal]=useState<{type:'success'|'error';text:string}|null>(null);
 const [deleteTarget,setDeleteTarget]=useState<DeleteTarget>(null);

 async function load(){
  setLoading(true);
  const {data,error}=await createClient().from('payment_settings').select('*').eq('id',1).maybeSingle();
  setLoading(false);
  if(error){setModal({type:'error',text:`Gagal memuat metode pembayaran: ${error.message}`});return}
  if(data)setD({...base,...data,banks:data.banks||[],ewallets:data.ewallets||[]} as PaymentSettings);
 }

 useEffect(()=>{load()},[]);

 function addBank(){
  setD(v=>({...v,banks:[...v.banks,{id:uid(),bank:'BCA',account_number:'',account_name:'',enabled:true}]}));
 }
 function addWallet(){
  setD(v=>({...v,ewallets:[...v.ewallets,{id:uid(),provider:'DANA',number:'',account_name:'',enabled:true}]}));
 }
 function bankPatch(i:number,p:Partial<BankAccount>){
  setD(v=>({...v,banks:v.banks.map((x,n)=>n===i?{...x,...p}:x)}));
 }
 function walletPatch(i:number,p:Partial<EWallet>){
  setD(v=>({...v,ewallets:v.ewallets.map((x,n)=>n===i?{...x,...p}:x)}));
 }

 function validate(){
  const badBank=d.banks.find(x=>x.enabled&&(!x.bank.trim()||!x.account_number.trim()||!x.account_name.trim()));
  if(badBank)return 'Rekening bank yang aktif wajib diisi lengkap: nama bank, nomor rekening, dan atas nama.';
  const badWallet=d.ewallets.find(x=>x.enabled&&(!x.provider.trim()||!x.number.trim()||!x.account_name.trim()));
  if(badWallet)return 'E-wallet yang aktif wajib diisi lengkap: provider, nomor, dan atas nama.';
  if(d.qris_enabled&&!d.qris_image_url)return 'QRIS diaktifkan tetapi gambar QRIS belum dipilih.';
  return '';
 }

 async function save(e?:FormEvent){
  e?.preventDefault();
  if(saving)return;
  const validation=validate();
  if(validation){setModal({type:'error',text:validation});return}

  setSaving(true);
  const payload={
   banks:d.banks,
   ewallets:d.ewallets,
   qris_enabled:d.qris_enabled,
   qris_label:d.qris_label,
   qris_image_url:d.qris_image_url,
   instructions:d.instructions
  };

  const s=createClient();
  const {data,error}=await s.from('payment_settings').update(payload).eq('id',1).select('*').single();
  setSaving(false);

  if(error){
   setModal({type:'error',text:`Gagal menyimpan pembayaran: ${error.message}`});
   return;
  }

  if(data)setD({...base,...data,banks:data.banks||[],ewallets:data.ewallets||[]} as PaymentSettings);
  setModal({type:'success',text:'Metode pembayaran berhasil disimpan dan sudah diverifikasi dari database.'});
 }

 function askDelete(kind:'bank'|'wallet',index:number){
  const item=kind==='bank'?d.banks[index]:d.ewallets[index];
  const label=kind==='bank'
   ?`${(item as BankAccount)?.bank||'Bank'} ${(item as BankAccount)?.account_number||''}`
   :`${(item as EWallet)?.provider||'E-Wallet'} ${(item as EWallet)?.number||''}`;
  setDeleteTarget({kind,index,label:label.trim()});
 }

 function confirmDelete(){
  if(!deleteTarget)return;
  if(deleteTarget.kind==='bank'){
   setD(v=>({...v,banks:v.banks.filter((_,n)=>n!==deleteTarget.index)}));
  }else{
   setD(v=>({...v,ewallets:v.ewallets.filter((_,n)=>n!==deleteTarget.index)}));
  }
  setDeleteTarget(null);
 }

 return <>
  <div className="pageHead3d paymentPageHead">
   <div>
    <span className="eyebrow">CHECKOUT INTERNAL</span>
    <h1>Pembayaran</h1>
    <p>Atur metode pembayaran yang tampil saat customer checkout langsung di website.</p>
   </div>
   <button type="button" className="btn paymentSaveBtn" onClick={()=>save()} disabled={saving||loading}>
    <Save size={18}/>{saving?'Menyimpan...':'Simpan Pembayaran'}
   </button>
  </div>

  <form onSubmit={save}>
   <div className="paymentGrid3d">
    <section className="panel3d">
     <div className="panelTitle">
      <div className="sectionIcon"><Building2/></div>
      <div><h2>Bank Transfer</h2><p>Tambah satu atau beberapa rekening.</p></div>
      <button type="button" className="iconBtn3d" onClick={addBank}><Plus/></button>
     </div>
     <div className="stack3d">
      {d.banks.map((b,i)=><div className="methodCard3d" key={b.id}>
       <div className="methodRow">
        <input className="input" value={b.bank} onChange={e=>bankPatch(i,{bank:e.target.value})} placeholder="Nama bank"/>
        <input className="input" value={b.account_number} onChange={e=>bankPatch(i,{account_number:e.target.value})} placeholder="Nomor rekening"/>
       </div>
       <div className="methodRow">
        <input className="input" value={b.account_name} onChange={e=>bankPatch(i,{account_name:e.target.value})} placeholder="Atas nama"/>
        <label className="toggleLine"><input type="checkbox" checked={b.enabled} onChange={e=>bankPatch(i,{enabled:e.target.checked})}/> Aktif</label>
        <button type="button" className="dangerIcon" onClick={()=>askDelete('bank',i)}><Trash2 size={18}/></button>
       </div>
      </div>)}
      {!d.banks.length&&<div className="empty3d">Belum ada rekening. Klik + untuk menambahkan.</div>}
     </div>
    </section>

    <section className="panel3d">
     <div className="panelTitle">
      <div className="sectionIcon"><WalletCards/></div>
      <div><h2>E-Wallet</h2><p>DANA, OVO, GoPay, ShopeePay, atau custom.</p></div>
      <button type="button" className="iconBtn3d" onClick={addWallet}><Plus/></button>
     </div>
     <div className="stack3d">
      {d.ewallets.map((w,i)=><div className="methodCard3d" key={w.id}>
       <div className="methodRow">
        <input className="input" value={w.provider} onChange={e=>walletPatch(i,{provider:e.target.value})} placeholder="Provider"/>
        <input className="input" value={w.number} onChange={e=>walletPatch(i,{number:e.target.value})} placeholder="Nomor e-wallet"/>
       </div>
       <div className="methodRow">
        <input className="input" value={w.account_name} onChange={e=>walletPatch(i,{account_name:e.target.value})} placeholder="Atas nama"/>
        <label className="toggleLine"><input type="checkbox" checked={w.enabled} onChange={e=>walletPatch(i,{enabled:e.target.checked})}/> Aktif</label>
        <button type="button" className="dangerIcon" onClick={()=>askDelete('wallet',i)}><Trash2 size={18}/></button>
       </div>
      </div>)}
      {!d.ewallets.length&&<div className="empty3d">Belum ada e-wallet. Klik + untuk menambahkan.</div>}
     </div>
    </section>

    <section className="panel3d qrisPanel">
     <div className="panelTitle"><div className="sectionIcon"><QrCode/></div><div><h2>QRIS Statis</h2><p>Upload gambar QRIS untuk checkout.</p></div></div>
     <div className="qrisEditor">
      <div className="qrisPreview3d">
       {d.qris_image_url?<img src={d.qris_image_url} alt="QRIS"/>:<div><QrCode size={56}/><span>Belum ada QRIS</span></div>}
      </div>
      <div className="form">
       <div className="field"><label>Label QRIS</label><input className="input" value={d.qris_label} onChange={e=>setD({...d,qris_label:e.target.value})}/></div>
       <MediaPicker currentUrls={d.qris_image_url?[d.qris_image_url]:[]} buttonText="Pilih / Upload Image QRIS" onSelect={urls=>setD(v=>({...v,qris_image_url:urls[0]||null,qris_enabled:true}))}/>
       <label className="toggleLine"><input type="checkbox" checked={d.qris_enabled} onChange={e=>setD({...d,qris_enabled:e.target.checked})}/> Tampilkan QRIS</label>
      </div>
     </div>
    </section>

    <section className="panel3d">
     <div className="panelTitle"><div><h2>Instruksi Pembayaran</h2><p>Teks ini tampil pada halaman checkout.</p></div></div>
     <textarea className="input" rows={7} value={d.instructions} onChange={e=>setD({...d,instructions:e.target.value})}/>
    </section>
   </div>

   <div className="paymentBottomAction">
    <span>Pastikan data bank, e-wallet, dan QRIS sudah benar sebelum disimpan.</span>
    <button type="submit" className="btn" disabled={saving||loading}><Save size={18}/>{saving?'Menyimpan...':'Simpan Pembayaran'}</button>
   </div>
  </form>

  <ConfirmDialog
   open={!!deleteTarget}
   title={deleteTarget?.kind==='bank'?'Hapus Rekening?':'Hapus E-Wallet?'}
   message={deleteTarget?`${deleteTarget.label} akan dihapus dari daftar. Perubahan baru permanen setelah tombol Simpan Pembayaran ditekan.`:''}
   confirmText="Ya, Hapus"
   danger
   onCancel={()=>setDeleteTarget(null)}
   onConfirm={confirmDelete}
  />

  {modal&&<div className="modalBack" onMouseDown={()=>setModal(null)}>
   <div className="modal3d confirmModal3d" onMouseDown={e=>e.stopPropagation()}>
    <div className={`confirmIcon ${modal.type==='error'?'danger':''}`}>{modal.type==='success'?'✓':'!'}</div>
    <h2>{modal.type==='success'?'Berhasil Disimpan':'Tidak Bisa Disimpan'}</h2>
    <p className="muted confirmMessage">{modal.text}</p>
    <div className="actions confirmActions"><button type="button" className="btn" onClick={()=>setModal(null)}>OK</button></div>
   </div>
  </div>}
 </>
}
