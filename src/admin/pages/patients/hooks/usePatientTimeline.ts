import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";

export function usePatientTimeline(clinicKey: string, patientId: string) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicKey || !patientId) return;

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const timelineEvents: any[] = [];

        // 1. Fetch Visits
        const visitsSnap = await get(ref(db, `carefirst/users/${clinicKey}/patients/${patientId}/visits`));
        if (visitsSnap.exists()) {
          const visitsData = visitsSnap.val();
          Object.keys(visitsData).forEach((key) => {
            const v = visitsData[key];
            timelineEvents.push({
              id: `visit_${key}`,
              type: "visit",
              title: `Consultation: ${v.departmentLabel || v.department}`,
              description: `Dr. ${v.doctorName || v.doctor}`,
              date: v.timestamp || v.date,
              icon: "stethoscope",
              status: v.status
            });
          });
        }

        // 2. Fetch Audit Logs for this patient
        const auditRef = query(
          ref(db, `carefirst/users/${clinicKey}/auditLog`),
          orderByChild("patientId"),
          equalTo(patientId)
        );
        const auditSnap = await get(auditRef);
        if (auditSnap.exists()) {
          const auditData = auditSnap.val();
          Object.keys(auditData).forEach((key) => {
            const a = auditData[key];
            
            let title = "System Event";
            let icon = "activity";
            let desc = `Performed by ${a.performedBy}`;

            if (a.action === "patient_registered") {
              title = "Patient Registered";
              icon = "user-plus";
            } else if (a.action === "profile_updated") {
              title = "Profile Updated";
              icon = "pencil";
            }

            timelineEvents.push({
              id: `audit_${key}`,
              type: "audit",
              title,
              description: desc,
              date: a.timestamp,
              icon,
              status: "completed"
            });
          });
        }

        // Sort descending by date
        timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(timelineEvents);
      } catch (err) {
        console.error("Error fetching timeline:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [clinicKey, patientId]);

  return { events, loading };
}
