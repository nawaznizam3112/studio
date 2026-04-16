'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { acceptPatientInvite } from '@/app/breathing/actions';

export function PatientEnrollClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState(params.get('token') || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Patient Enrollment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Invite token</Label><Input value={token} onChange={(e) => setToken(e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button onClick={() => startTransition(async () => {
            const res = await acceptPatientInvite({ token, phone, password });
            if (res.success) router.push('/login?audience=patient');
          })} disabled={isPending || !token || !phone || !password}>Complete enrollment</Button>
        </CardContent>
      </Card>
    </div>
  );
}
