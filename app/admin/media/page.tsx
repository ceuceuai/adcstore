'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { MediaAsset } from '@/lib/types';
import { Search, Trash2, UploadCloud } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

async function fileSha256(file:File){
 const buf=await file.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',buf);
 return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
export default function MediaLibraryPage(){
 const [rows,setRows]=useState<MediaAsset[]>([]),[q,setQ]=useState(''),[page,setPage]=useState(1),[size,setSize]=useState(20),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState<MediaAsset|null>(null),[deleteBusy,setDeleteBusy]=useState(false);
 async function load(){const {data,error}=await createClient().from('media_library').select('*').order('created_at',{ascending:false});if(error)setMsg(error.message);else setRows((data||[]) as MediaAsset[])}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>rows.filter(x=>`${x.file_name} ${x.mime_type||''} ${x.public_url}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
 const pages=Math.max(1,Math.ceil(filtered.length/size)),safe=Math.min(page,pages),view=filtered.slice((safe-1)*size,safe*size);
 async function upload(files:FileList|null){
  if(!files?.length)return;setBusy(true);setMsg('');const s=createClient();let duplicate=0,added=0;
  for(const file of Array.from(files)){
   const hash=await fileSha256(file);const {data:existing}=await s.from('media_library').select('id').eq('sha256',hash).maybeSingle();
   if(existing){duplicate++;continue}
   const ext=(file.name.split('.').pop()||'bin').toLowerCase(),path=`media/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
   const {error}=await s.storage.from('store-assets').upload(path,file,{upsert:false,contentType:file.type||undefined});if(error){setMsg(error.message);continue}
   const url=s.storage.from('store-assets').getPublicUrl(path).data.publicUrl;
   const {error:db}=await s.from('media_library').insert({file_name:file.name,storage_path:path,public_url:url,mime_type:file.type||null,size_bytes:file.size,sha256:hash,source:'upload'});
   if(db)setMsg(db.message);else added++;
  }setBusy(false);await load();setMsg(`${added} image ditambahkan${duplicate?` • ${duplicate} duplikat dilewati`:''}.`);
 }
 async function remove(x:MediaAsset){
  const c=createClient();const {data:usage,error}=await c.rpc('media_usage_count',{p_url:x.public_url});if(error){setMsg(error.message);return}
  if(Number(usage||0)>0){setMsg(`Image "${x.file_name}" masih dipakai ${usage} tempat. Ganti image yang memakai file ini dulu sebelum dihapus.`);return}
  setDeleteTarget(x);
 }
 async function confirmDelete(){
  if(!deleteTarget)return;setDeleteBusy(true);const c=createClient();
  if(deleteTarget.storage_path){const {error:st}=await c.storage.from('store-assets').remove([deleteTarget.storage_path]);if(st){setDeleteBusy(false);setMsg(st.message);return}}
  const {error:db}=await c.from('media_library').delete().eq('id',deleteTarget.id);setDeleteBusy(false);if(db){setMsg(db.message);return}
  setDeleteTarget(null);await load();setMsg('Image berhasil dihapus.');
 }
 return <div className="adminPage"><ConfirmDialog open={!!deleteTarget} title="Hapus Image?" message={deleteTarget?`Image "${deleteTarget.file_name}" akan dihapus permanen dari Media Library.`:''} confirmText="Ya, Hapus" danger busy={deleteBusy} onCancel={()=>!deleteBusy&&setDeleteTarget(null)} onConfirm={confirmDelete}/>
  <div className="pageHead3d"><div><span className="eyebrow">ASET TERPUSAT</span><h1>Media Library</h1><p>Semua image yang sudah pernah diupload bisa dipilih ulang di seluruh modul tanpa upload duplikat.</p></div><label className="btn" style={{cursor:busy?'wait':'pointer'}}><UploadCloud size={18}/>{busy?'Mengupload...':'Upload Media'}<input hidden type="file" accept="image/*" multiple disabled={busy} onChange={e=>upload(e.target.files)}/></label></div>
  <div className="filterPanel3d"><div style={{position:'relative',flex:1}}><Search size={17} style={{position:'absolute',left:14,top:15,opacity:.55}}/><input className="input" style={{paddingLeft:40}} value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} placeholder="Cari image..."/></div><select className="input" value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}><option value="20">20 / halaman</option><option value="40">40 / halaman</option><option value="80">80 / halaman</option></select></div>
  {msg&&<div className="notice" style={{marginBottom:14}}>{msg}</div>}
  <div className="mediaLibraryGrid">{view.map(x=><article className="mediaLibraryCard" key={x.id}><div className="mediaLibraryThumb"><img src={x.public_url} alt={x.file_name}/></div><div className="mediaLibraryMeta"><strong title={x.file_name}>{x.file_name}</strong><small>{x.mime_type||'image'} • {x.size_bytes?`${Math.max(1,Math.round(x.size_bytes/1024))} KB`:'legacy'}</small><button className="btn alt dangerText" type="button" onClick={()=>remove(x)}><Trash2 size={16}/> Hapus</button></div></article>)}{!view.length&&<div className="empty3d panel3d" style={{gridColumn:'1/-1'}}>Belum ada media.</div>}</div>
  <div className="pager3d"><span>{filtered.length} media • Halaman {safe}/{pages}</span><div className="actions"><button type="button" className="btn alt" disabled={safe<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>← Sebelumnya</button><button type="button" className="btn alt" disabled={safe>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>Berikutnya →</button></div></div>
 </div>
}
