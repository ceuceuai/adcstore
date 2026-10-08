'use client';
import { getTheme, themeVars } from '@/lib/themes';
export default function ThemeProvider({children,preset='lavender',primary,secondary,accent}:{children:React.ReactNode;preset?:string;primary?:string|null;secondary?:string|null;accent?:string|null}){
 const base=getTheme(preset);
 return <div className="themeRoot" style={themeVars(base,{primary,secondary,accent})}>{children}</div>
}
