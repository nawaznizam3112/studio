
'use client';
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Login',
//   description: 'Access your QREngage account to manage your business or track your loyalty rewards.',
// };

export default function LoginPage() {
    return <LoginForm />;
}
