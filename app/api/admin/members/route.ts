import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const runtime='nodejs';
export const dynamic='force-dynamic';

function env(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const anon=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!anon)throw new Error('Konfigurasi Supabase public belum lengkap.');
 if(!service)throw new Error('SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel Environment Variables.');
 return {url,anon,service};
}

async function requireOwner(req:NextRequest){
 const {url,anon,service}=env();
 const bearer=req.headers.get('authorization')||'';
 const token=bearer.toLowerCase().startsWith('bearer ')?bearer.slice(7):'';
 if(!token)throw new Error('Sesi owner tidak ditemukan.');

 // Validasi owner memakai jalur yang SAMA dengan Owner Console di browser:
 // access token user -> RPC public.is_admin(). Jangan menebak role lewat service client.
 const authClient=createSupabaseClient(url,anon,{
  auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:`Bearer ${token}`}}
 });
 const {data:userData,error:userError}=await authClient.auth.getUser(token);
 if(userError||!userData.user)throw new Error('Sesi owner tidak valid.');

 const {data:isAdmin,error:roleError}=await authClient.rpc('is_admin');
 if(roleError)throw new Error(`Gagal memeriksa role owner: ${roleError.message}`);
 if(!isAdmin)throw new Error('Akun ini bukan owner toko.');

 // Secret key hanya dipakai SETELAH user lolos validasi owner.
 const adminAuth=createSupabaseClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 return {adminAuth,ownerDb:authClient,ownerId:userData.user.id};
}

function cleanEmail(v:unknown){return String(v||'').trim().toLowerCase()}
function cleanText(v:unknown){return String(v||'').trim()}

export async function GET(req:NextRequest){
 try{
  const {adminAuth,ownerDb,ownerId}=await requireOwner(req);
  const {data:listed,error:listError}=await adminAuth.auth.admin.listUsers({page:1,perPage:1000});
  if(listError)throw listError;

  const {data:orders,error:orderError}=await ownerDb
   .from('orders')
   .select('customer_name,customer_email,customer_whatsapp,status,created_at')
   .order('created_at',{ascending:false})
   .limit(5000);
  if(orderError)throw orderError;

  const orderMap=new Map<string,{name:string;wa:string;orders:number;paid:number}>();
  for(const o of orders||[]){
   const email=cleanEmail(o.customer_email);
   if(!email)continue;
   const current=orderMap.get(email)||{name:'',wa:'',orders:0,paid:0};
   current.orders++;
   if(o.status==='paid'||o.status==='completed')current.paid++;
   if(!current.name)current.name=cleanText(o.customer_name);
   if(!current.wa)current.wa=cleanText(o.customer_whatsapp);
   orderMap.set(email,current);
  }

  const members=(listed.users||[])
   .filter(u=>!u.app_metadata?.is_owner)
   .map(u=>{
    const email=cleanEmail(u.email);
    const order=orderMap.get(email);
    return {
     id:u.id,
     email,
     full_name:cleanText(u.user_metadata?.full_name)||order?.name||'',
     whatsapp:cleanText(u.user_metadata?.whatsapp)||order?.wa||'',
     email_confirmed_at:u.email_confirmed_at||null,
     created_at:u.created_at,
     last_sign_in_at:u.last_sign_in_at||null,
     order_count:order?.orders||0,
     paid_count:order?.paid||0
    };
   });

  // ADCStore memakai satu owner aktif. Jangan query admin_users dengan Secret Key:
  // beberapa project lama tidak memberikan table privilege langsung ke key server.
  // Owner yang sedang login sudah tervalidasi lewat RPC is_admin() di requireOwner().
  return NextResponse.json({members:members.filter(m=>m.id!==ownerId)});
 }catch(error:any){
  return NextResponse.json({error:error?.message||'Gagal membaca member.'},{status:400});
 }
}

export async function POST(req:NextRequest){
 try{
  const {adminAuth,ownerId}=await requireOwner(req);
  const body=await req.json();
  const action=cleanText(body.action);

  if(action==='create'){
   const email=cleanEmail(body.email);
   const full_name=cleanText(body.full_name);
   const whatsapp=cleanText(body.whatsapp);
   const password=String(body.password||'');
   if(!email||!full_name)throw new Error('Nama dan email wajib diisi.');
   if(password.length<6)throw new Error('Password minimal 6 karakter.');

   const {data,error}=await adminAuth.auth.admin.createUser({
    email,
    password,
    email_confirm:true,
    user_metadata:{full_name,whatsapp}
   });
   if(error)throw error;

   // public.profiles is created automatically by the existing auth trigger.
   return NextResponse.json({ok:true,id:data.user?.id,email});
  }

  if(action==='update'){
   const id=cleanText(body.id);
   const full_name=cleanText(body.full_name);
   const whatsapp=cleanText(body.whatsapp);
   if(!id||!full_name)throw new Error('ID member dan nama wajib diisi.');

   if(id===ownerId)throw new Error('Akun owner tidak boleh diedit dari menu Member.');

   const {error}=await adminAuth.auth.admin.updateUserById(id,{user_metadata:{full_name,whatsapp}});
   if(error)throw error;
   return NextResponse.json({ok:true});
  }

  if(action==='set_password'){
   const id=cleanText(body.id);
   const password=String(body.password||'');
   if(!id)throw new Error('ID member tidak valid.');
   if(id===ownerId)throw new Error('Password owner tidak boleh diubah dari menu Member.');
   if(password.length<6)throw new Error('Password minimal 6 karakter.');

   const {error}=await adminAuth.auth.admin.updateUserById(id,{password});
   if(error)throw error;
   return NextResponse.json({ok:true});
  }

  if(action==='delete'){
   const id=cleanText(body.id);
   if(!id)throw new Error('ID member tidak valid.');

   if(id===ownerId)throw new Error('Akun owner tidak boleh dihapus.');

   const {error}=await adminAuth.auth.admin.deleteUser(id);
   if(error)throw error;
   return NextResponse.json({ok:true});
  }

  throw new Error('Aksi member tidak dikenali.');
 }catch(error:any){
  return NextResponse.json({error:error?.message||'Aksi member gagal.'},{status:400});
 }
}
