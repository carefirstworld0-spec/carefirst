import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
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
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatAge } from "./utils/validation";

export function PatientProfile() {
  const { patientId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";
  
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
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
        const vList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        vList.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setVisits(vList);
      } else {
        setVisits([]);
      }
    });

    return () => {
      unsubPatient();
      unsubVisits();
    };
  }, [clinicKey, patientId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading patient profile...</div>;
  }

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-navy">Patient Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/admin/patients" })}>Back to List</Button>
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
              <Badge variant="outline" className={`${meta.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700'} capitalize`}>
                {meta.status || "Active"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono font-medium">
              ID: {identity.uhid} • Registered: {new Date(meta.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-xl" onClick={() => navigate({ to: `/admin/patients/${patientId}/edit` })}>
            <Pencil size={15} className="mr-2" /> Edit Profile
          </Button>
          <Button className="h-10 rounded-xl bg-primary text-white" onClick={() => {}}>
            <Plus size={15} className="mr-2" /> New Visit
          </Button>
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
                {identity.gender || "Unknown Gender"} • {identity.age || (identity.dob ? formatAge(identity.dob) : "Unknown Age")}
              </p>
            </div>

            <div className="h-px bg-border" />

            {/* Quick Info */}
            <div className="space-y-3 text-[13px]">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-navy">{contact.mobile || "N/A"}</p>
                  {contact.altMobile && <p className="text-muted-foreground">{contact.altMobile}</p>}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="font-medium text-navy">
                  {contact.address?.city ? `${contact.address.city}, ${contact.address.state || ''}` : "No address added"}
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
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Known Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {medical.conditions.map((c: string) => (
                      <Badge key={c} variant="secondary" className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100">{c}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {medical.allergies && medical.allergies.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Allergies</p>
                  <p className="text-[13px] font-medium text-orange-700 bg-orange-50 p-2 rounded-md border border-orange-100">
                    {medical.allergies.join(", ")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Right Content (Tabs) ─── */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[600px]">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-border bg-secondary/10 px-2 pt-2 overflow-x-auto">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="overview" className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 flex gap-2"><User size={16} /> Overview</TabsTrigger>
                <TabsTrigger value="visits" className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 flex gap-2"><CalendarDays size={16} /> Visits</TabsTrigger>
                <TabsTrigger value="medical" className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 flex gap-2"><Activity size={16} /> Clinical Notes</TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 flex gap-2"><FileText size={16} /> Documents</TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 flex gap-2"><Receipt size={16} /> Billing</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 m-0 focus-visible:outline-none space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Full */}
                <div className="space-y-4">
                  <h3 className="font-bold text-navy border-b border-border pb-2">Full Contact Details</h3>
                  <div className="space-y-3 text-[13px]">
                    <div className="grid grid-cols-3"><span className="text-muted-foreground font-medium">Email:</span> <span className="col-span-2 font-medium text-navy">{contact.email || "—"}</span></div>
                    <div className="grid grid-cols-3"><span className="text-muted-foreground font-medium">Address:</span> 
                      <span className="col-span-2 font-medium text-navy">
                        {contact.address?.line1 ? (
                          <>
                            {contact.address.line1}<br/>
                            {contact.address.line2 && <>{contact.address.line2}<br/></>}
                            {contact.address.city}, {contact.address.state} - {contact.address.pincode}
                          </>
                        ) : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency */}
                <div className="space-y-4">
                  <h3 className="font-bold text-navy border-b border-border pb-2">Emergency Contact</h3>
                  {patient.emergency?.name ? (
                    <div className="space-y-3 text-[13px] bg-red-50/50 border border-red-100 p-4 rounded-lg">
                      <div className="grid grid-cols-3"><span className="text-muted-foreground font-medium">Name:</span> <span className="col-span-2 font-bold text-navy">{patient.emergency.name}</span></div>
                      <div className="grid grid-cols-3"><span className="text-muted-foreground font-medium">Relation:</span> <span className="col-span-2 font-medium text-navy capitalize">{patient.emergency.relationship}</span></div>
                      <div className="grid grid-cols-3"><span className="text-muted-foreground font-medium">Phone:</span> <span className="col-span-2 font-medium text-navy">{patient.emergency.phone}</span></div>
                    </div>
                  ) : (
                    <p className="text-[13px] text-muted-foreground italic">No emergency contact provided.</p>
                  )}
                </div>
              </div>

              {/* Recent Visits Preview */}
              <div className="pt-4">
                <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                  <h3 className="font-bold text-navy">Recent Visits</h3>
                  <Button variant="link" className="h-auto p-0 text-primary text-[13px]" onClick={() => document.querySelector('[value="visits"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                    View All
                  </Button>
                </div>
                
                {visits.length > 0 ? (
                  <div className="space-y-3">
                    {visits.slice(0, 3).map((visit: any) => (
                      <div key={visit.id} className="flex justify-between items-center p-4 rounded-lg border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white">{new Date(visit.date).toLocaleDateString()}</Badge>
                            <span className="font-bold text-navy">{visit.departmentLabel || visit.department}</span>
                          </div>
                          <p className="text-[13px] text-muted-foreground mt-1">Dr. {visit.doctorName || visit.doctor} • {visit.chiefComplaint || "Routine Checkup"}</p>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground italic">No visits recorded yet.</p>
                )}
              </div>

            </TabsContent>

            <TabsContent value="visits" className="p-6 m-0 focus-visible:outline-none">
              <h3 className="font-bold text-navy border-b border-border pb-2 mb-4">Visit History</h3>
              {visits.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {visits.map((visit: any) => (
                    <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <CalendarDays size={16} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-navy">{new Date(visit.date).toLocaleDateString()}</span>
                          <Badge variant="secondary" className="text-[10px] uppercase">{visit.admissionType}</Badge>
                        </div>
                        <p className="text-[13px] font-medium text-primary">{visit.departmentLabel || visit.department}</p>
                        <p className="text-[13px] text-muted-foreground mb-2">Dr. {visit.doctorName || visit.doctor}</p>
                        {visit.chiefComplaint && (
                          <div className="bg-secondary/10 p-2 rounded-md text-[12px] text-navy border border-border">
                            <span className="font-semibold">Reason:</span> {visit.chiefComplaint}
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="w-full mt-2 h-8 text-[12px]">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground"><CalendarDays /></div>
                  <p className="text-[14px] font-medium text-navy">No visits yet</p>
                  <Button variant="outline" className="mt-3 h-8 text-[12px]">Schedule Visit</Button>
                </div>
              )}
            </TabsContent>

            {/* Placeholder Tabs */}
            <TabsContent value="medical" className="p-10 text-center text-muted-foreground m-0 focus-visible:outline-none">
              <Activity size={32} className="mx-auto mb-3 opacity-20" />
              <p>Clinical notes integration coming soon.</p>
            </TabsContent>
            
            <TabsContent value="documents" className="p-10 text-center text-muted-foreground m-0 focus-visible:outline-none">
              <FileText size={32} className="mx-auto mb-3 opacity-20" />
              <p>Document upload and lab reports coming soon.</p>
            </TabsContent>

            <TabsContent value="billing" className="p-10 text-center text-muted-foreground m-0 focus-visible:outline-none">
              <Receipt size={32} className="mx-auto mb-3 opacity-20" />
              <p>Billing integration coming soon.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
