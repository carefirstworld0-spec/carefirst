import { useNavigate } from "@tanstack/react-router";
import { Activity, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabMedicalProps {
  patient: any;
  patientId: string;
}

export function TabMedical({ patient, patientId }: TabMedicalProps) {
  const navigate = useNavigate();
  const medical = patient.medical || {};

  const hasMedicalData = 
    (medical.allergies && medical.allergies.length > 0) || 
    (medical.conditions && medical.conditions.length > 0) || 
    (medical.medications && medical.medications.length > 0);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <Activity size={18} className="text-primary" /> Clinical Notes & History
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8"
          onClick={() => navigate({ to: `/admin/patients/${patientId}/edit` })}
        >
          <Pencil size={12} className="mr-2" /> Edit History
        </Button>
      </div>

      {!hasMedicalData ? (
        <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <Activity />
          </div>
          <p className="text-[14px] font-medium text-navy">No medical history recorded</p>
          <p className="text-[12px] text-muted-foreground mt-1">Add allergies, conditions, and ongoing medications.</p>
          <Button 
            variant="outline" 
            className="mt-4 h-8 text-[12px]"
            onClick={() => navigate({ to: `/admin/patients/${patientId}/edit` })}
          >
            Add Medical History
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
            <h4 className="text-[13px] font-bold text-red-900 uppercase tracking-wider">Known Allergies</h4>
            {medical.allergies && medical.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medical.allergies.map((item: string) => (
                  <Badge key={item} variant="outline" className="bg-white text-red-700 border-red-200">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground italic">None recorded</p>
            )}
          </div>

          <div className="space-y-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <h4 className="text-[13px] font-bold text-orange-900 uppercase tracking-wider">Chronic Conditions</h4>
            {medical.conditions && medical.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medical.conditions.map((item: string) => (
                  <Badge key={item} variant="outline" className="bg-white text-orange-700 border-orange-200">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground italic">None recorded</p>
            )}
          </div>

          <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 md:col-span-2">
            <h4 className="text-[13px] font-bold text-blue-900 uppercase tracking-wider">Ongoing Medications</h4>
            {medical.medications && medical.medications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medical.medications.map((item: string) => (
                  <Badge key={item} variant="outline" className="bg-white text-blue-700 border-blue-200">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground italic">None recorded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
