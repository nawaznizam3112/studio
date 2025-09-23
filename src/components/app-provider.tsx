
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/entry')) {
    return <>{children}</>;
  }

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
  );
}
