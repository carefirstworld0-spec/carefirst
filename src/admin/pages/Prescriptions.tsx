import { useState, useEffect, useMemo } from "react";
import {
  ScrollText,
  Plus,
  Search,
  Calendar,
  Phone,
  Eye,
  Printer,
  Edit3,
  MessageCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronLeft,
  User,
  Trash2,
  Share2,
  Send,
  Info,
  Clock,
  Sparkles,
  Stethoscope,
  Pill,
  ShieldAlert,
  ArrowRight,
  Download,
  Building2,
  Activity,
  Heart,
  Thermometer,
  Weight,
  FlaskConical,
  Award,
  ShieldCheck,
  Check
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, update } from "firebase/database";

// --- Types ---
export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  qualification: string;
  department: string;
  regNo: string;
  signatureName: string;
}

export interface Prescription {
  id: string; // e.g. RX-0231
  uhid: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorQual: string;
  doctorReg: string;
  doctorDept: string;
  date: string;
  
  // Vitals
  vitalsBp?: string;
  vitalsPulse?: string;
  vitalsTemp?: string;
  vitalsWeight?: string;
  vitalsSpo2?: string;
  vitalsRbs?: string;

  // Clinical Data
  chiefComplaints?: string;
  diagnosis: string;
  medicines: Medicine[];
  labTests?: string;
  notes: string;
  followUpDate: string;
  
  // Clinic Header
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;

  whatsappSent: boolean;
  whatsappSentTo?: string;
  status: "Draft" | "Issued" | "Sent via WhatsApp";
  createdAt?: number;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

// Doctors Registry for CareFirst Clinic
const DOCTORS_LIST: DoctorProfile[] = [
  {
    id: "doc_1",
    name: "Dr. Rajesh Sharma",
    qualification: "MBBS, MD (General Medicine)",
    department: "General Medicine",
    regNo: "Reg. No: MMC-2014/08/3921",
    signatureName: "Dr. Rajesh Sharma"
  },
  {
    id: "doc_2",
    name: "Dr. Sunita Rao",
    qualification: "MBBS, DCH (Pediatrics)",
    department: "Pediatrics",
    regNo: "Reg. No: KMC-2016/04/1892",
    signatureName: "Dr. Sunita Rao"
  },
  {
    id: "doc_3",
    name: "Dr. Amit Patel",
    qualification: "MBBS, DM (Cardiology)",
    department: "Cardiology",
    regNo: "Reg. No: GMC-2010/02/1043",
    signatureName: "Dr. Amit Patel"
  },
  {
    id: "doc_4",
    name: "Dr. Ananya Roy",
    qualification: "MBBS, MD (Dermatology)",
    department: "Dermatology",
    regNo: "Reg. No: WBMC-2018/11/4501",
    signatureName: "Dr. Ananya Roy"
  },
  {
    id: "doc_5",
    name: "Dr. Vikram Joshi",
    qualification: "MBBS, MS (Orthopedics)",
    department: "Orthopedics",
    regNo: "Reg. No: MMC-2012/09/2810",
    signatureName: "Dr. Vikram Joshi"
  }
];

// Common Indian Medicine Database for Autocomplete
const COMMON_MEDICINES = [
  { name: "Paracetamol 650mg (Dolo 650)", defaultDosage: "1 Tab", defaultFreq: "1-0-1", defaultInst: "After food" },
  { name: "Amoxicillin + Clavulanate 625mg (Augmentin 625)", defaultDosage: "1 Tab", defaultFreq: "1-0-1", defaultInst: "After food" },
  { name: "Pantoprazole 40mg (Pan 40)", defaultDosage: "1 Tab", defaultFreq: "1-0-0", defaultInst: "Before food / Empty stomach" },
  { name: "Azithromycin 500mg (Azee 500)", defaultDosage: "1 Tab", defaultFreq: "1-0-0", defaultInst: "After food" },
  { name: "Metformin 500mg (Glycomet 500)", defaultDosage: "1 Tab", defaultFreq: "1-0-1", defaultInst: "With meals" },
  { name: "Cetirizine 10mg (Cetzine 10)", defaultDosage: "1 Tab", defaultFreq: "0-0-1", defaultInst: "At bedtime" },
  { name: "Telmisartan 40mg (Telma 40)", defaultDosage: "1 Tab", defaultFreq: "1-0-0", defaultInst: "Morning after food" },
  { name: "Montelukast 10mg + Levocetirizine 5mg (Monticope)", defaultDosage: "1 Tab", defaultFreq: "0-0-1", defaultInst: "At bedtime" },
  { name: "Ibuprofen 400mg (Brufen 400)", defaultDosage: "1 Tab", defaultFreq: "1-0-1", defaultInst: "After food" },
  { name: "Ondansetron 4mg (Vomitron 4)", defaultDosage: "1 Tab", defaultFreq: "SOS", defaultInst: "Before food if nauseous" },
  { name: "Rabeprazole 20mg (Rabeloc 20)", defaultDosage: "1 Tab", defaultFreq: "1-0-0", defaultInst: "Before breakfast" },
  { name: "Aspirin 75mg (Ecosprin 75)", defaultDosage: "1 Tab", defaultFreq: "0-1-0", defaultInst: "After lunch" },
  { name: "Warfarin 5mg", defaultDosage: "1 Tab", defaultFreq: "0-0-1", defaultInst: "At bedtime with water" },
  { name: "Ciprofloxacin 500mg (Cifran 500)", defaultDosage: "1 Tab", defaultFreq: "1-0-1", defaultInst: "After food" },
  { name: "Atorvastatin 10mg (Atorva 10)", defaultDosage: "1 Tab", defaultFreq: "0-0-1", defaultInst: "At bedtime" },
  { name: "ORS Electrolyte Powder Sachet", defaultDosage: "1 Sachet in 1L Water", defaultFreq: "SIP THROUGHOUT DAY", defaultInst: "As needed for dehydration" },
  { name: "Multivitamin + Zinc Capsule (Becosules)", defaultDosage: "1 Cap", defaultFreq: "0-1-0", defaultInst: "After meals" }
];

// Quick Chief Complaints
const QUICK_COMPLAINTS = [
  "High grade fever with chills & body ache for 3 days",
  "Persistent dry cough & sore throat for 4 days",
  "Severe epigastric pain & acidity after meals",
  "Acute headache, dizziness & nausea",
  "Breathlessness on exertion & chest heaviness",
  "Frequent watery stools & vomiting for 2 days"
];

// Quick Diagnoses
const QUICK_DIAGNOSES = [
  "Acute Upper Respiratory Tract Infection (URTI)",
  "Acute Gastroenteritis with Mild Dehydration",
  "Essential Hypertension (Stage 1)",
  "Type 2 Diabetes Mellitus (Uncontrolled)",
  "Viral Fever with Myalgia",
  "Allergic Rhinitis & Bronchial Hyperresponsiveness",
  "Gastritis & Acid Peptic Disease",
  "Migraine Headache",
  "Acute Tonsillopharyngitis"
];

// Quick Lab Tests
const QUICK_LAB_TESTS = [
  "Complete Blood Count (CBC) & ESR",
  "Widal Test & Dengue NS1 Antigen",
  "Chest X-Ray PA View",
  "HbA1c & Fasting Blood Sugar (FBS)",
  "Lipid Profile & Renal Function Test (RFT)",
  "ECG 12-Lead Standard",
  "Serum Electrolytes (Na+, K+, Cl-)",
  "Urine Routine & Microscopy"
];

// Quick Dietary & Patient Advice
const QUICK_ADVICE = [
  "Drink 3-4 Liters of warm water daily.",
  "Complete the full 5-day antibiotic course without skipping.",
  "Avoid cold drinks, fried & spicy foods.",
  "Take strict bed rest for 3 days.",
  "Monitor Blood Pressure & Blood Sugar twice daily.",
  "Seek immediate emergency care if fever exceeds 102°F or breathlessness occurs."
];

// Known Drug Interactions Database
const DRUG_INTERACTIONS: { medA: string; medB: string; warning: string }[] = [
  {
    medA: "Aspirin",
    medB: "Warfarin",
    warning: "Severe Bleeding Risk: Combining Antiplatelet (Aspirin) with Anticoagulant (Warfarin) significantly increases hemorrhage risk."
  },
  {
    medA: "Ibuprofen",
    medB: "Aspirin",
    warning: "NSAID Conflict: Ibuprofen interferes with Aspirin's cardio-protective effect and increases gastric ulceration risk."
  },
  {
    medA: "Ciprofloxacin",
    medB: "Pantoprazole",
    warning: "Absorption Reduced: PPIs/Antacids impair oral bioavailability of Ciprofloxacin."
  },
  {
    medA: "Paracetamol",
    medB: "Ibuprofen",
    warning: "Duplicate Analgesic Dosing: Monitor daily renal & hepatic clearance when co-prescribing multiple NSAIDs/analgesics."
  },
  {
    medA: "Metformin",
    medB: "Contrast",
    warning: "Lactic Acidosis Caution: Discontinue Metformin prior to intravascular iodinated contrast procedure."
  }
];

// Initial Mock Prescriptions
const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: "RX-0231",
    uhid: "CF982310",
    patientName: "Rahul Verma",
    patientAge: "34",
    patientGender: "Male",
    patientPhone: "+91 98765 43210",
    doctorId: "doc_1",
    doctorName: "Dr. Rajesh Sharma",
    doctorQual: "MBBS, MD (General Medicine)",
    doctorReg: "Reg. No: MMC-2014/08/3921",
    doctorDept: "General Medicine",
    date: new Date().toISOString().split("T")[0],
    vitalsBp: "120/80 mmHg",
    vitalsPulse: "78 bpm",
    vitalsTemp: "99.2 °F",
    vitalsWeight: "68 kg",
    vitalsSpo2: "98%",
    vitalsRbs: "110 mg/dL",
    chiefComplaints: "High grade fever with chills & severe throat pain for 3 days.",
    diagnosis: "Acute Upper Respiratory Tract Infection with High Fever",
    medicines: [
      { id: "m1", name: "Paracetamol 650mg (Dolo 650)", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" },
      { id: "m2", name: "Amoxicillin + Clavulanate 625mg (Augmentin 625)", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" },
      { id: "m3", name: "Pantoprazole 40mg (Pan 40)", dosage: "1 Tab", frequency: "1-0-0", duration: "5 Days", instructions: "Before food" }
    ],
    labTests: "Complete Blood Count (CBC) & ESR, Chest X-Ray PA View",
    notes: "Drink 3-4 Liters of warm water daily. Complete full 5-day antibiotic course.",
    followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    clinicName: "CAREFIRST MULTISPECIALTY CLINIC & HOSPITAL",
    clinicAddress: "102 Healthcare Tower, MG Road, Mumbai, Maharashtra 400001",
    clinicPhone: "+91 98765 43210 / 022-2894-1100",
    whatsappSent: true,
    whatsappSentTo: "+91 98765 43210",
    status: "Sent via WhatsApp",
    createdAt: Date.now() - 3600000
  },
  {
    id: "RX-0230",
    uhid: "CF847291",
    patientName: "Priya Patel",
    patientAge: "28",
    patientGender: "Female",
    patientPhone: "+91 98123 45678",
    doctorId: "doc_2",
    doctorName: "Dr. Sunita Rao",
    doctorQual: "MBBS, DCH (Pediatrics)",
    doctorReg: "Reg. No: KMC-2016/04/1892",
    doctorDept: "Pediatrics",
    date: new Date().toISOString().split("T")[0],
    vitalsBp: "110/70 mmHg",
    vitalsPulse: "82 bpm",
    vitalsTemp: "98.4 °F",
    vitalsWeight: "54 kg",
    vitalsSpo2: "99%",
    chiefComplaints: "Runny nose, sneezing & dry nocturnal cough for 5 days.",
    diagnosis: "Allergic Rhinitis & Dry Cough",
    medicines: [
      { id: "m1", name: "Montelukast 10mg + Levocetirizine 5mg (Monticope)", dosage: "1 Tab", frequency: "0-0-1", duration: "7 Days", instructions: "At bedtime" },
      { id: "m2", name: "Pantoprazole 40mg (Pan 40)", dosage: "1 Tab", frequency: "1-0-0", duration: "7 Days", instructions: "Before food" }
    ],
    notes: "Avoid cold drinks and ice cream. Steam inhalation twice daily.",
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    clinicName: "CAREFIRST MULTISPECIALTY CLINIC & HOSPITAL",
    clinicAddress: "102 Healthcare Tower, MG Road, Mumbai, Maharashtra 400001",
    clinicPhone: "+91 98765 43210 / 022-2894-1100",
    whatsappSent: false,
    status: "Issued",
    createdAt: Date.now() - 7200000
  },
  {
    id: "RX-0229",
    uhid: "CF739102",
    patientName: "Amitabh Singh",
    patientAge: "52",
    patientGender: "Male",
    patientPhone: "+91 99887 76655",
    doctorId: "doc_3",
    doctorName: "Dr. Amit Patel",
    doctorQual: "MBBS, DM (Cardiology)",
    doctorReg: "Reg. No: GMC-2010/02/1043",
    doctorDept: "Cardiology",
    date: new Date().toISOString().split("T")[0],
    vitalsBp: "148/92 mmHg",
    vitalsPulse: "74 bpm",
    vitalsTemp: "98.6 °F",
    vitalsWeight: "81 kg",
    vitalsSpo2: "97%",
    vitalsRbs: "145 mg/dL",
    chiefComplaints: "Occasional mild headache & fatigue after exertion.",
    diagnosis: "Essential Hypertension Stage 1 & Dyslipidemia",
    medicines: [
      { id: "m1", name: "Telmisartan 40mg (Telma 40)", dosage: "1 Tab", frequency: "1-0-0", duration: "30 Days", instructions: "Morning after food" },
      { id: "m2", name: "Atorvastatin 10mg (Atorva 10)", dosage: "1 Tab", frequency: "0-0-1", duration: "30 Days", instructions: "At bedtime" }
    ],
    labTests: "Lipid Profile & Serum Creatinine, ECG 12-Lead Standard",
    notes: "Low salt diet (< 2g/day). 30 mins brisk walking daily. Re-check BP weekly.",
    followUpDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    clinicName: "CAREFIRST MULTISPECIALTY CLINIC & HOSPITAL",
    clinicAddress: "102 Healthcare Tower, MG Road, Mumbai, Maharashtra 400001",
    clinicPhone: "+91 98765 43210 / 022-2894-1100",
    whatsappSent: true,
    whatsappSentTo: "+91 99887 76655",
    status: "Sent via WhatsApp",
    createdAt: Date.now() - 86400000
  }
];

export function Prescriptions() {
  // --- Core View & Data State ---
  const [view, setView] = useState<"list" | "generator" | "view">("list");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);

  // --- Real Patients & Doctors Firebase Data State ---
  const [realPatients, setRealPatients] = useState<any[]>([]);
  const [realDoctors, setRealDoctors] = useState<DoctorProfile[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // --- Search & Filtering ---
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // --- WhatsApp Dialog Modal State ---
  const [whatsappModalRx, setWhatsappModalRx] = useState<Prescription | null>(null);
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState("");

  // --- Toast Notifications ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --- Generator Form State ---
  const [editingRxId, setEditingRxId] = useState<string | null>(null);
  const [formUhid, setFormUhid] = useState("CF" + Math.floor(100000 + Math.random() * 900000));
  const [formPatientName, setFormPatientName] = useState("");
  const [formPatientAge, setFormPatientAge] = useState("");
  const [formPatientGender, setFormPatientGender] = useState("Male");
  const [formPatientPhone, setFormPatientPhone] = useState("");
  
  // Doctor Selection (Dynamic Real Doctors + Fallback)
  const [selectedDoctorId, setSelectedDoctorId] = useState("doc_1");

  // Merge real doctors from Firebase with DOCTORS_LIST fallback
  const availableDoctors = useMemo(() => {
    if (realDoctors.length > 0) {
      const combined = [...realDoctors];
      DOCTORS_LIST.forEach((d) => {
        if (!combined.some((cd) => cd.id === d.id || cd.name === d.name)) {
          combined.push(d);
        }
      });
      return combined;
    }
    return DOCTORS_LIST;
  }, [realDoctors]);

  const currentDoctorProfile = useMemo(() => {
    return availableDoctors.find((d) => d.id === selectedDoctorId) || availableDoctors[0];
  }, [selectedDoctorId, availableDoctors]);

  const [formDate, setFormDate] = useState(todayStr);
  
  // Clinic Details
  const [formClinicName, setFormClinicName] = useState("CAREFIRST MULTISPECIALTY CLINIC & HOSPITAL");
  const [formClinicAddress, setFormClinicAddress] = useState("102 Healthcare Tower, MG Road, Mumbai, Maharashtra 400001");
  const [formClinicPhone, setFormClinicPhone] = useState("+91 98765 43210 / 022-2894-1100");

  // Vitals (Blank by default so no fake values are pre-filled)
  const [formVitalsBp, setFormVitalsBp] = useState("");
  const [formVitalsPulse, setFormVitalsPulse] = useState("");
  const [formVitalsTemp, setFormVitalsTemp] = useState("");
  const [formVitalsWeight, setFormVitalsWeight] = useState("");
  const [formVitalsSpo2, setFormVitalsSpo2] = useState("");
  const [formVitalsRbs, setFormVitalsRbs] = useState("");

  // Clinical Content
  const [formChiefComplaints, setFormChiefComplaints] = useState("");
  const [formDiagnosis, setFormDiagnosis] = useState("");
  const [formMedicines, setFormMedicines] = useState<Medicine[]>([
    { id: "1", name: "", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" }
  ]);
  const [formLabTests, setFormLabTests] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formFollowUpDate, setFormFollowUpDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );

  const [showMedDropdown, setShowMedDropdown] = useState<{ [key: string]: boolean }>({});

  // View Mode Selected Prescription
  const [viewRx, setViewRx] = useState<Prescription | null>(null);

  // --- Fetch Real Patients & Real Doctors from Firebase ---
  useEffect(() => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) return;

    // Fetch Patients index for real patient search / auto-fill
    const patientIndexRef = ref(db, `carefirst/users/${clinicKey}/patient_index`);
    const unsubPatients = onValue(patientIndexRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
        setRealPatients(list);
      } else {
        // Fallback check on full patients node
        const legacyRef = ref(db, `carefirst/users/${clinicKey}/patients`);
        onValue(
          legacyRef,
          (legSnap) => {
            if (legSnap.exists()) {
              const data = legSnap.val();
              const list = Object.keys(data).map((k) => {
                const item = data[k];
                return {
                  id: k,
                  uhid: item.identity?.uhid || "",
                  name: item.identity?.name || "",
                  age: item.identity?.age || "",
                  gender: item.identity?.gender || "Male",
                  mobile: item.contact?.mobile || "",
                };
              });
              setRealPatients(list);
            }
          },
          { onlyOnce: true }
        );
      }
    });

    // Fetch Doctors list from Firebase
    const docsRef = ref(db, `carefirst/users/${clinicKey}/doctors`);
    const unsubDocs = onValue(docsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: DoctorProfile[] = Object.keys(data).map((k) => ({
          id: k,
          name: data[k].name || "Doctor",
          qualification: data[k].qualification || "MBBS",
          department: data[k].department || "General Medicine",
          regNo: data[k].regNo || "Reg. No: MMC-2024",
          signatureName: data[k].name || "Doctor",
        }));
        setRealDoctors(list);
      }
    });

    return () => {
      unsubPatients();
      unsubDocs();
    };
  }, []);

  // --- Firebase Prescriptions Sync ---
  useEffect(() => {
    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) {
      setPrescriptions(MOCK_PRESCRIPTIONS);
      return;
    }

    const rxRef = ref(db, `carefirst/users/${clinicKey}/prescriptions`);
    const unsub = onValue(
      rxRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list: Prescription[] = Object.keys(data).map((k) => ({
            id: k,
            ...data[k]
          }));
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setPrescriptions(list);
        } else {
          // Empty array for real clinic when no prescriptions are saved yet
          setPrescriptions([]);
        }
      },
      (err) => {
        console.error("Firebase prescriptions error:", err);
        setPrescriptions([]);
      }
    );

    return () => unsub();
  }, []);

  // --- Filter real patients for autocomplete dropdown ---
  const filteredRealPatients = useMemo(() => {
    if (!formPatientName.trim()) return realPatients.slice(0, 6);
    const q = formPatientName.toLowerCase();
    return realPatients.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        (p.mobile && p.mobile.includes(q))
    ).slice(0, 8);
  }, [formPatientName, realPatients]);

  const handleSelectPatient = (p: any) => {
    setFormPatientName(p.name || "");
    if (p.uhid) setFormUhid(p.uhid);
    if (p.age) setFormPatientAge(p.age);
    if (p.gender) setFormPatientGender(p.gender);
    if (p.mobile) setFormPatientPhone(p.mobile);
    setShowPatientDropdown(false);
  };

  // --- Compute Drug Interactions Live ---
  const activeDrugInteractions = useMemo(() => {
    const warnings: string[] = [];
    const medNames = formMedicines.map((m) => m.name.toLowerCase());

    DRUG_INTERACTIONS.forEach((rule) => {
      const hasA = medNames.some((n) => n.includes(rule.medA.toLowerCase()));
      const hasB = medNames.some((n) => n.includes(rule.medB.toLowerCase()));

      if (hasA && hasB) {
        warnings.push(rule.warning);
      }
    });

    return warnings;
  }, [formMedicines]);

  // --- Filtered Prescriptions ---
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      if (selectedDate && rx.date !== selectedDate) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rx.patientName.toLowerCase().includes(q);
        const matchesPhone = rx.patientPhone.includes(q);
        const matchesId = rx.id.toLowerCase().includes(q);
        const matchesUhid = rx.uhid.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesId && !matchesUhid) {
          return false;
        }
      }
      return true;
    });
  }, [prescriptions, selectedDate, searchQuery]);

  // Paginated List
  const totalPages = Math.ceil(filteredPrescriptions.length / pageSize) || 1;
  const paginatedPrescriptions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPrescriptions.slice(start, start + pageSize);
  }, [filteredPrescriptions, currentPage, pageSize]);

  // Stats Summary
  const todayCount = prescriptions.filter((r) => r.date === todayStr).length;
  const sentWhatsappCount = prescriptions.filter((r) => r.whatsappSent).length;
  const pendingCount = prescriptions.length - sentWhatsappCount;

  // Reset Generator Form for a Clean New Prescription
  const handleOpenNewGenerator = () => {
    setEditingRxId(null);
    setFormUhid("CF" + Math.floor(100000 + Math.random() * 900000));
    setFormPatientName("");
    setFormPatientAge("");
    setFormPatientGender("Male");
    setFormPatientPhone("");
    setShowPatientDropdown(false);
    setSelectedDoctorId(availableDoctors[0]?.id || "doc_1");
    setFormDate(todayStr);

    // Clean blank vitals (no fake pre-filled numbers)
    setFormVitalsBp("");
    setFormVitalsPulse("");
    setFormVitalsTemp("");
    setFormVitalsWeight("");
    setFormVitalsSpo2("");
    setFormVitalsRbs("");

    setFormChiefComplaints("");
    setFormDiagnosis("");
    // 1 empty medicine row ready for input
    setFormMedicines([
      { id: "1", name: "", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" }
    ]);
    setFormLabTests("");
    setFormNotes("");
    setFormFollowUpDate(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
    setView("generator");
  };

  const handleEditRx = (rx: Prescription) => {
    setEditingRxId(rx.id);
    setFormUhid(rx.uhid);
    setFormPatientName(rx.patientName);
    setFormPatientAge(rx.patientAge);
    setFormPatientGender(rx.patientGender);
    setFormPatientPhone(rx.patientPhone);
    setSelectedDoctorId(rx.doctorId || "doc_1");
    setFormDate(rx.date);
    setFormVitalsBp(rx.vitalsBp || "120/80 mmHg");
    setFormVitalsPulse(rx.vitalsPulse || "78 bpm");
    setFormVitalsTemp(rx.vitalsTemp || "98.6 °F");
    setFormVitalsWeight(rx.vitalsWeight || "68 kg");
    setFormVitalsSpo2(rx.vitalsSpo2 || "98%");
    setFormVitalsRbs(rx.vitalsRbs || "110 mg/dL");
    setFormChiefComplaints(rx.chiefComplaints || "");
    setFormDiagnosis(rx.diagnosis);
    setFormMedicines(rx.medicines && rx.medicines.length > 0 ? rx.medicines : [
      { id: "1", name: "Paracetamol 650mg (Dolo 650)", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" }
    ]);
    setFormLabTests(rx.labTests || "");
    setFormNotes(rx.notes || "");
    setFormFollowUpDate(rx.followUpDate || "");
    if (rx.clinicName) setFormClinicName(rx.clinicName);
    if (rx.clinicAddress) setFormClinicAddress(rx.clinicAddress);
    if (rx.clinicPhone) setFormClinicPhone(rx.clinicPhone);
    setView("generator");
  };

  const handleViewRx = (rx: Prescription) => {
    setViewRx(rx);
    setView("view");
  };

  // Medicine Form Row Handlers
  const handleAddMedicineRow = () => {
    const newMed: Medicine = {
      id: Math.random().toString(36).substring(2, 9),
      name: "",
      dosage: "1 Tab",
      frequency: "1-0-1",
      duration: "5 Days",
      instructions: "After food"
    };
    setFormMedicines((prev) => [...prev, newMed]);
  };

  const handleRemoveMedicineRow = (id: string) => {
    if (formMedicines.length === 1) return;
    setFormMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMedicineField = (id: string, field: keyof Medicine, value: string) => {
    setFormMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Save Prescription (Local State + Firebase)
  const handleSavePrescription = async (targetStatus: "Draft" | "Issued" | "Sent via WhatsApp" = "Issued", autoWhatsApp: boolean = false) => {
    if (!formPatientName.trim()) {
      addToast("Validation Error", "Please enter patient name", "error");
      return null;
    }
    if (!formDiagnosis.trim()) {
      addToast("Validation Error", "Please enter diagnosis", "error");
      return null;
    }

    const rxId = editingRxId || `RX-${Math.floor(1000 + Math.random() * 9000)}`;
    const doc = currentDoctorProfile;

    const newRx: Prescription = {
      id: rxId,
      uhid: formUhid,
      patientName: formPatientName.trim(),
      patientAge: formPatientAge.trim() || "30",
      patientGender: formPatientGender,
      patientPhone: formPatientPhone.trim() || "+91 98765 43210",
      doctorId: doc.id,
      doctorName: doc.name,
      doctorQual: doc.qualification,
      doctorReg: doc.regNo,
      doctorDept: doc.department,
      date: formDate,
      vitalsBp: formVitalsBp.trim(),
      vitalsPulse: formVitalsPulse.trim(),
      vitalsTemp: formVitalsTemp.trim(),
      vitalsWeight: formVitalsWeight.trim(),
      vitalsSpo2: formVitalsSpo2.trim(),
      vitalsRbs: formVitalsRbs.trim(),
      chiefComplaints: formChiefComplaints.trim(),
      diagnosis: formDiagnosis.trim(),
      medicines: formMedicines.filter((m) => m.name.trim() !== ""),
      labTests: formLabTests.trim(),
      notes: formNotes.trim(),
      followUpDate: formFollowUpDate,
      clinicName: formClinicName,
      clinicAddress: formClinicAddress,
      clinicPhone: formClinicPhone,
      whatsappSent: autoWhatsApp || targetStatus === "Sent via WhatsApp",
      whatsappSentTo: autoWhatsApp ? formPatientPhone.trim() || "+91 98765 43210" : undefined,
      status: targetStatus,
      createdAt: Date.now()
    };

    // Instant local state update
    setPrescriptions((prev) => {
      const idx = prev.findIndex((p) => p.id === rxId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newRx;
        return copy;
      }
      return [newRx, ...prev];
    });

    // Firebase Sync
    const clinicKey = localStorage.getItem("user_clinic");
    if (clinicKey) {
      try {
        const rxRef = ref(db, `carefirst/users/${clinicKey}/prescriptions/${rxId}`);
        await set(rxRef, newRx);
      } catch (err) {
        console.error("Firebase prescription save error:", err);
      }
    }

    return newRx;
  };

  // Action: Save & Print
  const handleSaveAndPrint = async () => {
    const saved = await handleSavePrescription("Issued");
    if (saved) {
      addToast("Prescription Saved", `Prescription ${saved.id} ready for printing.`, "success");
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  // Action: Save & Send WhatsApp
  const handleSaveAndSendWhatsApp = async () => {
    const saved = await handleSavePrescription("Sent via WhatsApp", true);
    if (saved) {
      const phone = saved.patientPhone || "+91 98765 43210";
      const text = encodeURIComponent(
        `Hello ${saved.patientName}, your official E-Prescription (${saved.id}) from ${saved.doctorName} at ${saved.clinicName || "CareFirst Clinic"} is ready.\n\nDiagnosis: ${saved.diagnosis}\nFollow-up Date: ${saved.followUpDate}\n\nGet well soon!`
      );
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=${text}`;

      addToast("Prescription Sent!", `Prescription sent to ${phone} via WhatsApp`, "success");
      window.open(waUrl, "_blank");
      setView("list");
    }
  };

  // WhatsApp Trigger Row Click
  const handleTriggerWhatsAppRow = (rx: Prescription) => {
    if (rx.patientPhone && rx.patientPhone.replace(/[^0-9]/g, "").length >= 10) {
      const phone = rx.patientPhone;
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const text = encodeURIComponent(
        `Hello ${rx.patientName}, your E-Prescription (${rx.id}) from ${rx.doctorName} at CareFirst Clinic is ready.\n\nDiagnosis: ${rx.diagnosis}\n\nGet well soon!`
      );
      const waUrl = `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=${text}`;

      setPrescriptions((prev) =>
        prev.map((p) =>
          p.id === rx.id ? { ...p, whatsappSent: true, whatsappSentTo: phone, status: "Sent via WhatsApp" } : p
        )
      );

      const clinicKey = localStorage.getItem("user_clinic");
      if (clinicKey) {
        const rxRef = ref(db, `carefirst/users/${clinicKey}/prescriptions/${rx.id}`);
        update(rxRef, { whatsappSent: true, whatsappSentTo: phone, status: "Sent via WhatsApp" });
      }

      addToast("Prescription Sent!", `Prescription ${rx.id} sent to ${phone}`, "success");
      window.open(waUrl, "_blank");
    } else {
      setWhatsappModalRx(rx);
      setWhatsappPhoneInput(rx.patientPhone || "");
    }
  };

  const handleConfirmWhatsAppModal = () => {
    if (!whatsappModalRx) return;
    if (!whatsappPhoneInput.trim()) {
      addToast("Required", "Please enter valid mobile number", "error");
      return;
    }

    const rx = whatsappModalRx;
    const phone = whatsappPhoneInput.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${rx.patientName}, your E-Prescription (${rx.id}) from ${rx.doctorName} is available.\n\nDiagnosis: ${rx.diagnosis}\n\nCareFirst Hospital & Clinic`
    );
    const waUrl = `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=${text}`;

    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === rx.id ? { ...p, patientPhone: phone, whatsappSent: true, whatsappSentTo: phone, status: "Sent via WhatsApp" } : p
      )
    );

    const clinicKey = localStorage.getItem("user_clinic");
    if (clinicKey) {
      const rxRef = ref(db, `carefirst/users/${clinicKey}/prescriptions/${rx.id}`);
      update(rxRef, { patientPhone: phone, whatsappSent: true, whatsappSentTo: phone, status: "Sent via WhatsApp" });
    }

    addToast("Prescription Sent!", `Prescription ${rx.id} sent to ${phone}`, "success");
    setWhatsappModalRx(null);
    setWhatsappPhoneInput("");
    window.open(waUrl, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans">
      {/* Toast Notification Bar */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
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
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
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
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Inline WhatsApp Phone Modal */}
      {whatsappModalRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 no-print">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <MessageCircle className="w-5 h-5 fill-emerald-600 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Send on WhatsApp</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Prescription {whatsappModalRx.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappModalRx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Enter WhatsApp registered mobile number for{" "}
                <strong className="text-slate-900">{whatsappModalRx.patientName}</strong>:
              </p>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={whatsappPhoneInput}
                  onChange={(e) => setWhatsappPhoneInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setWhatsappModalRx(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWhatsAppModal}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 1: PRESCRIPTION LIST (TABLE VIEW) */}
      {/* ========================================================================= */}
      {view === "list" && (
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Bar Header */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                  Prescriptions
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Generate, print & send OPD e-prescriptions to patients via WhatsApp.
                </p>
              </div>

              {/* Date Filter */}
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
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="ml-2 text-slate-400 hover:text-slate-600"
                    title="Clear Date Filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Search & Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, phone, RX ID..."
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

              <button
                onClick={handleOpenNewGenerator}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#094db2] active:scale-95 text-white text-xs font-bold shadow-sm shadow-[#0B5ED7]/30 hover:shadow-md transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Prescription</span>
              </button>
            </div>
          </header>

          {/* Summary Stats Row */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Prescriptions
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-display">
                  {prescriptions.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B5ED7] flex items-center justify-center shrink-0">
                <ScrollText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Sent on WhatsApp
                </p>
                <h3 className="text-2xl font-extrabold text-emerald-900 mt-1 font-display">
                  {sentWhatsappCount}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Pending / Printed
                </p>
                <h3 className="text-2xl font-extrabold text-amber-900 mt-1 font-display">
                  {pendingCount}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                  Issued Today
                </p>
                <h3 className="text-2xl font-extrabold text-teal-900 mt-1 font-display">
                  {todayCount}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </section>

          {/* Prescription Table Card */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4 font-extrabold text-slate-700">Rx Code</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-700">Patient Details</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-700">Attending Doctor</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-700">Date</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-700">Diagnosis</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-700 text-center">
                      WhatsApp
                    </th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-700 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedPrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <ScrollText className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                        <p className="font-bold text-slate-700 text-sm">No Prescriptions Found</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Try adjusting search query or date filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPrescriptions.map((rx) => (
                      <tr
                        key={rx.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono font-extrabold text-[#0B5ED7] whitespace-nowrap">
                          <span className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                            {rx.id}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-[#0B5ED7] transition-colors">
                            {rx.patientName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                            <span>UHID: {rx.uhid}</span>
                            <span>•</span>
                            <span>{rx.patientAge} yrs, {rx.patientGender}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                          <div className="font-bold text-slate-900">{rx.doctorName}</div>
                          <div className="text-[10px] text-slate-500">{rx.doctorQual}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                          {rx.date}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="truncate font-semibold text-slate-800" title={rx.diagnosis}>
                            {rx.diagnosis}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {rx.medicines ? `${rx.medicines.length} Medicines Prescribed` : "0 Medicines"}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {rx.whatsappSent ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              Not Sent
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewRx(rx)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#0B5ED7] hover:bg-blue-50 transition-colors cursor-pointer"
                              title="View Printable Prescription"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                handleViewRx(rx);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Print Prescription Letterhead"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleEditRx(rx)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Edit Prescription"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleTriggerWhatsAppRow(rx)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 bg-emerald-50 transition-colors cursor-pointer ml-1"
                              title="Send on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
                <span>
                  Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-50 hover:bg-slate-100 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-50 hover:bg-slate-100 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: PRESCRIPTION GENERATOR (MODAL POPUP OVERLAY - NO OVERLAP) */}
      {/* ========================================================================= */}
      {(view === "generator" || view === "view") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print">
          <div className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Top Header (Fixed - No Overlap!) */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Prescriptions
                </button>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <span>{view === "view" ? "View E-Prescription" : editingRxId ? "Edit E-Prescription" : "Prescription Generator"}</span>
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-blue-50 text-[#0B5ED7] border border-blue-200">
                      {view === "view" && viewRx ? viewRx.id : editingRxId || "NEW RX"}
                    </span>
                  </h2>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {view === "view" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Print Prescription
                    </button>
                    {viewRx && (
                      <button
                        type="button"
                        onClick={() => handleTriggerWhatsAppRow(viewRx)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white text-emerald-600" /> Send on WhatsApp
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSavePrescription("Draft")}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndPrint}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Save & Print
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndSendWhatsApp}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-emerald-600" /> Save & Send WhatsApp
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors ml-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Modal Body (Scrollable Container) */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl w-full mx-auto">
              {view === "generator" ? (
                /* ========================================================================= */
                /* CLEAN, NEAT, UNCLUTTERED E-PRESCRIPTION FORM (GENERATOR MODE) */
                /* ========================================================================= */
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-8 space-y-6">
                  
                  {/* 1. PATIENT & DOCTOR SELECTION CARD */}
                  <div className="bg-gradient-to-r from-blue-50/80 to-slate-50 p-4 sm:p-5 rounded-xl border border-blue-100 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0B5ED7] text-white flex items-center justify-center font-bold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">Patient & Doctor Information</h3>
                          <p className="text-[11px] text-slate-500 font-medium">Select registered patient to auto-fill details</p>
                        </div>
                      </div>

                      {/* Select Registered Patient Quick Dropdown */}
                      {realPatients.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600 hidden sm:inline">Registered Patient:</span>
                          <select
                            onChange={(e) => {
                              const pt = realPatients.find((p) => (p.id || p.uhid) === e.target.value);
                              if (pt) handleSelectPatient(pt);
                            }}
                            defaultValue=""
                            className="px-3 py-1.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-[#0B5ED7] outline-none shadow-xs cursor-pointer hover:border-[#0B5ED7]"
                          >
                            <option value="" disabled>-- Select Patient to Auto-Fill --</option>
                            {realPatients.map((pt) => (
                              <option key={pt.id || pt.uhid} value={pt.id || pt.uhid}>
                                {pt.name} ({pt.uhid || pt.mobile})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {/* Patient Name */}
                      <div className="relative md:col-span-1">
                        <label className="font-bold text-slate-700 block mb-1">Patient Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={formPatientName}
                          onChange={(e) => {
                            setFormPatientName(e.target.value);
                            setShowPatientDropdown(true);
                          }}
                          onFocus={() => setShowPatientDropdown(true)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0B5ED7]"
                        />

                        {/* Registered Patient Autocomplete List */}
                        {showPatientDropdown && filteredRealPatients.length > 0 && (
                          <div className="absolute left-0 right-0 top-full z-40 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                            <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                              <span>Click to Auto-Fill</span>
                              <button
                                type="button"
                                onClick={() => setShowPatientDropdown(false)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            {filteredRealPatients.map((pt) => (
                              <button
                                key={pt.id || pt.uhid}
                                type="button"
                                onClick={() => handleSelectPatient(pt)}
                                className="w-full text-left p-2 hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">{pt.name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    UHID: {pt.uhid} • {pt.age ? `${pt.age} yrs` : ""} • {pt.gender}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Age & Gender */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Age & Gender *</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Age"
                            value={formPatientAge}
                            onChange={(e) => setFormPatientAge(e.target.value)}
                            className="w-16 px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#0B5ED7]"
                          />
                          <select
                            value={formPatientGender}
                            onChange={(e) => setFormPatientGender(e.target.value)}
                            className="flex-1 px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#0B5ED7] cursor-pointer"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">WhatsApp Phone *</label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          value={formPatientPhone}
                          onChange={(e) => setFormPatientPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#0B5ED7]"
                        />
                      </div>

                      {/* Attending Doctor */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Attending Doctor *</label>
                        <select
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0B5ED7] cursor-pointer"
                        >
                          {availableDoctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name} ({doc.department})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Compact Vitals Row */}
                    <div className="pt-2 border-t border-blue-200/60">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Physical Vitals (Optional):
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                        <div>
                          <input
                            type="text"
                            placeholder="BP (120/80)"
                            value={formVitalsBp}
                            onChange={(e) => setFormVitalsBp(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#0B5ED7]"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Pulse (78 bpm)"
                            value={formVitalsPulse}
                            onChange={(e) => setFormVitalsPulse(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#0B5ED7]"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Temp (98.6°F)"
                            value={formVitalsTemp}
                            onChange={(e) => setFormVitalsTemp(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#0B5ED7]"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Weight (68 kg)"
                            value={formVitalsWeight}
                            onChange={(e) => setFormVitalsWeight(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#0B5ED7]"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="SpO2 (98%)"
                            value={formVitalsSpo2}
                            onChange={(e) => setFormVitalsSpo2(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#0B5ED7]"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Sugar (110 mg/dL)"
                            value={formVitalsRbs}
                            onChange={(e) => setFormVitalsRbs(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#0B5ED7]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. CLINICAL DIAGNOSIS & COMPLAINTS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Diagnosis */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                        Clinical Diagnosis *
                      </label>
                      <input
                        type="text"
                        list="quick-diagnoses-list"
                        placeholder="Type diagnosis or choose from list..."
                        value={formDiagnosis}
                        onChange={(e) => setFormDiagnosis(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-[#0B5ED7] text-xs shadow-2xs"
                      />
                      <datalist id="quick-diagnoses-list">
                        {QUICK_DIAGNOSES.map((diag, i) => (
                          <option key={i} value={diag} />
                        ))}
                      </datalist>
                    </div>

                    {/* Chief Complaints */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                        Chief Complaints
                      </label>
                      <input
                        type="text"
                        list="quick-complaints-list"
                        placeholder="Type complaints or choose from list..."
                        value={formChiefComplaints}
                        onChange={(e) => setFormChiefComplaints(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-[#0B5ED7] text-xs shadow-2xs"
                      />
                      <datalist id="quick-complaints-list">
                        {QUICK_COMPLAINTS.map((comp, i) => (
                          <option key={i} value={comp} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Drug Interaction Warning */}
                  {activeDrugInteractions.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                      <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Drug Interaction Warning Detected</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-800 font-medium">
                        {activeDrugInteractions.map((warn, i) => (
                          <li key={i}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. PRESCRIBED MEDICINES TABLE (SLEEK SINGLE-ROW UI) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-serif font-bold text-[#0B5ED7]">Rx</span>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          Prescribed Medicines & Schedule
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMedicineRow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0B5ED7] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-4 h-4" /> Add Medicine Row
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {formMedicines.map((med, index) => (
                        <div
                          key={med.id}
                          className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl relative group hover:border-blue-200 transition-colors"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs items-center">
                            
                            {/* Medicine Name & Strength (Single Input with Autocomplete Datalist) */}
                            <div className="md:col-span-4 space-y-1">
                              <label className="font-bold text-slate-600 text-[10px] uppercase block">
                                #{index + 1} Medicine Name & Strength *
                              </label>
                              <input
                                type="text"
                                list={`med-datalist-${med.id}`}
                                placeholder="Type or select medicine..."
                                value={med.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateMedicineField(med.id, "name", val);
                                  const match = COMMON_MEDICINES.find((m) => m.name.toLowerCase() === val.toLowerCase());
                                  if (match) {
                                    handleUpdateMedicineField(med.id, "dosage", match.defaultDosage);
                                    handleUpdateMedicineField(med.id, "frequency", match.defaultFreq);
                                    handleUpdateMedicineField(med.id, "instructions", match.defaultInst);
                                    if (!med.duration) handleUpdateMedicineField(med.id, "duration", "5 Days");
                                  }
                                }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0B5ED7] text-xs shadow-2xs"
                              />
                              <datalist id={`med-datalist-${med.id}`}>
                                {COMMON_MEDICINES.map((item, idx) => (
                                  <option key={idx} value={item.name} />
                                ))}
                              </datalist>
                            </div>

                            {/* Dosage (Single Clean Dropdown) */}
                            <div className="md:col-span-2 space-y-1">
                              <label className="font-bold text-slate-600 text-[10px] uppercase block">
                                Dosage
                              </label>
                              <select
                                value={med.dosage}
                                onChange={(e) => handleUpdateMedicineField(med.id, "dosage", e.target.value)}
                                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#0B5ED7] cursor-pointer text-xs shadow-2xs"
                              >
                                <option value="" disabled>Dosage</option>
                                <option value="1 Tab">1 Tab</option>
                                <option value="2 Tabs">2 Tabs</option>
                                <option value="1/2 Tab">1/2 Tab</option>
                                <option value="1 Cap">1 Cap</option>
                                <option value="5 ml">5 ml Syrup</option>
                                <option value="10 ml">10 ml Syrup</option>
                                <option value="1 Sachet">1 Sachet</option>
                                <option value="1 Drop">1 Drop</option>
                                <option value="2 Drops">2 Drops</option>
                                <option value="1 Injection">1 Injection</option>
                                <option value="1 Application">1 Application</option>
                              </select>
                            </div>

                            {/* Frequency (Single Clean Dropdown) */}
                            <div className="md:col-span-2 space-y-1">
                              <label className="font-bold text-slate-600 text-[10px] uppercase block">
                                Frequency
                              </label>
                              <select
                                value={med.frequency}
                                onChange={(e) => handleUpdateMedicineField(med.id, "frequency", e.target.value)}
                                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-[#0B5ED7] outline-none focus:border-[#0B5ED7] cursor-pointer text-xs shadow-2xs"
                              >
                                <option value="1-0-1">1-0-1 (Twice daily)</option>
                                <option value="1-0-0">1-0-0 (Morning)</option>
                                <option value="0-0-1">0-0-1 (Bedtime)</option>
                                <option value="1-1-1">1-1-1 (Thrice daily)</option>
                                <option value="0-1-0">0-1-0 (Afternoon)</option>
                                <option value="SOS">SOS (As needed)</option>
                                <option value="Once Weekly">Once Weekly</option>
                                <option value="Every 8 Hours">Every 8 Hours</option>
                              </select>
                            </div>

                            {/* Duration (Single Clean Dropdown) */}
                            <div className="md:col-span-2 space-y-1">
                              <label className="font-bold text-slate-600 text-[10px] uppercase block">
                                Duration
                              </label>
                              <select
                                value={med.duration}
                                onChange={(e) => handleUpdateMedicineField(med.id, "duration", e.target.value)}
                                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#0B5ED7] cursor-pointer text-xs shadow-2xs"
                              >
                                <option value="" disabled>Duration</option>
                                <option value="3 Days">3 Days</option>
                                <option value="5 Days">5 Days</option>
                                <option value="7 Days">7 Days</option>
                                <option value="10 Days">10 Days</option>
                                <option value="14 Days">14 Days</option>
                                <option value="15 Days">15 Days</option>
                                <option value="30 Days">30 Days (1 Month)</option>
                                <option value="60 Days">60 Days (2 Months)</option>
                                <option value="90 Days">90 Days (3 Months)</option>
                                <option value="SOS">SOS / As Needed</option>
                                <option value="Continuous">Continuous</option>
                              </select>
                            </div>

                            {/* Instructions (Single Clean Dropdown) */}
                            <div className="md:col-span-2 space-y-1 pr-6">
                              <label className="font-bold text-slate-600 text-[10px] uppercase block">
                                Instructions
                              </label>
                              <select
                                value={med.instructions}
                                onChange={(e) => handleUpdateMedicineField(med.id, "instructions", e.target.value)}
                                className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-[#0B5ED7] cursor-pointer text-xs shadow-2xs"
                              >
                                <option value="After food">After food</option>
                                <option value="Before food / Empty stomach">Before food / Empty stomach</option>
                                <option value="With meals">With meals</option>
                                <option value="At bedtime">At bedtime</option>
                                <option value="Morning after breakfast">Morning after breakfast</option>
                                <option value="Before breakfast">Before breakfast</option>
                                <option value="With warm water">With warm water</option>
                                <option value="SOS when in pain">SOS when in pain</option>
                                <option value="Avoid dairy products">Avoid dairy products</option>
                              </select>
                            </div>
                          </div>

                          {/* Delete Row Button */}
                          {formMedicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(med.id)}
                              className="absolute top-2.5 right-2 text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                              title="Remove Medicine"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. LAB TESTS, FOLLOW-UP & ADVICE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    {/* Recommended Lab Tests */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-blue-600" /> Recommended Lab Tests
                      </label>
                      <input
                        type="text"
                        list="quick-labtests-list"
                        placeholder="Type or select lab test..."
                        value={formLabTests}
                        onChange={(e) => setFormLabTests(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#0B5ED7] text-xs shadow-2xs"
                      />
                      <datalist id="quick-labtests-list">
                        {QUICK_LAB_TESTS.map((test, i) => (
                          <option key={i} value={test} />
                        ))}
                      </datalist>
                    </div>

                    {/* Follow-up Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" /> Follow-up / Re-visit Date
                      </label>
                      <input
                        type="date"
                        value={formFollowUpDate}
                        onChange={(e) => setFormFollowUpDate(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-[#0B5ED7] text-xs cursor-pointer shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Special Advice */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      Special Dietary & Lifestyle Advice
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Drink 3-4 Liters of warm water daily. Complete full antibiotic course."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-[#0B5ED7] text-xs leading-relaxed shadow-2xs"
                    />
                  </div>

                  {/* BOTTOM ACTION BAR INSIDE MODAL */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 font-medium">
                      Prescription will be saved to clinic records & patient history automatically.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSavePrescription("Draft")}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAndPrint}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        <Printer className="w-4 h-4" /> Save & Print
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAndSendWhatsApp}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white text-emerald-600" /> Save & Send WhatsApp
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                /* ========================================================================= */
                /* ELEGANT PRINTABLE LETTERHEAD PREVIEW (VIEW MODE) */
                /* ========================================================================= */
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6 printable-prescription-pad relative overflow-hidden">
                  
                  {/* Decorative Subtle Background Medical Rx Watermark */}
                  <div className="absolute right-8 bottom-32 opacity-[0.03] text-slate-900 font-serif font-bold text-[180px] pointer-events-none select-none">
                    Rx
                  </div>

                  {/* CLINIC LETTERHEAD HEADER */}
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#0B5ED7] pb-5 gap-4">
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#0B5ED7] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B5ED7] font-display tracking-tight uppercase">
                            {viewRx?.clinicName || formClinicName}
                          </h1>
                          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            Multispecialty OPD & Emergency Care Center
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 pt-1 leading-relaxed font-medium">
                        {viewRx?.clinicAddress || formClinicAddress}
                        <br />
                        Ph: {viewRx?.clinicPhone || formClinicPhone} • Email: contact@carefirstclinic.com
                      </p>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
                        {viewRx?.doctorName || currentDoctorProfile.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700">
                        {viewRx?.doctorQual || currentDoctorProfile.qualification}
                      </p>
                      <p className="text-[11px] font-mono font-bold text-[#0B5ED7]">
                        {viewRx?.doctorReg || currentDoctorProfile.regNo}
                      </p>
                    </div>
                  </div>

                  {/* PATIENT INFO & VITALS BAR */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
                    {viewRx && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-800">
                          <div>
                            <span className="text-slate-500">Patient: </span>
                            <strong className="text-slate-900 font-bold text-sm">{viewRx.patientName}</strong>
                            <span className="ml-2 text-slate-500">({viewRx.patientAge} yrs, {viewRx.patientGender})</span>
                          </div>
                          <div>
                            <span className="text-slate-500">UHID: </span>
                            <strong className="font-mono text-[#0B5ED7]">{viewRx.uhid}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Phone: </span>
                            <span>{viewRx.patientPhone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Date: </span>
                            <span>{viewRx.date}</span>
                          </div>
                        </div>

                        {/* Displayed Vitals Pill Bar */}
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-3 text-[11px] font-mono font-bold text-slate-700">
                          {viewRx.vitalsBp && (
                            <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <Activity className="w-3 h-3 text-[#0B5ED7]" /> BP: {viewRx.vitalsBp}
                            </span>
                          )}
                          {viewRx.vitalsPulse && (
                            <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-500" /> Pulse: {viewRx.vitalsPulse}
                            </span>
                          )}
                          {viewRx.vitalsTemp && (
                            <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <Thermometer className="w-3 h-3 text-amber-500" /> Temp: {viewRx.vitalsTemp}
                            </span>
                          )}
                          {viewRx.vitalsWeight && (
                            <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <Weight className="w-3 h-3 text-emerald-600" /> Wt: {viewRx.vitalsWeight}
                            </span>
                          )}
                          {viewRx.vitalsSpo2 && (
                            <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">
                              SpO2: {viewRx.vitalsSpo2}
                            </span>
                          )}
                          {viewRx.vitalsRbs && (
                            <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">
                              RBS: {viewRx.vitalsRbs}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CLINICAL COMPLAINTS & DIAGNOSIS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Chief Clinical Complaints
                      </label>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800">
                        {viewRx?.chiefComplaints || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Clinical Diagnosis
                      </label>
                      <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs font-bold text-slate-900">
                        {viewRx?.diagnosis}
                      </div>
                    </div>
                  </div>

                  {/* PRESCRIPTION MEDICINE TABLE */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-serif font-bold text-[#0B5ED7] leading-none">
                          Rx
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Prescribed Medicines & Schedules
                        </span>
                      </div>
                    </div>

                    {viewRx && (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b-2 border-slate-300 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider bg-slate-50/80">
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Medicine Name & Strength</th>
                            <th className="py-2.5 px-3">Dosage</th>
                            <th className="py-2.5 px-3">Frequency</th>
                            <th className="py-2.5 px-3">Duration</th>
                            <th className="py-2.5 px-3">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {viewRx.medicines.map((m, idx) => (
                            <tr key={m.id || idx}>
                              <td className="py-3 px-3 font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-3 px-3 font-extrabold text-slate-900 text-sm">
                                {m.name}
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-800">{m.dosage}</td>
                              <td className="py-3 px-3 font-bold text-[#0B5ED7]">
                                <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                                  {m.frequency}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-800">{m.duration}</td>
                              <td className="py-3 px-3 font-medium text-slate-700">{m.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* LAB TESTS & RE-VISIT ADVICE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-blue-600" /> Recommended Investigations / Lab Tests
                      </label>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                        {viewRx?.labTests || "No specific lab tests ordered."}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" /> Re-visit / Follow-up Date
                      </label>
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs font-extrabold text-amber-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Re-visit on: {viewRx?.followUpDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* SPECIAL ADVICE */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Special Dietary & Lifestyle Advice
                    </label>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed">
                      {viewRx?.notes || "Follow routine dietary precautions and prescribed dosages."}
                    </p>
                  </div>

                  {/* FOOTER & DOCTOR SIGNATURE BLOCK */}
                  <div className="pt-8 border-t-2 border-slate-300 flex flex-col sm:flex-row justify-between items-end gap-6">
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <p className="font-extrabold text-slate-700 uppercase flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        {viewRx?.clinicName || formClinicName}
                      </p>
                      <p>Get well soon • Emergency Helpline: +91 98765 43210</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Official E-Prescription issued via CareFirst Healthcare OS • Valid for 30 days
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border-2 border-blue-600/40 p-1 flex flex-col items-center justify-center text-center text-[8px] font-bold text-blue-700 leading-tight bg-blue-50/30 select-none hidden sm:flex">
                        <ShieldCheck className="w-4 h-4 text-[#0B5ED7]" />
                        <span>VERIFIED</span>
                        <span className="text-[7px]">CAREFIRST</span>
                      </div>

                      <div className="text-center sm:text-right space-y-1 min-w-[200px]">
                        <div className="h-12 border-b-2 border-slate-400 flex items-end justify-center sm:justify-end pb-1 font-serif italic text-slate-800 font-bold text-base tracking-wide">
                          {viewRx?.doctorName || currentDoctorProfile.name}
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Authorized Doctor Signature
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 font-bold">
                          {viewRx?.doctorReg || currentDoctorProfile.regNo}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </main>
        </div>
      </div>
    )}
  </div>
);
}
