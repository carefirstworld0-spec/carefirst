import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, child, onValue } from "firebase/database";
import { AlertCircle, Clock } from "lucide-react";

export function Dashboard() {
  const [trialExpires, setTrialExpires] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [stats, setStats] = useState(() => {
    if (typeof window !== "undefined") {
      const clinicKey = localStorage.getItem("user_clinic");
      if (clinicKey) {
        const cached = sessionStorage.getItem(`dash_stats_${clinicKey}`);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {}
        }
      }
    }
    return {
      patients: 0,
      appointments: 0,
      revenue: 0,
      staff: 0,
    };
  });

  useEffect(() => {
    const fetchTrialData = async () => {
      const uid = localStorage.getItem("user_uid");
      const clinicKey = localStorage.getItem("user_clinic");

      if (uid && clinicKey) {
        // Fetch trial data
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `carefirst/users/${clinicKey}/signup`));

        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.trialExpires) {
            const expiryDate = new Date(data.trialExpires);
            const now = new Date();

            setTrialExpires(
              expiryDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            );

            const diffTime = expiryDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
              setIsExpired(true);
              setDaysLeft(0);
            } else {
              setIsExpired(false);
              setDaysLeft(diffDays);
            }
          }
        }

        // Real-time listeners for dashboard stats
        const clinicRef = ref(db, `carefirst/users/${clinicKey}`);

        const unsubPatients = onValue(child(clinicRef, "patients"), (snap) => {
          setStats((s) => {
            const next = { ...s, patients: snap.exists() ? Object.keys(snap.val()).length : 0 };
            sessionStorage.setItem(`dash_stats_${clinicKey}`, JSON.stringify(next));
            return next;
          });
        });
        const unsubAppointments = onValue(child(clinicRef, "appointments"), (snap) => {
          setStats((s) => {
            const next = {
              ...s,
              appointments: snap.exists() ? Object.keys(snap.val()).length : 0,
            };
            sessionStorage.setItem(`dash_stats_${clinicKey}`, JSON.stringify(next));
            return next;
          });
        });
        const unsubPayments = onValue(child(clinicRef, "payments"), (snap) => {
          let total = 0;
          if (snap.exists()) {
            Object.values(snap.val()).forEach((p: any) => {
              if (p.amount) total += Number(p.amount);
            });
          }
          setStats((s) => {
            const next = { ...s, revenue: total };
            sessionStorage.setItem(`dash_stats_${clinicKey}`, JSON.stringify(next));
            return next;
          });
        });
        const unsubStaff = onValue(child(clinicRef, "staff"), (snap) => {
          setStats((s) => {
            const next = { ...s, staff: snap.exists() ? Object.keys(snap.val()).length : 0 };
            sessionStorage.setItem(`dash_stats_${clinicKey}`, JSON.stringify(next));
            return next;
          });
        });

        return () => {
          unsubPatients();
          unsubAppointments();
          unsubPayments();
          unsubStaff();
        };
      }
    };

    fetchTrialData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500 ease-out">
        <h1 className="text-[24px] font-extrabold tracking-tight text-navy font-display">
          Dashboard Overview
        </h1>
      </div>

      {/* Trial Plan Alert */}
      {trialExpires && (
        <div
          className={`flex flex-col sm:flex-row items-start gap-3 sm:gap-4 rounded-[12px] p-3 sm:p-4 border animate-in fade-in zoom-in-[0.98] slide-in-from-top-3 duration-700 ease-out fill-mode-both ${
            isExpired
              ? "bg-destructive/10 border-destructive/20 text-destructive shadow-sm"
              : "bg-orange/10 border-orange/20 text-orange shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          }`}
        >
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto flex-1">
            <div
              className={`mt-0.5 grid size-7 sm:size-8 shrink-0 place-items-center rounded-full relative ${
                isExpired ? "bg-destructive/20" : "bg-orange/20"
              }`}
            >
              {!isExpired && (
                <span className="absolute inset-0 rounded-full bg-orange/40 animate-ping opacity-75" style={{ animationDuration: '3s' }}></span>
              )}
              {isExpired ? (
                <AlertCircle size={14} className="sm:w-[18px] sm:h-[18px] relative z-10" />
              ) : (
                <Clock size={14} className="sm:w-[18px] sm:h-[18px] relative z-10" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-[13px] sm:text-[14px] font-bold">
                {isExpired ? "Trial Plan Expired" : "7-Day Trial Plan Active"}
              </h3>
              <p className="mt-0.5 sm:mt-1 text-[11.5px] sm:text-[13px] opacity-90 leading-relaxed max-w-3xl">
                {isExpired
                  ? `Your trial period expired on ${trialExpires}. Please upgrade your subscription to continue using the CareFirst Clinic Admin features without interruption.`
                  : `You are currently exploring CareFirst on a free trial. You have ${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining. Your trial expires on ${trialExpires}.`}
              </p>
            </div>
          </div>
          {!isExpired && (
            <button className="w-full sm:w-auto shrink-0 rounded-[8px] bg-orange px-3 py-2 text-[12.5px] sm:text-[12px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange/90 hover:shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 delay-300 fill-mode-both">
              Upgrade Now
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Real-time stats cards */}
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both hover:-translate-y-1 transition-transform">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Total Patients
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-navy">
            {stats.patients.toLocaleString()}
          </div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both hover:-translate-y-1 transition-transform">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Appointments
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-navy">
            {stats.appointments.toLocaleString()}
          </div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both hover:-translate-y-1 transition-transform">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Revenue (Month)
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-navy">
            ₹{stats.revenue.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="rounded-[12px] sm:rounded-[16px] border border-border bg-card p-3 sm:p-5 shadow-sm ring-1 ring-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both hover:-translate-y-1 transition-transform">
          <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">
            Active Staff
          </div>
          <div className="mt-1 sm:mt-2 text-[20px] sm:text-[28px] font-display font-extrabold text-navy">
            {stats.staff.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-card p-6 shadow-sm ring-1 ring-border/50 min-h-[400px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both">
        <h3 className="font-display text-[15px] font-bold text-navy mb-4">Recent Activity</h3>
        <p className="text-[13px] font-medium text-muted-foreground">
          Welcome to your new CareFirst admin panel. Activity logs will appear here once your staff
          begins using the system.
        </p>
      </div>
    </div>
  );
}
