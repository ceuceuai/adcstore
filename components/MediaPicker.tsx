'use client';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { MediaAsset } from '@/lib/types';
import { Check, ImagePlus, Search, UploadCloud, X } from 'lucide-react';

type Props={
  label?:string;
  buttonText?:string;
  multiple?:boolean;
  onSelect:(urls:string[])=>void;
  currentUrls?:string[];
};

async function fileSha256(file:File){
  const buf=await file.arrayBuffer();
  const digest=await crypto.subtle.digest('SHA-256',buf);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export default function MediaPicker({label,buttonText='Pilih / Upload Gambar',multiple=false,onSelect,currentUrls=[]}:Props){
 const [open,setOpen]=useState(false),[rows,setRows]=useState<MediaAsset[]>([]),[q,setQ]=useState(''),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(20),[busy,setBusy]=useState(false),[note,setNote]=useState('');
 const [selected,setSelected]=useState<string[]>([]);
 async function load(){
   const {data,error}=await createClient().from('media_library').select('*').order('created_at',{ascending:false});
   if(error){setNote(error.message);return}
   setRows((data||[]) as MediaAsset[]);
 }
 useEffect(()=>{if(open){setSelected(multiple?currentUrls.filter(Boolean):[]);setPage(1);setNote('');load()}},[open]);
 const filtered=useMemo(()=>rows.filter(x=>`${x.file_name} ${x.mime_type||''} ${x.public_url}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize)),safe=Math.min(page,pages),view=filtered.slice((safe-1)*pageSize,safe*pageSize);
 function choose(url:string){
   if(multiple)setSelected(s=>s.includes(url)?s.filter(x=>x!==url):[...s,url]);
   else {onSelect([url]);setOpen(false)}
 }
 async function uploadFiles(e:ChangeEvent<HTMLInputElement>){
   const files=Array.from(e.target.files||[]); if(!files.length)return;
   setBusy(true);setNote('');
   const s=createClient(); const chosen:string[]=[];
   for(const file of files){
     try{
       const hash=await fileSha256(file);
       const {data:existing}=await s.from('media_library').select('*').eq('sha256',hash).maybeSingle();
       if(existing){
         chosen.push(existing.public_url);
         setNote(`File "${file.name}" sudah ada di Media Library. Sistem memakai file yang sudah tersedia agar tidak duplikat.`);
         continue;
       }
       const ext=(file.name.split('.').pop()||'bin').toLowerCase();
       const path=`media/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
       const {error:upErr}=await s.storage.from('store-assets').upload(path,file,{upsert:false,contentType:file.type||undefined});
       if(upErr){setNote(upErr.message);continue}
       const publicUrl=s.storage.from('store-assets').getPublicUrl(path).data.publicUrl;
       const {error:dbErr}=await s.from('media_library').insert({
         file_name:file.name,
         storage_path:path,
         public_url:publicUrl,
         mime_type:file.type||null,
         size_bytes:file.size,
         sha256:hash,
         source:'upload'
       });
       if(dbErr){setNote(dbErr.message);continue}
       chosen.push(publicUrl);
     }catch(err:any){setNote(err?.message||'Upload gagal')}
   }
   await load();setBusy(false);e.target.value='';
   if(chosen.length){
     if(multiple)setSelected(s=>Array.from(new Set([...s,...chosen])));
     else {onSelect([chosen[0]]);setOpen(false)}
   }
 }
 function apply(){if(!selected.length){setNote('Pilih minimal satu gambar.');return}onSelect(selected);setOpen(false)}
 return <>
  <div>
   {label&&<label style={{display:'block',fontWeight:800,marginBottom:8}}>{label}</label>}
   <button type="button" className="btn alt" onClick={()=>setOpen(true)}><ImagePlus size={18}/>{buttonText}</button>
  </div>
  {open&&<div className="modalBack" onMouseDown={()=>setOpen(false)}>
   <div className="modal3d mediaLibraryModal" onMouseDown={e=>e.stopPropagation()} style={{maxWidth:1050,width:'min(1050px,94vw)'}}>
    <div className="topline"><div><span className="eyebrow">MEDIA LIBRARY</span><h2>Pilih gambar yang sudah tersedia</h2><p className="muted">Gunakan ulang aset lama agar storage tidak penuh gambar duplikat.</p></div><button type="button" className="iconBtn3d" onClick={()=>setOpen(false)}><X/></button></div>
    <div className="filterPanel3d">
     <div style={{position:'relative',flex:1}}><Search size={17} style={{position:'absolute',left:14,top:15,opacity:.55}}/><input className="input" style={{paddingLeft:40}} placeholder="Cari nama file..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div>
     <select className="input" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}><option value="20">20 / halaman</option><option value="40">40 / halaman</option><option value="80">80 / halaman</option></select>
     <label className="btn" style={{cursor:busy?'wait':'pointer'}}><UploadCloud size={18}/>{busy?'Mengupload...':'Upload Baru'}<input type="file" accept="image/*" multiple={multiple} hidden disabled={busy} onChange={uploadFiles}/></label>
    </div>
    {note&&<div className="notice" style={{marginBottom:14}}>{note}</div>}
    <div className="mediaLibraryGrid">
     {view.map(x=>{const active=selected.includes(x.public_url)||(!multiple&&currentUrls.includes(x.public_url));return <button type="button" key={x.id} className={`mediaLibraryItem ${active?'selected':''}`} onClick={()=>choose(x.public_url)}>
      <div className="mediaLibraryThumb"><img src={x.public_url} alt={x.file_name}/>{active&&<span className="mediaCheck"><Check size={16}/></span>}</div>
      <strong title={x.file_name}>{x.file_name}</strong><small>{x.source==='upload'?'Uploaded':'Existing asset'}</small>
     </button>})}
     {!view.length&&<div className="empty3d panel3d" style={{gridColumn:'1/-1'}}>Belum ada image di Media Library. Klik <b>Upload Baru</b>.</div>}
    </div>
    <div className="pager3d"><span>{filtered.length} media • Halaman {safe}/{pages}</span><div className="actions"><button type="button" className="btn alt" disabled={safe<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>← Sebelumnya</button><button type="button" className="btn alt" disabled={safe>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>Berikutnya →</button>{multiple&&<button type="button" className="btn" onClick={apply}>Gunakan {selected.length||''} Gambar</button>}</div></div>
   </div>
  </div>}
 </>
}
