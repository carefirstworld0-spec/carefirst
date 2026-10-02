import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRY_CODES, GOV_ID_TYPES, RELATIONSHIPS, COMMON_CONDITIONS } from "../../utils/constants";
import { stripNonDigits } from "../../utils/validation";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export function StepContactMedical({ formData, updateField, errors, matches, checking, checkDuplicate, clearMatches }: any) {
  
  const handleMobileChange = (value: string) => {
    const digits = stripNonDigits(value);
    const maxDigits = COUNTRY_CODES.find(c => c.code === formData.countryCode)?.maxDigits || 10;
    if (digits.length <= maxDigits) {
      updateField("mobile", digits);
      if (digits.length === maxDigits) checkDuplicate(digits);
      else clearMatches();
    }
  };

  const handleEmergencyMobileChange = (value: string) => {
    const digits = stripNonDigits(value);
    const maxDigits = COUNTRY_CODES.find(c => c.code === formData.emergencyCountryCode)?.maxDigits || 10;
    if (digits.length <= maxDigits) {
      updateField("emergencyPhone", digits);
    }
  };

  const toggleCondition = (cond: string) => {
    if (formData.conditions.includes(cond)) {
      updateField("conditions", formData.conditions.filter((c: string) => c !== cond));
    } else {
      updateField("conditions", [...formData.conditions, cond]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ─── Contact Details ─── */}
      <div>
        <h3 className="text-lg font-display font-bold text-navy border-b border-border pb-2 mb-4">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Mobile Number <span className="text-destructive">*</span></Label>
            <div className={`flex items-center rounded-md border bg-secondary/10 focus-within:ring-1 focus-within:ring-ring transition-colors ${errors.mobile ? "border-red-500 focus-within:ring-red-500" : "border-input"}`}>
              <Select value={formData.countryCode} onValueChange={val => updateField("countryCode", val)}>
                <SelectTrigger className="w-[80px] shrink-0 h-11 border-0 bg-transparent shadow-none focus:ring-0 rounded-r-none pr-1 pl-3 font-medium">
                  <span className="truncate">{formData.countryCode}</span>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.country})</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="w-px h-6 bg-border shrink-0" />
              <input value={formData.mobile} onChange={e => handleMobileChange(e.target.value)} placeholder="9876543210" className="flex-1 h-11 bg-transparent border-0 px-3 text-sm focus:outline-none min-w-0" />
            </div>
            {errors.mobile && <p className="text-[11px] text-red-500 font-medium">{errors.mobile}</p>}
            
            {/* Duplicate Checker */}
            {checking && <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1"><Loader2 size={12} className="animate-spin" /> Checking...</p>}
            {!checking && formData.mobile.length >= 10 && matches.length === 0 && <p className="text-[11px] text-success font-medium flex items-center gap-1.5 mt-1"><CheckCircle2 size={12} /> Unique</p>}
            {matches.length > 0 && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                <AlertTriangle size={14} className="inline mr-1" /> Possible duplicate detected ({matches.length})
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Email (Optional)</Label>
            <Input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="patient@example.com" className="h-11 bg-secondary/10" />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[13px] font-bold text-navy">Address</Label>
            <Input value={formData.addressLine1} onChange={e => updateField("addressLine1", e.target.value)} placeholder="House/Flat No., Building Name" className="h-11 bg-secondary/10 mb-2" />
            <Input value={formData.addressLine2} onChange={e => updateField("addressLine2", e.target.value)} placeholder="Street, Locality (Optional)" className="h-11 bg-secondary/10 mb-3" />
            <div className="grid grid-cols-3 gap-3">
              <Input value={formData.city} onChange={e => updateField("city", e.target.value)} placeholder="City" className="h-11 bg-secondary/10" />
              <Input value={formData.state} onChange={e => updateField("state", e.target.value)} placeholder="State" className="h-11 bg-secondary/10" />
              <Input value={formData.pincode} onChange={e => updateField("pincode", e.target.value)} placeholder="PIN Code" className="h-11 bg-secondary/10" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Emergency Contact ─── */}
      <div>
        <h3 className="text-lg font-display font-bold text-navy border-b border-border pb-2 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Name</Label>
            <Input value={formData.emergencyName} onChange={e => updateField("emergencyName", e.target.value)} placeholder="Contact Name" className="h-11 bg-secondary/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Relationship</Label>
            <Select value={formData.emergencyRelation} onValueChange={val => updateField("emergencyRelation", val)}>
              <SelectTrigger className="h-11 bg-secondary/10"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map(r => <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Phone</Label>
            <div className="flex items-center rounded-md border bg-secondary/10 border-input focus-within:ring-1 focus-within:ring-ring transition-colors">
              <Select value={formData.emergencyCountryCode} onValueChange={val => updateField("emergencyCountryCode", val)}>
                <SelectTrigger className="w-[80px] shrink-0 h-11 border-0 bg-transparent shadow-none focus:ring-0 rounded-r-none pr-1 pl-3 font-medium">
                  <span className="truncate">{formData.emergencyCountryCode}</span>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.country})</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="w-px h-6 bg-border shrink-0" />
              <input value={formData.emergencyPhone} onChange={e => handleEmergencyMobileChange(e.target.value)} placeholder="Emergency Contact" className="flex-1 h-11 bg-transparent border-0 px-3 text-sm focus:outline-none min-w-0" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Medical History ─── */}
      <div>
        <h3 className="text-lg font-display font-bold text-navy border-b border-border pb-2 mb-4">Medical Background</h3>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">Known Conditions</Label>
            <div className="flex gap-2 flex-wrap mt-2">
              {COMMON_CONDITIONS.map(cond => (
                <button
                  key={cond} type="button"
                  onClick={() => toggleCondition(cond)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${formData.conditions.includes(cond) ? "bg-red-100 text-red-800 border-red-200" : "bg-secondary/20 text-muted-foreground border-border hover:bg-secondary"}`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">Allergies (if any)</Label>
              <Textarea 
                value={formData.allergies.join(", ")} 
                onChange={e => updateField("allergies", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
                placeholder="Peanuts, Penicillin, etc. (comma separated)" 
                className="bg-secondary/10 resize-none h-20" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-navy">Current Medications</Label>
              <Textarea 
                value={formData.medications.join(", ")} 
                onChange={e => updateField("medications", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
                placeholder="Ongoing treatments (comma separated)" 
                className="bg-secondary/10 resize-none h-20" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Gov ID ─── */}
      <div>
        <h3 className="text-lg font-display font-bold text-navy border-b border-border pb-2 mb-4">Identification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">ID Type</Label>
            <Select value={formData.govIdType} onValueChange={val => updateField("govIdType", val)}>
              <SelectTrigger className="h-11 bg-secondary/10"><SelectValue placeholder="Select ID Type" /></SelectTrigger>
              <SelectContent>
                {GOV_ID_TYPES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-navy">ID Number</Label>
            <Input value={formData.govIdNumber} onChange={e => updateField("govIdNumber", e.target.value)} placeholder="Number will be masked securely" className="h-11 bg-secondary/10" disabled={!formData.govIdType} />
          </div>
        </div>
      </div>

    </div>
  );
}
