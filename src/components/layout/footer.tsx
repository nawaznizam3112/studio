import { QrCode } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
                <QrCode className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-foreground">QREngage</h1>
            </Link>
            <p className="mt-4 text-sm">
                Modern loyalty and engagement for local businesses.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/about-us" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/legal/contact-us" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/legal/disclaimer" className="hover:text-primary">Disclaimer</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/pricing" className="hover:text-primary">Pricing Policy</Link></li>
              <li><Link href="/legal/refund-policy" className="hover:text-primary">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} QREngage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
