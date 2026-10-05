import { Microscope, FileText, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabLabsProps {
  patientId: string;
}

export function TabLabs({ patientId }: TabLabsProps) {
  const labOrders: any[] = []; // Placeholder

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <Microscope size={18} className="text-primary" /> Lab Reports & Orders
        </h3>
      </div>

      {labOrders.length > 0 ? (
        <div className="space-y-4">
          {/* Mockup for future data */}
        </div>
      ) : (
        <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <Microscope />
          </div>
          <p className="text-[14px] font-medium text-navy">No lab reports found</p>
          <p className="text-[12px] text-muted-foreground mt-1">Investigations and lab results will appear here.</p>
        </div>
      )}
    </div>
  );
}
