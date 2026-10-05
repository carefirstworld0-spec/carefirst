import { Pill, Printer, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabPrescriptionsProps {
  patientId: string;
}

export function TabPrescriptions({ patientId }: TabPrescriptionsProps) {
  // Placeholder data for now, would be fetched from `patients/${patientId}/prescriptions` or `visits/${visitId}/prescription`
  const prescriptions: any[] = [];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <Pill size={18} className="text-primary" /> Prescriptions
        </h3>
      </div>

      {prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((rx, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-navy">Dr. {rx.doctorName}</h4>
                  <p className="text-[12px] text-muted-foreground">{new Date(rx.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[11px]">
                    <FileText size={12} className="mr-1" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-[11px]">
                    <Printer size={12} className="mr-1" /> Print
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {rx.drugs.map((drug: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/10 border border-border">
                    <div>
                      <p className="text-[13px] font-bold text-navy">{drug.name}</p>
                      <p className="text-[11px] text-muted-foreground">{drug.dosage} • {drug.frequency} • {drug.duration}</p>
                    </div>
                    <Badge variant="outline" className="bg-white text-[10px]">
                      {drug.instruction}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <Pill />
          </div>
          <p className="text-[14px] font-medium text-navy">No prescriptions yet</p>
          <p className="text-[12px] text-muted-foreground mt-1">Prescriptions issued during consultations will appear here.</p>
        </div>
      )}
    </div>
  );
}
