import { MessageSquare, Mail, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TabCommunicationsProps {
  patientId: string;
}

export function TabCommunications({ patientId }: TabCommunicationsProps) {
  const comms: any[] = []; // Placeholder

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" /> Communication History
        </h3>
      </div>

      {comms.length > 0 ? (
        <div className="space-y-4">
          {/* Mockup for future data */}
        </div>
      ) : (
        <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <MessageSquare />
          </div>
          <p className="text-[14px] font-medium text-navy">No communication records</p>
          <p className="text-[12px] text-muted-foreground mt-1">SMS, WhatsApp, and Email logs will appear here.</p>
        </div>
      )}
    </div>
  );
}
