import './globals.css';
import GlobalFloatingWhatsApp from '@/components/GlobalFloatingWhatsApp';
export const metadata = { title: 'ADCStore', description: 'Digital Store & Affiliate Website for ADC Members' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}<GlobalFloatingWhatsApp/></body></html>}
