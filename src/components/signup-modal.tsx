import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinic: "",
    practiceType: "Clinic",
    password: "",
    agreeTerms: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.replace(/\D/g, "").length < 8) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.clinic.trim()) newErrors.clinic = "Practice or hospital name is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate secure registration process
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      clinic: "",
      practiceType: "Clinic",
      password: "",
      agreeTerms: true,
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          if (submitted) handleReset();
          else onOpenChange(false);
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-lg overflow-y-auto p-6 sm:p-8">
        {!submitted ? (
          <>
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HeartPulse size={18} />
                </span>
                <span className="font-display text-sm font-bold tracking-tight text-navy">
                  carefirst
                </span>
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-navy sm:text-3xl">
                Create your account
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
                Join healthcare professionals managing smarter practices with CareFirst. Free 7-day trial included.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-navy">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Dr. Aditi Sharma"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${
                      errors.name ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Work Email & Phone Number (2 columns on sm) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-navy">
                    Work Email <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={`h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${
                        errors.email ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      className={`h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${
                        errors.phone ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Clinic Name & Practice Type */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-navy">
                    Clinic / Hospital Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Apex Health Clinic"
                      value={formData.clinic}
                      onChange={(e) => {
                        setFormData({ ...formData, clinic: e.target.value });
                        if (errors.clinic) setErrors({ ...errors, clinic: "" });
                      }}
                      className={`h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${
                        errors.clinic ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.clinic && (
                    <p className="mt-1 text-xs text-destructive">{errors.clinic}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy">
                    Organization Type
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      value={formData.practiceType}
                      onChange={(e) =>
                        setFormData({ ...formData, practiceType: e.target.value })
                      }
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    >
                      <option value="Clinic">Single Clinic</option>
                      <option value="Multi-branch Clinic">Multi-Branch Clinic</option>
                      <option value="Hospital">Hospital (OPD/IPD)</option>
                      <option value="Dental Practice">Dental Care Center</option>
                      <option value="Diagnostic Lab">Pathology / Diagnostic Lab</option>
                      <option value="Pharmacy">Pharmacy / Retail</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-navy">
                  Create Password <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={`h-11 w-full rounded-md border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary ${
                      errors.password ? "border-destructive" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => {
                      setFormData({ ...formData, agreeTerms: e.target.checked });
                      if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: "" });
                    }}
                    className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    I agree to the{" "}
                    <span className="font-semibold text-navy underline">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-navy underline">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1 text-xs text-destructive">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="orange"
                size="lg"
                disabled={loading}
                className="w-full text-sm font-bold shadow-md"
              >
                {loading ? "Creating your account..." : "Create Account & Start Free Trial"}
                {!loading && <ArrowRight size={16} />}
              </Button>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground">
                <ShieldCheck size={14} className="text-success" />
                <span>256-bit encrypted · No credit card required</span>
              </div>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
              <CheckCircle2 size={36} className="text-success" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold text-navy">
              Welcome aboard, {formData.name.split(" ")[0]}!
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your CareFirst account for{" "}
              <strong className="text-navy">{formData.clinic}</strong> has been created.
              A confirmation email has been sent to{" "}
              <span className="font-semibold text-foreground">{formData.email}</span>.
            </p>

            <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-navy">
                <span className="grid size-5 place-items-center rounded bg-primary text-primary-foreground text-[10px]">
                  ✓
                </span>
                <span>Next Steps:</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li>• 7-day full access trial is active for your practice.</li>
                <li>• Our onboarding specialist will reach out to configure custom doctor schedules.</li>
              </ul>
            </div>

            <Button
              variant="default"
              size="lg"
              onClick={handleReset}
              className="mt-6 w-full font-bold"
            >
              Explore Clinical Features <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
