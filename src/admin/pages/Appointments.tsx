import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Phone,
  X,
  Stethoscope,
  Search,
  User,
  ArrowRight,
  ChevronDown,
  Edit3,
  List,
  Eye,
  RefreshCw,
  XCircle,
  CalendarDays,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  Zap,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Sliders,
  ScrollText,
  Printer,
  MessageCircle,
  Trash2,
  FlaskConical,
  ShieldAlert,
  Send,
  Award,
  ShieldCheck,
  Activity,
  Heart,
  Thermometer,
  Weight
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, update, serverTimestamp } from "firebase/database";

// --- Types ---
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification?: string;
  phone?: string;
  email?: string;
  fee?: string;
  status?: "Available" | "On Leave" | "Busy";
  slots?: string[];
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
  status: "Waiting" | "In Consultation" | "Completed" | "Cancelled" | "No-Show" | string;
  date: string;
  notes?: string;
  createdAt?: number;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

// Fallback Doctors if Firebase database is initial/empty
const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Rajesh Sharma",
    specialty: "General Medicine",
    qualification: "MBBS, MD",
    slots: [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "02:00 PM",
      "02:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM"
    ]
  },
  {
    id: "doc_2",
    name: "Dr. Sunita Rao",
    specialty: "Pediatrics",
    qualification: "MBBS, DCH",
    slots: [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "05:00 PM",
      "05:30 PM",
      "06:00 PM"
    ]
  },
  {
    id: "doc_3",
    name: "Dr. Amit Patel",
    specialty: "Cardiology",
    qualification: "MBBS, DM (Cardio)",
    slots: ["09:30 AM", "10:00 AM", "11:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"]
  },
  {
    id: "doc_4",
    name: "Dr. Ananya Roy",
    specialty: "Dermatology",
    qualification: "MBBS, MD (Derma)",
    slots: ["11:00 AM", "11:30 AM", "12:00 PM", "04:00 PM", "04:30 PM"]
  },
  {
    id: "doc_5",
    name: "Dr. Vikram Joshi",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Ortho)",
    slots: ["10:00 AM", "10:30 AM", "11:30 AM", "03:30 PM", "04:00 PM", "05:00 PM"]
  }
];

// Fallback Initial Appointments
const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: "demo_1",
    token: "APT-0101",
    uhid: "CF982310",
    name: "Rahul Verma",
    phone: "+91 98765 43210",
    age: "34",
    gender: "M",
    doctorId: "doc_1",
    doctorName: "Dr. Rajesh Sharma",
    department: "General Medicine",
    timeSlot: "09:30 AM",
    status: "In Consultation",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 3600000
  },
  {
    id: "demo_2",
    token: "APT-0102",
    uhid: "CF847291",
    name: "Priya Patel",
    phone: "+91 98123 45678",
    age: "28",
    gender: "F",
    doctorId: "doc_1",
    doctorName: "Dr. Rajesh Sharma",
    department: "General Medicine",
    timeSlot: "10:00 AM",
    status: "Waiting",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 2700000
  },
  {
    id: "demo_3",
    token: "APT-0103",
    uhid: "CF739102",
    name: "Amitabh Singh",
    phone: "+91 99887 76655",
    age: "52",
    gender: "M",
    doctorId: "doc_3",
    doctorName: "Dr. Amit Patel",
    department: "Cardiology",
    timeSlot: "10:30 AM",
    status: "Waiting",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 1800000
  },
  {
    id: "demo_4",
    token: "APT-0104",
    uhid: "CF648201",
    name: "Meera Nair",
    phone: "+91 97654 32109",
    age: "41",
    gender: "F",
    doctorId: "doc_2",
    doctorName: "Dr. Sunita Rao",
    department: "Pediatrics",
    timeSlot: "09:00 AM",
    status: "Completed",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 7200000
  },
  {
    id: "demo_5",
    token: "APT-0105",
    uhid: "CF519283",
    name: "Suresh Menon",
    phone: "+91 96543 21098",
    age: "65",
    gender: "M",
    doctorId: "doc_5",
    doctorName: "Dr. Vikram Joshi",
    department: "Orthopedics",
    timeSlot: "11:30 AM",
    status: "Waiting",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 900000
  }
];

const DEPARTMENTS = [
  "All Departments",
  "General Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "ENT",
  "Gynecology"
];

// Helper: Generate time slot strings between start & end hour with optional maximum count cap
const generateTimeSlots = (
  start: number | string,
  end: number | string,
  intervalMinutes: number = 30,
  maxSlotsCount: number = 0
): string[] => {
  const step = intervalMinutes > 0 ? intervalMinutes : 30;
  const slots: string[] = [];
  let currentMinutes = 0;
  let endMinutes = 0;

  if (typeof start === "string") {
    const [h, m] = start.split(":").map(Number);
    currentMinutes = (isNaN(h) ? 9 : h) * 60 + (isNaN(m) ? 0 : m);
  } else {
    currentMinutes = (start || 9) * 60;
  }

  if (typeof end === "string") {
    const [h, m] = end.split(":").map(Number);
    endMinutes = (isNaN(h) ? 18 : h) * 60 + (isNaN(m) ? 0 : m);
  } else {
    endMinutes = (end || 18) * 60;
  }

  // Safeguard: If end time is earlier than start time (e.g. 05:00 PM entered as 05:00 = 300 mins), add 12 hours (720 mins)
  if (endMinutes <= currentMinutes && endMinutes < 12 * 60) {
    endMinutes += 12 * 60;
  }

  while (currentMinutes < endMinutes) {
    if (maxSlotsCount > 0 && slots.length >= maxSlotsCount) break;

    const hh = Math.floor(currentMinutes / 60);
    const mm = currentMinutes % 60;
    const period = hh >= 12 ? "PM" : "AM";
    const displayHour = hh % 12 === 0 ? 12 : hh % 12;
    const displayHourStr = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
    const displayMinStr = mm < 10 ? `0${mm}` : `${mm}`;

    slots.push(`${displayHourStr}:${displayMinStr} ${period}`);
    currentMinutes += step;
  }

  return slots;
};

export function Appointments() {
  // --- Core State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filtering & Search ---
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("ALL");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("All Departments");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // --- Sorting & Pagination ---
  const [sortField, setSortField] = useState<"timeSlot" | "status" | "token">("timeSlot");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- Modal & Drawer States ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSlotGenModalOpen, setIsSlotGenModalOpen] = useState(false);
  const [selectedApptDetail, setSelectedApptDetail] = useState<Appointment | null>(null);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);

  // --- Prescription Modal Popup State ---
  const [prescriptionModalAppt, setPrescriptionModalAppt] = useState<Appointment | null>(null);
  const [rxFormUhid, setRxFormUhid] = useState("");
  const [rxFormPatientName, setRxFormPatientName] = useState("");
  const [rxFormPatientAge, setRxFormPatientAge] = useState("");
  const [rxFormPatientGender, setRxFormPatientGender] = useState("Male");
  const [rxFormPatientPhone, setRxFormPatientPhone] = useState("");
  const [rxSelectedDoctorId, setRxSelectedDoctorId] = useState("");
  const [rxFormDate, setRxFormDate] = useState(todayStr);

  // Vitals (Blank by default)
  const [rxFormVitalsBp, setRxFormVitalsBp] = useState("");
  const [rxFormVitalsPulse, setRxFormVitalsPulse] = useState("");
  const [rxFormVitalsTemp, setRxFormVitalsTemp] = useState("");
  const [rxFormVitalsWeight, setRxFormVitalsWeight] = useState("");
  const [rxFormVitalsSpo2, setRxFormVitalsSpo2] = useState("");
  const [rxFormVitalsRbs, setRxFormVitalsRbs] = useState("");

  const [rxFormChiefComplaints, setRxFormChiefComplaints] = useState("");
  const [rxFormDiagnosis, setRxFormDiagnosis] = useState("");
  const [rxFormMedicines, setRxFormMedicines] = useState<any[]>([
    { id: "1", name: "", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" }
  ]);
  const [rxFormLabTests, setRxFormLabTests] = useState("");
  const [rxFormNotes, setRxFormNotes] = useState("");
  const [rxFormFollowUpDate, setRxFormFollowUpDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [showRxMedDropdown, setShowRxMedDropdown] = useState<{ [key: string]: boolean }>({});

  // --- Add Appointment Form State ---
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("M");
  const [formDepartment, setFormDepartment] = useState("General Medicine");
  const [formDoctorId, setFormDoctorId] = useState("");
  const [formDate, setFormDate] = useState(todayStr);
  const [formTimeSlot, setFormTimeSlot] = useState("");
  const [customSlotInput, setCustomSlotInput] = useState("");
  const [slotSessionFilter, setSlotSessionFilter] = useState<"ALL" | "MORNING" | "AFTERNOON" | "EVENING">("ALL");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- Slot Generator Modal State ---
  const [slotGenDoctorId, setSlotGenDoctorId] = useState("");
  const [slotGenStartTime, setSlotGenStartTime] = useState("09:00");
  const [slotGenEndTime, setSlotGenEndTime] = useState("18:00");
  const [slotGenInterval, setSlotGenInterval] = useState(30);
  const [slotGenMaxCount, setSlotGenMaxCount] = useState<number>(0); // 0 = all slots in range

  // --- Toasts ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --- Firebase Sync ---
  useEffect(() => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) {
      setAppointments(DEFAULT_APPOINTMENTS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch Appointments
    const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
    const unsubAppts = onValue(
      apptsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: Appointment[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key]
          }));
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setAppointments(list);
        } else {
          setAppointments(DEFAULT_APPOINTMENTS);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Firebase fetch error:", error);
        setAppointments(DEFAULT_APPOINTMENTS);
        setIsLoading(false);
      }
    );

    // Fetch Doctors
    const docsRef = ref(db, `carefirst/users/${clinicKey}/doctors`);
    const unsubDocs = onValue(docsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Doctor[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          slots: data[key].slots || MOCK_DOCTORS[0].slots
        }));
        setDoctors(list);
      } else {
        setDoctors(MOCK_DOCTORS);
      }
    });

    return () => {
      unsubAppts();
      unsubDocs();
    };
  }, []);

  // Sync selected form doctor ID & slot generator doctor ID whenever doctors change
  useEffect(() => {
    if (doctors.length > 0) {
      const validFormDoc = doctors.find((d) => d.id === formDoctorId);
      if (!validFormDoc) {
        setFormDoctorId(doctors[0].id);
      }
      const validSlotGenDoc = doctors.find((d) => d.id === slotGenDoctorId);
      if (!validSlotGenDoc) {
        setSlotGenDoctorId(doctors[0].id);
      }
    }
  }, [doctors, formDoctorId, slotGenDoctorId]);

  // Filter Doctors by Department in Form
  const filteredFormDoctors = useMemo(() => {
    if (!formDepartment || formDepartment === "All Departments") return doctors;
    return doctors.filter(
      (d) => d.specialty.toLowerCase() === formDepartment.toLowerCase()
    );
  }, [doctors, formDepartment]);

  // Current selected Doctor Object in Modal
  const currentFormDoctorObj = useMemo(() => {
    return doctors.find((d) => d.id === formDoctorId) || filteredFormDoctors[0] || doctors[0];
  }, [doctors, formDoctorId, filteredFormDoctors]);

  // Booked slots for selected form doctor & date
  const bookedSlotsForForm = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          a.doctorId === currentFormDoctorObj?.id &&
          a.date === formDate &&
          a.status !== "Cancelled"
      )
      .map((a) => a.timeSlot);
  }, [appointments, currentFormDoctorObj, formDate]);

  // Raw slots list for selected doctor
  const doctorSlots = useMemo(() => {
    return (
      currentFormDoctorObj?.slots || [
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "02:00 PM",
        "02:30 PM",
        "04:00 PM",
        "04:30 PM",
        "05:00 PM"
      ]
    );
  }, [currentFormDoctorObj]);

  // Filtered Slots by Session (Morning, Afternoon, Evening)
  const sessionFilteredSlots = useMemo(() => {
    return doctorSlots.filter((slot) => {
      if (slotSessionFilter === "ALL") return true;

      const isAM = slot.includes("AM");
      const hourNum = parseInt(slot.split(":")[0], 10);
      const isPM = slot.includes("PM");

      if (slotSessionFilter === "MORNING") {
        return isAM;
      }
      if (slotSessionFilter === "AFTERNOON") {
        return isPM && (hourNum === 12 || (hourNum >= 1 && hourNum <= 3));
      }
      if (slotSessionFilter === "EVENING") {
        return isPM && (hourNum >= 4 && hourNum <= 11);
      }
      return true;
    });
  }, [doctorSlots, slotSessionFilter]);

  // Unique patient database for live search suggestions
  const patientSuggestions = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; uhid: string; age: string; gender: string }>();
    appointments.forEach((a) => {
      if (a.uhid && !map.has(a.uhid)) {
        map.set(a.uhid, { name: a.name, phone: a.phone, uhid: a.uhid, age: a.age, gender: a.gender });
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  const filteredPatientSuggestions = useMemo(() => {
    if (!patientSearch.trim()) return [];
    const q = patientSearch.toLowerCase();
    return patientSuggestions
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.uhid.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [patientSearch, patientSuggestions]);

  // --- Filtering Logic for Main Table ---
  const dayAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.date === selectedDate || (!a.date && selectedDate === todayStr)
    );
  }, [appointments, selectedDate, todayStr]);

  const filteredAppointments = useMemo(() => {
    return dayAppointments.filter((app) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = app.name.toLowerCase().includes(q);
        const matchesPhone = app.phone.includes(q);
        const matchesToken = app.token.toLowerCase().includes(q);
        const matchesUhid = app.uhid.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesToken && !matchesUhid) {
          return false;
        }
      }

      // Doctor Filter
      if (selectedDoctorFilter !== "ALL" && app.doctorId !== selectedDoctorFilter) {
        return false;
      }

      // Department Filter
      if (
        selectedDepartmentFilter !== "All Departments" &&
        app.department.toLowerCase() !== selectedDepartmentFilter.toLowerCase()
      ) {
        return false;
      }

      // Status Filter
      if (selectedStatusFilter !== "ALL" && app.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [
    dayAppointments,
    searchQuery,
    selectedDoctorFilter,
    selectedDepartmentFilter,
    selectedStatusFilter
  ]);

  // Sorted Appointments
  const sortedAppointments = useMemo(() => {
    const list = [...filteredAppointments];
    list.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";
      if (sortDirection === "asc") {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    });
    return list;
  }, [filteredAppointments, sortField, sortDirection]);

  // Paginated Appointments
  const totalPages = Math.ceil(sortedAppointments.length / pageSize) || 1;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAppointments.slice(start, start + pageSize);
  }, [sortedAppointments, currentPage, pageSize]);

  // Quick Stats
  const totalCount = dayAppointments.length;
  const waitingCount = dayAppointments.filter((a) => a.status === "Waiting").length;
  const inConsultCount = dayAppointments.filter((a) => a.status === "In Consultation").length;
  const completedCount = dayAppointments.filter((a) => a.status === "Completed").length;

  const isFilterActive =
    searchQuery.trim() !== "" ||
    selectedDoctorFilter !== "ALL" ||
    selectedDepartmentFilter !== "All Departments" ||
    selectedStatusFilter !== "ALL" ||
    selectedDate !== todayStr;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedDoctorFilter("ALL");
    setSelectedDepartmentFilter("All Departments");
    setSelectedStatusFilter("ALL");
    setSelectedDate(todayStr);
    setCurrentPage(1);
  };

  // --- Status Update Handler ---
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      addToast("Status Updated", `Appointment status updated to ${newStatus}`);
      return;
    }

    try {
      const apptRef = ref(db, `carefirst/users/${clinicKey}/appointments/${id}`);
      await update(apptRef, { status: newStatus });
      addToast("Status Updated", `Appointment status updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update error:", err);
      addToast("Error", "Could not update appointment status", "error");
    }
  };

  // --- Open Prescription Modal Popup Pre-filled with Appointment Details ---
  const handleOpenPrescriptionModal = (appt: Appointment) => {
    setPrescriptionModalAppt(appt);
    setRxFormUhid(appt.uhid || "CF" + Math.floor(100000 + Math.random() * 900000));
    setRxFormPatientName(appt.name || "");
    setRxFormPatientAge(appt.age || "30");
    setRxFormPatientGender(
      appt.gender === "M" || appt.gender === "Male"
        ? "Male"
        : appt.gender === "F" || appt.gender === "Female"
        ? "Female"
        : "Other"
    );
    setRxFormPatientPhone(appt.phone || "");
    setRxSelectedDoctorId(appt.doctorId || doctors[0]?.id || "doc_1");
    setRxFormDate(todayStr);

    // Clean blank vitals (no fake numbers)
    setRxFormVitalsBp("");
    setRxFormVitalsPulse("");
    setRxFormVitalsTemp("");
    setRxFormVitalsWeight("");
    setRxFormVitalsSpo2("");
    setRxFormVitalsRbs("");

    setRxFormChiefComplaints(appt.notes || "");
    setRxFormDiagnosis("");
    setRxFormMedicines([
      { id: "1", name: "", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" }
    ]);
    setRxFormLabTests("");
    setRxFormNotes("");
    setRxFormFollowUpDate(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  };

  const handleAddRxMedicineRow = () => {
    setRxFormMedicines((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), name: "", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" }
    ]);
  };

  const handleRemoveRxMedicineRow = (id: string) => {
    if (rxFormMedicines.length === 1) return;
    setRxFormMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateRxMedicineField = (id: string, field: string, value: string) => {
    setRxFormMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSaveModalPrescription = async (targetStatus: "Issued" | "Sent via WhatsApp" = "Issued", autoWhatsApp: boolean = false) => {
    if (!rxFormPatientName.trim()) {
      addToast("Required", "Patient name is required", "error");
      return;
    }
    if (!rxFormDiagnosis.trim()) {
      addToast("Required", "Diagnosis is required", "error");
      return;
    }

    const rxId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;
    const doc = doctors.find((d) => d.id === rxSelectedDoctorId) || doctors[0];

    const newRx = {
      id: rxId,
      uhid: rxFormUhid,
      patientName: rxFormPatientName.trim(),
      patientAge: rxFormPatientAge.trim() || "30",
      patientGender: rxFormPatientGender,
      patientPhone: rxFormPatientPhone.trim() || "+91 98765 43210",
      doctorId: doc?.id || "doc_1",
      doctorName: doc?.name ? (doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`) : "Dr. Rajesh Sharma",
      doctorQual: doc?.qualification || "MBBS, MD",
      doctorReg: "Reg. No: MMC-2024/08/3921",
      doctorDept: doc?.specialty || "General Medicine",
      date: rxFormDate,
      vitalsBp: rxFormVitalsBp.trim(),
      vitalsPulse: rxFormVitalsPulse.trim(),
      vitalsTemp: rxFormVitalsTemp.trim(),
      vitalsWeight: rxFormVitalsWeight.trim(),
      vitalsSpo2: rxFormVitalsSpo2.trim(),
      vitalsRbs: rxFormVitalsRbs.trim(),
      chiefComplaints: rxFormChiefComplaints.trim(),
      diagnosis: rxFormDiagnosis.trim(),
      medicines: rxFormMedicines.filter((m) => m.name && m.name.trim() !== ""),
      labTests: rxFormLabTests.trim(),
      notes: rxFormNotes.trim(),
      followUpDate: rxFormFollowUpDate,
      clinicName: "CAREFIRST MULTISPECIALTY CLINIC & HOSPITAL",
      clinicAddress: "102 Healthcare Tower, MG Road, Mumbai, Maharashtra 400001",
      clinicPhone: "+91 98765 43210 / 022-2894-1100",
      whatsappSent: autoWhatsApp || targetStatus === "Sent via WhatsApp",
      whatsappSentTo: autoWhatsApp ? rxFormPatientPhone.trim() : undefined,
      status: targetStatus,
      createdAt: Date.now()
    };

    // Save to Firebase
    const clinicKey = localStorage.getItem("user_clinic");
    if (clinicKey) {
      try {
        const rxRef = ref(db, `carefirst/users/${clinicKey}/prescriptions/${rxId}`);
        await set(rxRef, newRx);
      } catch (err) {
        console.error("Firebase rx save error:", err);
      }
    }

    // Auto-mark appointment as Completed
    if (prescriptionModalAppt) {
      handleUpdateStatus(prescriptionModalAppt.id, "Completed");
    }

    addToast("Prescription Issued!", `Prescription ${rxId} created successfully for ${rxFormPatientName}.`, "success");

    if (autoWhatsApp) {
      const phone = rxFormPatientPhone.trim() || "+91 98765 43210";
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const text = encodeURIComponent(
        `Hello ${rxFormPatientName}, your official E-Prescription (${rxId}) from ${newRx.doctorName} at CareFirst Clinic is ready.\n\nDiagnosis: ${rxFormDiagnosis}\nRe-visit Date: ${rxFormFollowUpDate}\n\nGet well soon!`
      );
      const waUrl = `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=${text}`;
      window.open(waUrl, "_blank");
    }

    setPrescriptionModalAppt(null);
  };

  // --- Add Custom Slot Inline ---
  const handleAddCustomSlot = () => {
    if (!customSlotInput.trim()) return;
    const formattedSlot = customSlotInput.trim().toUpperCase();

    // Update current doctor's slots locally
    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id === currentFormDoctorObj.id) {
          const updatedSlots = Array.from(new Set([...(doc.slots || []), formattedSlot]));
          return { ...doc, slots: updatedSlots };
        }
        return doc;
      })
    );

    setFormTimeSlot(formattedSlot);
    setCustomSlotInput("");
    addToast("Custom Slot Added", `Selected custom time slot: ${formattedSlot}`, "info");
  };

  // --- Generate & Apply Doctor Slots Handler ---
  const handleApplyGeneratedDoctorSlots = async () => {
    if (!doctors || doctors.length === 0) {
      addToast("Error", "No doctors available in system", "error");
      return;
    }

    // Always fallback gracefully if slotGenDoctorId is not found in doctors list
    const targetDoc = doctors.find((d) => d.id === slotGenDoctorId) || doctors[0];
    const targetDocId = targetDoc.id;

    const generated = generateTimeSlots(
      slotGenStartTime,
      slotGenEndTime,
      slotGenInterval,
      slotGenMaxCount
    );

    // Synchronous Local State Update FIRST (guarantees instant UI update)
    setDoctors((prev) =>
      prev.map((d) => (d.id === targetDocId ? { ...d, slots: generated } : d))
    );

    // Pre-select target doctor & first slot for booking form
    setFormDoctorId(targetDocId);
    if (targetDoc.specialty) {
      setFormDepartment(targetDoc.specialty);
    } else {
      setFormDepartment("All Departments");
    }
    if (generated.length > 0) {
      setFormTimeSlot(generated[0]);
    }

    addToast(
      "Slots Saved & Applied!",
      `Generated ${generated.length} time slots for Dr. ${targetDoc.name}`,
      "success"
    );

    // Close Slot Generator modal and open Add Appointment modal with this doctor pre-selected
    setIsSlotGenModalOpen(false);
    setIsAddModalOpen(true);

    // Asynchronous Firebase Sync
    const clinicKey = localStorage.getItem("user_clinic");
    if (clinicKey) {
      try {
        const docRef = ref(db, `carefirst/users/${clinicKey}/doctors/${targetDocId}`);
        await update(docRef, { slots: generated });
      } catch (err) {
        console.error("Firebase slots update error:", err);
      }
    }
  };

  // --- Generate Appointment Handler ---
  const handleGenerateAppointment = async () => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) errors.name = "Patient full name is required";
    if (!formPhone.trim()) errors.phone = "Phone number is required";
    if (!formDoctorId) errors.doctor = "Please select a doctor";
    if (!formTimeSlot) errors.slot = "Please select an available time slot";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const selectedDoctorObj = doctors.find((d) => d.id === formDoctorId) || doctors[0];
    const clinicKey = localStorage.getItem("user_clinic");
    const generatedToken = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedUhid = `CF${Math.floor(100000 + Math.random() * 900000)}`;

    const newApptData: Omit<Appointment, "id"> = {
      token: generatedToken,
      uhid: isNewPatient ? generatedUhid : patientSearch || generatedUhid,
      name: formName.trim(),
      phone: formPhone.trim(),
      age: formAge.trim() || "30",
      gender: formGender,
      doctorId: selectedDoctorObj.id,
      doctorName: selectedDoctorObj.name,
      department: selectedDoctorObj.specialty || formDepartment,
      timeSlot: formTimeSlot,
      status: "Waiting",
      date: formDate,
      createdAt: Date.now()
    };

    // Synchronous Local State Update FIRST (guarantees instant table update)
    const created: Appointment = { id: `local_${Date.now()}`, ...newApptData };
    setAppointments((prev) => [created, ...prev]);

    addToast(
      "Appointment Created!",
      `Generated Token Code: ${generatedToken} for ${formName.trim()}`,
      "success"
    );

    resetModalForm();

    // Asynchronous Firebase Sync
    if (clinicKey) {
      try {
        const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
        const newRef = push(apptsRef);
        await set(newRef, {
          ...newApptData,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firebase appointment save error:", err);
      }
    }
  };

  const resetModalForm = () => {
    setIsAddModalOpen(false);
    setFormName("");
    setFormPhone("");
    setFormAge("");
    setFormGender("M");
    setFormTimeSlot("");
    setPatientSearch("");
    setCustomSlotInput("");
    setIsNewPatient(true);
    setFormErrors({});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Completed
          </span>
        );
      case "Waiting":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            Waiting
          </span>
        );
      case "In Consultation":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 animate-pulse" />
            In Consultation
          </span>
        );
      case "Cancelled":
      case "No-Show":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === "success"
                ? "bg-white border-emerald-200 text-slate-900"
                : toast.type === "error"
                ? "bg-white border-rose-200 text-slate-900"
                : "bg-white border-blue-200 text-slate-900"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {toast.type === "error" && (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            {toast.type === "info" && (
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToasts((t) => t.filter((item) => item.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
        {/* ================= 1. TOP BAR ================= */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Left Title & Date Selector */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                Appointment Management
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage OPD queues, doctor schedules & generate walk-in tokens.
              </p>
            </div>

            {/* Date Selector Badge */}
            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5">
              <Calendar className="w-4 h-4 text-[#0B5ED7] mr-2 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              />
              {selectedDate === todayStr && (
                <span className="ml-2 text-[10px] font-extrabold uppercase bg-[#0B5ED7]/10 text-[#0B5ED7] px-2 py-0.5 rounded-md">
                  Today
                </span>
              )}
            </div>
          </div>

          {/* Right Actions & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Live Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, phone, or token..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5ED7]/20 focus:border-[#0B5ED7] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Generate Slots Button */}
            <button
              onClick={() => setIsSlotGenModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-all shrink-0"
              title="Generate / Configure Doctor Time Slots"
            >
              <Zap className="w-4 h-4 text-teal-600 fill-teal-600" />
              <span>Generate Slots</span>
            </button>

            {/* Primary Add Appointment Button */}
            <button
              onClick={() => {
                resetModalForm();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#094db2] text-white text-xs font-bold shadow-sm shadow-[#0B5ED7]/30 hover:shadow-md transition-all active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Appointment</span>
            </button>
          </div>
        </header>

        {/* ================= 2. SUMMARY STATS ROW ================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Today
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-display">
                {totalCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B5ED7] flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Waiting */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Patients Waiting
              </p>
              <h3 className="text-2xl font-extrabold text-amber-900 mt-1 font-display">
                {waitingCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: In Consultation */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                In Consultation
              </p>
              <h3 className="text-2xl font-extrabold text-blue-900 mt-1 font-display">
                {inConsultCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Completed
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-900 mt-1 font-display">
                {completedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* ================= 3. FILTER BAR ================= */}
        <section className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Doctor Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedDoctorFilter}
                onChange={(e) => {
                  setSelectedDoctorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0B5ED7]/20 focus:border-[#0B5ED7] transition-all cursor-pointer"
              >
                <option value="ALL">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Department Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => {
                  setSelectedDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0B5ED7]/20 focus:border-[#0B5ED7] transition-all cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
              {["ALL", "Waiting", "In Consultation", "Completed", "Cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedStatusFilter === st
                      ? "bg-white text-[#0B5ED7] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st === "ALL" ? "All Status" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Link */}
          {isFilterActive && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B5ED7] transition-colors self-end md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </section>

        {/* ================= 4. APPOINTMENTS TABLE ================= */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              {/* Sticky Header */}
              <thead className="bg-slate-50/90 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">
                    <button
                      onClick={() => {
                        setSortField("token");
                        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      Token / Code
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3.5">Patient Details</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Doctor & Dept</th>
                  <th className="px-6 py-3.5">
                    <button
                      onClick={() => {
                        setSortField("timeSlot");
                        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      Slot Time
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3.5">
                    <button
                      onClick={() => {
                        setSortField("status");
                        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {/* Skeleton Loading State */}
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-32 mb-1" />
                        <div className="h-3 bg-slate-100 rounded w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-28 mb-1" />
                        <div className="h-3 bg-slate-100 rounded w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 rounded-full w-20" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-6 bg-slate-200 rounded w-20 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedAppointments.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <List className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800">
                        No appointments found
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        No appointments match your search criteria or selected date.
                      </p>
                      {isFilterActive && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Clear Filters</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  /* Rows */
                  paginatedAppointments.map((item, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedApptDetail(item)}
                        className={`group cursor-pointer transition-colors hover:bg-blue-50/50 ${
                          isEven ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        {/* Token / Code */}
                        <td className="px-6 py-4 align-middle font-mono font-bold text-slate-900 group-hover:text-[#0B5ED7]">
                          {item.token}
                        </td>

                        {/* Patient Info */}
                        <td className="px-6 py-4 align-middle">
                          <div className="font-bold text-slate-900 text-sm">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {item.uhid} ({item.age}y/{item.gender})
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4 align-middle text-slate-600 font-medium">
                          {item.phone}
                        </td>

                        {/* Doctor & Dept */}
                        <td className="px-6 py-4 align-middle">
                          <div className="font-bold text-slate-800">
                            Dr. {item.doctorName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {item.department}
                          </div>
                        </td>

                        {/* Slot Time */}
                        <td className="px-6 py-4 align-middle">
                          <span className="inline-flex items-center font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                            <Clock className="w-3 h-3 text-[#0B5ED7] mr-1.5" />
                            {item.timeSlot}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 align-middle">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-6 py-4 align-middle text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Call Next Action */}
                            {item.status === "Waiting" && (
                              <button
                                title="Call Next / Start Consultation"
                                onClick={() =>
                                  handleUpdateStatus(item.id, "In Consultation")
                                }
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-[#0B5ED7] text-[#0B5ED7] hover:text-white transition-all"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}

                            {/* Mark Complete Action */}
                            {item.status === "In Consultation" && (
                              <button
                                title="Mark Completed"
                                onClick={() =>
                                  handleUpdateStatus(item.id, "Completed")
                                }
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {/* Write Prescription Modal Trigger */}
                            <button
                              title="Write E-Prescription Popup"
                              onClick={() => handleOpenPrescriptionModal(item)}
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white transition-all cursor-pointer font-bold text-xs flex items-center gap-1"
                            >
                              <ScrollText className="w-4 h-4" />
                            </button>

                            {/* View Details */}
                            <button
                              title="View Full Details"
                              onClick={() => setSelectedApptDetail(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Reschedule / Edit */}
                            <button
                              title="Edit / Reschedule"
                              onClick={() => setEditingAppt(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B5ED7] hover:bg-blue-50 transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Cancel */}
                            {item.status !== "Cancelled" && (
                              <button
                                title="Cancel Appointment"
                                onClick={() => handleUpdateStatus(item.id, "Cancelled")}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer & Pagination */}
          <div className="bg-white px-6 py-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Showing{" "}
              <span className="font-bold text-slate-800">
                {sortedAppointments.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * pageSize, sortedAppointments.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {sortedAppointments.length}
              </span>{" "}
              appointments
            </div>

            <div className="flex items-center gap-4">
              {/* Rows Per Page */}
              <div className="flex items-center gap-2">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Page Nav */}
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= 5. ADD APPOINTMENT MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[650px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Book New Appointment
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Generate walk-in token or schedule OPD consultation.
                </p>
              </div>
              <button
                onClick={resetModalForm}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Section 1: Patient Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#0B5ED7]" /> Patient Info
                  </label>

                  {/* Toggle New / Search Patient */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setIsNewPatient(false)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                        !isNewPatient
                          ? "bg-white text-[#0B5ED7] shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Search Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewPatient(true)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                        isNewPatient
                          ? "bg-white text-[#0B5ED7] shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      + New Patient
                    </button>
                  </div>
                </div>

                {!isNewPatient ? (
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type Patient Name, Phone or UHID..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setShowPatientSuggestions(true);
                      }}
                      onFocus={() => setShowPatientSuggestions(true)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#0B5ED7]/20 focus:border-[#0B5ED7]"
                    />
                    {showPatientSuggestions && filteredPatientSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100">
                        {filteredPatientSuggestions.map((p) => (
                          <div
                            key={p.uhid}
                            onClick={() => {
                              setFormName(p.name);
                              setFormPhone(p.phone);
                              setFormAge(p.age);
                              setFormGender(p.gender);
                              setPatientSearch(p.uhid);
                              setShowPatientSuggestions(false);
                            }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                UHID: {p.uhid} • Phone: {p.phone}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-[#0B5ED7] bg-blue-50 px-2 py-0.5 rounded">
                              Select
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <label className="font-semibold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Verma"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium outline-none transition-all ${
                          formErrors.name
                            ? "border-rose-500 bg-rose-50/30"
                            : "border-slate-200 focus:bg-white focus:border-[#0B5ED7]"
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-[10px] font-semibold text-rose-500">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <label className="font-semibold text-slate-700">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium outline-none transition-all ${
                          formErrors.phone
                            ? "border-rose-500 bg-rose-50/30"
                            : "border-slate-200 focus:bg-white focus:border-[#0B5ED7]"
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[10px] font-semibold text-rose-500">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Age</label>
                      <input
                        type="number"
                        placeholder="Years"
                        value={formAge}
                        onChange={(e) => setFormAge(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-[#0B5ED7]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Gender</label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-[#0B5ED7]"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Department & Doctor */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0B5ED7]" /> Consultation Details
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="font-semibold text-slate-700">Department</label>
                    <select
                      value={formDepartment}
                      onChange={(e) => {
                        setFormDepartment(e.target.value);
                        setFormTimeSlot("");
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-[#0B5ED7]"
                    >
                      {DEPARTMENTS.filter((d) => d !== "All Departments").map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="font-semibold text-slate-700">Doctor *</label>
                    <select
                      value={formDoctorId}
                      onChange={(e) => {
                        setFormDoctorId(e.target.value);
                        setFormTimeSlot("");
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-[#0B5ED7]"
                    >
                      {filteredFormDoctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#0B5ED7]"
                  />
                </div>

                {/* ADVANCED TIME SLOT SELECTOR & GENERATOR */}
                <div className="space-y-3 pt-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#0B5ED7]" /> Select Time Slot *
                    </label>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {doctorSlots.filter((s) => !bookedSlotsForForm.includes(s)).length}{" "}
                      slots open
                    </span>
                  </div>

                  {/* Session Filters (Morning, Afternoon, Evening) */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSlotSessionFilter("ALL")}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        slotSessionFilter === "ALL"
                          ? "bg-[#0B5ED7] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All Slots
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotSessionFilter("MORNING")}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        slotSessionFilter === "MORNING"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Sun className="w-3 h-3" /> Morning
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotSessionFilter("AFTERNOON")}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        slotSessionFilter === "AFTERNOON"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Sunset className="w-3 h-3" /> Afternoon
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotSessionFilter("EVENING")}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        slotSessionFilter === "EVENING"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Moon className="w-3 h-3" /> Evening
                    </button>
                  </div>

                  {/* Slot Pills Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {sessionFilteredSlots.map((slot) => {
                      const isBooked = bookedSlotsForForm.includes(slot);
                      const isSelected = formTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setFormTimeSlot(slot)}
                          className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all border flex items-center justify-center gap-1 ${
                            isBooked
                              ? "bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed opacity-70"
                              : isSelected
                              ? "bg-[#0B5ED7] text-white border-[#0B5ED7] shadow-sm scale-[1.02]"
                              : "bg-white text-slate-700 border-slate-200 hover:border-[#0B5ED7] hover:text-[#0B5ED7]"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Slot Input & Quick Generator Option */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Custom time (e.g. 11:45 AM)"
                        value={customSlotInput}
                        onChange={(e) => setCustomSlotInput(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B5ED7] w-full"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSlot}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 transition-all"
                      >
                        + Add Custom
                      </button>
                    </div>
                  </div>

                  {formErrors.slot && (
                    <p className="text-[10px] font-semibold text-rose-500">
                      {formErrors.slot}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetModalForm}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAppointment}
                className="px-5 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#094db2] text-white text-xs font-bold shadow-sm shadow-[#0B5ED7]/30 transition-all active:scale-[0.98]"
              >
                Generate Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. GENERATE DOCTOR SLOTS MODAL ================= */}
      {isSlotGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Zap className="w-5 h-5 fill-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Generate Doctor Time Slots
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure quantity & automated OPD schedules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSlotGenModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Doctor */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Doctor</label>
                <select
                  value={slotGenDoctorId}
                  onChange={(e) => setSlotGenDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#0B5ED7] cursor-pointer"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Slots to Generate */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-teal-600" /> How Many Slots to Generate?
                  </label>
                  <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                    {slotGenMaxCount === 0 ? "Unlimited" : `${slotGenMaxCount} slots`}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 pt-1.5">
                  {[0, 5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSlotGenMaxCount(count)}
                      className={`py-1.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                        slotGenMaxCount === count
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-teal-500"
                      }`}
                    >
                      {count === 0 ? "All" : `${count}`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Custom Slot Count:</span>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    min={0}
                    max={100}
                    value={slotGenMaxCount === 0 ? "" : slotGenMaxCount}
                    onChange={(e) =>
                      setSlotGenMaxCount(Math.max(0, parseInt(e.target.value || "0", 10)))
                    }
                    className="w-24 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Slot Interval */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Slot Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSlotGenInterval(mins)}
                      className={`py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                        slotGenInterval === mins
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-500"
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Working Hours (Start Time & End Time Pickers) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Custom Start Time</label>
                  <input
                    type="time"
                    value={slotGenStartTime}
                    onChange={(e) => setSlotGenStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Custom End Time</label>
                  <input
                    type="time"
                    value={slotGenEndTime}
                    onChange={(e) => setSlotGenEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <span>Slot Preview</span>
                  <span className="text-teal-600 font-extrabold">
                    {
                      generateTimeSlots(
                        slotGenStartTime,
                        slotGenEndTime,
                        slotGenInterval,
                        slotGenMaxCount
                      ).length
                    }{" "}
                    slots generated
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {generateTimeSlots(
                    slotGenStartTime,
                    slotGenEndTime,
                    slotGenInterval,
                    slotGenMaxCount
                  ).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSlotGenModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApplyGeneratedDoctorSlots();
                }}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. SIDE DRAWER: APPOINTMENT DETAILS ================= */}
      {selectedApptDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B5ED7] bg-blue-50 px-2 py-0.5 rounded">
                  Appointment Details
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
                  {selectedApptDetail.token}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApptDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedApptDetail.name}
                  </h4>
                  {getStatusBadge(selectedApptDetail.status)}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  UHID: {selectedApptDetail.uhid}
                </div>
                <div className="flex items-center gap-4 text-slate-600 pt-1">
                  <span>Age: {selectedApptDetail.age} yrs</span>
                  <span>•</span>
                  <span>Gender: {selectedApptDetail.gender}</span>
                  <span>•</span>
                  <span>{selectedApptDetail.phone}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Consultation Info
                </h5>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Doctor Name</span>
                    <span className="font-bold text-slate-800">
                      Dr. {selectedApptDetail.doctorName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Department</span>
                    <span className="font-bold text-slate-800">
                      {selectedApptDetail.department}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Time Slot</span>
                    <span className="font-bold text-[#0B5ED7]">
                      {selectedApptDetail.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-semibold">Date</span>
                    <span className="font-bold text-slate-800">
                      {selectedApptDetail.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Status Actions */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Quick Actions
                </h5>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApptDetail.id, "In Consultation");
                      setSelectedApptDetail((prev) =>
                        prev ? { ...prev, status: "In Consultation" } : null
                      );
                    }}
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-[#0B5ED7] text-[#0B5ED7] hover:text-white font-bold text-xs transition-all text-center"
                  >
                    Call Next
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApptDetail.id, "Completed");
                      setSelectedApptDetail((prev) =>
                        prev ? { ...prev, status: "Completed" } : null
                      );
                    }}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold text-xs transition-all text-center"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApptDetail.id, "Waiting");
                      setSelectedApptDetail((prev) =>
                        prev ? { ...prev, status: "Waiting" } : null
                      );
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white font-bold text-xs transition-all text-center"
                  >
                    Set Waiting
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApptDetail.id, "Cancelled");
                      setSelectedApptDetail((prev) =>
                        prev ? { ...prev, status: "Cancelled" } : null
                      );
                    }}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs transition-all text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
              <button
                onClick={() => {
                  const appt = selectedApptDetail;
                  setSelectedApptDetail(null);
                  handleOpenPrescriptionModal(appt);
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ScrollText className="w-4 h-4" /> Write Prescription
              </button>
              <button
                onClick={() => {
                  setEditingAppt(selectedApptDetail);
                  setSelectedApptDetail(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all text-center cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 8. EDIT / RESCHEDULE MODAL ================= */}
      {editingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">
                Edit Appointment ({editingAppt.token})
              </h3>
              <button
                onClick={() => setEditingAppt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Patient Name</label>
                <input
                  type="text"
                  value={editingAppt.name}
                  onChange={(e) =>
                    setEditingAppt({ ...editingAppt, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={editingAppt.phone}
                  onChange={(e) =>
                    setEditingAppt({ ...editingAppt, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Time Slot</label>
                <input
                  type="text"
                  value={editingAppt.timeSlot}
                  onChange={(e) =>
                    setEditingAppt({ ...editingAppt, timeSlot: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Status</label>
                <select
                  value={editingAppt.status}
                  onChange={(e) =>
                    setEditingAppt({ ...editingAppt, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none mt-1"
                >
                  <option value="Waiting">Waiting</option>
                  <option value="In Consultation">In Consultation</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAppt(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingAppt) return;

                  // Update local state IMMEDIATELY so UI table updates synchronously
                  setAppointments((prev) =>
                    prev.map((a) => (a.id === editingAppt.id ? editingAppt : a))
                  );
                  addToast("Saved", "Appointment details updated successfully.");
                  const apptToSave = editingAppt;
                  setEditingAppt(null);

                  const clinicKey = localStorage.getItem("user_clinic");
                  if (clinicKey) {
                    try {
                      const apptRef = ref(
                        db,
                        `carefirst/users/${clinicKey}/appointments/${apptToSave.id}`
                      );
                      await update(apptRef, {
                        name: apptToSave.name,
                        phone: apptToSave.phone,
                        timeSlot: apptToSave.timeSlot,
                        status: apptToSave.status
                      });
                    } catch (err) {
                      console.error("Firebase update error:", err);
                    }
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0B5ED7] text-white text-xs font-bold hover:bg-[#094db2]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. PRESCRIPTION GENERATOR POPUP MODAL ================= */}
      {prescriptionModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <span>E-Prescription Generator</span>
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      {rxFormUhid}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Prescription for <strong className="text-slate-900">{rxFormPatientName}</strong> ({rxFormPatientAge} yrs, {rxFormPatientGender}) • Ph: {rxFormPatientPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrescriptionModalAppt(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Doctor & Patient Info Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      value={rxFormPatientName}
                      onChange={(e) => setRxFormPatientName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Age & Gender</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rxFormPatientAge}
                        onChange={(e) => setRxFormPatientAge(e.target.value)}
                        className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-teal-600"
                      />
                      <select
                        value={rxFormPatientGender}
                        onChange={(e) => setRxFormPatientGender(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-teal-600"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">WhatsApp Mobile Phone</label>
                    <input
                      type="text"
                      value={rxFormPatientPhone}
                      onChange={(e) => setRxFormPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Attending Doctor</label>
                    <select
                      value={rxSelectedDoctorId}
                      onChange={(e) => setRxSelectedDoctorId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-teal-600 cursor-pointer"
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vitals Bar */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Patient Physical Vitals (Optional)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">BP (mmHg)</span>
                      <input
                        type="text"
                        placeholder="120/80 mmHg"
                        value={rxFormVitalsBp}
                        onChange={(e) => setRxFormVitalsBp(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Pulse (bpm)</span>
                      <input
                        type="text"
                        placeholder="78 bpm"
                        value={rxFormVitalsPulse}
                        onChange={(e) => setRxFormVitalsPulse(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Temp (°F)</span>
                      <input
                        type="text"
                        placeholder="98.6 °F"
                        value={rxFormVitalsTemp}
                        onChange={(e) => setRxFormVitalsTemp(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Weight (kg)</span>
                      <input
                        type="text"
                        placeholder="68 kg"
                        value={rxFormVitalsWeight}
                        onChange={(e) => setRxFormVitalsWeight(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">SpO2 (%)</span>
                      <input
                        type="text"
                        placeholder="98%"
                        value={rxFormVitalsSpo2}
                        onChange={(e) => setRxFormVitalsSpo2(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Sugar / RBS</span>
                      <input
                        type="text"
                        placeholder="110 mg/dL"
                        value={rxFormVitalsRbs}
                        onChange={(e) => setRxFormVitalsRbs(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chief Complaints & Clinical Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Chief Clinical Complaints
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High grade fever with chills for 3 days"
                    value={rxFormChiefComplaints}
                    onChange={(e) => setRxFormChiefComplaints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-teal-600 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Clinical Diagnosis *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acute Upper Respiratory Tract Infection"
                    value={rxFormDiagnosis}
                    onChange={(e) => setRxFormDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-teal-600 text-xs"
                  />
                </div>
              </div>

              {/* Medicines Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-bold text-teal-700">Rx</span>
                    <span className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                      Prescribed Medicines & Schedules
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRxMedicineRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 font-bold transition-all cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine Row
                  </button>
                </div>

                <div className="space-y-3">
                  {rxFormMedicines.map((med, index) => (
                    <div key={med.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-5 relative">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">
                            #{index + 1} Medicine Name & Strength
                          </label>
                          <input
                            type="text"
                            placeholder="Type medicine (e.g. Dolo 650, Augmentin)..."
                            value={med.name}
                            onChange={(e) => handleUpdateRxMedicineField(med.id, "name", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-teal-600 mt-1 text-xs"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Dosage</label>
                          <input
                            type="text"
                            placeholder="1 Tab"
                            value={med.dosage}
                            onChange={(e) => handleUpdateRxMedicineField(med.id, "dosage", e.target.value)}
                            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-teal-600 mt-1 text-xs"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Frequency</label>
                          <select
                            value={med.frequency}
                            onChange={(e) => handleUpdateRxMedicineField(med.id, "frequency", e.target.value)}
                            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-teal-600 mt-1 text-xs cursor-pointer"
                          >
                            <option value="1-0-1">1-0-1 (Twice daily)</option>
                            <option value="1-0-0">1-0-0 (Morning)</option>
                            <option value="0-0-1">0-0-1 (Bedtime)</option>
                            <option value="1-1-1">1-1-1 (Thrice daily)</option>
                            <option value="0-1-0">0-1-0 (Afternoon)</option>
                            <option value="SOS">SOS (As needed)</option>
                          </select>
                        </div>
                        <div className="md:col-span-1">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Days</label>
                          <input
                            type="text"
                            placeholder="5 Days"
                            value={med.duration}
                            onChange={(e) => handleUpdateRxMedicineField(med.id, "duration", e.target.value)}
                            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-teal-600 mt-1 text-xs"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Instructions</label>
                          <input
                            type="text"
                            placeholder="After food"
                            value={med.instructions}
                            onChange={(e) => handleUpdateRxMedicineField(med.id, "instructions", e.target.value)}
                            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-teal-600 mt-1 text-xs"
                          />
                        </div>
                      </div>
                      {rxFormMedicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRxMedicineRow(med.id)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Tests & Re-visit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Recommended Investigations / Lab Tests
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CBC, Widal, Chest X-Ray PA View"
                    value={rxFormLabTests}
                    onChange={(e) => setRxFormLabTests(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:bg-white focus:border-teal-600 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Re-visit / Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={rxFormFollowUpDate}
                    onChange={(e) => setRxFormFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-teal-600 text-xs cursor-pointer"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Special Dietary & Lifestyle Advice
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drink 3-4 Liters of warm water daily. Complete full antibiotic course."
                  value={rxFormNotes}
                  onChange={(e) => setRxFormNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-teal-600 text-xs"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPrescriptionModalAppt(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveModalPrescription("Issued", false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Save & Print
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveModalPrescription("Sent via WhatsApp", true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Save & Send WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
