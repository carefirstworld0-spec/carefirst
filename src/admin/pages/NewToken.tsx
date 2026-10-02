import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { 
  User, 
  Stethoscope, 
  CheckCircle2, 
  ChevronDown, 
  Search, 
  Phone,
  ArrowLeft
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  slots: string[];
}

export function NewToken() {
  const navigate = useNavigate();
  
  // --- Form State ---
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("M");
  
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) return;

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
      } else {
        setDoctors([]);
      }
    });

    return () => unsubDocs();
  }, []);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey || !selectedDoctorId || !selectedDate) return;
    
    const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    const unsubAppts = onValue(apptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const slots = Object.keys(data)
          .map(key => data[key])
          .filter(a => a.date === selectedDate && a.doctorId === selectedDoctorId)
          .map(a => a.timeSlot);
        setBookedSlots(slots);
      } else {
        setBookedSlots([]);
      }
    });
    
    return () => unsubAppts();
  }, [selectedDoctorId, selectedDate]);

  const handleGenerateToken = async () => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey || !newName || !selectedDoctorId || !newTimeSlot) return;
    
    setIsSubmitting(true);
    try {
      const doctor = doctors.find(d => d.id === selectedDoctorId);
      if (!doctor) return;

      const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
      const newApptRef = push(apptsRef);

      const tokenNo = `T-${(bookedSlots.length + 1).toString().padStart(3, '0')}`;
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
      
      // Navigate back to queue
      navigate({ to: "/admin/appointments" });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctorId);
  const availableSlots = selectedDoctorObj?.slots?.filter(s => !bookedSlots.includes(s)) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header spanning full width naturally in AdminLayout */}
      <div className="bg-card border-b border-border -mx-8 -mt-8 px-8 py-6 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/admin/appointments" className="p-2 bg-secondary/80 text-muted-foreground hover:text-navy rounded-full transition-colors border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="display-title text-2xl text-navy">Book Appointment</h1>
            <p className="text-[14px] text-muted-foreground mt-1">Generate a new walk-in token for the OPD queue.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto pb-12">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border overflow-hidden">
          
          <div className="p-8 lg:p-10 space-y-10">
            {/* Section 1: Patient Details */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border/60 pb-3">
                <h3 className="text-[13px] font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary" /> Patient Details
                </h3>
                
                {/* Segmented Control */}
                <div className="flex bg-secondary p-1 rounded-xl shadow-inner border border-border/50">
                  <button 
                    onClick={() => setIsNewPatient(false)} 
                    className={`px-5 py-1.5 text-[13px] font-bold rounded-lg transition-all ${!isNewPatient ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy'}`}
                  >
                    Search Existing
                  </button>
                  <button 
                    onClick={() => setIsNewPatient(true)} 
                    className={`px-5 py-1.5 text-[13px] font-bold rounded-lg transition-all ${isNewPatient ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy'}`}
                  >
                    New Patient
                  </button>
                </div>
              </div>

              {!isNewPatient ? (
                <div className="relative group">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input type="text" placeholder="Search by Name, Phone, or UHID (e.g. CF123456)" className="w-full pl-12 pr-4 h-[56px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-2xl text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[14px] font-bold text-navy ml-1">Full Name</label>
                    <User className="w-4 h-4 absolute left-4 bottom-[20px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="text" placeholder="John Doe" value={newName} onChange={e => setNewName(e.target.value)} className="w-full pl-11 pr-4 h-[56px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                    <label className="text-[14px] font-bold text-navy ml-1">Phone Number</label>
                    <Phone className="w-4 h-4 absolute left-4 bottom-[20px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="tel" placeholder="+91" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full pl-11 pr-4 h-[56px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-navy ml-1">Age</label>
                    <input type="number" placeholder="Years" value={newAge} onChange={e => setNewAge(e.target.value)} className="w-full px-4 h-[56px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-1.5 relative group">
                    <label className="text-[14px] font-bold text-navy ml-1">Gender</label>
                    <select value={newGender} onChange={e => setNewGender(e.target.value)} className="w-full px-4 h-[56px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none">
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 bottom-[20px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Consultation Details */}
            <div className="space-y-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-[13px] font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2 text-primary" /> Assign Doctor & Time
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                  <label className="text-[14px] font-bold text-navy ml-1">Select Doctor</label>
                  <Stethoscope className="w-4 h-4 absolute left-4 bottom-[20px] text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <select value={selectedDoctorId} onChange={e => { setSelectedDoctorId(e.target.value); setNewTimeSlot(""); }} className="w-full pl-11 pr-10 h-[56px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none truncate relative z-0">
                    <option value="" disabled>Choose...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-4 bottom-[20px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1.5 relative group">
                  <label className="text-[14px] font-bold text-navy ml-1">Date</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 h-[56px] bg-secondary/30 border border-transparent hover:bg-secondary/50 focus:bg-white rounded-xl text-[15px] font-bold text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-end">
                  <label className="text-[14px] font-bold text-navy ml-1">Available Time Slots</label>
                  {selectedDoctorId && <span className="text-[12px] font-bold px-3 py-1 bg-secondary rounded-lg text-muted-foreground">{availableSlots.length} slots open</span>}
                </div>
                
                {!selectedDoctorId ? (
                  <div className="p-6 bg-secondary/30 rounded-2xl border border-dashed border-border text-center text-[15px] font-medium text-muted-foreground">
                    Please select a doctor to view their schedule.
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 bg-orange/10 rounded-2xl border border-orange/20 text-center text-[15px] font-bold text-orange">
                    Doctor is fully booked on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {availableSlots.map(time => (
                      <button 
                        key={time} 
                        onClick={() => setNewTimeSlot(time)}
                        className={`py-3.5 px-2 text-[13px] font-extrabold rounded-xl transition-all shadow-sm ${
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

          {/* Action Footer */}
          <div className="p-8 border-t border-border bg-secondary/10">
            <button 
              onClick={handleGenerateToken}
              disabled={!newName || !newPhone || !selectedDoctorId || !newTimeSlot || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/30 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed text-white font-bold h-[64px] rounded-2xl transition-all shadow-[0_8px_25px_rgba(11,94,215,0.35)] hover:shadow-[0_12px_30px_rgba(11,94,215,0.45)] hover:-translate-y-1 flex items-center justify-center text-[18px]"
            >
              {isSubmitting ? "Generating Token..." : (
                <><CheckCircle2 className="w-6 h-6 mr-2 stroke-[2.5]" /> Generate Queue Token</>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
