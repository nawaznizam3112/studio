import { Suspense } from 'react';
import { PatientEnrollClient } from '@/components/breathing/patient-enroll-client';

export default function PatientEnrollPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading enrollment...</div>}>
      <PatientEnrollClient />
    </Suspense>
  );
}
