
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Footer } from '@/components/layout/footer';
import { SessionProvider } from '@/hooks/use-session.tsx';

const appIconString = `data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='512' height='512' rx='128' fill='url(%23gradient)' /%3E%3Cg transform='translate(102.4, 102.4) scale(0.6)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M170.667 0H106.667C47.7563 0 0 47.7563 0 106.667V170.667H170.667V0ZM0 405.333V448C0 483.346 28.6538 512 64 512H106.667V405.333H0Z' fill='white' fill-opacity='0.8' /%3E%3Cpath d='M0 256H170.667V362.667H0V256Z' fill='white' fill-opacity='0.8' /%3E%3Cpath d='M256 0H362.667V170.667H256V0Z' fill='white' fill-opacity='0.8' /%3E%3Cpath d='M448 0H405.333V170.667H512V64C512 28.6538 483.346 0 448 0Z' fill='white' fill-opacity='0.8' /%3E%3Crect x='256' y='256' width='256' height='256' rx='48' fill='white' /%3E%3Ctext x='384' y='400' fontFamily='Inter, sans-serif' fontSize='220' fontWeight='bold' textAnchor='middle' fill='hsl(254 100% 63%)'%3EE%3C/text%3E%3C/g%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0' y1='0' x2='512' y2='512' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='hsl(254 100% 63%)' /%3E%3Cstop offset='1' stop-color='hsl(219 100% 73%)' /%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E`;


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'),
  title: {
    default: 'QREngage | Modern Loyalty & Engagement',
    template: '%s | QREngage',
  },
  description: 'A modern loyalty and engagement platform for salons, gyms, and local businesses. Use QR codes to connect with customers, offer rewards, and grow your brand.',
  icons: {
    icon: appIconString,
    apple: appIconString,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <SessionProvider>
            <div className="flex-grow">
            {children}
            </div>
            <Footer />
            <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
