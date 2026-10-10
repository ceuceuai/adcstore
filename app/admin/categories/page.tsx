\'use client\';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ProductCategory } from '@/lib/types';
import { ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

type Draft={name:string;slug:string;parent_id:string|null;is_active:boolean;sort_order:number};
const blank:Draft={name:'',slug:'',parent_id:null,is_active:true,sort_order:0};
const slugify=(x:string)=>x.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function CategoriesPage(){
 const [rows,setRows]=useState<ProductCategory[]>([]),[q,setQ]=useState(''),[status,setStatus]=useState('all'),[level,setLevel]=useState('all'),[page,setPage]=useState(1),[size,setSize]=useState(20);
 const [selected,setSelected]=useState<Set<string>>(new Set()),[deleteIds,setDeleteIds]=useState<string[]>([]);
 const [dialog,setDialog]=useState<{open:boolean;title:string;message:string;danger:boolean;infoOnly:boolean}>({open:false,title:'',message:'',danger:false,infoOnly:false}),[dialogBusy,setDialogBusy]=useState(false);
 const [show,setShow]=useState(false),[edit,setEdit]=useState<ProductCategory|null>(null),[draft,setDraft]=useState<Draft>(blank),[msg,setMsg]=useState('');

 async function load(){const {data,error}=await createClient().from('product_categories').select('*').order('sort_order').order('name');if(error){setDialog({open:true,title:'Gagal Memuat Kategori',message:error.message,danger:false,infoOnly:true});return}setRows((data||[]) as ProductCategory[])}
 useEffect(()=>{void load()},[]);
 const parentMap=useMemo(()=>new Map(rows.map(r=>[r.id,r])),[rows]);
 const roots=useMemo(()=>rows.filter(r=>!r.parent_id),[rows]);
 const childrenByParent=useMemo(()=>{const m=new Map<string,ProductCategory[]>();rows.filter(r=>r.parent_id).forEach(r=>{const a=m.get(r.parent_id!)||[];a.push(r);m.set(r.parent_id!,a)});for(const a of m.values())a.sort((x,y)=>x.sort_order-y.sort_order||x.name.localeCompare(y.name));return m},[rows]);
 const ordered=useMemo(()=>{const out:ProductCategory[]=[];const sortedRoots=[...roots].sort((a,b)=>a.sort_order-b.sort_order||a.name.localeCompare(b.name));for(const r of sortedRoots){out.push(r);out.push(...(childrenByParent.get(r.id)||[]))}const orphan=rows.filter(r=>r.parent_id&&!parentMap.has(r.parent_id));out.push(...orphan);return out},[roots,childrenByParent,parentMap,rows]);
 const filtered=useMemo(()=>ordered.filter(r=>(status==='all'||(status==='active'&&r.is_active)||(status==='inactive'&&!r.is_active))&&(level==='all'||(level==='parent'&&!r.parent_id)||(level==='child'&&!!r.parent_id))&&`${r.name} ${r.slug} ${r.parent_id?parentMap.get(r.parent_id)?.name||'':''}`.toLowerCase().includes(q.toLowerCase())),[ordered,q,status,level,parentMap]);
 const pages=Math.max(1,Math.ceil(filtered.length/size)),safePage=Math.min(page,pages),view=filtered.slice((safePage-1)*size,safePage*size);
 function openNew(parentId:string|null=null){setEdit(null);setDraft({...blank,parent_id:parentId});setShow(true);setMsg('')}
 function openEdit(r:ProductCategory){setEdit(r);setDraft({name:r.name,slug:r.slug,parent_id:r.parent_id||null,is_active:r.is_active,sort_order:r.sort_order});setShow(true);setMsg('')}
 async function save(e:FormEvent){e.preventDefault();if(edit&&draft.parent_id===edit.id){setMsg('Kategori tidak bisa menjadi parent untuk dirinya sendiri.');return}const s=createClient();const payload={name:draft.name.trim(),slug:draft.slug||slugify(draft.name),parent_id:draft.parent_id||null,is_active:draft.is_active,sort_order:Number(draft.sort_order)};const res=edit?await s.from('product_categories').update(payload).eq('id',edit.id):await s.from('product_categories').insert(payload);if(res.error){setMsg(res.error.message);return}setShow(false);await load()}
 function toggleSelected(id:string){setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})}
 function selectPage(){setSelected(prev=>{const n=new Set(prev);view.forEach(x=>n.add(x.id));return n})}
 function clearPageSelection(){setSelected(prev=>{const n=new Set(prev);view.forEach(x=>n.delete(x.id));return n})}
 function selectFiltered(){setSelected(new Set(filtered.map(x=>x.id)))}
 function clearSelected(){setSelected(new Set())}

 async function askDelete(ids:string[]){
  if(!ids.length)return;
  const targets=rows.filter(x=>ids.includes(x.id));if(!targets.length)return;
  const childTargets=rows.filter(x=>x.parent_id&&ids.includes(x.parent_id));
  if(childTargets.length){setDialog({open:true,title:'Masih Memiliki Subkategori',message:`Hapus/pindahkan subkategori terlebih dahulu: ${childTargets.map(x=>x.name).join(', ')}`,danger:false,infoOnly:true});return}
  const names=targets.map(x=>x.name);
  const {data,error}=await createClient().from('products').select('category').in('category',names);
  if(error){setDialog({open:true,title:'Gagal Memeriksa Kategori',message:error.message,danger:false,infoOnly:true});return}
  const counts=new Map<string,number>();(data||[]).forEach((x:any)=>{if(x.category)counts.set(x.category,(counts.get(x.category)||0)+1)});
  const used=targets.filter(x=>(counts.get(x.name)||0)>0);
  if(used.length){const detail=used.map(x=>`${x.name} (${counts.get(x.name)||0} produk)`).join(', ');setDialog({open:true,title:'Kategori Masih Digunakan',message:`Tidak bisa dihapus karena masih dipakai produk: ${detail}. Pindahkan produk ke kategori lain terlebih dahulu.`,danger:false,infoOnly:true});return}
  setDeleteIds(ids);setDialog({open:true,title:ids.length>1?`Hapus ${ids.length} Kategori?`:'Hapus Kategori?',message:ids.length>1?`${ids.length} kategori terpilih akan dihapus permanen.`:`Kategori "${targets[0].name}" akan dihapus permanen.`,danger:true,infoOnly:false});
 }
 async function confirmCategoryDelete(){if(dialog.infoOnly){setDialog(d=>({...d,open:false}));return}if(!deleteIds.length){setDialog(d=>({...d,open:false}));return}setDialogBusy(true);const {error}=await createClient().from('product_categories').delete().in('id',deleteIds);setDialogBusy(false);if(error){setDialog({open:true,title:'Gagal Menghapus',message:error.message,danger:false,infoOnly:true});return}setSelected(prev=>{const n=new Set(prev);deleteIds.forEach(id=>n.delete(id));return n});setDeleteIds([]);setDialog(d=>({...d,open:false}));await load()}

 return <div className="adminPage categoryCompactPage">
  <div className="adminPageHead"><div><span className="eyebrow">MASTER DATA</span><h1>Kategori Produk</h1><p className="muted">Kategori dibuat ringkas. Gunakan parent & subkategori bila diperlukan.</p></div><button type="button" className="btn" onClick={()=>openNew()}><Plus size={18}/> Tambah Kategori</button></div>
  <div className="filterPanel3d categoryFilters"><div style={{position:'relative',flex:1}}><Search size={17} style={{position:'absolute',left:14,top:15,opacity:.55}}/><input className="input" style={{paddingLeft:40}} placeholder="Cari kategori / subkategori..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div><select className="input" value={level} onChange={e=>{setLevel(e.target.value);setPage(1)}}><option value="all">Semua Level</option><option value="parent">Kategori Utama</option><option value="child">Subkategori</option></select><select className="input" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="all">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><select className="input" value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}><option value="20">20 / halaman</option><option value="50">50 / halaman</option><option value="100">100 / halaman</option></select></div>
  <div className="bulkToolbar3d categoryBulk"><label className="bulkCheck"><input type="checkbox" checked={view.length>0&&view.every(x=>selected.has(x.id))} onChange={e=>e.target.checked?selectPage():clearPageSelection()}/> Pilih halaman</label><button className="btn alt" type="button" onClick={selectFiltered}>Pilih Semua ({filtered.length})</button>{selected.size>0&&<><span className="selectedCount">{selected.size} dipilih</span><button className="btn alt" type="button" onClick={clearSelected}>Batal</button><button className="btn dangerBtn" type="button" onClick={()=>askDelete(Array.from(selected))}><Trash2 size={16}/> Hapus</button></>}</div>

  <div className="categoryList3d">
   <div className="categoryListHead"><span></span><span>Nama Kategori</span><span>Level</span><span>Urutan</span><span>Status</span><span>Aksi</span></div>
   {view.map(r=>{const parent=r.parent_id?parentMap.get(r.parent_id):null;const childCount=childrenByParent.get(r.id)?.length||0;return <div className={`categoryCompactRow ${r.parent_id?'isChild':''} ${selected.has(r.id)?'selected':''}`} key={r.id}>
    <label className="categoryCheck"><input type="checkbox" checked={selected.has(r.id)} onChange={()=>toggleSelected(r.id)}/></label>
    <div className="categoryNameCell">{r.parent_id&&<ChevronRight size={15}/>}<div><strong>{r.name}</strong><small>/{r.slug}{parent?` • ${parent.name}`:''}</small></div></div>
    <div>{r.parent_id?<span className="categoryLevel child">Subkategori</span>:<span className="categoryLevel parent">Kategori Utama{childCount?` • ${childCount} sub`:''}</span>}</div>
    <div className="categorySort">{r.sort_order}</div>
    <div><span className={`statusPill ${r.is_active?'paid':'cancelled'}`}>{r.is_active?'Aktif':'Nonaktif'}</span></div>
    <div className="categoryActions"><button type="button" className="iconAction" title="Edit" onClick={()=>openEdit(r)}><Pencil size={16}/></button>{!r.parent_id&&<button type="button" className="iconAction" title="Tambah subkategori" onClick={()=>openNew(r.id)}><Plus size={16}/></button>}<button type="button" className="iconAction danger" title="Hapus" onClick={()=>askDelete([r.id])}><Trash2 size={16}/></button></div>
   </div>})}
   {!view.length&&<div className="empty3d panel3d">Belum ada kategori.</div>}
  </div>
  <div className="pager3d"><span>{filtered.length} kategori • Halaman {safePage}/{pages}</span><div className="actions"><button type="button" className="btn alt" disabled={safePage<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>← Sebelumnya</button><button type="button" className="btn alt" disabled={safePage>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>Berikutnya →</button></div></div>

  <ConfirmDialog open={dialog.open} title={dialog.title} message={dialog.message} danger={dialog.danger} infoOnly={dialog.infoOnly} busy={dialogBusy} onCancel={()=>{if(!dialogBusy){setDeleteIds([]);setDialog(d=>({...d,open:false}))}}} onConfirm={confirmCategoryDelete}/>
  {show&&<div className="modalBack" onMouseDown={()=>setShow(false)}><div className="modal3d" style={{maxWidth:620}} onMouseDown={e=>e.stopPropagation()}><div className="topline"><div><span className="eyebrow">MASTER DATA</span><h2>{edit?'Edit Kategori':'Tambah Kategori'}</h2></div><button type="button" className="iconBtn3d" onClick={()=>setShow(false)}><X/></button></div><form onSubmit={save}>
   <div className="field"><label>Nama Kategori</label><input className="input" required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value,slug:edit?draft.slug:slugify(e.target.value)})}/></div>
   <div className="field"><label>Parent / Kategori Utama</label><select className="input" value={draft.parent_id||''} onChange={e=>setDraft({...draft,parent_id:e.target.value||null})}><option value="">— Kategori Utama —</option>{roots.filter(x=>x.id!==edit?.id).map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select><small className="muted">Pilih parent jika ini adalah subkategori. Maksimal 1 level subkategori agar tetap sederhana.</small></div>
   <div className="twoCols"><div className="field"><label>Slug</label><input className="input" value={draft.slug} onChange={e=>setDraft({...draft,slug:slugify(e.target.value)})}/></div><div className="field"><label>Urutan</label><input className="input" type="number" value={draft.sort_order} onChange={e=>setDraft({...draft,sort_order:Number(e.target.value)})}/></div></div>
   <label className="toggleLine"><input type="checkbox" checked={draft.is_active} onChange={e=>setDraft({...draft,is_active:e.target.checked})}/> Aktif</label>
   {msg&&<div className="notice">{msg}</div>}<button className="btn full" type="submit">{edit?'Simpan Perubahan':'Simpan Kategori'}</button>
  </form></div></div>}
 </div>
}
