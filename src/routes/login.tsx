import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, child } from "firebase/database";

export const Route = createFileRoute("/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify if data is in Firebase Realtime Database
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `carefirst/users`));

      let userFound = false;
      let userClinic = "";

      if (snapshot.exists()) {
        const clinics = snapshot.val();
        for (const clinicKey in clinics) {
          const clinicData = clinics[clinicKey];
          if (clinicData.signup && clinicData.signup.uid === user.uid) {
            userFound = true;
            userClinic = clinicKey;
            break;
          }
        }
      }

      if (userFound) {
        localStorage.setItem("user_uid", user.uid);
        localStorage.setItem("user_clinic", userClinic);

        // Cache user name for instant UI rendering
        const clinicData = (
          await get(child(ref(db), `carefirst/users/${userClinic}/signup`))
        ).val();
        if (clinicData && clinicData.name) {
          localStorage.setItem("user_name", clinicData.name);
        }

        navigate({ to: "/admin" });
      } else {
        setErrorMsg("User data not found in database.");
      }
    } catch (error: any) {
      setErrorMsg("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left side: Full screen height image with overlay (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2940&auto=format&fit=crop')",
          }}
        />
      </div>

      {/* Right side: Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-background px-4 py-3 sm:px-12 sm:py-12 xl:px-24">
        <div className="w-full max-w-[440px] mx-auto">
          <div className="mb-4 sm:mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[14px] font-bold text-muted-foreground hover:text-navy transition-colors"
            >
              &larr; Back
            </Link>
          </div>

          <div className="mb-4 sm:mb-10 text-left">
            <h2 className="font-display text-[22px] sm:text-[32px] font-extrabold text-navy tracking-tight leading-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground font-medium">
              Please sign in to your admin account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-2 sm:space-y-4">
            {errorMsg && (
              <div className="rounded-[8px] bg-destructive/15 p-3 text-sm font-semibold text-destructive">
                {errorMsg}
              </div>
            )}
            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="email"
                className="block text-[10px] sm:text-[12px] font-bold capitalize text-navy/80"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[40px] sm:h-[50px] w-full rounded-[8px] border border-border bg-background px-4 text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="admin@carefirst.world"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="password"
                className="block text-[10px] sm:text-[12px] font-bold capitalize text-navy/80"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-[40px] sm:h-[50px] w-full rounded-[8px] border border-border bg-background px-4 pr-[46px] text-[13px] sm:text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
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

            <div className="pt-2 sm:pt-6">
              <Button
                type="submit"
                variant="orange"
                disabled={isLoading}
                className="h-[44px] sm:h-[56px] w-full rounded-[8px] text-[15px] sm:text-[16px] font-bold shadow-lg transition-all hover:-translate-y-[1px] hover:shadow-xl hover:shadow-orange/20"
              >
                {isLoading ? "Signing in..." : "Sign In to Dashboard"}
                {!isLoading && <ArrowRight size={20} className="ml-2" />}
              </Button>
            </div>
          </form>

          <div className="mt-4 sm:mt-10 text-center text-[13px] sm:text-[14px] font-medium text-muted-foreground border-t border-border pt-4 sm:pt-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-primary hover:underline hover:text-navy transition-colors"
            >
              Sign up
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
