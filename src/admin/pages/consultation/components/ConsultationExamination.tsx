import { FileText } from "lucide-react";

export function ConsultationExamination({ 
  consultation, 
  onChange 
}: { 
  consultation: any; 
  onChange: (field: string, value: any) => void 
}) {
  const isReadOnly = consultation?.status === "completed";
  const exam = consultation?.examination || {};

  const handleExamChange = (key: string, value: string) => {
    onChange("examination", { ...exam, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <FileText className="text-primary" size={20} />
        <h2 className="text-lg font-bold text-navy">Clinical Examination</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-bold text-navy mb-2 block">General Examination</label>
          <textarea
            className="w-full min-h-[120px] p-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            placeholder="Appearance, Pallor, Icterus, Clubbing..."
            value={exam.general || ""}
            onChange={(e) => handleExamChange("general", e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-navy mb-2 block">Systemic Examination (CVS, RS, PA, CNS)</label>
          <textarea
            className="w-full min-h-[120px] p-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            placeholder="System-specific findings..."
            value={exam.systemic || ""}
            onChange={(e) => handleExamChange("systemic", e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="text-sm font-bold text-navy mb-2 block">Clinical Notes</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            placeholder="Additional clinical observations, differential diagnosis thoughts..."
            value={consultation?.clinicalNotes || ""}
            onChange={(e) => onChange("clinicalNotes", e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}
