import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function escapeHtml(value:string){
  return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch] || ch));
}

export async function GET(request:NextRequest,{params}:{params:{slug:string}}){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if(!url || !key){
    return new Response('<h1>Konfigurasi Supabase belum lengkap.</h1>',{
      status:500,headers:{'content-type':'text/html; charset=utf-8'}
    });
  }

  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await supabase
    .from('products')
    .select('name,internal_salespage_html,is_active')
    .eq('slug',params.slug)
    .eq('is_active',true)
    .maybeSingle();

  if(error || !data || !data.internal_salespage_html?.trim()){
    return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Salespage tidak ditemukan</title></head><body style="font-family:system-ui;padding:40px"><h1>Salespage tidak ditemukan</h1><p>${escapeHtml(error?.message||'Produk ini belum memiliki salespage internal.')}</p></body></html>`,{
      status:404,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}
    });
  }

  let html=data.internal_salespage_html.trim();
  const origin=new URL(request.url).origin;
  const additions=`<base href="${origin}/"><meta name="viewport" content="width=device-width,initial-scale=1">`;

  if(/<!doctype|<html[\s>]/i.test(html)){
    if(/<head[\s>]/i.test(html)){
      html=html.replace(/<head([^>]*)>/i,`<head$1>${additions}`);
    }else{
      html=html.replace(/<html([^>]*)>/i,`<html$1><head>${additions}<title>${escapeHtml(data.name)}</title></head>`);
    }
  }else{
    html=`<!doctype html><html><head><meta charset="utf-8">${additions}<title>${escapeHtml(data.name)}</title></head><body>${html}</body></html>`;
  }

  return new Response(html,{
    status:200,
    headers:{
      'content-type':'text/html; charset=utf-8',
      'cache-control':'no-store, max-age=0',
      'x-content-type-options':'nosniff'
    }
  });
}
