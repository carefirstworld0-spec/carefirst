import { Receipt, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabBillingProps {
  patientId: string;
}

export function TabBilling({ patientId }: TabBillingProps) {
  const bills: any[] = []; // Placeholder

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <Receipt size={18} className="text-primary" /> Billing & Payments
        </h3>
        <Button variant="outline" size="sm" className="h-8">
          <IndianRupee size={12} className="mr-1" /> New Bill
        </Button>
      </div>

      {bills.length > 0 ? (
        <div className="space-y-4">
          {/* Mockup for future data */}
        </div>
      ) : (
        <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <Receipt />
          </div>
          <p className="text-[14px] font-medium text-navy">No billing history</p>
          <p className="text-[12px] text-muted-foreground mt-1">Invoices and payment receipts will be listed here.</p>
        </div>
      )}
    </div>
  );
}
