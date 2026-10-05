import { ShieldCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabInsuranceProps {
  patient: any;
  patientId: string;
}

export function TabInsurance({ patient, patientId }: TabInsuranceProps) {
  const insurance = patient.insurance || {};
  const hasInsurance = Object.keys(insurance).length > 0;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" /> Insurance & Corporate Coverage
        </h3>
      </div>

      {!hasInsurance ? (
        <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <ShieldCheck />
          </div>
          <p className="text-[14px] font-medium text-navy">No insurance details found</p>
          <p className="text-[12px] text-muted-foreground mt-1 mb-4">Update the patient's profile to add insurance or corporate coverage.</p>
          <Button variant="outline" size="sm">
            Add Coverage
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-navy">Primary Coverage</h4>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
            </div>
            
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-bold text-navy">{insurance.provider || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Policy Number:</span>
                <span className="font-medium text-navy">{insurance.policyNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">TPA:</span>
                <span className="font-medium text-navy">{insurance.tpa || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
