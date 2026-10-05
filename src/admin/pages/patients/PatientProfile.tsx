import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, onValue, query, orderByChild, equalTo, get } from "firebase/database";
import {
  ArrowLeft,
  User,
  Activity,
  FileText,
  CalendarDays,
  Receipt,
  Phone,
  Droplet,
  MapPin,
  Pencil,
  Plus,
  ChevronRight,
  Pill,
  Microscope,
  ShieldCheck,
  MessageSquare,
  ClipboardList,
  CalendarCheck,
  Timer,
  Stethoscope,
  CreditCard,
  RefreshCcw,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatAge } from "./utils/validation";

import { TabOverview } from "./components/profile/TabOverview";
import { TabVisits } from "./components/profile/TabVisits";
import { TabMedical } from "./components/profile/TabMedical";
import { TabPrescriptions } from "./components/profile/TabPrescriptions";
import { TabLabs } from "./components/profile/TabLabs";
import { TabBilling } from "./components/profile/TabBilling";
import { TabDocuments } from "./components/profile/TabDocuments";
import { TabInsurance } from "./components/profile/TabInsurance";
import { TabCommunications } from "./components/profile/TabCommunications";
import { TabTimeline } from "./components/profile/TabTimeline";

export function PatientProfile() {
  const { patientId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";

  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [activeAppt, setActiveAppt] = useState<any>(null);
  const [activeConsult, setActiveConsult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicKey || !patientId) return;

    const patientRef = ref(db, `carefirst/users/${clinicKey}/patients/${patientId}`);
    const visitsRef = ref(db, `carefirst/users/${clinicKey}/patients/${patientId}/visits`);

    const unsubPatient = onValue(patientRef, (snapshot) => {
      if (snapshot.exists()) {
        setPatient(snapshot.val());
      } else {
        setPatient(null);
      }
      setLoading(false);
    });

    const unsubVisits = onValue(visitsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const vList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        vList.sort(
          (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setVisits(vList);
      } else {
        setVisits([]);
      }
    });

    const fetchActiveJourney = async () => {
      try {
        const apptsRef = query(
          ref(db, `carefirst/users/${clinicKey}/appointments`),
          orderByChild("patientId"),
          equalTo(patientId)
        );
        const snap = await get(apptsRef);
        if (snap.exists()) {
          const apptsData = snap.val();
          const apptsList = Object.keys(apptsData).map(k => ({ id: k, ...apptsData[k] }));
          // Find the most recent appointment (assuming descending sort)
          apptsList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          const latest = apptsList[0];
          setActiveAppt(latest);

          if (latest && latest.id) {
            const consultRef = ref(db, `carefirst/users/${clinicKey}/consultations/${latest.id}`);
            const cSnap = await get(consultRef);
            if (cSnap.exists()) {
              setActiveConsult(cSnap.val());
            }
          }
        }
      } catch (err) {
        console.error("Error fetching active journey:", err);
      }
    };

    fetchActiveJourney();

    return () => {
      unsubPatient();
      unsubVisits();
    };
  }, [clinicKey, patientId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading patient profile...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-navy">Patient Not Found</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/admin/patients" })}
        >
          Back to List
        </Button>
      </div>
    );
  }

  const identity = patient.identity || {};
  const contact = patient.contact || {};
  const meta = patient.meta || {};
  const medical = patient.medical || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ─── Header & Actions ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/patients" })}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy font-display">
                {identity.name}
              </h1>
              <Badge
                variant="outline"
                className={`${meta.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-700"} capitalize`}
              >
                {meta.status || "Active"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono font-medium">
              ID: {identity.uhid} • Registered: {new Date(meta.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => navigate({ to: `/admin/patients/${patientId}/edit` })}
          >
            <Pencil size={15} className="mr-2" /> Edit Profile
          </Button>
          <Button className="h-10 rounded-xl bg-primary text-white" onClick={() => {}}>
            <Plus size={15} className="mr-2" /> New Visit
          </Button>
        </div>
      </div>

      {/* ─── Patient Visit Workflow Tracker ─── */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-navy text-[15px]">Current Visit Journey</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Tracking patient workflow for active visit</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Active Visit
          </Badge>
        </div>
        
        <div className="relative z-0">
          {(() => {
            // Calculate Dynamic Journey Progress
            let currentStepIdx = 0; // Default: Registered
            
            if (activeAppt) {
              currentStepIdx = 1; // Check-in
              if (activeAppt.status === "Waiting" || activeAppt.status === "In Consultation" || activeAppt.status === "Completed") {
                currentStepIdx = 2; // In Queue
              }
              if (activeAppt.status === "In Consultation" || activeAppt.status === "Completed") {
                currentStepIdx = 3; // Consult
              }
            }
            
            if (activeConsult) {
              if (activeConsult.status === "completed") {
                currentStepIdx = 4; // Rx & Lab
                // If prescriptions or labs exist, move to billing
                if ((activeConsult.prescription && activeConsult.prescription.length > 0) || 
                    (activeConsult.investigations && activeConsult.investigations.length > 0)) {
                  currentStepIdx = 5; // Billing
                  // Here we could check if billed, then Follow-up (Step 6)
                } else {
                  currentStepIdx = 6; // Follow-up (skip billing if no rx/lab)
                }
              }
            }

            const journeySteps = [
              { id: 'registration', label: 'Registered', icon: ClipboardList, status: currentStepIdx > 0 ? 'completed' : 'active' },
              { id: 'appointment', label: 'Check-in', icon: CalendarCheck, status: currentStepIdx > 1 ? 'completed' : currentStepIdx === 1 ? 'active' : 'pending' },
              { id: 'queue', label: 'In Queue', icon: Timer, status: currentStepIdx > 2 ? 'completed' : currentStepIdx === 2 ? 'active' : 'pending' },
              { id: 'consultation', label: 'Consult', icon: Stethoscope, status: currentStepIdx > 3 ? 'completed' : currentStepIdx === 3 ? 'active' : 'pending' },
              { id: 'orders', label: 'Rx & Lab', icon: Microscope, status: currentStepIdx > 4 ? 'completed' : currentStepIdx === 4 ? 'active' : 'pending' },
              { id: 'billing', label: 'Billing', icon: CreditCard, status: currentStepIdx > 5 ? 'completed' : currentStepIdx === 5 ? 'active' : 'pending' },
              { id: 'followup', label: 'Follow-up', icon: RefreshCcw, status: currentStepIdx === 6 ? 'active' : 'pending' },
            ];

            const progressPercentage = (currentStepIdx / (journeySteps.length - 1)) * 100;

            return (
              <>
                <div className="absolute top-[18px] left-[5%] right-[5%] h-[2px] bg-border -z-10" />
                <div 
                  className="absolute top-[18px] left-[5%] h-[2px] bg-primary -z-10 transition-all duration-700 ease-in-out" 
                  style={{ width: `${progressPercentage}%` }} 
                />
                
                <div className="flex justify-between items-start gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                  {journeySteps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center min-w-[75px] flex-1 snap-center group">
                <div 
                  className={`grid size-9 place-items-center rounded-full border-2 transition-all duration-300 ${
                    step.status === 'completed' 
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : step.status === 'active'
                        ? 'bg-white border-primary text-primary ring-4 ring-primary/20 scale-110 shadow-sm'
                        : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <Check size={16} className="animate-in zoom-in duration-300" />
                  ) : (
                    <step.icon size={16} className={step.status === 'active' ? 'animate-pulse' : ''} />
                  )}
                </div>
                <div className="text-center mt-3">
                  <p className={`text-[10px] font-extrabold uppercase tracking-widest ${
                    step.status === 'active' ? 'text-primary' : 
                    step.status === 'completed' ? 'text-navy' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* ─── Left Sidebar (Quick Summary) ─── */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-5">
            {/* Avatar block */}
            <div className="flex flex-col items-center text-center">
              <div className="grid size-20 place-items-center rounded-full bg-primary/10 text-primary text-2xl font-bold mb-3">
                {identity.name ? identity.name.substring(0, 2).toUpperCase() : "PT"}
              </div>
              <h3 className="font-bold text-navy text-lg">{identity.name}</h3>
              <p className="text-[13px] text-muted-foreground capitalize">
                {identity.gender || "Unknown Gender"} •{" "}
                {identity.age || (identity.dob ? formatAge(identity.dob) : "Unknown Age")}
              </p>
            </div>

            <div className="h-px bg-border" />

            {/* Quick Info */}
            <div className="space-y-3 text-[13px]">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-navy">{contact.mobile || "N/A"}</p>
                  {contact.altMobile && (
                    <p className="text-muted-foreground">{contact.altMobile}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="font-medium text-navy">
                  {contact.address?.city
                    ? `${contact.address.city}, ${contact.address.state || ""}`
                    : "No address added"}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Droplet size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="font-medium text-navy">
                  Blood Group: {identity.bloodGroup || "Unknown"}
                </p>
              </div>
            </div>

            {/* Tags/Conditions */}
            {medical.conditions && medical.conditions.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Known Conditions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {medical.conditions.map((c: string) => (
                      <Badge
                        key={c}
                        variant="secondary"
                        className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {medical.allergies && medical.allergies.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Allergies
                  </p>
                  <p className="text-[13px] font-medium text-orange-700 bg-orange-50 p-2 rounded-md border border-orange-100">
                    {medical.allergies.join(", ")}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Quick Snapshot Card */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-navy text-[14px]">Snapshot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays size={14}/> Last Visit</span>
                <span className="font-semibold text-navy">
                  {visits.length > 0 ? new Date(visits[0].date).toLocaleDateString() : "Never"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-muted-foreground flex items-center gap-1.5"><Stethoscope size={14}/> Primary Dr.</span>
                <span className="font-semibold text-navy">
                  {visits.length > 0 ? `Dr. ${visits[0].doctorName || visits[0].doctor}` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-muted-foreground flex items-center gap-1.5"><Receipt size={14}/> Balance</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ₹0
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Content (Tabs) ─── */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[600px]">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-border bg-secondary/10 px-2 pt-2 overflow-x-auto">
              <TabsList className="bg-transparent h-12 flex-nowrap w-max min-w-full justify-start">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <User size={16} /> Overview
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <Activity size={16} /> Full Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="visits"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <CalendarDays size={16} /> Visits Only
                </TabsTrigger>
                <TabsTrigger
                  value="medical"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <Activity size={16} /> Clinical Notes
                </TabsTrigger>
                <TabsTrigger
                  value="prescriptions"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <Pill size={16} /> Prescriptions
                </TabsTrigger>
                <TabsTrigger
                  value="labs"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <Microscope size={16} /> Lab Reports
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <Receipt size={16} /> Bills/Payments
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <FileText size={16} /> Documents
                </TabsTrigger>
                <TabsTrigger
                  value="insurance"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <ShieldCheck size={16} /> Insurance
                </TabsTrigger>
                <TabsTrigger
                  value="communications"
                  className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 flex gap-2 whitespace-nowrap"
                >
                  <MessageSquare size={16} /> Communication
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 m-0 focus-visible:outline-none">
              <TabOverview patient={patient} visits={visits} />
            </TabsContent>

            <TabsContent value="timeline" className="p-6 m-0 focus-visible:outline-none">
              <TabTimeline patientId={patientId} />
            </TabsContent>

            <TabsContent value="visits" className="p-6 m-0 focus-visible:outline-none">
              <TabVisits visits={visits} />
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="medical" className="p-6 m-0 focus-visible:outline-none">
              <TabMedical patient={patient} patientId={patientId} />
            </TabsContent>

            <TabsContent value="prescriptions" className="p-6 m-0 focus-visible:outline-none">
              <TabPrescriptions patientId={patientId} />
            </TabsContent>

            <TabsContent value="labs" className="p-6 m-0 focus-visible:outline-none">
              <TabLabs patientId={patientId} />
            </TabsContent>

            <TabsContent value="billing" className="p-6 m-0 focus-visible:outline-none">
              <TabBilling patientId={patientId} />
            </TabsContent>

            <TabsContent value="documents" className="p-6 m-0 focus-visible:outline-none">
              <TabDocuments patientId={patientId} />
            </TabsContent>

            <TabsContent value="insurance" className="p-6 m-0 focus-visible:outline-none">
              <TabInsurance patient={patient} patientId={patientId} />
            </TabsContent>

            <TabsContent value="communications" className="p-6 m-0 focus-visible:outline-none">
              <TabCommunications patientId={patientId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
