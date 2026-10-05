import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Users, Timer, CheckCircle2, Play, Eye, Activity, Pencil, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDoctors } from "../patients/hooks/useDoctors";

export function ConsultationDashboard() {
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";
  const { doctors, loading: docsLoading } = useDoctors(clinicKey);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");

  useEffect(() => {
    if (!clinicKey) return;
    
    // Fetch queue from appointments
    const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    const unsub = onValue(apptsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        
        // Filter for today only
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = list.filter(a => a.date === today || !a.date);
        
        setAppointments(todayAppts);
      } else {
        setAppointments([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [clinicKey]);

  if (loading || docsLoading) {
    return <div className="p-10 text-center animate-pulse text-muted-foreground">Loading Consultation Dashboard...</div>;
  }

  const filteredQueue = appointments.filter(a => {
    if (selectedDoctorId !== "all" && a.doctorId !== selectedDoctorId) return false;
    return true;
  });

  const waiting = filteredQueue.filter(a => a.status === "Waiting");
  const inProgress = filteredQueue.filter(a => a.status === "In Consultation");
  const completed = filteredQueue.filter(a => a.status === "Completed");

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Waiting": return <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">Waiting</Badge>;
      case "In Consultation": return <Badge className="bg-primary/10 text-primary border-primary/20 animate-pulse">In Progress</Badge>;
      case "Completed": return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStartConsultation = (appt: any) => {
    // If the appointment doesn't have a linked patient ID, we should handle that.
    // For now, assume patientId is stored in appt.patientId (from Phase 1 Registration to Queue).
    // The prompt says "Consultation belongs to Visit".
    // We will navigate to the consultation workspace.
    // We can use the appointment ID as the visit ID or link them.
    const visitId = appt.id; 
    navigate({ to: `/admin/consultation/${visitId}` });
  };

  return (
    <div className="flex flex-col h-full bg-secondary/20 font-sans">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
        <div>
          <h1 className="font-display text-lg font-bold text-navy">Consultation Dashboard</h1>
          <p className="text-xs text-muted-foreground">Manage your queue and patient records</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-navy">Filter by Doctor:</span>
          <select 
            className="h-9 rounded-md border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="all">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>Dr. {d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Today's Patients</p>
              <p className="text-3xl font-display font-extrabold text-navy">{filteredQueue.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Waiting</p>
              <p className="text-3xl font-display font-extrabold text-navy">{waiting.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <Timer size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">In Consultation</p>
              <p className="text-3xl font-display font-extrabold text-navy">{inProgress.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-success uppercase tracking-wider mb-1">Completed</p>
              <p className="text-3xl font-display font-extrabold text-navy">{completed.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
            <h2 className="font-bold text-navy text-[15px]">Live Patient Queue</h2>
            <Badge variant="outline" className="bg-white shadow-sm">Updated Just Now</Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="px-6 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">Sr No.</th>
                  <th className="px-6 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">Token</th>
                  <th className="px-6 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">Patient</th>
                  <th className="px-6 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor</th>
                  <th className="px-6 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No patients in queue for today.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((appt, idx) => (
                    <tr key={appt.id} className="hover:bg-secondary/10 transition-colors group">
                      <td className="px-6 py-4 font-medium text-sm text-navy">{idx + 1}</td>
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-navy">{appt.token || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-navy">{appt.name}</div>
                        <div className="text-xs text-muted-foreground">{appt.uhid} • {appt.age ? `${appt.age}Y` : "-"} • {appt.gender}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-navy">Dr. {appt.doctorName}</div>
                        <div className="text-xs text-muted-foreground">{appt.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(appt.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            title="View Patient 360"
                            onClick={() => appt.patientId && navigate({ to: `/admin/patients/${appt.patientId}` })}
                            disabled={!appt.patientId}
                          >
                            <User size={14} />
                          </Button>
                          
                          {appt.status !== "Completed" ? (
                            <Button 
                              size="sm" 
                              className={`h-8 px-3 ${appt.status === "In Consultation" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary text-white"}`}
                              onClick={() => handleStartConsultation(appt)}
                            >
                              {appt.status === "In Consultation" ? <Pencil size={14} className="mr-1.5" /> : <Play size={14} className="mr-1.5" />}
                              {appt.status === "In Consultation" ? "Edit" : "Start"}
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-3 text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100" 
                              onClick={() => handleStartConsultation(appt)}
                            >
                              <FileText size={14} className="mr-1.5" /> View EMR
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
