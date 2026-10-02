import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { Plus, Search, Calendar as CalendarIcon, Clock, User, Trash2, CheckCircle2 } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  doctor: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  createdAt: string;
};

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
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    doctor: "",
    reason: "",
    status: "Scheduled" as const,
  });

  const clinicKey = typeof window !== 'undefined' ? localStorage.getItem("user_clinic") || "" : "";

  useEffect(() => {
    if (!clinicKey) return;
    const appointmentsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const list: Appointment[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const key in data) {
          list.push({ id: key, ...data[key] });
        }
      }
      // Sort by date descending
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAppointments(list);
    });

    return () => unsubscribe();
  }, [clinicKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, phone: numericValue }));
        if (numericValue.length > 0 && numericValue.length !== 10) {
          setPhoneError("Please enter valid 10-digit phone number");
        } else {
          setPhoneError("");
        }
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: "Scheduled" | "Completed" | "Cancelled") => {
    setFormData(prev => ({ ...prev, status: value }));
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
      createdAt: new Date().toISOString()
    });

    setFormData({
      patientName: "",
      phone: "",
      countryCode: "+91",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      doctor: "",
      reason: "",
      status: "Scheduled",
    });
    setPhoneError("");
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!clinicKey) return;
    if (confirm("Are you sure you want to delete this appointment?")) {
      const appointmentRef = ref(db, `carefirst/users/${clinicKey}/appointments/${id}`);
      await remove(appointmentRef);
    }
  };

  const handleComplete = async (id: string) => {
    if (!clinicKey) return;
    const appointmentRef = ref(db, `carefirst/users/${clinicKey}/appointments/${id}`);
    await update(appointmentRef, { status: "Completed" });
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.phone.includes(searchTerm) ||
                          app.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? app.date === filterDate : true;
    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy font-display">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage patient schedules and bookings.</p>
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
                  <Label htmlFor="patientName" className="text-[13px] font-bold text-navy">Patient Name <span className="text-destructive">*</span></Label>
                  <Input id="patientName" name="patientName" value={formData.patientName} onChange={handleInputChange} required placeholder="John Doe" className="h-10 bg-secondary/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[13px] font-bold text-navy">Phone Number <span className="text-destructive">*</span></Label>
                  <div className={`flex items-center rounded-md border border-input bg-secondary/10 focus-within:ring-1 focus-within:ring-ring transition-colors ${phoneError ? 'border-red-500 focus-within:ring-red-500' : ''}`}>
                    <Select value={formData.countryCode} onValueChange={(val) => setFormData(p => ({ ...p, countryCode: val }))}>
                      <SelectTrigger className="w-[85px] shrink-0 h-10 border-0 bg-transparent shadow-none focus:ring-0 rounded-r-none pr-1 pl-3 font-medium">
                        <span className="truncate">{formData.countryCode}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} <span className="text-muted-foreground ml-1">({c.country})</span>
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
                  {phoneError && <p className="text-[11px] text-red-500 font-medium">{phoneError}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[13px] font-bold text-navy">Date <span className="text-destructive">*</span></Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required className="h-10 bg-secondary/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-[13px] font-bold text-navy">Time <span className="text-destructive">*</span></Label>
                  <Input id="time" name="time" type="time" value={formData.time} onChange={handleInputChange} required className="h-10 bg-secondary/10" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-[13px] font-bold text-navy">Assign Doctor <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Input id="doctor" name="doctor" value={formData.doctor} onChange={handleInputChange} placeholder="Dr. Smith" className="h-10 bg-secondary/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[13px] font-bold text-navy">Status</Label>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-[13px] font-bold text-navy">Reason for Visit <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input id="reason" name="reason" value={formData.reason} onChange={handleInputChange} placeholder="E.g. Routine checkup, Fever..." className="h-10 bg-secondary/10" />
              </div>

              <div className="pt-6 border-t border-border mt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full px-6">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-md transition-transform hover:-translate-y-0.5">
                  Confirm Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">Total Appointments</div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-navy">{appointments.length}</div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">Scheduled</div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-blue-600">{appointments.filter(a => a.status === "Scheduled").length}</div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">Completed</div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-green-600">{appointments.filter(a => a.status === "Completed").length}</div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">Cancelled</div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-red-600">{appointments.filter(a => a.status === "Cancelled").length}</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
          {filterDate && (
            <Button variant="ghost" onClick={() => setFilterDate("")} className="text-sm h-10 px-3 shrink-0 text-muted-foreground">
              Clear Filter
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-bold text-navy py-4 w-[70px] text-center">Sr. No.</TableHead>
                <TableHead className="font-bold text-navy py-4">Patient Info</TableHead>
                <TableHead className="font-bold text-navy">Schedule</TableHead>
                <TableHead className="font-bold text-navy hidden md:table-cell">Doctor & Reason</TableHead>
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
                          {new Date(app.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center text-[12px] text-muted-foreground gap-1.5">
                          <Clock size={14} />
                          {app.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-[13px] font-medium text-navy">{app.doctor || "N/A"}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5 truncate max-w-[200px]">{app.reason || "No reason specified"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(app.status)} px-2.5 py-0.5 rounded-full font-bold`}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status !== "Completed" && app.status !== "Cancelled" && (
                        <Button variant="ghost" size="icon" onClick={() => handleComplete(app.id)} title="Mark as Completed" className="text-muted-foreground hover:text-success hover:bg-success/10 transition-colors mr-1">
                          <CheckCircle2 size={18} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} title="Delete Appointment" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
