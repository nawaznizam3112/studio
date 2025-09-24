
import { Header } from "@/components/layout/header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8">
            <Button asChild variant="ghost" className="pl-0">
                 <Link href="/">
                    <ArrowLeft className="mr-2" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <div className="prose dark:prose-invert max-w-full">
            {children}
        </div>
      </main>
    </>
  );
}
