import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { 
  User, 
  Stethoscope, 
  CheckCircle2, 
  ChevronDown, 
  Search, 
  Phone,
  ArrowLeft,
  Clock,
  Calendar,
  History,
  X
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
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientUhid, setSelectedPatientUhid] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

    // Fetch All Appointments for Patient Search & History
    const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    const unsubAppts = onValue(apptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAllAppointments(list);
      } else {
        setAllAppointments([]);
      }
    });

    return () => {
      unsubDocs();
      unsubAppts();
    };
  }, []);

  const bookedSlots = allAppointments
    .filter(a => a.date === selectedDate && a.doctorId === selectedDoctorId)
    .map(a => a.timeSlot);

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
      const uhid = isNewPatient ? `CF${Math.floor(100000 + Math.random() * 900000)}` : (selectedPatientUhid || `CF${Math.floor(100000 + Math.random() * 900000)}`);

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

  // --- Search Logic ---
  const uniquePatients = Array.from(new Map(allAppointments.map(a => [a.uhid, a])).values());
  const searchResults = searchQuery 
    ? uniquePatients.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.phone?.includes(searchQuery) || 
        p.uhid?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) 
    : [];

  const patientHistory = selectedPatientUhid 
    ? allAppointments.filter(a => a.uhid === selectedPatientUhid) 
    : [];

  const handleSelectPatient = (patient: any) => {
    setSelectedPatientUhid(patient.uhid);
    setNewName(patient.name || "");
    setNewPhone(patient.phone || "");
    setNewAge(patient.age || "");
    setNewGender(patient.gender || "M");
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const clearSelectedPatient = () => {
    setSelectedPatientUhid("");
    setNewName("");
    setNewPhone("");
    setNewAge("");
    setNewGender("M");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 -mx-8 -mt-8 px-8 py-6 mb-8 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
        <div className="flex items-center gap-5">
          <Link to="/admin/appointments" className="p-2.5 bg-secondary/80 text-muted-foreground hover:text-navy hover:bg-white rounded-[14px] transition-all border border-border/50 shadow-sm hover:shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="display-title text-2xl text-navy">Book Appointment</h1>
            <p className="text-[14px] text-muted-foreground mt-1">Generate a new walk-in token for the OPD queue.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] w-full px-4 mx-auto pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* Left Column: Patient Details */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative p-8 lg:p-10 flex flex-col gap-6">
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-center border-b border-border/60 pb-4">
                <h3 className="text-[14px] font-bold text-navy/80 flex items-center">
                  <User className="w-4 h-4 mr-2.5 text-primary" /> Patient Details
                </h3>
                
                {/* Segmented Control */}
                <div className="flex bg-secondary/50 p-1 rounded-xl shadow-inner border border-border/40">
                  <button 
                    onClick={() => { setIsNewPatient(false); clearSelectedPatient(); }} 
                    className={`px-5 py-2 text-[13px] font-bold rounded-[10px] transition-all duration-300 ${!isNewPatient ? 'bg-white text-navy shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'text-muted-foreground hover:text-navy'}`}
                  >
                    Search Existing
                  </button>
                  <button 
                    onClick={() => { setIsNewPatient(true); clearSelectedPatient(); }} 
                    className={`px-5 py-2 text-[13px] font-bold rounded-[10px] transition-all duration-300 ${isNewPatient ? 'bg-white text-navy shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'text-muted-foreground hover:text-navy'}`}
                  >
                    New Patient
                  </button>
                </div>
              </div>

              {!isNewPatient ? (
                <div className="space-y-5 relative">
                  {!selectedPatientUhid ? (
                    <div className="relative group">
                      <Search className={`w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                      <input 
                        type="text" 
                        placeholder="Search by Name, Phone, or UHID (e.g. CF123456)" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        className="w-full pl-14 pr-5 h-[60px] bg-secondary/40 border border-transparent hover:bg-secondary/60 focus:bg-white rounded-[16px] text-[15px] font-bold text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" 
                      />
                      
                      {/* Search Results Dropdown */}
                      {isSearchFocused && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-border/50 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                          {searchResults.map(p => (
                            <div 
                              key={p.uhid} 
                              onClick={() => handleSelectPatient(p)}
                              className="px-5 py-4 border-b border-border/40 hover:bg-primary/[0.03] cursor-pointer transition-colors flex items-center justify-between group last:border-0"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-secondary text-primary font-bold flex items-center justify-center uppercase group-hover:bg-primary group-hover:text-white transition-colors">
                                  {p.name?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-navy text-[15px]">{p.name}</div>
                                  <div className="text-[13px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                    <Phone className="w-3.5 h-3.5" /> {p.phone}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[12px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                {p.uhid}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Selected Patient Card */}
                      <div className="bg-primary/[0.03] border border-primary/20 rounded-[20px] p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                        <div className="flex items-center gap-5 relative z-10">
                          <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            {newName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-xl text-navy">{newName}</h4>
                              <span className="text-[12px] font-bold text-primary bg-white px-2.5 py-1 rounded-md border border-primary/20 shadow-sm">
                                {selectedPatientUhid}
                              </span>
                            </div>
                            <div className="text-[14px] text-muted-foreground font-medium flex items-center gap-2 mt-1.5">
                              <span>{newAge}y</span> • <span>{newGender}</span> • <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> {newPhone}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={clearSelectedPatient} className="relative z-10 self-start md:self-center text-[13px] font-bold text-muted-foreground hover:text-destructive bg-white hover:bg-destructive/10 px-4 py-2 rounded-xl transition-all border border-border hover:border-destructive/30 shadow-sm flex items-center">
                          <X className="w-4 h-4 mr-1.5" /> Change
                        </button>
                      </div>

                      {/* Patient History */}
                      {patientHistory.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-[14px] font-bold text-navy/80 flex items-center mb-4">
                            <History className="w-4 h-4 mr-2" /> Recent Visits
                          </h4>
                          <div className="space-y-3">
                            {patientHistory.slice(0, 3).map((visit, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-secondary/20 border border-border/50 rounded-[14px] p-4 hover:bg-white hover:border-white hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-border/80 flex items-center justify-center text-primary shadow-sm">
                                    <Stethoscope className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-navy text-[14px]">Dr. {visit.doctorName}</div>
                                    <div className="text-[12px] text-muted-foreground font-medium mt-0.5">{visit.department}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[13px] font-bold text-navy flex items-center justify-end gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {new Date(visit.date).toLocaleDateString()}
                                  </div>
                                  <div className="text-[12px] font-bold text-primary mt-1 bg-primary/10 inline-block px-2 py-0.5 rounded-md">
                                    {visit.status}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="col-span-2 sm:col-span-1 space-y-2 relative group">
                    <label className="text-[13px] font-bold text-navy/80 ml-1">Full Name</label>
                    <User className="w-4 h-4 absolute left-5 bottom-[20px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="text" placeholder="John Doe" value={newName} onChange={e => setNewName(e.target.value)} className="w-full pl-12 pr-5 h-[60px] bg-secondary/40 border border-transparent hover:bg-secondary/60 focus:bg-white rounded-[16px] text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-2 relative group">
                    <label className="text-[13px] font-bold text-navy/80 ml-1">Phone Number</label>
                    <Phone className="w-4 h-4 absolute left-5 bottom-[20px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input type="tel" placeholder="+91" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full pl-12 pr-5 h-[60px] bg-secondary/40 border border-transparent hover:bg-secondary/60 focus:bg-white rounded-[16px] text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-navy/80 ml-1">Age</label>
                    <input type="number" placeholder="Years" value={newAge} onChange={e => setNewAge(e.target.value)} className="w-full px-5 h-[60px] bg-secondary/40 border border-transparent hover:bg-secondary/60 focus:bg-white rounded-[16px] text-[15px] font-medium text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
                  </div>
                  <div className="space-y-2 relative group">
                    <label className="text-[13px] font-bold text-navy/80 ml-1">Gender</label>
                    <select value={newGender} onChange={e => setNewGender(e.target.value)} className="w-full pl-5 pr-10 h-[60px] bg-secondary/40 border border-transparent hover:bg-secondary/60 focus:bg-white rounded-[16px] text-[15px] font-bold text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] appearance-none">
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-5 bottom-[20px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Consultation Details & Submit */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden flex flex-col justify-between">
            
            <div className="p-8 lg:p-10 space-y-6 relative z-10 flex-1">
              <div className="border-b border-border/60 pb-4">
                <h3 className="text-[14px] font-bold text-navy/80 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2.5 text-primary" /> Assign Doctor & Time
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1 space-y-2 relative group">
                  <label className="text-[13px] font-bold text-navy/80 ml-1">Select Doctor</label>
                  <Stethoscope className="w-4 h-4 absolute left-5 bottom-[20px] text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <select value={selectedDoctorId} onChange={e => { setSelectedDoctorId(e.target.value); setNewTimeSlot(""); }} className="w-full pl-12 pr-10 h-[60px] bg-secondary/40 border border-transparent hover:bg-secondary/60 focus:bg-white rounded-[16px] text-[15px] font-bold text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] appearance-none truncate relative z-0">
                    <option value="" disabled>Choose...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-5 bottom-[20px] text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-2 relative group">
                  <label className="text-[13px] font-bold text-navy/80 ml-1">Date</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-5 h-[60px] bg-secondary/40 border border-transparent hover:bg-secondary/60 focus:bg-white rounded-[16px] text-[15px] font-bold text-navy outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end">
                  <label className="text-[13px] font-bold text-navy/80 ml-1">Available Time Slots</label>
                  {selectedDoctorId && <span className="text-[12px] font-bold px-3 py-1 bg-secondary rounded-lg text-muted-foreground shadow-sm border border-border/50">{availableSlots.length} slots open</span>}
                </div>
                
                {!selectedDoctorId ? (
                  <div className="p-8 bg-secondary/20 rounded-[20px] border border-dashed border-border/80 text-center text-[15px] font-medium text-muted-foreground">
                    Please select a doctor to view their schedule.
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-8 bg-orange/5 rounded-[20px] border border-orange/20 text-center text-[15px] font-bold text-orange shadow-[inset_0_2px_10px_rgba(249,115,22,0.05)]">
                    Doctor is fully booked on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 animate-in fade-in duration-500">
                    {availableSlots.map(time => (
                      <button 
                        key={time} 
                        onClick={() => setNewTimeSlot(time)}
                        className={`py-4 px-2 text-[13px] font-extrabold rounded-[14px] transition-all duration-300 ${
                          newTimeSlot === time 
                            ? 'bg-primary text-white shadow-[0_8px_20px_-6px_rgba(11,94,215,0.5)] -translate-y-1 border border-primary' 
                            : 'bg-white border border-border text-navy hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

          {/* Action Footer */}
          <div className="p-8 border-t border-border bg-secondary/30 relative z-10 backdrop-blur-md">
            <button 
              onClick={handleGenerateToken}
              disabled={!newName || !newPhone || !selectedDoctorId || !newTimeSlot || isSubmitting}
              className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed text-white font-bold h-[68px] rounded-[20px] transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(11,94,215,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(11,94,215,0.7)] hover:-translate-y-1 flex items-center justify-center text-[18px] overflow-hidden group relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <div className="relative z-10 flex items-center">
                {isSubmitting ? "Generating Token..." : (
                  <><CheckCircle2 className="w-6 h-6 mr-3 stroke-[2.5]" /> Generate Queue Token</>
                )}
              </div>
            </button>
          </div>
          
        </div>
        </div>
      </div>
    </div>
  );
}
