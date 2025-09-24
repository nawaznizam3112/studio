
import { Profile } from "@/components/features/profile";
import { Header } from "@/components/layout/header";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Profile />
      </main>
    </div>
  );
}

    