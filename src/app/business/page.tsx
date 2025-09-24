
'use client';
import { redirect } from 'next/navigation';
import { useSession } from '@/hooks/use-session.tsx';
import { useEffect } from 'react';

export default function BusinessPage() {
    const { session, loading } = useSession();
    
    useEffect(() => {
        if (!loading) {
            if (session?.businessId) {
                redirect(`/business/${session.businessId}/dashboard`);
            } else if(session?.role === 'admin') {
                redirect('/admin');
            }
             else {
                redirect('/login');
            }
        }
    }, [session, loading]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading Clinic Dashboard...</p>
        </div>
    );
}
