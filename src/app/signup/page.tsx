
import { SignupFlow } from "@/components/auth/signup-flow";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new QREngage account as a customer or register your business to start engaging with clients.',
};

export default function SignupPage() {
    return <SignupFlow />;
}
