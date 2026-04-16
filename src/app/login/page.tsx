
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from 'react';

// export const metadata: Metadata = {
//   title: 'Login',
//   description: 'Access your QREngage account to manage your business or track your loyalty rewards.',
// };

export default function LoginPage() {
    return (
      <Suspense fallback={<div className="p-6">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    );
}
