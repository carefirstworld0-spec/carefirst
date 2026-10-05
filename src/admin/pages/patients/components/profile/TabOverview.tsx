import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabOverviewProps {
  patient: any;
  visits: any[];
}

export function TabOverview({ patient, visits }: TabOverviewProps) {
  const contact = patient.contact || {};
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Full */}
        <div className="space-y-4">
          <h3 className="font-bold text-navy border-b border-border pb-2">
            Full Contact Details
          </h3>
          <div className="space-y-3 text-[13px]">
            <div className="grid grid-cols-3">
              <span className="text-muted-foreground font-medium">Email:</span>{" "}
              <span className="col-span-2 font-medium text-navy">
                {contact.email || "—"}
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-muted-foreground font-medium">Address:</span>
              <span className="col-span-2 font-medium text-navy">
                {contact.address?.line1 ? (
                  <>
                    {contact.address.line1}
                    <br />
                    {contact.address.line2 && (
                      <>
                        {contact.address.line2}
                        <br />
                      </>
                    )}
                    {contact.address.city}, {contact.address.state} -{" "}
                    {contact.address.pincode}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div className="space-y-4">
          <h3 className="font-bold text-navy border-b border-border pb-2">
            Emergency Contact
          </h3>
          {patient.emergency?.name ? (
            <div className="space-y-3 text-[13px] bg-red-50/50 border border-red-100 p-4 rounded-lg">
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium">Name:</span>{" "}
                <span className="col-span-2 font-bold text-navy">
                  {patient.emergency.name}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium">Relation:</span>{" "}
                <span className="col-span-2 font-medium text-navy capitalize">
                  {patient.emergency.relationship}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium">Phone:</span>{" "}
                <span className="col-span-2 font-medium text-navy">
                  {patient.emergency.phone}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground italic">
              No emergency contact provided.
            </p>
          )}
        </div>
      </div>

      {/* Recent Visits Preview */}
      <div className="pt-4">
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <h3 className="font-bold text-navy">Recent Visits</h3>
          <Button
            variant="link"
            className="h-auto p-0 text-primary text-[13px]"
            onClick={() =>
              document
                .querySelector('[value="visits"]')
                ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
            }
          >
            View All
          </Button>
        </div>

        {visits.length > 0 ? (
          <div className="space-y-3">
            {visits.slice(0, 3).map((visit: any) => (
              <div
                key={visit.id}
                className="flex justify-between items-center p-4 rounded-lg border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">
                      {new Date(visit.date).toLocaleDateString()}
                    </Badge>
                    <span className="font-bold text-navy">
                      {visit.departmentLabel || visit.department}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Dr. {visit.doctorName || visit.doctor} •{" "}
                    {visit.chiefComplaint || "Routine Checkup"}
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground italic">
            No visits recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
