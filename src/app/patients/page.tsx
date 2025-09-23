import { PageHeader } from "@/components/page-header";
import { PatientSuggester } from "@/components/patients/suggester";

export default function PatientsPage() {
  return (
    <div>
      <PageHeader
        title="Patient Follow-up"
        description="Let AI suggest which past patients to contact for your open appointment slots."
      />
      <div className="p-6 pt-0">
        <PatientSuggester />
      </div>
    </div>
  );
}
