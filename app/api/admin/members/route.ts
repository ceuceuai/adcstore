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

 const authClient=createSupabaseClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:userData,error:userError}=await authClient.auth.getUser(token);
 if(userError||!userData.user)throw new Error('Sesi owner tidak valid.');

 const admin=createSupabaseClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:isAdmin,error:adminError}=await admin.from('admin_users').select('user_id').eq('user_id',userData.user.id).maybeSingle();
 if(adminError||!isAdmin)throw new Error('Akses hanya untuk owner.');
 return {admin,ownerId:userData.user.id};
}

function cleanEmail(v:unknown){return String(v||'').trim().toLowerCase()}
function cleanText(v:unknown){return String(v||'').trim()}

export async function GET(req:NextRequest){
 try{
  const {admin}=await requireOwner(req);
  const {data:listed,error:listError}=await admin.auth.admin.listUsers({page:1,perPage:1000});
  if(listError)throw listError;

  const {data:orders,error:orderError}=await admin
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

  // Remove owner(s) using admin_users table, not metadata.
  const {data:admins}=await admin.from('admin_users').select('user_id');
  const adminIds=new Set((admins||[]).map(x=>x.user_id));
  return NextResponse.json({members:members.filter(m=>!adminIds.has(m.id))});
 }catch(error:any){
  return NextResponse.json({error:error?.message||'Gagal membaca member.'},{status:400});
 }
}

export async function POST(req:NextRequest){
 try{
  const {admin}=await requireOwner(req);
  const body=await req.json();
  const action=cleanText(body.action);

  if(action==='create'){
   const email=cleanEmail(body.email);
   const full_name=cleanText(body.full_name);
   const whatsapp=cleanText(body.whatsapp);
   if(!email||!full_name)throw new Error('Nama dan email wajib diisi.');

   // Password acak tidak pernah ditampilkan; buyer set password via reset link.
   const randomPassword=`Adc!${crypto.randomUUID()}#9z`;
   const {data,error}=await admin.auth.admin.createUser({
    email,
    password:randomPassword,
    email_confirm:true,
    user_metadata:{full_name,whatsapp}
   });
   if(error)throw error;

   if(data.user){
    await admin.from('profiles').upsert({
     id:data.user.id,
     full_name,
     role:'member'
    },{onConflict:'id'});
   }
   return NextResponse.json({ok:true,id:data.user?.id,email});
  }

  if(action==='update'){
   const id=cleanText(body.id);
   const full_name=cleanText(body.full_name);
   const whatsapp=cleanText(body.whatsapp);
   if(!id||!full_name)throw new Error('ID member dan nama wajib diisi.');

   const {data:admins}=await admin.from('admin_users').select('user_id').eq('user_id',id).maybeSingle();
   if(admins)throw new Error('Akun owner tidak boleh diedit dari menu Member.');

   const {error}=await admin.auth.admin.updateUserById(id,{user_metadata:{full_name,whatsapp}});
   if(error)throw error;
   await admin.from('profiles').update({full_name}).eq('id',id);
   return NextResponse.json({ok:true});
  }

  if(action==='delete'){
   const id=cleanText(body.id);
   if(!id)throw new Error('ID member tidak valid.');

   const {data:admins}=await admin.from('admin_users').select('user_id').eq('user_id',id).maybeSingle();
   if(admins)throw new Error('Akun owner tidak boleh dihapus.');

   const {error}=await admin.auth.admin.deleteUser(id);
   if(error)throw error;
   return NextResponse.json({ok:true});
  }

  throw new Error('Aksi member tidak dikenali.');
 }catch(error:any){
  return NextResponse.json({error:error?.message||'Aksi member gagal.'},{status:400});
 }
}
