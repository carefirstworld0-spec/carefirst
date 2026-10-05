import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabVisitsProps {
  visits: any[];
}

export function TabVisits({ visits }: TabVisitsProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="font-bold text-navy border-b border-border pb-2 mb-4">
        Visit History
      </h3>
      {visits.length > 0 ? (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {visits.map((visit: any) => (
            <div
              key={visit.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CalendarDays size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-navy">
                    {new Date(visit.date).toLocaleDateString()}
                  </span>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {visit.admissionType || "OPD"}
                  </Badge>
                </div>
                <p className="text-[13px] font-medium text-primary">
                  {visit.departmentLabel || visit.department}
                </p>
                <p className="text-[13px] text-muted-foreground mb-2">
                  Dr. {visit.doctorName || visit.doctor}
                </p>
                {visit.chiefComplaint && (
                  <div className="bg-secondary/10 p-2 rounded-md text-[12px] text-navy border border-border">
                    <span className="font-semibold">Reason:</span> {visit.chiefComplaint}
                  </div>
                )}
                <Button variant="ghost" size="sm" className="w-full mt-2 h-8 text-[12px]">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <CalendarDays />
          </div>
          <p className="text-[14px] font-medium text-navy">No visits yet</p>
          <Button variant="outline" className="mt-3 h-8 text-[12px]">
            Schedule Visit
          </Button>
        </div>
      )}
    </div>
  );
}
