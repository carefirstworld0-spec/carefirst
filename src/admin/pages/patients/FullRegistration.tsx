import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, set, push, update, serverTimestamp, get } from "firebase/database";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  User,
  Phone,
  FileText,
  Loader2,
  AlertTriangle,
  Eye,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useUHID } from "./hooks/useUHID";
import { useDoctors } from "./hooks/useDoctors";
import { formatAge, dobFromAge } from "./utils/validation";
import { DEPARTMENTS } from "./utils/constants";

import { StepBasicInfo } from "./components/registration/StepBasicInfo";
import { StepContactMedical } from "./components/registration/StepContactMedical";
import { StepVisitConsent } from "./components/registration/StepVisitConsent";
import { useDuplicateChecker } from "./hooks/useDuplicateChecker";

export type FullRegistrationData = {
  // Step 1: Basic
  name: string;
  dobMode: "dob" | "age";
  dob: string;
  approxAge: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  photoUrl: string;

  // Step 2: Contact & Medical
  countryCode: string;
  mobile: string;
  altMobile: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyCountryCode: string;
  emergencyPhone: string;
  govIdType: string;
  govIdNumber: string;
  allergies: string[];
  conditions: string[];
  medications: string[];

  // Step 3: Visit & Consent
  visitType: string;
  department: string;
  doctor: string;
  chiefComplaint: string;
  referredBy: string;
  paymentCategory: string;
  insuranceProvider: string;
  policyNumber: string;
  corporateCompany: string;
  govScheme: string;
  admissionType: string;
  ward: string;
  bed: string;
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  consentTreatment: boolean;
  consent_sms: boolean;
  consent_whatsapp: boolean;
  consent_email: boolean;
};

const initialData: FullRegistrationData = {
  name: "",
  dobMode: "dob",
  dob: "",
  approxAge: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  photoUrl: "",
  countryCode: "+91",
  mobile: "",
  altMobile: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyCountryCode: "+91",
  emergencyPhone: "",
  govIdType: "",
  govIdNumber: "",
  allergies: [],
  conditions: [],
  medications: [],
  visitType: "new",
  department: "",
  doctor: "",
  chiefComplaint: "",
  referredBy: "",
  paymentCategory: "cash",
  insuranceProvider: "",
  policyNumber: "",
  corporateCompany: "",
  govScheme: "",
  admissionType: "opd",
  ward: "",
  bed: "",
  guardianName: "",
  guardianRelation: "",
  guardianMobile: "",
  consentTreatment: false,
  consent_sms: true,
  consent_whatsapp: true,
  consent_email: false,
};

const STEPS = [
  { id: 1, title: "Basic Information", icon: User },
  { id: 2, title: "Contact & Medical", icon: Phone },
  { id: 3, title: "Visit & Consent", icon: FileText },
];

export function FullRegistration() {
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FullRegistrationData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedUHID, setSavedUHID] = useState("");
  const [savedPatientId, setSavedPatientId] = useState("");

  const { uhid, loading: uhidLoading, generate: generateUHID } = useUHID();
  const { getDoctorsByDepartment } = useDoctors(clinicKey);
  const { matches, checking, checkDuplicate, clearMatches } = useDuplicateChecker(clinicKey);

  useEffect(() => {
    if (clinicKey && !uhid && !success) {
      generateUHID(clinicKey);
    }
  }, [clinicKey, generateUHID, success, uhid]);

  const updateField = (field: keyof FullRegistrationData, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "department") next.doctor = "";
      if (field === "paymentCategory") {
        next.insuranceProvider = "";
        next.policyNumber = "";
        next.corporateCompany = "";
        next.govScheme = "";
      }
      return next;
    });
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: undefined }) as any);
    }
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Patient name is required";
    if (formData.dobMode === "dob" && !formData.dob) errs.dob = "Date of birth is required";
    if (formData.dobMode === "age" && !formData.approxAge)
      errs.approxAge = "Approximate age is required";
    if (!formData.gender) errs.gender = "Gender is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.mobile) errs.mobile = "Mobile number is required";
    else if (formData.mobile.length < 9) errs.mobile = "Invalid mobile number length";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.department) errs.department = "Department is required";
    if (formData.admissionType === "ipd") {
      if (!formData.ward) errs.ward = "Ward is required for IPD";
      if (!formData.bed) errs.bed = "Bed is required for IPD";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (step === 1) isValid = validateStep1();
    if (step === 2) isValid = validateStep2();
    if (isValid) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep3() || !clinicKey || !uhid) return;
    setSaving(true);

    try {
      let age = "";
      let dob = formData.dob;
      if (formData.dobMode === "dob" && formData.dob) {
        age = formatAge(formData.dob);
      } else if (formData.dobMode === "age" && formData.approxAge) {
        age = `${formData.approxAge}Y (approx)`;
        dob = dobFromAge(parseInt(formData.approxAge, 10));
      }

      const availableDoctors = getDoctorsByDepartment(formData.department);
      const doctorName =
        availableDoctors.find((d) => d.id === formData.doctor)?.name || formData.doctor;
      const deptLabel =
        DEPARTMENTS.find((d) => d.id === formData.department)?.label || formData.department;

      const patientId = push(ref(db, `carefirst/users/${clinicKey}/patients`)).key;
      if (!patientId) throw new Error("Failed to create patient key");

      // We normalize data structure
      const patientData = {
        identity: {
          uhid,
          name: formData.name.trim(),
          dob,
          age,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          bloodGroup: formData.bloodGroup,
        },
        contact: {
          countryCode: formData.countryCode,
          mobile: `${formData.countryCode} ${formData.mobile}`,
          altMobile: formData.altMobile,
          email: formData.email,
          address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        },
        emergency: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelation,
          countryCode: formData.emergencyCountryCode,
          phone: `${formData.emergencyCountryCode} ${formData.emergencyPhone}`,
        },
        identification: {
          type: formData.govIdType,
          number: formData.govIdNumber, // Will mask on UI, store actual here
        },
        medical: {
          allergies: formData.allergies,
          conditions: formData.conditions,
          medications: formData.medications,
        },
        insurance: {
          provider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          tpa: "",
          corporateCompany: formData.corporateCompany,
          govScheme: formData.govScheme,
        },
        consent: {
          treatment: formData.consentTreatment,
          sms: formData.consent_sms,
          whatsapp: formData.consent_whatsapp,
          email: formData.consent_email,
          timestamp: new Date().toISOString(),
        },
        meta: {
          branch: typeof window !== "undefined" ? localStorage.getItem("user_clinic_name") || "Main Clinic" : "Main Clinic",
          department: formData.department,
          departmentLabel: deptLabel,
          doctor: formData.doctor,
          doctorName,
          status: "active",
          registrationType: "full",
          createdAt: new Date().toISOString(),
          createdBy:
            typeof window !== "undefined" ? localStorage.getItem("user_name") || "Staff" : "Staff",
          lastVisit: new Date().toISOString(),
        },
      };

      const indexData = {
        uhid: patientData.identity.uhid,
        name: patientData.identity.name,
        gender: patientData.identity.gender,
        dob: patientData.identity.dob,
        age: patientData.identity.age,
        mobile: patientData.contact.mobile,
        department: patientData.meta.department,
        doctor: patientData.meta.doctor,
        status: patientData.meta.status,
        lastVisit: patientData.meta.lastVisit,
        createdAt: patientData.meta.createdAt,
      };

      const updates: any = {};
      updates[`patients/${patientId}`] = patientData;
      updates[`patient_index/${patientId}`] = indexData;
      await update(ref(db, `carefirst/users/${clinicKey}`), updates);

      // Create Initial Visit
      const visitId = push(
        ref(db, `carefirst/users/${clinicKey}/patients/${patientId}/visits`),
      ).key;
      if (visitId) {
        await set(ref(db, `carefirst/users/${clinicKey}/patients/${patientId}/visits/${visitId}`), {
          visitType: formData.visitType,
          department: formData.department,
          doctor: formData.doctor,
          chiefComplaint: formData.chiefComplaint,
          referredBy: formData.referredBy,
          paymentCategory: formData.paymentCategory,
          admissionType: formData.admissionType,
          ward: formData.ward,
          bed: formData.bed,
          date: new Date().toISOString().split("T")[0],
          timestamp: new Date().toISOString(),
          status: "Scheduled",
        });
      }

      // Audit log
      const auditRef = push(ref(db, `carefirst/users/${clinicKey}/auditLog`));
      await set(auditRef, {
        action: "patient_registered_full",
        patientId,
        uhid,
        patientName: formData.name.trim(),
        performedBy:
          typeof window !== "undefined" ? localStorage.getItem("user_name") || "Staff" : "Staff",
        timestamp: new Date().toISOString(),
      });

      setSavedUHID(uhid);
      setSavedPatientId(patientId);
      setSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ submit: "Failed to save patient record. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleSendToQueue = async () => {
    if (!clinicKey || !savedPatientId || !savedUHID) return;
    try {
      // Get the current list of appointments for today to generate a token
      const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
      const snapshot = await get(apptsRef);
      const today = new Date().toISOString().split('T')[0];
      
      let tokenNumber = 1;
      if (snapshot.exists()) {
        const data = snapshot.val();
        const todaysAppts = Object.values(data).filter((a: any) => a.date === today);
        tokenNumber = todaysAppts.length + 1;
      }
      
      const tokenNo = `T-${tokenNumber.toString().padStart(3, '0')}`;
      const newApptRef = push(apptsRef);
      
      const availableDoctors = getDoctorsByDepartment(formData.department);
      const doctorName = availableDoctors.find((d) => d.id === formData.doctor)?.name || formData.doctor;
      const deptLabel = DEPARTMENTS.find((d) => d.id === formData.department)?.label || formData.department;

      await set(newApptRef, {
        token: tokenNo,
        uhid: savedUHID,
        patientId: savedPatientId,
        name: formData.name.trim(),
        phone: formData.mobile,
        age: formData.dobMode === "age" ? formData.approxAge : formatAge(formData.dob),
        gender: formData.gender,
        doctorId: formData.doctor,
        doctorName: doctorName,
        department: deptLabel,
        status: "Waiting",
        date: today, 
        createdAt: serverTimestamp(),
      });
      
      alert(`Patient added to queue successfully! Token: ${tokenNo}`);
      navigate({ to: "/admin/consultation" });
    } catch (err) {
      console.error("Failed to send to queue:", err);
      alert("Failed to send to queue. Please try again.");
    }
  };

  const handleStartConsultationDirect = async () => {
    if (!clinicKey || !savedPatientId || !savedUHID) return;
    try {
      setSaving(true);
      const apptsRef = ref(db, `carefirst/users/${clinicKey}/appointments`);
      const snapshot = await get(apptsRef);
      const today = new Date().toISOString().split('T')[0];
      
      let tokenNumber = 1;
      if (snapshot.exists()) {
        const data = snapshot.val();
        const todaysAppts = Object.values(data).filter((a: any) => a.date === today);
        tokenNumber = todaysAppts.length + 1;
      }
      
      const tokenNo = `T-${tokenNumber.toString().padStart(3, '0')}`;
      const newApptRef = push(apptsRef);
      
      const availableDoctors = getDoctorsByDepartment(formData.department);
      const doctorName = availableDoctors.find((d) => d.id === formData.doctor)?.name || formData.doctor;
      const deptLabel = DEPARTMENTS.find((d) => d.id === formData.department)?.label || formData.department;

      await set(newApptRef, {
        token: tokenNo,
        uhid: savedUHID,
        patientId: savedPatientId,
        name: formData.name.trim(),
        phone: formData.mobile,
        age: formData.dobMode === "age" ? formData.approxAge : formatAge(formData.dob),
        gender: formData.gender,
        doctorId: formData.doctor,
        doctorName: doctorName,
        department: deptLabel,
        status: "Waiting",
        date: today, 
        createdAt: serverTimestamp(),
      });
      
      navigate({ to: `/admin/consultation/${newApptRef.key}` });
    } catch (err) {
      console.error("Failed to start consultation directly:", err);
      alert("Failed to start consultation. Please try again.");
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-success/10">
            <CheckCircle2 className="text-success" size={40} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-navy">
              Patient Registered Successfully
            </h2>
            <p className="mt-2 text-muted-foreground">
              Full registration complete. The patient is ready for consultation.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Patient ID
              </span>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 font-bold"
              >
                {savedUHID}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Name
              </span>
              <span className="text-sm font-semibold text-navy">{formData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Department
              </span>
              <span className="text-sm text-navy">
                {DEPARTMENTS.find((d) => d.id === formData.department)?.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-primary text-white rounded-xl h-11"
              onClick={handleStartConsultationDirect}
              disabled={saving}
            >
              Start Consultation
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-11 text-navy border-primary/20 hover:bg-primary/5"
              onClick={handleSendToQueue}
            >
              Send to Queue
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-11"
              onClick={() =>
                navigate({
                  to: "/admin/patients/$patientId",
                  params: { patientId: savedPatientId },
                })
              }
            >
              <Eye size={16} className="mr-2" /> View Patient
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-11 text-navy"
              onClick={() => alert("Create bill functionality pending")}
            >
              Create Bill
            </Button>
            <Button
              className="rounded-xl h-11 col-span-2 bg-secondary text-navy hover:bg-secondary/80"
              onClick={() => {
                setSuccess(false);
                setFormData(initialData);
                setStep(1);
                generateUHID(clinicKey);
              }}
            >
              <UserPlus size={16} className="mr-2" /> Register Another Patient
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/admin/patients" })}
            className="shrink-0"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy font-display">
              Register New Patient
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Complete patient profiling</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">UHID:</span>
          {uhidLoading ? (
            <Loader2 size={14} className="animate-spin text-primary" />
          ) : (
            <span className="text-sm font-bold text-primary font-mono">{uhid || "—"}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: Main Form Wizard */}
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px]">
              {STEPS.map((s, idx) => {
                const isCompleted = step > s.id;
                const isActive = step === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div
                        className={`grid size-10 place-items-center rounded-full border-2 font-bold transition-colors ${isActive ? "border-primary bg-primary text-white" : isCompleted ? "border-success bg-success text-white" : "border-border bg-secondary text-muted-foreground"}`}
                      >
                        {isCompleted ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                      </div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"}`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`h-[2px] flex-1 mx-4 -mt-6 transition-colors ${isCompleted ? "bg-success" : "bg-border"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Step Component */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-8 shadow-sm min-h-[500px]">
            {errors.submit && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} /> {errors.submit}
              </div>
            )}

            {step === 1 && (
              <StepBasicInfo formData={formData} updateField={updateField} errors={errors} />
            )}
            {step === 2 && (
              <StepContactMedical
                formData={formData}
                updateField={updateField}
                errors={errors}
                matches={matches}
                checking={checking}
                checkDuplicate={checkDuplicate}
                clearMatches={clearMatches}
              />
            )}
            {step === 3 && (
              <StepVisitConsent
                formData={formData}
                updateField={updateField}
                errors={errors}
                clinicKey={clinicKey}
              />
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={step === 1 ? () => navigate({ to: "/admin/patients" }) : handleBack}
              className="rounded-xl px-6 h-12"
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-primary text-white rounded-xl px-8 h-12 shadow-md"
              >
                Next Step <ChevronRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={saving || uhidLoading}
                className="bg-success hover:bg-success/90 text-white rounded-xl px-8 h-12 shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="mr-2" /> Complete Registration
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Right: Summary Panel (Desktop Only) */}
        <div className="hidden lg:block">
          <div className="sticky top-6 bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Patient Summary
            </h4>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                {formData.name ? formData.name.substring(0, 2).toUpperCase() : "?"}
              </div>
              <div>
                <p className="text-[14px] font-bold text-navy">{formData.name || "New Patient"}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {uhid || "Generating..."}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-[13px] pt-4 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile</span>
                <span className="font-medium text-navy">
                  {formData.mobile ? `${formData.countryCode} ${formData.mobile}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-medium text-navy capitalize">{formData.gender || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium text-navy">
                  {formData.dobMode === "dob" && formData.dob
                    ? formatAge(formData.dob)
                    : formData.approxAge
                      ? `${formData.approxAge}Y`
                      : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium text-navy truncate max-w-[120px]">
                  {DEPARTMENTS.find((d) => d.id === formData.department)?.label || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
