import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, onValue, set, update, serverTimestamp, get } from "firebase/database";
import { ArrowLeft, Save, CheckCircle2, User, Activity, AlertTriangle, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsultationChiefComplaint } from "./components/ConsultationChiefComplaint";
import { ConsultationVitals } from "./components/ConsultationVitals";
import { ConsultationExamination } from "./components/ConsultationExamination";
import { ConsultationDiagnosis } from "./components/ConsultationDiagnosis";
import { ConsultationInvestigations } from "./components/ConsultationInvestigations";
import { ConsultationPrescription } from "./components/ConsultationPrescription";

export function ConsultationWorkspace() {
  const { visitId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [consultation, setConsultation] = useState<any>(null);
  
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize Consultation Data
  useEffect(() => {
    if (!clinicKey || !visitId) return;

    const loadWorkspace = async () => {
      try {
        // 1. Fetch Appointment to get patient context
        const apptRef = ref(db, `carefirst/users/${clinicKey}/appointments/${visitId}`);
        const apptSnap = await get(apptRef);
        
        let patientIdToFetch = null;

        if (apptSnap.exists()) {
          const apptData = apptSnap.val();
          setAppointment({ id: visitId, ...apptData });
          patientIdToFetch = apptData.patientId;

          // If the status is still "Waiting", mark it as "In Consultation"
          if (apptData.status === "Waiting") {
            await update(apptRef, { status: "In Consultation" });
          }
        }

        // 2. Fetch Patient 360 data if patientId exists
        if (patientIdToFetch) {
          const patientRef = ref(db, `carefirst/users/${clinicKey}/patients/${patientIdToFetch}`);
          const patientSnap = await get(patientRef);
          if (patientSnap.exists()) {
            setPatient(patientSnap.val());
          }
        }

        // 3. Load or Initialize Consultation Record
        const consultRef = ref(db, `carefirst/users/${clinicKey}/consultations/${visitId}`);
        const consultSnap = await get(consultRef);
        
        if (consultSnap.exists()) {
          setConsultation({ id: visitId, ...consultSnap.val() });
        } else {
          // Initialize new consultation
          const newConsultation = {
            visitId,
            patientId: patientIdToFetch || null,
            doctorId: apptSnap.exists() ? apptSnap.val().doctorId : null,
            status: "draft",
            chiefComplaint: [],
            history: "",
            vitals: {},
            examination: {},
            diagnosis: [],
            prescription: [],
            investigations: [],
            clinicalNotes: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await set(consultRef, newConsultation);
          setConsultation({ id: visitId, ...newConsultation });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading consultation workspace", err);
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [clinicKey, visitId]);

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-muted-foreground">Initializing Consultation Workspace...</div>;
  }

  const identity = patient?.identity || {};
  const medical = patient?.medical || {};

  const handleSaveDraft = async () => {
    if (!clinicKey || !visitId) return;
    setSaving(true);
    try {
      const consultRef = ref(db, `carefirst/users/${clinicKey}/consultations/${visitId}`);
      await update(consultRef, {
        ...consultation,
        updatedAt: serverTimestamp()
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save draft", err);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!clinicKey || !visitId) return;
    if (!window.confirm("Are you sure you want to complete this consultation? It will be marked as read-only.")) return;
    
    try {
      // 1. Update Consultation
      const consultRef = ref(db, `carefirst/users/${clinicKey}/consultations/${visitId}`);
      await update(consultRef, {
        ...consultation,
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Update Appointment Queue Status
      const apptRef = ref(db, `carefirst/users/${clinicKey}/appointments/${visitId}`);
      await update(apptRef, { status: "Completed" });

      alert("Consultation Completed Successfully!");
      navigate({ to: "/admin/consultation" });
    } catch (err) {
      console.error("Failed to complete consultation", err);
      alert("Failed to complete consultation.");
    }
  };

  const handleConsultationChange = (field: string, value: any) => {
    setConsultation((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-secondary/20 font-sans">
      {/* ─── Header ─── */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/consultation" })}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold text-navy">
                {appointment?.name || "Unknown Patient"}
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">
                {consultation?.status === 'completed' ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              UHID: {appointment?.uhid} • Visit: {appointment?.token || "Walk-in"} • Dr. {appointment?.doctorName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-muted-foreground mr-2">
              ✓ Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" className="h-9" onClick={handleSaveDraft} disabled={saving || consultation?.status === "completed"}>
            <Save size={16} className="mr-2" /> {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button className="h-9 bg-success hover:bg-success/90 text-white" onClick={handleComplete} disabled={consultation?.status === "completed"}>
            <CheckCircle2 size={16} className="mr-2" /> Complete
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-full">
          
          {/* ─── Left Sidebar (Clinical Snapshot) ─── */}
          <div className="border-r border-border bg-white overflow-y-auto p-5 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Patient Snapshot</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {appointment?.name ? appointment.name.substring(0,2).toUpperCase() : "PT"}
                </div>
                <div>
                  <p className="font-bold text-navy">{appointment?.name}</p>
                  <p className="text-xs text-muted-foreground">{appointment?.age}Y • {appointment?.gender}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-border pb-1">
                  <span className="text-muted-foreground">Blood Group</span>
                  <span className="font-medium text-navy">{identity.bloodGroup || "Unknown"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium text-navy">{appointment?.phone || "N/A"}</span>
                </div>
              </div>
            </div>

            {medical.allergies && medical.allergies.length > 0 && (
              <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} /> Recorded Allergies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {medical.allergies.map((a: string) => (
                    <Badge key={a} variant="outline" className="bg-white text-red-700 border-red-200 text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {medical.conditions && medical.conditions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Chronic Conditions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {medical.conditions.map((c: string) => (
                    <Badge key={c} variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {medical.medications && medical.medications.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Current Medications</h4>
                <div className="flex flex-wrap gap-1.5">
                  {medical.medications.map((m: string) => (
                    <Badge key={m} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Content (Consultation Workspace) ─── */}
          <div className="overflow-y-auto p-6 space-y-6">
            {consultation?.status === "completed" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Consultation Completed</h4>
                  <p className="text-xs text-blue-700 mt-1">This record is locked and read-only. Medical history, prescriptions, and lab orders have been synced to the patient's EMR.</p>
                </div>
              </div>
            )}

            {/* EMR Sections */}
            <div className="space-y-6 pb-10">
              <ConsultationVitals 
                consultation={consultation} 
                onChange={handleConsultationChange} 
              />
              <ConsultationChiefComplaint 
                consultation={consultation} 
                onChange={handleConsultationChange} 
              />
              <ConsultationExamination 
                consultation={consultation} 
                onChange={handleConsultationChange} 
              />
              <ConsultationDiagnosis 
                consultation={consultation} 
                onChange={handleConsultationChange} 
              />
              <ConsultationInvestigations 
                consultation={consultation} 
                onChange={handleConsultationChange} 
              />
              <ConsultationPrescription 
                consultation={consultation} 
                onChange={handleConsultationChange} 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
