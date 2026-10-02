// ─── Departments ───
export const DEPARTMENTS = [
  { id: "general-medicine", label: "General Medicine" },
  { id: "dental", label: "Dental" },
  { id: "gynaecology", label: "Gynaecology" },
  { id: "paediatrics", label: "Paediatrics" },
  { id: "orthopaedics", label: "Orthopaedics" },
  { id: "ent", label: "ENT" },
  { id: "dermatology", label: "Dermatology" },
  { id: "cardiology", label: "Cardiology" },
  { id: "ophthalmology", label: "Ophthalmology" },
  { id: "neurology", label: "Neurology" },
  { id: "psychiatry", label: "Psychiatry" },
  { id: "physiotherapy", label: "Physiotherapy" },
  { id: "radiology", label: "Radiology" },
  { id: "pathology", label: "Pathology" },
  { id: "general-surgery", label: "General Surgery" },
  { id: "emergency", label: "Emergency" },
  { id: "other", label: "Other" },
] as const;

// ─── Blood Groups ───
export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown",
] as const;

// ─── Gender Options ───
export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

// ─── Marital Status ───
export const MARITAL_STATUS = [
  "Single", "Married", "Divorced", "Widowed", "Other",
] as const;

// ─── Common Medical Conditions ───
export const COMMON_CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "Thyroid",
  "Asthma",
  "Heart Disease",
  "Kidney Disease",
] as const;

// ─── Government ID Types ───
export const GOV_ID_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "voter-id", label: "Voter ID" },
  { value: "passport", label: "Passport" },
  { value: "driving-licence", label: "Driving Licence" },
  { value: "other", label: "Other" },
] as const;

// ─── Payment Categories ───
export const PAYMENT_CATEGORIES = [
  { value: "cash", label: "Cash", icon: "₹", description: "Direct payment" },
  { value: "insurance", label: "Insurance", icon: "🛡️", description: "Covered by insurance" },
  { value: "corporate", label: "Corporate", icon: "🏢", description: "Company-sponsored" },
  { value: "government", label: "Government Scheme", icon: "🏛️", description: "Govt. programme" },
] as const;

// ─── Visit Types ───
export const VISIT_TYPES = [
  { value: "new", label: "New Patient" },
  { value: "follow-up", label: "Follow-up" },
  { value: "referred", label: "Referred" },
] as const;

// ─── Admission Types ───
export const ADMISSION_TYPES = [
  { value: "opd", label: "OPD" },
  { value: "ipd", label: "IPD" },
  { value: "emergency", label: "Emergency" },
] as const;

// ─── Patient Status ───
export const PATIENT_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "waiting", label: "Waiting", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "in-consultation", label: "In Consultation", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "admitted", label: "Admitted", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "discharged", label: "Discharged", color: "bg-slate-100 text-slate-800 border-slate-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "follow-up", label: "Follow-up", color: "bg-sky-100 text-sky-800 border-sky-200" },
] as const;

// ─── Guardian Relationships ───
export const RELATIONSHIPS = [
  "Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister",
  "Guardian", "Friend", "Other",
] as const;

// ─── Country Codes (for phone) ───
export const COUNTRY_CODES = [
  { code: "+91", country: "India", maxDigits: 10 },
  { code: "+1", country: "USA/Canada", maxDigits: 10 },
  { code: "+44", country: "UK", maxDigits: 10 },
  { code: "+61", country: "Australia", maxDigits: 9 },
  { code: "+971", country: "UAE", maxDigits: 9 },
  { code: "+65", country: "Singapore", maxDigits: 8 },
  { code: "+49", country: "Germany", maxDigits: 11 },
  { code: "+33", country: "France", maxDigits: 9 },
  { code: "+81", country: "Japan", maxDigits: 10 },
  { code: "+86", country: "China", maxDigits: 11 },
] as const;

// ─── Age threshold for minor/guardian logic ───
export const MINOR_AGE_THRESHOLD = 18;
