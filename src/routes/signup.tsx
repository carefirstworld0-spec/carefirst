import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const submitSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSending(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const clinic = formData.get("clinic") as string;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await set(ref(db, "users/" + user.uid), {
        name,
        email,
        clinic,
        createdAt: new Date().toISOString(),
        trialExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Redirect directly to the dashboard demo account
      navigate({ to: "/dashboard" });
      
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during signup");
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side: branding/copy */}
      <div className="hidden lg:flex flex-1 flex-col justify-between blue-surface p-12 text-primary-foreground">
        <div>
          <a href="/" className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <span className="grid size-8 place-items-center rounded bg-primary text-primary-foreground">
              <Activity size={18} />
            </span>
            CareFirst
          </a>
        </div>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[.15em] text-primary-foreground/70">
            TAKE THE NEXT STEP
          </span>
          <h1 className="display-title mt-4 text-[clamp(2.4rem,4.6vw,3.75rem)] leading-[1.1]">
            Ready to make more room for care?
          </h1>
          <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
            Set up your 7-day free trial and experience a calmer, more organized clinic today.
          </p>
          <div className="mt-7 flex flex-wrap gap-4 text-sm text-primary-foreground/90">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> Instant demo access</span>
          </div>
        </div>
        <div className="text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} CareFirst Software Solutions.
        </div>
      </div>

      {/* Right side: form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-10">
            <a href="/" className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-navy">
              <span className="grid size-8 place-items-center rounded bg-primary text-primary-foreground">
                <Activity size={18} />
              </span>
              CareFirst
            </a>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy">
              Let's get to know you
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your account to access your demo space. Or <Link to="/" className="font-medium text-primary hover:underline">go back to home</Link>.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={submitSignup}>
            <div className="grid gap-4">
              {([
                { name: "name", label: "Your name", placeholder: "Dr. Aditi Sharma", type: "text" },
                { name: "email", label: "Work email", placeholder: "you@clinic.com", type: "email" },
                { name: "password", label: "Password", placeholder: "Create a secure password", type: "password" },
                { name: "clinic", label: "Clinic / hospital name", placeholder: "Your practice name", type: "text" },
              ] as const).map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-xs font-semibold text-navy mb-1.5">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required
                    className="block h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground outline-none transition-colors focus:border-primary"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" variant="orange" size="lg" className="w-full h-12 text-base font-bold shadow-lg shadow-orange/20" disabled={sending}>
                {sending ? "Creating your demo..." : "Start your 7-day free trial"} {!sending && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
