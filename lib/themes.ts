import type { CSSProperties } from 'react';
export type ThemePreset = { id:string; name:string; primary:string; secondary:string; accent:string; bg:string; surface:string; text:string; muted:string };
export const THEME_PRESETS:ThemePreset[] = [
 {id:'lavender',name:'Lavender Dream',primary:'#8b5cf6',secondary:'#c4b5fd',accent:'#f9a8d4',bg:'#f5efff',surface:'#fffafd',text:'#362b54',muted:'#766b8f'},
 {id:'sky',name:'Sky Candy',primary:'#3b82f6',secondary:'#93c5fd',accent:'#67e8f9',bg:'#eef8ff',surface:'#ffffff',text:'#16345c',muted:'#6780a2'},
 {id:'mint',name:'Minty Pop',primary:'#10b981',secondary:'#6ee7b7',accent:'#a7f3d0',bg:'#effdf8',surface:'#ffffff',text:'#17483d',muted:'#64857d'},
 {id:'rose',name:'Rose Milk',primary:'#ec4899',secondary:'#f9a8d4',accent:'#fbcfe8',bg:'#fff1f7',surface:'#ffffff',text:'#5f2341',muted:'#9b6c82'},
 {id:'peach',name:'Peach Glow',primary:'#f97316',secondary:'#fdba74',accent:'#fde68a',bg:'#fff7ed',surface:'#fffdf8',text:'#5a351c',muted:'#9a785e'},
 {id:'lemon',name:'Lemon Cream',primary:'#ca8a04',secondary:'#fde047',accent:'#fef08a',bg:'#fffceb',surface:'#ffffff',text:'#524514',muted:'#8f8352'},
 {id:'aqua',name:'Aqua Cloud',primary:'#0891b2',secondary:'#67e8f9',accent:'#a5f3fc',bg:'#ecfeff',surface:'#ffffff',text:'#164e63',muted:'#5f8d98'},
 {id:'grape',name:'Grape Soda',primary:'#7c3aed',secondary:'#a78bfa',accent:'#c084fc',bg:'#f6f0ff',surface:'#ffffff',text:'#402567',muted:'#7f6a98'},
 {id:'coral',name:'Coral Pop',primary:'#ef4444',secondary:'#fca5a5',accent:'#fdba74',bg:'#fff4f2',surface:'#ffffff',text:'#642e2b',muted:'#9a6c68'},
 {id:'midnight',name:'Midnight Candy',primary:'#7c3aed',secondary:'#2563eb',accent:'#ec4899',bg:'#101426',surface:'#181f35',text:'#f8f7ff',muted:'#adb6d0'}
];
export function getTheme(id?:string|null){return THEME_PRESETS.find(x=>x.id===id)||THEME_PRESETS[0]}
export function themeVars(base:ThemePreset, custom?:{primary?:string|null;secondary?:string|null;accent?:string|null}){
 return {
  '--primary': custom?.primary||base.primary,
  '--secondary': custom?.secondary||base.secondary,
  '--accent': custom?.accent||base.accent,
  '--bg': base.bg,'--surface':base.surface,'--text':base.text,'--muted':base.muted
 } as CSSProperties;
}
