import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VISIT_TYPES, ADMISSION_TYPES, PAYMENT_CATEGORIES, DEPARTMENTS } from "../../utils/constants";
import { useDoctors } from "../../hooks/useDoctors";
import { Stethoscope, ShieldCheck, HeartHandshake } from "lucide-react";

export function StepVisitConsent({ formData, updateField, errors, clinicKey }: any) {
  const { getDoctorsByDepartment } = useDoctors(clinicKey);
  const availableDoctors = formData.department ? getDoctorsByDepartment(formData.department) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ─── Visit Information ─── */}
      <div>
        <h3 className="text-lg font-display font-bold text-navy border-b border-border pb-2 mb-4 flex items-center gap-2">
          <Stethoscope size={18} className="text-primary" /> Initial Visit Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Visit Type <span className="text-destructive">*</span></Label>
            <div className="flex gap-2 flex-wrap">
              {VISIT_TYPES.map(v => (
                <button
                  key={v.value} type="button"
                  onClick={() => updateField("visitType", v.value)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all ${formData.visitType === v.value ? "bg-primary text-white border-primary shadow-sm" : "bg-secondary/20 text-navy border-border hover:border-primary/40"}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Admission Type <span className="text-destructive">*</span></Label>
            <Select value={formData.admissionType} onValueChange={val => updateField("admissionType", val)}>
              <SelectTrigger className="h-11 bg-secondary/10"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {ADMISSION_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Department <span className="text-destructive">*</span></Label>
            <Select value={formData.department} onValueChange={val => updateField("department", val)}>
              <SelectTrigger className={`h-11 bg-secondary/10 ${errors.department ? "border-red-500" : ""}`}><SelectValue placeholder="Select Department" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-[11px] text-red-500 font-medium">{errors.department}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Doctor</Label>
            <Select value={formData.doctor} onValueChange={val => updateField("doctor", val)} disabled={!formData.department}>
              <SelectTrigger className="h-11 bg-secondary/10"><SelectValue placeholder={formData.department ? "Select Doctor" : "Select department first"} /></SelectTrigger>
              <SelectContent>
                {availableDoctors.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[13px] font-bold text-navy">Chief Complaint / Reason for Visit</Label>
            <Textarea 
              value={formData.chiefComplaint} 
              onChange={e => updateField("chiefComplaint", e.target.value)} 
              placeholder="E.g., Fever and cough for 3 days" 
              className="bg-secondary/10 resize-none h-20" 
            />
          </div>
        </div>
      </div>

      {/* ─── IPD Fields (Conditional) ─── */}
      {formData.admissionType === "ipd" && (
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4 animate-in slide-in-from-top-2">
          <h4 className="text-[13px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
            In-Patient Admission Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">Ward / Room <span className="text-destructive">*</span></Label>
              <Input value={formData.ward} onChange={e => updateField("ward", e.target.value)} className={`h-11 bg-white ${errors.ward ? "border-red-500" : ""}`} placeholder="E.g., General Ward A" />
              {errors.ward && <p className="text-[11px] text-red-500 font-medium">{errors.ward}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">Bed Number <span className="text-destructive">*</span></Label>
              <Input value={formData.bed} onChange={e => updateField("bed", e.target.value)} className={`h-11 bg-white ${errors.bed ? "border-red-500" : ""}`} placeholder="E.g., B-12" />
              {errors.bed && <p className="text-[11px] text-red-500 font-medium">{errors.bed}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ─── Payment & Billing ─── */}
      <div>
        <h3 className="text-lg font-display font-bold text-navy border-b border-border pb-2 mb-4 flex items-center gap-2">
          <HeartHandshake size={18} className="text-primary" /> Payment & Billing
        </h3>
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PAYMENT_CATEGORIES.map(p => (
              <button
                key={p.value} type="button"
                onClick={() => updateField("paymentCategory", p.value)}
                className={`p-3 rounded-xl border text-left transition-all ${formData.paymentCategory === p.value ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary" : "bg-card border-border hover:border-primary/30"}`}
              >
                <div className="text-xl mb-1">{p.icon}</div>
                <div className={`text-[13px] font-bold ${formData.paymentCategory === p.value ? "text-primary" : "text-navy"}`}>{p.label}</div>
              </button>
            ))}
          </div>

          {/* Conditional Payment Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-1">
            {formData.paymentCategory === "insurance" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-bold text-navy">Insurance Provider <span className="text-destructive">*</span></Label>
                  <Input value={formData.insuranceProvider} onChange={e => updateField("insuranceProvider", e.target.value)} className="h-11 bg-secondary/10" placeholder="E.g., Star Health" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-bold text-navy">Policy / TPA Number <span className="text-destructive">*</span></Label>
                  <Input value={formData.policyNumber} onChange={e => updateField("policyNumber", e.target.value)} className="h-11 bg-secondary/10" />
                </div>
              </>
            )}
            {formData.paymentCategory === "corporate" && (
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[13px] font-bold text-navy">Corporate Company <span className="text-destructive">*</span></Label>
                <Input value={formData.corporateCompany} onChange={e => updateField("corporateCompany", e.target.value)} className="h-11 bg-secondary/10" placeholder="E.g., TCS, Infosys" />
              </div>
            )}
            {formData.paymentCategory === "government" && (
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[13px] font-bold text-navy">Government Scheme Name <span className="text-destructive">*</span></Label>
                <Input value={formData.govScheme} onChange={e => updateField("govScheme", e.target.value)} className="h-11 bg-secondary/10" placeholder="E.g., Ayushman Bharat" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Legal & Consent ─── */}
      <div>
        <h3 className="text-lg font-display font-bold text-navy border-b border-border pb-2 mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" /> Legal & Consent
        </h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/10 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={formData.consentTreatment} 
              onChange={e => updateField("consentTreatment", e.target.checked)} 
              className="mt-1 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-[13px] font-bold text-navy">Consent for Treatment</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">The patient/guardian gives consent for general clinical examination and preliminary treatment.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/10 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={formData.consentComms} 
              onChange={e => updateField("consentComms", e.target.checked)} 
              className="mt-1 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-[13px] font-bold text-navy">Consent for Communications</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">The patient agrees to receive SMS/WhatsApp reminders and digital reports.</p>
            </div>
          </label>
        </div>
      </div>

    </div>
  );
}
