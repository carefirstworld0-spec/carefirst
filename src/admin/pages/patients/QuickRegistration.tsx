import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, set, push, update } from "firebase/database";
import {
  CalendarDays,
  Phone,
  User,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Printer,
  Eye,
  UserPlus,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DEPARTMENTS, GENDERS, COUNTRY_CODES } from "./utils/constants";
import {
  stripNonDigits,
  isValidIndianMobile,
  calculateAge,
  formatAge,
  dobFromAge,
} from "./utils/validation";
import { useUHID } from "./hooks/useUHID";
import { useDuplicateChecker } from "./hooks/useDuplicateChecker";
import { useDoctors } from "./hooks/useDoctors";

// ─── Types ───
type QuickFormData = {
  name: string;
  countryCode: string;
  mobile: string;
  dobMode: "dob" | "age";
  dob: string;
  approxAge: string;
  gender: string;
  department: string;
  doctor: string;
};

const initialForm: QuickFormData = {
  name: "",
  countryCode: "+91",
  mobile: "",
  dobMode: "dob",
  dob: "",
  approxAge: "",
  gender: "",
  department: "",
  doctor: "",
};

// ─── Component ───
export function QuickRegistration() {
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";

  const [form, setForm] = useState<QuickFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof QuickFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedUHID, setSavedUHID] = useState("");
  const [savedPatientId, setSavedPatientId] = useState("");

  const { uhid, loading: uhidLoading, generate: generateUHID } = useUHID();
  const { matches, checking, checkDuplicate, clearMatches } = useDuplicateChecker(clinicKey);

  // Generate UHID on mount
  useEffect(() => {
    if (clinicKey) {
      generateUHID(clinicKey);
    }
  }, [clinicKey, generateUHID]);
  const { getDoctorsByDepartment } = useDoctors(clinicKey);

  // Filtered doctors based on selected department — real-time from Firebase
  const availableDoctors = form.department ? getDoctorsByDepartment(form.department) : [];

  // ─── Handlers ───
  const updateField = (field: keyof QuickFormData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Clear doctor when department changes
      if (field === "department") {
        next.doctor = "";
      }

      return next;
    });

    // Clear error on edit
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMobileChange = (value: string) => {
    const digits = stripNonDigits(value);
    const maxDigits = COUNTRY_CODES.find((c) => c.code === form.countryCode)?.maxDigits || 10;
    if (digits.length <= maxDigits) {
      updateField("mobile", digits);
      // Trigger duplicate check at full length
      if (digits.length === maxDigits) {
        checkDuplicate(digits);
      } else {
        clearMatches();
      }
    }
  };

  // ─── Validation ───
  const validate = (): boolean => {
    const errs: Partial<Record<keyof QuickFormData, string>> = {};

    if (!form.name.trim()) errs.name = "Patient name is required.";

    const maxDigits = COUNTRY_CODES.find((c) => c.code === form.countryCode)?.maxDigits || 10;
    if (!form.mobile) {
      errs.mobile = "Mobile number is required.";
    } else if (form.mobile.length !== maxDigits) {
      errs.mobile = `Please enter a valid ${maxDigits}-digit mobile number.`;
    } else if (form.countryCode === "+91" && !isValidIndianMobile(form.mobile)) {
      errs.mobile = "Please enter a valid Indian mobile number.";
    }

    if (form.dobMode === "dob" && !form.dob) {
      errs.dob = "Enter date of birth or select 'DOB unknown' and provide approximate age.";
    }
    if (form.dobMode === "age" && !form.approxAge) {
      errs.approxAge = "Please provide approximate age.";
    }

    if (!form.gender) errs.gender = "Gender is required.";
    if (!form.department) errs.department = "Please select a department.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !clinicKey || !uhid) return;

    setSaving(true);

    try {
      // Calculate age
      let age = "";
      let dob = form.dob;

      if (form.dobMode === "dob" && form.dob) {
        age = formatAge(form.dob);
      } else if (form.dobMode === "age" && form.approxAge) {
        age = `${form.approxAge}Y (approx)`;
        dob = dobFromAge(parseInt(form.approxAge, 10));
      }

      // Find doctor name
      const doctorName = availableDoctors.find((d) => d.id === form.doctor)?.name || form.doctor;
      const deptLabel = DEPARTMENTS.find((d) => d.id === form.department)?.label || form.department;

      const patientId = push(ref(db, `carefirst/users/${clinicKey}/patients`)).key;
      if (!patientId) throw new Error("Failed to create patient key");

      const patientData = {
        identity: {
          uhid,
          name: form.name.trim(),
          dob,
          age,
          gender: form.gender,
        },
        contact: {
          mobile: `${form.countryCode} ${form.mobile}`,
          countryCode: form.countryCode,
        },
        meta: {
          department: form.department,
          departmentLabel: deptLabel,
          doctor: form.doctor,
          doctorName,
          status: "active",
          registrationType: "quick",
          createdAt: new Date().toISOString(),
          createdBy:
            typeof window !== "undefined" ? localStorage.getItem("user_name") || "Staff" : "Staff",
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
        lastVisit: "",
        createdAt: patientData.meta.createdAt,
      };

      const updates: any = {};
      updates[`patients/${patientId}`] = patientData;
      updates[`patient_index/${patientId}`] = indexData;
      await update(ref(db, `carefirst/users/${clinicKey}`), updates);

      // Write audit log
      const auditRef = push(ref(db, `carefirst/users/${clinicKey}/auditLog`));
      await set(auditRef, {
        action: "patient_registered",
        patientId,
        uhid,
        patientName: form.name.trim(),
        performedBy:
          typeof window !== "undefined" ? localStorage.getItem("user_name") || "Staff" : "Staff",
        timestamp: new Date().toISOString(),
        type: "quick",
      });

      setSavedUHID(uhid);
      setSavedPatientId(patientId);
      setSuccess(true);
    } catch (err) {
      console.error("Registration failed:", err);
      setErrors({ name: "Patient could not be saved. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Success Screen ───
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
              The patient has been registered and is ready for consultation.
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
              <span className="text-sm font-semibold text-navy">{form.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Department
              </span>
              <span className="text-sm text-navy">
                {DEPARTMENTS.find((d) => d.id === form.department)?.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              className="bg-primary text-white rounded-xl h-11"
              onClick={() => {
                setSuccess(false);
                setForm(initialForm);
                clearMatches();
                generateUHID(clinicKey);
              }}
            >
              <UserPlus size={16} className="mr-2" /> Register Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Registration Form ───
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
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
            Quick Patient Registration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register a new patient in seconds. Complete details can be added later.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ─── LEFT: Main Form ─── */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Patient ID Card */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <User size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Patient ID
                </p>
                <p className="text-[15px] font-display font-bold text-navy">
                  {uhidLoading ? (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" /> Generating…
                    </span>
                  ) : (
                    uhid || "—"
                  )}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Registration
              </p>
              <p className="text-[13px] font-medium text-navy">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                ,{" "}
                {new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Personal Details Card */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5">
            <h3 className="font-display text-[15px] font-bold text-navy flex items-center gap-2">
              <User size={16} className="text-primary" /> Personal Details
            </h3>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter patient's full name"
                className={`h-11 bg-secondary/10 ${errors.name ? "border-red-500" : ""}`}
                autoFocus
              />
              {errors.name && <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <div
                className={`flex items-center rounded-md border bg-secondary/10 focus-within:ring-1 focus-within:ring-ring transition-colors ${errors.mobile ? "border-red-500 focus-within:ring-red-500" : "border-input"}`}
              >
                <Select
                  value={form.countryCode}
                  onValueChange={(val) => updateField("countryCode", val)}
                >
                  <SelectTrigger className="w-[80px] shrink-0 h-11 border-0 bg-transparent shadow-none focus:ring-0 rounded-r-none pr-1 pl-3 font-medium">
                    <span className="truncate">{form.countryCode}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} <span className="text-muted-foreground ml-1">({c.country})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-px h-6 bg-border shrink-0" />
                <input
                  value={form.mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 h-11 bg-transparent border-0 px-3 text-sm focus:outline-none w-full min-w-0"
                />
              </div>
              {errors.mobile && (
                <p className="text-[11px] text-red-500 font-medium">{errors.mobile}</p>
              )}

              {/* Duplicate Checker Results */}
              {checking && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" /> Checking for existing patients…
                </p>
              )}
              {!checking && form.mobile.length >= 10 && matches.length === 0 && (
                <p className="text-[11px] text-success font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> No existing patient found
                </p>
              )}
              {matches.length > 0 && (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <p className="text-[12px] font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Possible existing patient
                  </p>
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-md bg-white border border-amber-100 p-2.5"
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-navy">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {m.uhid} • {m.mobile}
                          {m.lastVisit &&
                            ` • Last visit: ${new Date(m.lastVisit).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7 rounded-full"
                        onClick={() => navigate({ to: "/admin/patients" })}
                      >
                        <Eye size={12} className="mr-1" /> View
                      </Button>
                    </div>
                  ))}
                  <p className="text-[11px] text-amber-700">
                    If this is a different patient, you may continue registration.
                  </p>
                </div>
              )}
            </div>

            {/* DOB / Age */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">
                Date of Birth <span className="text-destructive">*</span>
              </Label>

              {form.dobMode === "dob" ? (
                <>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className={`h-11 bg-secondary/10 ${errors.dob ? "border-red-500" : ""}`}
                  />
                  {form.dob && (
                    <p className="text-[12px] text-muted-foreground">
                      Age: <span className="font-semibold text-navy">{formatAge(form.dob)}</span>
                    </p>
                  )}
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.dobMode === "age"}
                      onChange={() => updateField("dobMode", "age")}
                      className="rounded border-border"
                    />
                    <span className="text-[12px] text-muted-foreground">
                      Patient does not know exact DOB
                    </span>
                  </label>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={form.approxAge}
                      onChange={(e) => updateField("approxAge", e.target.value)}
                      placeholder="Age"
                      min="0"
                      max="150"
                      className={`h-11 bg-secondary/10 w-24 ${errors.approxAge ? "border-red-500" : ""}`}
                    />
                    <span className="text-sm text-muted-foreground">Years (Approximate)</span>
                  </div>
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.dobMode === "dob"}
                      onChange={() => updateField("dobMode", "dob")}
                      className="rounded border-border"
                    />
                    <span className="text-[12px] text-muted-foreground">
                      Enter exact date of birth instead
                    </span>
                  </label>
                </>
              )}
              {errors.dob && <p className="text-[11px] text-red-500 font-medium">{errors.dob}</p>}
              {errors.approxAge && (
                <p className="text-[11px] text-red-500 font-medium">{errors.approxAge}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">
                Gender <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2 flex-wrap">
                {GENDERS.map((g) => (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() => updateField("gender", g.value)}
                    className={`px-5 py-2.5 rounded-lg text-[13px] font-semibold border transition-all ${
                      form.gender === g.value
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-secondary/20 text-navy border-border hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              {errors.gender && (
                <p className="text-[11px] text-red-500 font-medium">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Department & Doctor Card */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5">
            <h3 className="font-display text-[15px] font-bold text-navy flex items-center gap-2">
              <Stethoscope size={16} className="text-primary" /> Department & Doctor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Department */}
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold text-navy">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.department}
                  onValueChange={(val) => updateField("department", val)}
                >
                  <SelectTrigger
                    className={`h-11 bg-secondary/10 ${errors.department ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.department}</p>
                )}
              </div>

              {/* Doctor */}
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold text-navy">Doctor Assigned</Label>
                <Select
                  value={form.doctor}
                  onValueChange={(val) => updateField("doctor", val)}
                  disabled={!form.department}
                >
                  <SelectTrigger className="h-11 bg-secondary/10">
                    <SelectValue
                      placeholder={form.department ? "Select Doctor" : "Select department first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDoctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 pb-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-11 px-6"
              onClick={() => navigate({ to: "/admin/patients" })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || uhidLoading}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-8 shadow-md transition-transform hover:-translate-y-0.5"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="mr-2" /> Save & Register
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ─── RIGHT: Patient Summary Panel ─── */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Patient Summary
              </h4>

              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {form.name
                    ? form.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "?"}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-navy">{form.name || "New Patient"}</p>
                  <p className="text-[11px] text-muted-foreground">{uhid || "Generating ID…"}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Quick info */}
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium text-navy capitalize">{form.gender || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium text-navy">
                    {form.dobMode === "dob" && form.dob
                      ? formatAge(form.dob)
                      : form.approxAge
                        ? `${form.approxAge}Y (approx)`
                        : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium text-navy">
                    {form.mobile ? `${form.countryCode} ${form.mobile}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium text-navy">
                    {DEPARTMENTS.find((d) => d.id === form.department)?.label || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium text-navy truncate max-w-[140px]">
                    {availableDoctors.find((d) => d.id === form.doctor)?.name || "—"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Progress */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Registration Progress
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "Name", done: !!form.name.trim() },
                    { label: "Mobile", done: form.mobile.length >= 10 },
                    {
                      label: "DOB / Age",
                      done:
                        (form.dobMode === "dob" && !!form.dob) ||
                        (form.dobMode === "age" && !!form.approxAge),
                    },
                    { label: "Gender", done: !!form.gender },
                    { label: "Department", done: !!form.department },
                    { label: "Doctor", done: !!form.doctor },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-2 text-[12px]">
                      {step.done ? (
                        <CheckCircle2 size={14} className="text-success shrink-0" />
                      ) : (
                        <div className="size-3.5 rounded-full border-2 border-border shrink-0" />
                      )}
                      <span
                        className={step.done ? "text-navy font-medium" : "text-muted-foreground"}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
