import { Activity, UserPlus, Stethoscope, Pencil, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePatientTimeline } from "../../hooks/usePatientTimeline";

interface TabTimelineProps {
  patientId: string;
}

const iconMap: Record<string, any> = {
  "user-plus": UserPlus,
  "stethoscope": Stethoscope,
  "pencil": Pencil,
  "activity": Activity
};

export function TabTimeline({ patientId }: TabTimelineProps) {
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";
  const { events, loading } = usePatientTimeline(clinicKey, patientId);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading timeline...</div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <Clock size={18} className="text-primary" /> Patient Timeline
        </h3>
      </div>

      {events.length > 0 ? (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {events.map((event: any, idx: number) => {
            const Icon = iconMap[event.icon] || Activity;
            const isLatest = idx === 0;

            return (
              <div
                key={event.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                  isLatest ? "bg-primary text-white" : "bg-secondary text-navy"
                }`}>
                  <Icon size={16} />
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm transition-colors ${
                  isLatest ? "border-primary/40 bg-card hover:border-primary/60" : "border-border bg-card/50 hover:border-primary/30"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-navy">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Badge>
                  </div>
                  <p className={`text-[13px] font-medium ${isLatest ? 'text-primary' : 'text-navy'}`}>
                    {event.title}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <Clock />
          </div>
          <p className="text-[14px] font-medium text-navy">No timeline events</p>
        </div>
      )}
    </div>
  );
}
