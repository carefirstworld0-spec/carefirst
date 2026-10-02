import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const COUNTRY_CODES = [
  { value: "+91", label: "India (+91)" },
  { value: "+1", label: "USA/Canada (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+61", label: "Australia (+61)" },
  { value: "+971", label: "UAE (+971)" },
  { value: "+65", label: "Singapore (+65)" },
  { value: "+60", label: "Malaysia (+60)" },
  { value: "+49", label: "Germany (+49)" },
  { value: "+33", label: "France (+33)" },
  { value: "+81", label: "Japan (+81)" },
];
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set, get, child } from "firebase/database";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneVal, setPhoneVal] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [openCountry, setOpenCountry] = useState(false);
  const navigate = useNavigate();

  const submitSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = countryCode + " " + phoneVal;
    const clinic = formData.get("clinic") as string;

    if (phoneVal.length !== 10) {
      setPhoneError("Mobile number must be exactly 10 digits");
      setSending(false);
      return;
    }

    try {
      // Check if mobile number is already registered in RTDB
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "carefirst/users"));
      if (snapshot.exists()) {
        const clinics = snapshot.val();
        for (const clinicKey in clinics) {
          const clinicData = clinics[clinicKey];
          if (clinicData.signup && clinicData.signup.phone === phone) {
            setErrorMsg("User already exist with this mobile number. Please log in.");
            setSending(false);
            return;
          }
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const safeClinicName = clinic.replace(/[.#$\[\]\/]/g, "").trim();
      await set(ref(db, `carefirst/users/${safeClinicName}/signup`), {
        name,
        email,
        phone,
        clinic,
        password,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        trialExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Set local storage session data
      localStorage.setItem("user_uid", user.uid);
      localStorage.setItem("user_clinic", safeClinicName);
      localStorage.setItem("user_name", name);

      // Redirect directly to the admin dashboard
      navigate({ to: "/admin" });
    } catch (err: any) {
      let friendlyError = "An error occurred during signup. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        friendlyError = "User already exist with this email. Please log in instead.";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        friendlyError = "Please enter a valid email address.";
      } else if (err.message) {
        friendlyError = err.message
          .replace("Firebase: ", "")
          .replace(/\(auth\/.*\)\.?/, "")
          .trim();
      }
      setErrorMsg(friendlyError);
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left side: Full screen height image with overlay (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-navy flex-col justify-between p-12 text-primary-foreground overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2940&auto=format&fit=crop')",
          }}
        />
      </div>

      {/* Right side: Signup Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-background px-4 py-3 sm:px-8 sm:py-8 xl:px-16">
        <div className="w-full max-w-[480px] mx-auto">
          <div className="mb-3 sm:mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[14px] font-bold text-muted-foreground hover:text-navy transition-colors"
            >
              &larr; Back
            </Link>
          </div>

          <div className="mb-3 sm:mb-6 text-left">
            <h2 className="font-display text-[22px] sm:text-[28px] font-extrabold text-navy tracking-tight leading-tight">
              Let's get to know you
            </h2>
            <p className="mt-1 text-[14px] text-muted-foreground font-medium">
              Create your account to access your demo space.
            </p>
          </div>

          <form onSubmit={submitSignup} className="space-y-2 sm:space-y-3">
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-[10px] sm:text-[11px] font-bold capitalize text-navy/80"
                >
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="h-[40px] sm:h-[44px] w-full rounded-[8px] border border-border bg-background px-4 text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Dr. Aditi Sharma"
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[10px] sm:text-[11px] font-bold capitalize text-navy/80"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-[40px] sm:h-[44px] w-full rounded-[8px] border border-border bg-background px-4 text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="you@clinic.com"
                />
              </div>
            </div>

            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:space-y-1.5">
                <label
                  htmlFor="phone"
                  className="block text-[10px] sm:text-[11px] font-bold capitalize text-navy/80"
                >
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <Popover open={openCountry} onOpenChange={setOpenCountry}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={openCountry}
                        className="flex h-[40px] sm:h-[44px] w-[85px] items-center justify-between rounded-[8px] border border-border bg-background px-3 text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all hover:bg-secondary focus:border-primary focus:ring-4 focus:ring-primary/10"
                      >
                        {countryCode}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {COUNTRY_CODES.map((country) => (
                              <CommandItem
                                key={country.value}
                                value={country.label}
                                onSelect={(currentValue) => {
                                  const selected = COUNTRY_CODES.find(
                                    (c) => c.label.toLowerCase() === currentValue.toLowerCase(),
                                  );
                                  if (selected) {
                                    setCountryCode(selected.value);
                                    setOpenCountry(false);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    countryCode === country.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {country.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex-1 relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={phoneVal}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhoneVal(val);
                        if (val.length === 10) setPhoneError("");
                      }}
                      className={cn(
                        "h-[40px] sm:h-[44px] w-full rounded-[8px] border border-border bg-background px-3 text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10",
                        phoneError
                          ? "border-destructive focus:border-destructive focus:ring-destructive/10"
                          : "",
                      )}
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
                {phoneError && (
                  <span className="block text-[11px] font-semibold text-destructive mt-1">
                    {phoneError}
                  </span>
                )}
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[10px] sm:text-[11px] font-bold capitalize text-navy/80"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="h-[40px] sm:h-[44px] w-full rounded-[8px] border border-border bg-background px-4 pr-[46px] text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 flex h-full w-[46px] items-center justify-center text-muted-foreground hover:text-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-r-[8px]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <label
                htmlFor="clinic"
                className="block text-[10px] sm:text-[11px] font-bold capitalize text-navy/80"
              >
                Clinic / hospital name
              </label>
              <input
                id="clinic"
                name="clinic"
                type="text"
                required
                className="h-[40px] sm:h-[44px] w-full rounded-[8px] border border-border bg-background px-4 text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Your practice name"
              />
            </div>

            <div className="flex items-start gap-2 sm:gap-3 pt-0 sm:pt-2">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 size-[16px] sm:size-[18px] rounded-[4px] border-border bg-background text-primary focus:ring-primary focus:ring-offset-0"
                />
              </div>
              <label
                htmlFor="terms"
                className="text-[12px] sm:text-[13px] text-muted-foreground font-medium leading-[1.4]"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy hover:underline"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {errorMsg && (
              <div className="rounded-[8px] bg-destructive/10 p-2 sm:p-3 text-[12px] sm:text-[13px] font-medium text-destructive border border-destructive/20 mt-2 sm:mt-3">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 sm:pt-4">
              <Button
                type="submit"
                variant="orange"
                disabled={sending}
                className="h-[44px] sm:h-[48px] w-full rounded-[8px] text-[15px] sm:text-[16px] font-bold shadow-lg transition-all hover:-translate-y-[1px] hover:shadow-xl hover:shadow-orange/20"
              >
                {sending ? "Creating your demo..." : "Start your 7-day free trial"}
                {!sending && <ArrowRight size={20} className="ml-2" />}
              </Button>
            </div>
          </form>

          <div className="mt-4 sm:mt-6 text-center text-[13px] sm:text-[14px] font-medium text-muted-foreground border-t border-border pt-4 sm:pt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:underline hover:text-navy transition-colors"
            >
              Log in
            </Link>
          </div>

          <div className="flex justify-center items-baseline gap-1.5 mt-6 pt-2">
            <span className="text-[14px] font-medium text-slate-500">Powered by</span>
            <span className="text-[18px] font-extrabold text-navy font-display tracking-tight">
              CareFirst
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
