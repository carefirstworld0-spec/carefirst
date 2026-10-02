import { useState, useEffect } from "react";
import { 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2,
  Phone,
  MoreVertical,
  X,
  Stethoscope,
  Search,
  User,
  Activity,
  ArrowRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Edit,
  GraduationCap,
  IndianRupee,
  LayoutGrid,
  List,
  UserPlus
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, update, serverTimestamp } from "firebase/database";

// --- Types ---
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  phone: string;
  email: string;
  fee: string;
  status: "Available" | "On Leave" | "Busy";
  slots: string[];
}

interface Appointment {
  id: string;
  token: string;
  uhid: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
  doctorId: string;
  doctorName: string;
  department: string;
  timeSlot: string;
  status: string;
  date: string;
  createdAt: number;
}

export function Appointments() {
  // --- Firebase Data State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // --- Shared / Queue State ---
  const [activeTab, setActiveTab] = useState("All");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // --- New Appointment Form State ---
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("M");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");

  useEffect(() => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) return;

    // Fetch Appointments
    const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    const unsubAppts = onValue(apptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Appointment[] = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAppointments(list);
      } else {
        setAppointments([]);
      }
    });

    // Fetch Doctors
    const docsRef = ref(db, `carefirst/users/${clinicKey}/doctors`);
    const unsubDocs = onValue(docsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Doctor[] = Object.keys(data).map((key) => ({ 
          id: key, 
          ...data[key],
          slots: data[key].slots || [] 
        }));
        setDoctors(list);
        if (list.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(list[0].id);
        }
      } else {
        setDoctors([]);
      }
    });

    return () => {
      unsubAppts();
      unsubDocs();
    };
  }, []);

  const updateApptStatus = async (id: string, newStatus: string) => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) return;
    const apptRef = ref(db, `carefirst/users/${clinicKey}/appointments/${id}`);
    await update(apptRef, { status: newStatus });
  };

  const dateAppointments = appointments.filter(a => a.date === selectedDate || (!a.date && selectedDate === new Date().toISOString().split('T')[0]));
  const waitingCount = dateAppointments.filter(a => a.status === "Waiting").length;
  const consultedCount = dateAppointments.filter(a => a.status === "Completed").length;
  const inConsultationCount = dateAppointments.filter(a => a.status === "In Consultation").length;
  
  const filteredAppointments = dateAppointments.filter(app => {
    if (activeTab === "All") return true;
    return app.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting": return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
      case "In Consultation": return "bg-primary/10 text-primary border-primary/20";
      case "Completed": return "bg-success/10 text-success border-success/20";
      case "Cancelled": case "No-Show": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-secondary text-muted-foreground border-border";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Waiting": return "bg-[#F59E0B]";
      case "In Consultation": return "bg-primary animate-pulse";
      case "Completed": return "bg-success";
      case "Cancelled": case "No-Show": return "bg-destructive";
      default: return "bg-muted-foreground";
    }
  };

  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctorId);
  const bookedSlots = dateAppointments.filter(a => a.doctorId === selectedDoctorId).map(a => a.timeSlot);
  const availableSlots = selectedDoctorObj?.slots?.filter(s => !bookedSlots.includes(s)) || [];

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-72px)] bg-background">
      
      {/* Module Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 -mx-8 -mt-8 px-8 py-6 mb-8 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10 transition-all duration-300">
        <div>
          <h1 className="display-title text-3xl text-navy tracking-tight">OPD Queue</h1>
          <p className="text-[14px] text-muted-foreground/80 mt-1.5 font-medium">Manage patient queues and walk-in tokens.</p>
        </div>
      </div>

      <div>
        <div className="w-full px-2 mx-auto flex flex-col gap-6 pb-12">

          {/* =========================================
              APPOINTMENT QUEUE
          ========================================= */}
          <>
            {/* Queue Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <div className="relative group flex items-center bg-white/70 backdrop-blur-sm border border-border/50 hover:border-primary/30 rounded-[14px] px-4 py-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(11,94,215,0.1)] focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-300">
                    <div className="bg-primary/10 p-1.5 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                    </div>
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-[14px] font-bold text-navy outline-none bg-transparent cursor-pointer w-[125px] appearance-none"
                    />
                  </div>
                  
                  <div className="relative group flex items-center bg-white/70 backdrop-blur-sm border border-border/50 hover:border-primary/30 rounded-[14px] px-4 py-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(11,94,215,0.1)] focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-300 min-w-[260px]">
                    <div className="bg-primary/10 p-1.5 rounded-lg mr-3 shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    <select 
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="text-[14px] font-bold text-navy outline-none bg-transparent cursor-pointer w-full appearance-none truncate pr-6"
                    >
                      <option value="">All Doctors</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 pointer-events-none group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <Link 
                  to="/admin/new-token"
                  className="bg-primary hover:bg-primary/90 text-white px-7 py-3.5 rounded-[14px] text-[14px] font-bold transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(11,94,215,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(11,94,215,0.6)] hover:-translate-y-1 flex items-center whitespace-nowrap overflow-hidden group relative"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <Plus className="w-4 h-4 mr-2 stroke-2 relative z-10" />
                  <span className="relative z-10 tracking-wide">New Token</span>
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                {[
                  { label: "Today's Tokens", value: dateAppointments.length.toString(), icon: Users, color: "text-primary", bg: "bg-primary/15", gradient: "from-primary/5 to-transparent", glow: "shadow-[0_0_20px_-5px_rgba(11,94,215,0.3)]" },
                  { label: "Patients Waiting", value: waitingCount.toString(), icon: Clock, color: "text-orange", bg: "bg-orange/15", gradient: "from-orange/5 to-transparent", glow: "shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]" },
                  { label: "Consulted", value: consultedCount.toString(), icon: CheckCircle2, color: "text-success", bg: "bg-success/15", gradient: "from-success/5 to-transparent", glow: "shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]" },
                  { label: "Avg Wait Time", value: waitingCount > 0 ? "~18m" : "0m", icon: Activity, color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/15", gradient: "from-[#0ea5e9]/5 to-transparent", glow: "shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]" }
                ].map((stat, idx) => (
                  <div key={idx} className={`bg-white/80 backdrop-blur-md rounded-[20px] p-6 border border-white hover:border-white/40 flex items-center gap-5 relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 ${stat.glow}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700 blur-xl ${stat.bg}`}></div>
                    
                    <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/50`}>
                      <stat.icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="relative z-10">
                      <p className="eyebrow mb-1 text-[10px] tracking-[0.2em] font-black opacity-80">{stat.label}</p>
                      <h3 className="display-title text-3xl text-navy">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Queue Table */}
              <div className="flex flex-col flex-1 bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden min-h-[450px]">
                
                <div className="flex flex-col lg:flex-row justify-between items-center p-6 border-b border-border/50 gap-5 bg-gradient-to-r from-secondary/30 to-transparent">
                  <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md p-1.5 rounded-[14px] border border-white shadow-sm overflow-x-auto max-w-full custom-scrollbar">
                    {["All", "Waiting", "In Consultation", "Completed"].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-[10px] text-[13px] font-bold whitespace-nowrap transition-all duration-300 relative ${
                          activeTab === tab ? "text-white shadow-[0_4px_12px_rgba(11,94,215,0.3)] bg-primary" : "text-muted-foreground hover:text-navy hover:bg-secondary/50"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative w-full lg:w-[340px] group">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <input 
                      type="text" 
                      placeholder="Search UHID, name, or token..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-white shadow-sm rounded-[14px] text-[14px] focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 font-medium text-navy placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-white/95 backdrop-blur-md sticky top-0 z-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-b border-border/50">
                      <tr>
                        <th className="px-8 py-5 border-border text-[13px] font-semibold text-navy/80">Queue No.</th>
                        <th className="px-8 py-5 border-border text-[13px] font-semibold text-navy/80">Patient Info</th>
                        <th className="px-8 py-5 border-border text-[13px] font-semibold text-navy/80">Consultation</th>
                        <th className="px-8 py-5 border-border text-[13px] font-semibold text-navy/80">Status</th>
                        <th className="px-8 py-5 border-border text-[13px] font-semibold text-right text-navy/80">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-24">
                            <div className="mx-auto w-20 h-20 bg-secondary/80 rounded-full flex items-center justify-center mb-5">
                              <List className="w-10 h-10 text-muted-foreground/40" />
                            </div>
                            <h3 className="display-title text-2xl text-navy">Queue is empty</h3>
                            <p className="text-[15px] text-muted-foreground mt-2 max-w-sm mx-auto">No tokens generated for this date or criteria.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((item, index) => (
                          <tr key={item.id} className="hover:bg-primary/[0.03] hover:shadow-[inset_4px_0_0_0_var(--color-primary)] transition-all duration-300 group border-b border-border/40 last:border-0 relative">
                            <td className="px-8 py-6 align-middle">
                              <div className="flex items-center gap-5">
                                <div className="text-[18px] font-bold text-muted-foreground/40 w-8 text-right group-hover:text-primary/60 transition-colors">#{index+1}</div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-navy text-[17px] group-hover:text-primary transition-colors">{item.token}</span>
                                  <span className="text-[12px] font-semibold text-primary flex items-center mt-1 uppercase tracking-wider bg-primary/10 w-max px-2 py-0.5 rounded-md">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" /> {item.timeSlot}
                                  </span>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-8 py-6 align-middle">
                              <div className="flex items-center gap-4 group-hover:-translate-y-0.5 transition-transform duration-300">
                                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-[17px] font-bold flex items-center justify-center shrink-0 uppercase border border-primary/20 shadow-inner group-hover:shadow-[0_0_15px_-3px_rgba(11,94,215,0.3)] transition-all">
                                  {item.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <div className="font-bold text-navy text-[15px] flex items-center">
                                    {item.name} <span className="ml-2.5 text-[10px] bg-secondary/80 border border-border/50 px-2 py-0.5 rounded-md font-bold tracking-[0.1em] text-muted-foreground">{item.uhid}</span>
                                  </div>
                                  <div className="text-muted-foreground text-[13px] font-medium flex items-center mt-1.5">
                                    <span className="bg-secondary px-2 py-0.5 rounded-md text-[11px] font-bold text-navy/70">{item.age}y</span> 
                                    <span className="mx-2 text-muted-foreground/40">•</span> 
                                    <span className="bg-secondary px-2 py-0.5 rounded-md text-[11px] font-bold text-navy/70">{item.gender}</span>
                                    <span className="mx-2 text-muted-foreground/40">•</span> 
                                    <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> {item.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-8 py-5 align-middle">
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-navy flex items-center">
                                  <Stethoscope className="w-4 h-4 mr-2 text-primary" /> Dr. {item.doctorName}
                                </span>
                                <span className="text-[12px] text-muted-foreground font-semibold mt-1">
                                  {item.department}
                                </span>
                              </div>
                            </td>
                            
                            <td className="px-8 py-5 align-middle">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold border shadow-sm ${getStatusColor(item.status)}`}>
                                <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(item.status)}`}></span>
                                {item.status}
                              </span>
                            </td>
                            
                            <td className="px-8 py-5 align-middle text-right">
                              <div className="flex items-center justify-end gap-3 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                                {item.status === "Waiting" && (
                                  <button onClick={() => updateApptStatus(item.id, "In Consultation")} className="bg-primary text-white hover:bg-primary/90 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all shadow-[0_2px_8px_rgba(11,94,215,0.25)] hover:shadow-[0_4px_12px_rgba(11,94,215,0.35)] flex items-center hover:-translate-y-0.5">
                                    Call Next <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                  </button>
                                )}
                                {item.status === "In Consultation" && (
                                  <button onClick={() => updateApptStatus(item.id, "Completed")} className="bg-[#10B981] text-white hover:bg-[#059669] px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all shadow-[0_2px_8px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.35)] flex items-center hover:-translate-y-0.5">
                                    Complete <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                                  </button>
                                )}
                                <button className="p-2.5 text-muted-foreground hover:text-navy hover:bg-secondary rounded-xl transition-all border border-transparent hover:border-border shadow-sm bg-white"><MoreVertical className="w-5 h-5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </>

        </div>
      </div>

      {/* =========================================
          MODAL 1: ADD APPOINTMENT (PREMIUM)
      ========================================= */}
      {isApptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-md transition-opacity" onClick={() => setIsApptModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-[640px] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative z-10 flex flex-col max-h-[90vh] overflow-hidden transform transition-all border border-border/50">
            {/* Minimal Header */}
            <div className="flex justify-between items-center p-6 pb-4">
              <div>
                <h2 className="display-title text-[24px] text-navy">Book Appointment</h2>
                <p className="text-[14px] text-muted-foreground mt-1 font-medium">Generate a token for the OPD queue.</p>
              </div>
              <button onClick={() => setIsApptModalOpen(false)} className="p-2.5 text-muted-foreground hover:bg-secondary hover:text-navy rounded-full transition-colors bg-secondary/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-2 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* Section 1: Patient */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-[12px] font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center">
                    <User className="w-3.5 h-3.5 mr-2 text-primary" /> Patient Details
                  </h3>
                  
                  {/* iOS Style Segmented Control */}
                  <div className="flex bg-secondary/60 p-1 rounded-xl shadow-inner border border-border/50">
                    <button 
                      onClick={() => setIsNewPatient(false)} 
                      className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all ${!isNewPatient ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy'}`}
                    >
                      Search Existing
                    </button>
                    <button 
                      onClick={() => setIsNewPatient(true)} 
                      className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all ${isNewPatient ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy'}`}
                    >
                      New Patient
                    </button>
                  </div>
                </div>

                {!isNewPatient ? (
                  <div className="relative group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="text" placeholder="Search by Name, Phone, or UHID (e.g. CF123456)" className="w-full pl-12 pr-4 h-[52px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-2xl text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                      <label className="text-[13px] font-bold text-navy ml-1">Full Name</label>
                      <User className="w-4 h-4 absolute left-4 bottom-[17px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type="text" placeholder="John Doe" value={newName} onChange={e => setNewName(e.target.value)} className="w-full pl-11 pr-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                      <label className="text-[13px] font-bold text-navy ml-1">Phone Number</label>
                      <Phone className="w-4 h-4 absolute left-4 bottom-[17px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type="tel" placeholder="+91" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full pl-11 pr-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-navy ml-1">Age</label>
                      <input type="number" placeholder="Years" value={newAge} onChange={e => setNewAge(e.target.value)} className="w-full px-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-1.5 relative group">
                      <label className="text-[13px] font-bold text-navy ml-1">Gender</label>
                      <select value={newGender} onChange={e => setNewGender(e.target.value)} className="w-full px-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none">
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 bottom-[17px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Doctor & Time */}
              <div className="space-y-5">
                <h3 className="text-[12px] font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center">
                  <Stethoscope className="w-3.5 h-3.5 mr-2 text-primary" /> Consultation
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[13px] font-bold text-navy ml-1">Assign Doctor</label>
                    <Stethoscope className="w-4 h-4 absolute left-4 bottom-[17px] text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <select value={selectedDoctorId} onChange={e => { setSelectedDoctorId(e.target.value); setNewTimeSlot(""); }} className="w-full pl-11 pr-10 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none truncate relative z-0">
                      <option value="" disabled>Select Doctor...</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 bottom-[17px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[13px] font-bold text-navy ml-1">Date</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-bold text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[13px] font-bold text-navy ml-1">Available Time Slots</label>
                    {selectedDoctorId && <span className="text-[11px] font-bold px-2 py-1 bg-secondary rounded-md text-muted-foreground">{availableSlots.length} slots open</span>}
                  </div>
                  
                  {!selectedDoctorId ? (
                    <div className="p-5 bg-secondary/30 rounded-2xl border border-dashed border-border text-center text-[14px] font-medium text-muted-foreground">
                      Please select a doctor to view their schedule.
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-5 bg-orange/10 rounded-2xl border border-orange/20 text-center text-[14px] font-bold text-orange">
                      Fully booked on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[180px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                      {availableSlots.map(time => (
                        <button 
                          key={time} 
                          onClick={() => setNewTimeSlot(time)}
                          className={`py-3 px-1 text-[12px] font-extrabold rounded-xl transition-all shadow-sm ${
                            newTimeSlot === time ? 'bg-primary text-white shadow-[0_4px_14px_rgba(11,94,215,0.39)] -translate-y-0.5 border-none' : 'bg-white border border-border/80 text-navy hover:border-primary/50 hover:shadow-md'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="p-6 pt-4 mt-2 border-t border-border/40 bg-white rounded-b-3xl">
              <button 
                onClick={handleGenerateToken}
                disabled={!newName || !newPhone || !selectedDoctorId || !newTimeSlot}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/30 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed text-white font-bold h-[56px] rounded-2xl transition-all shadow-[0_8px_25px_rgba(11,94,215,0.35)] hover:shadow-[0_12px_30px_rgba(11,94,215,0.45)] hover:-translate-y-1 flex items-center justify-center text-[16px]"
              >
                <Plus className="w-5 h-5 mr-2 stroke-[2.5]" /> Generate Queue Token
              </button>
            </div>
          </div>
        </div>
      {/* Global minimal custom scrollbar for slot picker */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
