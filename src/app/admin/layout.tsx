
'use client';

import { Sidebar, SidebarProvider, SidebarInset, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, Building2, Factory, LogOut, User, QrCode, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/hooks/use-session.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, clearSession, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!session || session.role !== 'admin')) {
      router.push('/login');
    }
  }, [session, loading, router]);


  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return "A";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  
  if (loading || !session) {
      return (
          <div className="flex min-h-screen items-center justify-center">
              <p>Loading...</p>
          </div>
      )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent className="p-2 flex flex-col">
              <div>
                <div className="flex items-center gap-2 p-2">
                    <QrCode className="h-7 w-7 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight text-foreground">QREngage</h1>
                </div>
                <SidebarMenu className="mt-4">
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Dashboard">
                          <Link href="/admin">
                              <Home />
                              <span>Dashboard</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Industries">
                           <Link href="/admin/industries">
                              <Factory />
                              <span>Industries</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Businesses">
                          <Link href="/admin/businesses">
                              <Building2 />
                              <span>Businesses</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Clients">
                          <Link href="/admin/clients">
                              <Target />
                              <span>Clients</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Campaigns">
                          <Link href="/admin/campaigns">
                              <Trophy />
                              <span>Campaigns</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
              <div className="mt-auto">
                  <SidebarMenu>
                      <SidebarMenuItem>
                        <div className="flex items-center gap-3 p-2">
                           <Avatar className="h-9 w-9">
                              <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(session?.name)}`} alt="Admin avatar" data-ai-hint="person face" />
                              <AvatarFallback>{getInitials(session?.name)}</AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="text-sm font-semibold">{session?.name || 'Admin'}</p>
                              <p className="text-xs text-muted-foreground">{session?.role}</p>
                           </div>
                        </div>
                       </SidebarMenuItem>
                       <SidebarMenuItem>
                          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Logout</span>
                          </Button>
                      </SidebarMenuItem>
                  </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
