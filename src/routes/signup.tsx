import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const submitSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simulate submission
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-background p-6 shadow-2xl border border-border sm:p-8">
        <div>
          <h2 className="mt-2 text-center font-display text-3xl font-bold tracking-tight text-navy">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or <Link to="/" className="font-medium text-primary hover:underline">go back to home</Link>
          </p>
        </div>

        {submitted ? (
          <div role="status" className="mt-6 rounded-lg bg-secondary p-5">
            <CheckCircle2 className="text-success" />
            <h4 className="mt-3 font-display font-bold text-navy">Your account was created</h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We have saved your details. Email delivery isn't active yet, so you will not receive a confirmation email.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setSubmitted(false)}>
              Sign up again
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={submitSignup}>
            <div className="grid gap-4">
              {([
                { name: "name", label: "Your name", placeholder: "Dr. Aditi Sharma", type: "text" },
                { name: "email", label: "Work email", placeholder: "you@clinic.com", type: "email" },
                { name: "password", label: "Password", placeholder: "Create a password", type: "password" },
                { name: "clinic", label: "Clinic / hospital name", placeholder: "Your practice name", type: "text" },
              ] as const).map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="text-xs font-semibold text-navy">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required
                    className="mt-2 block h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-primary"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button type="submit" variant="orange" size="lg" className="w-full" disabled={sending}>
                {sending ? "Creating account..." : "Create Account"} {!sending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
