import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function WhiteLabel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full size-32" />
        <div className="relative flex size-24 items-center justify-center rounded-[24px] bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20 shadow-lg">
          <Construction size={40} className="text-primary" />
        </div>
      </div>
      
      <h1 className="font-display text-[32px] font-extrabold text-navy/90 tracking-tight mb-3">
        White Label Settings
      </h1>
      <p className="text-[15px] font-medium text-muted-foreground max-w-md mx-auto mb-8">
        This module is currently under development. Soon, you will be able to fully customize the platform's branding, emails, and domains for your clients.
      </p>
      
      <Link 
        to="/superadmin"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-navy/90 text-white text-[14px] font-bold hover:bg-navy/80 transition-all shadow-md hover:-translate-y-0.5"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}
