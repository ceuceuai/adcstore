'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import MediaPicker from '@/components/MediaPicker';
import { ProductCategory } from '@/lib/types';
import { Pencil, Plus, Search, Trash2, UploadCloud, X } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

type Draft={name:string;slug:string;description:string;image_url:string;is_active:boolean;sort_order:number};
const blank:Draft={name:'',slug:'',description:'',image_url:'',is_active:true,sort_order:0};
const slugify=(x:string)=>x.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function CategoriesPage(){
 const [rows,setRows]=useState<ProductCategory[]>([]),[q,setQ]=useState(''),[status,setStatus]=useState('all'),[page,setPage]=useState(1),[size,setSize]=useState(10);
 const [selected,setSelected]=useState<Set<string>>(new Set()),[deleteIds,setDeleteIds]=useState<string[]>([]);
 const [dialog,setDialog]=useState<{open:boolean;title:string;message:string;danger:boolean;infoOnly:boolean}>({open:false,title:'',message:'',danger:false,infoOnly:false}),[dialogBusy,setDialogBusy]=useState(false);
 const [show,setShow]=useState(false),[edit,setEdit]=useState<ProductCategory|null>(null),[draft,setDraft]=useState<Draft>(blank),[msg,setMsg]=useState('');

 async function load(){const {data}=await createClient().from('product_categories').select('*').order('sort_order').order('name');setRows((data||[]) as ProductCategory[])}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>rows.filter(r=>(status==='all'||(status==='active'&&r.is_active)||(status==='inactive'&&!r.is_active))&&`${r.name} ${r.slug} ${r.description||''}`.toLowerCase().includes(q.toLowerCase())),[rows,q,status]);
 const pages=Math.max(1,Math.ceil(filtered.length/size)),safePage=Math.min(page,pages),view=filtered.slice((safePage-1)*size,safePage*size);
 function openNew(){setEdit(null);setDraft(blank);setShow(true);setMsg('')}
 function openEdit(r:ProductCategory){setEdit(r);setDraft({name:r.name,slug:r.slug,description:r.description||'',image_url:r.image_url||'',is_active:r.is_active,sort_order:r.sort_order});setShow(true);setMsg('')}
 async function save(e:FormEvent){e.preventDefault();const s=createClient();const payload={...draft,slug:draft.slug||slugify(draft.name),sort_order:Number(draft.sort_order)};const res=edit?await s.from('product_categories').update(payload).eq('id',edit.id):await s.from('product_categories').insert(payload);if(res.error){setMsg(res.error.message);return}setShow(false);await load()}
 function toggleSelected(id:string){setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})}
 function selectPage(){setSelected(prev=>{const n=new Set(prev);view.forEach(x=>n.add(x.id));return n})}
 function clearPageSelection(){setSelected(prev=>{const n=new Set(prev);view.forEach(x=>n.delete(x.id));return n})}
 function selectFiltered(){setSelected(prev=>{const n=new Set(prev);filtered.forEach(x=>n.add(x.id));return n})}
 function clearSelected(){setSelected(new Set())}

 async function askDelete(ids:string[]){
  if(!ids.length)return;
  const targets=rows.filter(x=>ids.includes(x.id));
  if(!targets.length)return;
  const names=targets.map(x=>x.name);
  const {data,error}=await createClient().from('products').select('category').in('category',names);
  if(error){setDialog({open:true,title:'Gagal Memeriksa Kategori',message:error.message,danger:false,infoOnly:true});return}
  const counts=new Map<string,number>();
  (data||[]).forEach((x:any)=>{if(x.category)counts.set(x.category,(counts.get(x.category)||0)+1)});
  const used=targets.filter(x=>(counts.get(x.name)||0)>0);
  if(used.length){
    const detail=used.map(x=>`${x.name} (${counts.get(x.name)||0} produk)`).join(', ');
    setDialog({open:true,title:'Kategori Masih Digunakan',message:`Tidak bisa dihapus karena masih dipakai produk: ${detail}. Pindahkan produk ke kategori lain terlebih dahulu.`,danger:false,infoOnly:true});
    return;
  }
  setDeleteIds(ids);
  setDialog({open:true,title:ids.length>1?`Hapus ${ids.length} Kategori?`:'Hapus Kategori?',message:ids.length>1?`${ids.length} kategori terpilih akan dihapus permanen.`:`Kategori "${targets[0].name}" akan dihapus permanen.`,danger:true,infoOnly:false});
 }

 async function confirmCategoryDelete(){
  if(dialog.infoOnly){setDialog(d=>({...d,open:false}));return}
  if(!deleteIds.length){setDialog(d=>({...d,open:false}));return}
  setDialogBusy(true);
  const {error}=await createClient().from('product_categories').delete().in('id',deleteIds);
  setDialogBusy(false);
  if(error){setDialog({open:true,title:'Gagal Menghapus',message:error.message,danger:false,infoOnly:true});return}
  setSelected(prev=>{const n=new Set(prev);deleteIds.forEach(id=>n.delete(id));return n});
  setDeleteIds([]);
  setDialog(d=>({...d,open:false}));
  await load();
 }

 return <div className="adminPage">
  <div className="adminPageHead"><div><span className="eyebrow">MASTER DATA</span><h1>Kategori Produk</h1><p className="muted">Kategori dinamis untuk merapikan katalog. Bisa bertambah kapan saja.</p></div><button className="btn" onClick={openNew}><Plus size={18}/> Tambah Kategori</button></div>
  <div className="filterPanel3d">
   <div style={{position:'relative',flex:1}}><Search size={17} style={{position:'absolute',left:14,top:15,opacity:.55}}/><input className="input" style={{paddingLeft:40}} placeholder="Cari kategori..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div>
   <select className="input" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="all">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
   <select className="input" value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}><option value="10">10 / halaman</option><option value="20">20 / halaman</option><option value="50">50 / halaman</option></select>
  </div>
  <div className="bulkToolbar3d">
   <label className="bulkCheck"><input type="checkbox" checked={view.length>0&&view.every(x=>selected.has(x.id))} onChange={e=>e.target.checked?selectPage():clearPageSelection()}/> Pilih halaman ini</label>
   <button className="btn alt" type="button" onClick={selectFiltered}>Pilih Semua Hasil Filter ({filtered.length})</button>
   {selected.size>0&&<><span className="selectedCount">{selected.size} dipilih</span><button className="btn alt" type="button" onClick={clearSelected}>Batal Pilih</button><button className="btn dangerBtn" type="button" onClick={()=>askDelete(Array.from(selected))}><Trash2 size={17}/> Hapus Terpilih</button></>}
  </div>
  <div className="productAdminCards">{view.map(r=><article className={`productAdminCard ${selected.has(r.id)?'selectedProductCard':''}`} key={r.id}><label className="productSelectBox" title="Pilih kategori"><input type="checkbox" checked={selected.has(r.id)} onChange={()=>toggleSelected(r.id)}/><span></span></label>
   <div className="productAdminThumb">{r.image_url?<img src={r.image_url} alt={r.name}/>:<span>{r.name.slice(0,1).toUpperCase()}</span>}</div>
   <div className="productAdminInfo"><div className="adminCardTop"><div><span className="badge small">Kategori</span><h3>{r.name}</h3><small>/{r.slug}</small></div><span className={`statusPill ${r.is_active?'paid':'cancelled'}`}>{r.is_active?'Aktif':'Nonaktif'}</span></div>
   <p className="muted">{r.description||'Tanpa deskripsi.'}</p>
   <div className="productAdminMeta"><span><b>{r.sort_order}</b><small>Urutan</small></span></div>
   <div className="productAdminActions"><button className="btn alt" onClick={()=>openEdit(r)}><Pencil size={17}/> Edit</button><button className="btn alt dangerText" onClick={()=>askDelete([r.id])}><Trash2 size={17}/> Hapus</button></div></div>
  </article>)}{!view.length&&<div className="empty3d panel3d">Belum ada kategori.</div>}</div>
  <div className="pager3d"><span>{filtered.length} kategori • Halaman {safePage}/{pages}</span><div className="actions"><button className="btn alt" disabled={safePage<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>← Sebelumnya</button><button className="btn alt" disabled={safePage>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>Berikutnya →</button></div></div>

  <ConfirmDialog open={dialog.open} title={dialog.title} message={dialog.message} danger={dialog.danger} infoOnly={dialog.infoOnly} busy={dialogBusy} onCancel={()=>{if(!dialogBusy){setDeleteIds([]);setDialog(d=>({...d,open:false}))}}} onConfirm={confirmCategoryDelete}/>
  {show&&<div className="modalBack" onMouseDown={()=>setShow(false)}><div className="modal3d" style={{maxWidth:720}} onMouseDown={e=>e.stopPropagation()}><div className="topline"><div><span className="eyebrow">MASTER DATA</span><h2>{edit?'Edit Kategori':'Tambah Kategori'}</h2></div><button type="button" className="iconBtn3d" onClick={()=>setShow(false)}><X/></button></div><form onSubmit={save}>
   <div className="twoCols"><div className="field"><label>Nama Kategori</label><input className="input" required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value,slug:edit?draft.slug:slugify(e.target.value)})}/></div><div className="field"><label>Slug</label><input className="input" value={draft.slug} onChange={e=>setDraft({...draft,slug:slugify(e.target.value)})}/></div></div>
   <div className="field"><label>Deskripsi (optional)</label><textarea className="input" rows={3} value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></div>
   <div className="twoCols"><div className="field"><MediaPicker currentUrls={draft.image_url?[draft.image_url]:[]} label="Icon/Gambar Kategori (optional)" onSelect={urls=>setDraft({...draft,image_url:urls[0]||''})}/><small className="muted">Pilih dari Media Library atau upload baru. PNG/WebP transparan aman.</small></div><div className="field"><label>Image URL (optional)</label><input className="input" value={draft.image_url} onChange={e=>setDraft({...draft,image_url:e.target.value})} placeholder="https://..."/></div></div>
   {draft.image_url&&<img src={draft.image_url} alt="preview" style={{width:90,height:90,objectFit:'contain',background:'transparent'}}/>}
   <div className="twoCols"><div className="field"><label>Urutan</label><input className="input" type="number" value={draft.sort_order} onChange={e=>setDraft({...draft,sort_order:Number(e.target.value)})}/></div><label className="toggleLine"><input type="checkbox" checked={draft.is_active} onChange={e=>setDraft({...draft,is_active:e.target.checked})}/> Aktif</label></div>
   {msg&&<div className="notice">{msg}</div>}<button className="btn full" type="submit">{edit?'Simpan Perubahan':'Simpan Kategori'}</button>
  </form></div></div>}
 </div>
}
