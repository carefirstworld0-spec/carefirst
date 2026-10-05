import { Label } from "@/components/ui/label";
import { Camera, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENDERS, MARITAL_STATUS, BLOOD_GROUPS, MINOR_AGE_THRESHOLD } from "../../utils/constants";
import { formatAge, isMinor } from "../../utils/validation";

export function StepBasicInfo({ formData, updateField, errors }: any) {
  const isPatientMinor = 
    formData.dobMode === "dob" && formData.dob 
      ? isMinor(formData.dob, MINOR_AGE_THRESHOLD)
      : formData.dobMode === "age" && formData.approxAge
      ? parseInt(formData.approxAge, 10) < MINOR_AGE_THRESHOLD
      : false;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-display font-bold text-navy">Basic Information</h3>
        <p className="text-[13px] text-muted-foreground mt-1">
          Provide the patient's personal identity details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[13px] font-bold text-navy">
            Patient Photo & Name <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-secondary/30 border border-border text-muted-foreground hover:bg-secondary/50 hover:text-navy transition-colors"
              title="Upload Photo"
            >
              <Camera size={20} />
            </button>
            <Input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="First and Last Name"
              className={`h-11 flex-1 ${errors.name ? "border-red-500 bg-red-50" : "bg-secondary/10"}`}
              autoFocus
            />
          </div>
          {errors.name && <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-bold text-navy">
            Date of Birth <span className="text-destructive">*</span>
          </Label>
          {formData.dobMode === "dob" ? (
            <>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={`h-11 bg-secondary/10 ${errors.dob ? "border-red-500" : ""}`}
              />
              {formData.dob && (
                <p className="text-[12px] text-muted-foreground">
                  Age: <span className="font-semibold text-navy">{formatAge(formData.dob)}</span>
                </p>
              )}
              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => updateField("dobMode", "age")}
                  className="rounded border-border"
                />
                <span className="text-[12px] text-muted-foreground">Does not know exact DOB</span>
              </label>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={formData.approxAge}
                  onChange={(e) => updateField("approxAge", e.target.value)}
                  placeholder="Age"
                  min="0"
                  max="150"
                  className={`h-11 bg-secondary/10 w-24 ${errors.approxAge ? "border-red-500" : ""}`}
                />
                <span className="text-sm text-muted-foreground">Years (Approx)</span>
              </div>
              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => updateField("dobMode", "dob")}
                  className="rounded border-border"
                />
                <span className="text-[12px] text-muted-foreground">Enter exact date</span>
              </label>
            </>
          )}
          {errors.dob && <p className="text-[11px] text-red-500 font-medium">{errors.dob}</p>}
          {errors.approxAge && (
            <p className="text-[11px] text-red-500 font-medium">{errors.approxAge}</p>
          )}
          {isPatientMinor && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 p-2 text-[11px] text-amber-800 border border-amber-200">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>Patient is a minor (under {MINOR_AGE_THRESHOLD}). Guardian details will be required.</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-bold text-navy">
            Gender <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2 flex-wrap">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => updateField("gender", g.value)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all ${formData.gender === g.value ? "bg-primary text-white border-primary shadow-sm" : "bg-secondary/20 text-navy border-border hover:border-primary/40 hover:bg-primary/5"}`}
              >
                {g.label}
              </button>
            ))}
          </div>
          {errors.gender && <p className="text-[11px] text-red-500 font-medium">{errors.gender}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-bold text-navy">Marital Status</Label>
          <Select
            value={formData.maritalStatus}
            onValueChange={(val) => updateField("maritalStatus", val)}
          >
            <SelectTrigger className="h-11 bg-secondary/10">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-bold text-navy">Blood Group</Label>
          <Select
            value={formData.bloodGroup}
            onValueChange={(val) => updateField("bloodGroup", val)}
          >
            <SelectTrigger className="h-11 bg-secondary/10">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
