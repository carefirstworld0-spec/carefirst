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
<<<<<<< Updated upstream
import { ref, onValue, push, set, update, serverTimestamp } from "firebase/database";

// --- Types ---
interface Doctor {
=======
import { ref, onValue, push, set, remove, update } from "firebase/database";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  User,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Appointment = {
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
export function Appointments() {
  const [activeModuleView, setActiveModuleView] = useState<"Queue" | "Doctors">("Queue");
  
  // --- Firebase Data State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // --- Modals State ---
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  
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
  
  // --- New Doctor Form State ---
  const [docName, setDocName] = useState("");
  const [docSpecialty, setDocSpecialty] = useState("General Medicine");
  const [docQual, setDocQual] = useState("");
  const [docPhone, setDocPhone] = useState("");
  const [docEmail, setDocEmail] = useState("");
  const [docFee, setDocFee] = useState("");
  const [docStatus, setDocStatus] = useState<"Available" | "On Leave" | "Busy">("Available");
  const [docSlots, setDocSlots] = useState<string[]>(["10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM", "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM", "12:00 PM"]);
  const [slotGenStart, setSlotGenStart] = useState("09:00");
  const [slotGenEnd, setSlotGenEnd] = useState("17:00");
  const [slotGenDuration, setSlotGenDuration] = useState("15");
=======
const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "Singapore" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
];

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    countryCode: "+91",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    doctor: "",
    reason: "",
    status: "Scheduled" as const,
  });

  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";
>>>>>>> Stashed changes

  useEffect(() => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) return;
<<<<<<< Updated upstream

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
=======
    const appointmentsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);

    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const list: Appointment[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const key in data) {
          list.push({ id: key, ...data[key] });
        }
>>>>>>> Stashed changes
      }
    });

<<<<<<< Updated upstream
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
=======
    return () => unsubscribe();
  }, [clinicKey]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, phone: numericValue }));
        if (numericValue.length > 0 && numericValue.length !== 10) {
          setPhoneError("Please enter valid 10-digit phone number");
        } else {
          setPhoneError("");
>>>>>>> Stashed changes
        }
      } else {
        setDoctors([]);
      }
<<<<<<< Updated upstream
    });

    return () => {
      unsubAppts();
      unsubDocs();
    };
  }, []);

  const handleSaveDoctor = async () => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey || !docName || !docSpecialty) return;

    const docsRef = ref(db, `carefirst/users/${clinicKey}/doctors`);
    const newDocRef = push(docsRef);
    
    await set(newDocRef, {
      name: docName,
      specialty: docSpecialty,
      qualification: docQual,
      phone: docPhone,
      email: docEmail,
      fee: docFee,
      status: docStatus,
      slots: docSlots
=======
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: "Scheduled" | "Completed" | "Cancelled") => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicKey) return;

    if (formData.phone.length !== 10) {
      setPhoneError("Please enter valid 10-digit phone number");
      return;
    }

    const appointmentsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    const newAppointmentRef = push(appointmentsRef);

    // Combine country code and phone for saving
    const { countryCode, phone, ...rest } = formData;

    await set(newAppointmentRef, {
      ...rest,
      phone: `${countryCode} ${phone}`,
      createdAt: new Date().toISOString(),
    });

    setFormData({
      patientName: "",
      phone: "",
      countryCode: "+91",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      doctor: "",
      reason: "",
      status: "Scheduled",
>>>>>>> Stashed changes
    });

    setDocName(""); setDocQual(""); setDocPhone(""); setDocEmail(""); setDocFee("");
    setIsDoctorModalOpen(false);
  };

  const handleGenerateToken = async () => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey || !newName || !selectedDoctorId || !newTimeSlot) return;

    const doctor = doctors.find(d => d.id === selectedDoctorId);
    if (!doctor) return;

    const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    const newApptRef = push(apptsRef);

    const dateAppts = appointments.filter(a => a.date === selectedDate && a.doctorId === selectedDoctorId);
    const tokenNo = `T-${(dateAppts.length + 1).toString().padStart(3, '0')}`;
    const uhid = isNewPatient ? `CF${Math.floor(100000 + Math.random() * 900000)}` : "CF999999";

    await set(newApptRef, {
      token: tokenNo,
      uhid: uhid,
      name: newName,
      phone: newPhone,
      age: newAge,
      gender: newGender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.specialty,
      timeSlot: newTimeSlot,
      status: "Waiting",
      date: selectedDate, 
      createdAt: serverTimestamp(),
    });

    setNewName(""); setNewPhone(""); setNewAge(""); setNewGender("M"); setNewTimeSlot("");
    setIsApptModalOpen(false);
  };

  const updateApptStatus = async (id: string, newStatus: string) => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) return;
    const apptRef = ref(db, `carefirst/users/${clinicKey}/appointments/${id}`);
    await update(apptRef, { status: newStatus });
  };

  const generateSlots = () => {
    if (!slotGenStart || !slotGenEnd || !slotGenDuration) return;
    const slots = [];
    let current = new Date(`2000-01-01T${slotGenStart}:00`);
    const end = new Date(`2000-01-01T${slotGenEnd}:00`);
    const duration = parseInt(slotGenDuration);

    while (current < end) {
      slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      current = new Date(current.getTime() + duration * 60000);
    }
    setDocSlots(slots);
  };

<<<<<<< Updated upstream
  const dateAppointments = appointments.filter(a => a.date === selectedDate || (!a.date && selectedDate === new Date().toISOString().split('T')[0]));
  const waitingCount = dateAppointments.filter(a => a.status === "Waiting").length;
  const consultedCount = dateAppointments.filter(a => a.status === "Completed").length;
  const inConsultationCount = dateAppointments.filter(a => a.status === "In Consultation").length;
  
  const filteredAppointments = dateAppointments.filter(app => {
    if (activeTab === "All") return true;
    return app.status === activeTab;
=======
  const handleComplete = async (id: string) => {
    if (!clinicKey) return;
    const appointmentRef = ref(db, `carefirst/users/${clinicKey}/appointments/${id}`);
    await update(appointmentRef, { status: "Completed" });
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      app.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? app.date === filterDate : true;
    return matchesSearch && matchesDate;
>>>>>>> Stashed changes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
<<<<<<< Updated upstream
      case "Waiting": return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
      case "In Consultation": return "bg-primary/10 text-primary border-primary/20";
      case "Completed": return "bg-success/10 text-success border-success/20";
      case "Cancelled": case "No-Show": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-secondary text-muted-foreground border-border";
=======
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
>>>>>>> Stashed changes
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
      
      {/* Module Header & View Toggle */}
      <div className="bg-card border-b border-border -mx-8 -mt-8 px-8 py-5 mb-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative z-10">
        <div>
<<<<<<< Updated upstream
          <h1 className="display-title text-3xl text-navy tracking-tight">OPD Management</h1>
          <p className="text-[14px] text-muted-foreground mt-1">Manage doctor schedules, patient queues, and walk-in tokens.</p>
        </div>
        
        <div className="flex items-center bg-secondary/60 p-1.5 rounded-[14px] border border-border shadow-inner">
          <button 
            onClick={() => setActiveModuleView("Queue")}
            className={`px-6 py-2.5 rounded-[10px] text-[13px] font-bold whitespace-nowrap transition-all flex items-center ${
              activeModuleView === "Queue" ? "bg-white text-navy shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border/50" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <List className={`w-4 h-4 mr-2 ${activeModuleView === "Queue" ? "text-primary" : ""}`} /> Queue
          </button>
          <button 
            onClick={() => setActiveModuleView("Doctors")}
            className={`px-6 py-2.5 rounded-[10px] text-[13px] font-bold whitespace-nowrap transition-all flex items-center ${
              activeModuleView === "Doctors" ? "bg-white text-navy shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border/50" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <LayoutGrid className={`w-4 h-4 mr-2 ${activeModuleView === "Doctors" ? "text-primary" : ""}`} /> Doctors
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">

          {/* =========================================
              VIEW 1: DOCTOR MANAGEMENT
          ========================================= */}
          {activeModuleView === "Doctors" && (
            <>
              <div className="flex justify-between items-center">
                <div className="relative w-[320px]">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Search doctors..." className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-[14px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-navy shadow-sm" />
                </div>
                <button 
                  onClick={() => setIsDoctorModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-[14px] font-bold transition-all shadow-[0_4px_14px_0_rgba(11,94,215,0.39)] hover:shadow-[0_6px_20px_rgba(11,94,215,0.23)] hover:-translate-y-0.5 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2 stroke-2" /> Add Doctor
                </button>
              </div>

              {doctors.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-border mt-4">
                  <div className="mx-auto w-20 h-20 bg-secondary/80 rounded-full flex items-center justify-center mb-5">
                    <Stethoscope className="w-10 h-10 text-muted-foreground/60" />
                  </div>
                  <h3 className="display-title text-2xl text-navy">No doctors added</h3>
                  <p className="text-[15px] text-muted-foreground mt-2 max-w-sm mx-auto">Add your clinical staff to start managing their OPD schedules and tokens.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {doctors.map(doc => {
                    const docAppts = appointments.filter(a => a.date === new Date().toISOString().split('T')[0] && a.doctorId === doc.id).length;
                    return (
                      <div key={doc.id} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all overflow-hidden flex flex-col">
                        <div className="p-6 flex gap-4 items-start border-b border-border/50">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-xl font-bold uppercase shrink-0 border border-primary/20 shadow-inner">
                            {doc.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-[17px] text-navy truncate" title={doc.name}>Dr. {doc.name}</h3>
                            <p className="text-[13px] text-muted-foreground font-medium truncate">{doc.specialty}</p>
                            <span className={`inline-flex mt-2.5 items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${doc.status === 'Available' ? 'bg-success/10 text-success border-success/20' : doc.status === 'Busy' ? 'bg-orange/10 text-orange border-orange/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                              {doc.status}
                            </span>
                          </div>
                          <button className="p-2 text-muted-foreground hover:bg-secondary hover:text-navy rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        </div>
                        <div className="p-5 bg-secondary/20 flex-1 grid grid-cols-2 gap-4 text-center">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-border/50">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Today</p>
                            <p className="display-title text-2xl text-navy">{docAppts}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-border/50">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Fee</p>
                            <p className="display-title text-2xl text-navy">₹{doc.fee || "0"}</p>
                          </div>
                        </div>
                        <div className="p-4 border-t border-border bg-white">
                          <button className="w-full py-2.5 bg-secondary/50 hover:bg-primary/10 hover:text-primary text-navy font-bold text-[13px] rounded-xl transition-colors border border-border hover:border-primary/20">
                            View Schedule
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}


          {/* =========================================
              VIEW 2: APPOINTMENT QUEUE
          ========================================= */}
          {activeModuleView === "Queue" && (
            <>
              {/* Queue Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative group flex items-center bg-white border border-border rounded-xl px-4 py-3 shadow-sm hover:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                    <CalendarIcon className="w-4 h-4 text-primary mr-3" />
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-[14px] font-bold text-navy outline-none bg-transparent cursor-pointer w-[125px] appearance-none"
                    />
                  </div>
                  
                  <div className="relative group flex items-center bg-white border border-border rounded-xl px-4 py-3 shadow-sm hover:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all min-w-[240px]">
                    <Stethoscope className="w-4 h-4 text-primary mr-3 shrink-0" />
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
=======
          <h1 className="text-2xl font-extrabold tracking-tight text-navy font-display">
            Appointments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage patient schedules and bookings.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md">
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl p-0 overflow-x-hidden">
            <div className="bg-secondary/30 p-6 border-b border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl text-navy font-display font-extrabold flex items-center gap-2">
                  <CalendarIcon className="text-primary h-6 w-6" />
                  Schedule Appointment
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in the details below to book a new patient appointment.
                </p>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="text-[13px] font-bold text-navy">
                    Patient Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="h-10 bg-secondary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[13px] font-bold text-navy">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div
                    className={`flex items-center rounded-md border border-input bg-secondary/10 focus-within:ring-1 focus-within:ring-ring transition-colors ${phoneError ? "border-red-500 focus-within:ring-red-500" : ""}`}
                  >
                    <Select
                      value={formData.countryCode}
                      onValueChange={(val) => setFormData((p) => ({ ...p, countryCode: val }))}
                    >
                      <SelectTrigger className="w-[85px] shrink-0 h-10 border-0 bg-transparent shadow-none focus:ring-0 rounded-r-none pr-1 pl-3 font-medium">
                        <span className="truncate">{formData.countryCode}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code}{" "}
                            <span className="text-muted-foreground ml-1">({c.country})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="w-[1px] h-6 bg-border shrink-0" />
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="9876543210"
                      className="flex-1 h-10 bg-transparent border-0 px-3 text-sm focus:outline-none w-full min-w-0"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[11px] text-red-500 font-medium">{phoneError}</p>
                  )}
>>>>>>> Stashed changes
                </div>

                <Link 
                  to="/admin/new-token"
                  className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-xl text-[14px] font-bold transition-all shadow-[0_4px_14px_0_rgba(11,94,215,0.39)] hover:shadow-[0_6px_20px_rgba(11,94,215,0.23)] hover:-translate-y-0.5 flex items-center whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2 stroke-2" /> New Token
                </Link>
              </div>

<<<<<<< Updated upstream
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Today's Tokens", value: dateAppointments.length.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                  { label: "Patients Waiting", value: waitingCount.toString(), icon: Clock, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20" },
                  { label: "Consulted", value: consultedCount.toString(), icon: CheckCircle2, color: "text-[#10B981]", bg: "bg-[#10B981]/10", border: "border-[#10B981]/20" },
                  { label: "Avg Wait Time", value: waitingCount > 0 ? "~18m" : "0m", icon: Activity, color: "text-[#12B5A6]", bg: "bg-[#12B5A6]/10", border: "border-[#12B5A6]/20" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-border flex items-center gap-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500 ${stat.bg}`}></div>
                    <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="eyebrow mb-1 text-[11px]">{stat.label}</p>
                      <h3 className="display-title text-3xl text-navy">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Queue Table */}
              <div className="flex flex-col flex-1 bg-white rounded-3xl border border-border shadow-md overflow-hidden min-h-[400px]">
                
                <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-b border-border gap-4 bg-secondary/20">
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-border shadow-sm">
                    {["All", "Waiting", "In Consultation", "Completed"].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${
                          activeTab === tab ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-navy hover:bg-secondary/80"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative w-full sm:w-[320px]">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search UHID, name, or token..."
                      className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-[14px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-navy placeholder:text-muted-foreground shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-white sticky top-0 z-10 border-b-2 border-border/60 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
                      <tr>
                        <th className="px-8 py-5 eyebrow border-border text-[11px] tracking-widest text-muted-foreground/80">Queue No.</th>
                        <th className="px-8 py-5 eyebrow border-border text-[11px] tracking-widest text-muted-foreground/80">Patient Info</th>
                        <th className="px-8 py-5 eyebrow border-border text-[11px] tracking-widest text-muted-foreground/80">Consultation</th>
                        <th className="px-8 py-5 eyebrow border-border text-[11px] tracking-widest text-muted-foreground/80">Status</th>
                        <th className="px-8 py-5 eyebrow border-border text-[11px] tracking-widest text-right text-muted-foreground/80">Actions</th>
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
                          <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                            <td className="px-8 py-5 align-middle">
                              <div className="flex items-center gap-5">
                                <div className="text-[20px] font-display font-extrabold text-muted-foreground/30 w-8 text-right">#{index+1}</div>
                                <div className="flex flex-col">
                                  <span className="font-display font-extrabold text-navy text-[18px]">{item.token}</span>
                                  <span className="text-[12px] font-bold text-primary flex items-center mt-1 uppercase tracking-wider">
                                    <Clock className="w-3.5 h-3.5 mr-1" /> {item.timeSlot}
                                  </span>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-8 py-5 align-middle">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-[16px] font-bold flex items-center justify-center shrink-0 uppercase border border-primary/10">
                                  {item.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <div className="font-extrabold text-navy text-[15px] flex items-center">
                                    {item.name} <span className="ml-2.5 text-[10px] bg-secondary/80 px-2 py-0.5 rounded-md font-bold tracking-wider text-muted-foreground">{item.uhid}</span>
                                  </div>
                                  <div className="text-muted-foreground text-[13px] font-medium flex items-center mt-1">
                                    {item.age}y • {item.gender} <span className="mx-2.5 inline-block w-1 h-1 bg-border rounded-full"></span> <Phone className="w-3.5 h-3.5 mr-1" /> {item.phone}
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
=======
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[13px] font-bold text-navy">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="h-10 bg-secondary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-[13px] font-bold text-navy">
                    Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="h-10 bg-secondary/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-[13px] font-bold text-navy">
                    Assign Doctor{" "}
                    <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    placeholder="Dr. Smith"
                    className="h-10 bg-secondary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[13px] font-bold text-navy">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-10 bg-secondary/10 font-medium">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
>>>>>>> Stashed changes
                </div>
              </div>
            </>
          )}

<<<<<<< Updated upstream
=======
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-[13px] font-bold text-navy">
                  Reason for Visit{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="E.g. Routine checkup, Fever..."
                  className="h-10 bg-secondary/10"
                />
              </div>

              <div className="pt-6 border-t border-border mt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-full px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-md transition-transform hover:-translate-y-0.5"
                >
                  Confirm Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Total Appointments
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-navy">
            {appointments.length}
          </div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Scheduled
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-blue-600">
            {appointments.filter((a) => a.status === "Scheduled").length}
          </div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Completed
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-green-600">
            {appointments.filter((a) => a.status === "Completed").length}
          </div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Cancelled
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-red-600">
            {appointments.filter((a) => a.status === "Cancelled").length}
          </div>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
          {filterDate && (
            <Button
              variant="ghost"
              onClick={() => setFilterDate("")}
              className="text-sm h-10 px-3 shrink-0 text-muted-foreground"
            >
              Clear Filter
            </Button>
          )}
>>>>>>> Stashed changes
        </div>
      )}

<<<<<<< Updated upstream
      {/* =========================================
          MODAL 2: ADD DOCTOR (PREMIUM)
      ========================================= */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-md transition-opacity" onClick={() => setIsDoctorModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-[700px] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative z-10 flex flex-col max-h-[90vh] overflow-hidden border border-border/50">
            <div className="flex justify-between items-center p-6 pb-4">
              <div>
                <h2 className="display-title text-[24px] text-navy">Add New Doctor</h2>
                <p className="text-[14px] text-muted-foreground mt-1 font-medium">Configure profile and automated slots.</p>
              </div>
              <button onClick={() => setIsDoctorModalOpen(false)} className="p-2.5 text-muted-foreground hover:bg-secondary hover:text-navy rounded-full transition-colors bg-secondary/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-2 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              <div className="space-y-5">
                <h3 className="text-[12px] font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center">
                  <UserPlus className="w-3.5 h-3.5 mr-2 text-primary" /> Profile Info
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[13px] font-bold text-navy ml-1">Doctor Name</label>
                    <div className="flex shadow-sm rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/10">
                      <span className="inline-flex items-center px-4 bg-secondary/80 border-y border-l border-transparent text-[14px] text-navy font-bold">Dr.</span>
                      <input type="text" placeholder="First Last" value={docName} onChange={e => setDocName(e.target.value)} className="w-full px-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white text-[14px] font-medium text-navy outline-none focus:border-primary transition-all" />
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[13px] font-bold text-navy ml-1">Department</label>
                    <select value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)} className="w-full px-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none">
                      <option>General Medicine</option>
                      <option>Cardiology</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                      <option>Gynaecology</option>
                      <option>Dental</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 bottom-[17px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                  </div>
                  <div className="col-span-2 space-y-1.5 relative group">
                    <label className="text-[13px] font-bold text-navy ml-1">Qualifications</label>
                    <GraduationCap className="w-4 h-4 absolute left-4 bottom-[17px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="text" placeholder="e.g. MBBS, MD (Medicine)" value={docQual} onChange={e => setDocQual(e.target.value)} className="w-full pl-11 pr-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[13px] font-bold text-navy ml-1">Consultation Fee</label>
                    <IndianRupee className="w-4 h-4 absolute left-4 bottom-[17px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="number" placeholder="500" value={docFee} onChange={e => setDocFee(e.target.value)} className="w-full pl-11 pr-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[13px] font-bold text-navy ml-1">Status</label>
                    <select value={docStatus} onChange={e => setDocStatus(e.target.value as any)} className="w-full px-4 h-[48px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[14px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none">
                      <option>Available</option>
                      <option>Busy</option>
                      <option>On Leave</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 bottom-[17px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-[12px] font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-2 text-primary" /> Schedule & Slots
                </h3>
                
                <div className="bg-secondary/20 p-5 rounded-2xl border border-border/60">
                  <div className="grid grid-cols-3 gap-5 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-navy ml-1">Shift Start</label>
                      <input type="time" value={slotGenStart} onChange={e => setSlotGenStart(e.target.value)} className="w-full px-4 h-[44px] bg-white border border-transparent focus:border-primary rounded-xl text-[13px] font-bold text-navy outline-none shadow-sm transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-navy ml-1">Shift End</label>
                      <input type="time" value={slotGenEnd} onChange={e => setSlotGenEnd(e.target.value)} className="w-full px-4 h-[44px] bg-white border border-transparent focus:border-primary rounded-xl text-[13px] font-bold text-navy outline-none shadow-sm transition-all" />
                    </div>
                    <div className="space-y-1.5 relative group">
                      <label className="text-[12px] font-bold text-navy ml-1">Duration</label>
                      <select value={slotGenDuration} onChange={e => setSlotGenDuration(e.target.value)} className="w-full px-4 h-[44px] bg-white border border-transparent focus:border-primary rounded-xl text-[13px] font-bold text-navy outline-none shadow-sm appearance-none transition-all">
                        <option value="10">10 mins</option>
                        <option value="15">15 mins</option>
                        <option value="20">20 mins</option>
                        <option value="30">30 mins</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 bottom-[14px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                  <button onClick={generateSlots} className="mt-4 w-full h-[44px] bg-primary/10 text-primary font-extrabold text-[13px] rounded-xl transition-all hover:bg-primary/20 hover:scale-[1.01]">
                    Generate Daily Slots
                  </button>
                </div>

                {docSlots.length > 0 && (
                  <div>
                    <p className="text-[13px] font-bold text-navy mb-3 ml-1">Generated Slots <span className="ml-1 px-2 py-0.5 bg-secondary text-muted-foreground rounded-md text-[10px]">{docSlots.length}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {docSlots.map((slot, i) => (
                        <div key={i} className="pl-3 pr-2 py-1.5 bg-white border border-border/80 rounded-lg shadow-sm text-[12px] font-bold text-navy flex items-center group">
                          {slot} 
                          <button onClick={() => setDocSlots(docSlots.filter(s => s !== slot))} className="ml-2 w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="p-6 pt-4 mt-2 border-t border-border/40 bg-white rounded-b-3xl">
              <button 
                onClick={handleSaveDoctor}
                disabled={!docName || !docSpecialty}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/30 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed text-white font-bold h-[56px] rounded-2xl transition-all shadow-[0_8px_25px_rgba(11,94,215,0.35)] hover:shadow-[0_12px_30px_rgba(11,94,215,0.45)] hover:-translate-y-1 flex items-center justify-center text-[16px]"
              >
                Save Doctor Profile
              </button>
            </div>
          </div>
=======
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-bold text-navy py-4 w-[70px] text-center">
                  Sr. No.
                </TableHead>
                <TableHead className="font-bold text-navy py-4">Patient Info</TableHead>
                <TableHead className="font-bold text-navy">Schedule</TableHead>
                <TableHead className="font-bold text-navy hidden md:table-cell">
                  Doctor & Reason
                </TableHead>
                <TableHead className="font-bold text-navy">Status</TableHead>
                <TableHead className="font-bold text-navy text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No appointments found. Add your first appointment above!
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((app, index) => (
                  <TableRow key={app.id} className="hover:bg-secondary/10 transition-colors">
                    <TableCell className="text-center font-bold text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-navy text-[14px]">{app.patientName}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{app.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center text-[13px] text-navy font-medium gap-1.5">
                          <CalendarIcon size={14} className="text-primary/70" />
                          {new Date(app.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center text-[12px] text-muted-foreground gap-1.5">
                          <Clock size={14} />
                          {app.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-[13px] font-medium text-navy">{app.doctor || "N/A"}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                        {app.reason || "No reason specified"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(app.status)} px-2.5 py-0.5 rounded-full font-bold`}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status !== "Completed" && app.status !== "Cancelled" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleComplete(app.id)}
                          title="Mark as Completed"
                          className="text-muted-foreground hover:text-success hover:bg-success/10 transition-colors mr-1"
                        >
                          <CheckCircle2 size={18} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(app.id)}
                        title="Delete Appointment"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
>>>>>>> Stashed changes
        </div>
      )}

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
