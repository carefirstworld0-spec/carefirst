import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, child } from "firebase/database";
import {
  Users,
  Building2,
  Activity,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const statusBadge = (status: string) => {
  if (status === "Active")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
        <span className="size-1.5 rounded-full bg-success" /> Active
      </span>
    );
  if (status === "Trial")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange/15 px-2 py-0.5 text-[10px] font-bold text-orange">
        <span className="size-1.5 rounded-full bg-orange" /> Trial
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
      <span className="size-1.5 rounded-full bg-destructive" /> {status}
    </span>
  );
};

const alertIcon = (type: string) => {
  if (type === "info") return <Info size={14} className="text-navy" />;
  if (type === "success") return <CheckCircle2 size={14} className="text-success" />;
  return <AlertTriangle size={14} className="text-orange" />;
};

export function SuperAdminDashboard() {
  const [totalClinics, setTotalClinics] = useState(0);
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [popupRegs, setPopupRegs] = useState<any[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [uptimeStr, setUptimeStr] = useState("Calculating...");

  useEffect(() => {
    // Real-time uptime counter
    const startDate = new Date("2026-09-01T00:00:00Z").getTime();
    const interval = setInterval(() => {
      const diff = new Date().getTime() - startDate;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setUptimeStr(`Live: ${days}d ${hours}h ${mins}m ${secs}s`);
    }, 1000);
    const fetchData = async () => {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "carefirst/users"));
      if (snapshot.exists()) {
        const clinicsData = snapshot.val();
        let count = 0;
        const regs: any[] = [];

        for (const clinicKey in clinicsData) {
          count++;
          const signupData = clinicsData[clinicKey]?.signup;
          if (signupData) {
            regs.push({
              name: signupData.clinic || clinicKey,
              userName: signupData.name || "N/A",
              phone: signupData.phone || "N/A",
              email: signupData.email || "N/A",
              location: signupData.phone || signupData.email || "N/A",
              plan: "7-Day Trial",
              date: new Date(signupData.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: new Date(signupData.trialExpires) > new Date() ? "Trial" : "Expired",
              createdAtMs: new Date(signupData.createdAt).getTime(),
            });
          }
        }

        setTotalClinics(count);
        regs.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setRecentRegs(regs.slice(0, 5));

        const lastViewed = parseInt(localStorage.getItem("superAdminLastViewedMs") || "0", 10);
        const newRegs = regs.filter((r) => r.createdAtMs > lastViewed);
        
        if (newRegs.length > 0) {
          setPopupRegs(newRegs.slice(0, 5));
          setShowWelcomeModal(true);
        }
      }
    };
    fetchData();

    return () => clearInterval(interval);
  }, []);

  const statsData = [
    {
      label: "Total Clinics",
      value: totalClinics.toString(),
      trend: "Total registered",
      trendUp: true,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
      gradient: "from-primary/5 to-primary/0",
    },
    {
      label: "Active Doctors",
      value: totalClinics.toString(),
      trend: "Total active profiles",
      trendUp: true,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      gradient: "from-emerald-500/5 to-emerald-500/0",
    },
    {
      label: "Platform Uptime",
      value: "99.99%",
      trend: uptimeStr,
      trendUp: true,
      icon: Activity,
      color: "text-orange",
      bg: "bg-orange/10",
      gradient: "from-orange/5 to-orange/0",
    },
    {
      label: "Total Revenue",
      value: "₹0",
      trend: "Trial periods active",
      trendUp: true,
      icon: Wallet,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      gradient: "from-indigo-500/5 to-indigo-500/0",
    },
  ];

  const dynamicAlerts = recentRegs.slice(0, 4).map((reg) => ({
    title: "New Clinic Registration",
    desc: `${reg.name} joined the platform`,
    time: reg.date,
    type: "info",
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={(open) => {
        setShowWelcomeModal(open);
        if (!open && popupRegs.length > 0) {
          localStorage.setItem("superAdminLastViewedMs", popupRegs[0].createdAtMs.toString());
        }
      }}>
        <DialogContent className="max-w-[900px] p-0 overflow-hidden border-0 shadow-2xl rounded-[24px] [&>button]:text-white">
          <div className="bg-gradient-to-br from-navy to-[#1a4a6e] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 transform translate-x-12 -translate-y-12">
              <Building2 size={180} />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-[26px] font-display font-extrabold tracking-tight">
                New Registrations Overview
              </DialogTitle>
              <p className="text-white/80 text-[15px] mt-2 font-medium max-w-lg">
                Welcome back, Super Admin. Here are the latest clinics that have signed up for a
                trial recently.
              </p>
            </DialogHeader>
          </div>
          <div className="p-8 bg-background">
            <div className="bg-card rounded-[16px] overflow-hidden shadow-sm ring-1 ring-border/40">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/20">
                      <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                        Clinic Name
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                        User Name
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-right text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {popupRegs.length > 0 ? (
                      popupRegs.map((reg, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/20 last:border-0 hover:bg-secondary/10 transition-colors"
                        >
                          <td className="px-6 py-4.5">
                            <div className="text-[14px] font-bold text-navy">{reg.name}</div>
                            <div className="text-[12px] font-medium text-muted-foreground mt-0.5">
                              {reg.date}
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-2">
                              <div className="grid size-7 place-items-center rounded-full bg-secondary/80 text-[11px] font-bold text-navy">
                                {reg.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-[13px] font-semibold text-navy">
                                {reg.userName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="text-[13px] font-bold text-navy">{reg.phone}</div>
                            <div className="text-[12px] text-muted-foreground">{reg.email}</div>
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <button className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white hover:scale-105">
                              <ArrowUpRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-10 text-center text-[14px] font-medium text-muted-foreground"
                        >
                          No recent registrations to display.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  if (popupRegs.length > 0) {
                    localStorage.setItem("superAdminLastViewedMs", popupRegs[0].createdAtMs.toString());
                  }
                }}
                className="px-8 py-3 rounded-[12px] bg-navy text-white text-[14px] font-bold hover:bg-navy/90 transition-all shadow-lg hover:-translate-y-0.5"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-extrabold tracking-tight text-navy">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">
            Here's a live summary of your platform's activity.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-[10px] bg-card px-3 py-2 shadow-sm ring-1 ring-border sm:flex">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-[12px] font-semibold text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsData.map((stat, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-[14px] bg-card p-3.5 sm:p-4 shadow-sm ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div
                    className={`grid size-8 sm:size-10 place-items-center rounded-[8px] sm:rounded-[10px] ${stat.bg} shrink-0`}
                  >
                    <stat.icon size={16} className={`sm:w-[18px] sm:h-[18px] ${stat.color}`} />
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/80 line-clamp-1">
                    {stat.label}
                  </div>
                </div>
                {stat.trendUp && (
                  <div className="flex shrink-0 items-center gap-1 text-[10px] sm:text-[11px] font-bold text-success">
                    <TrendingUp size={12} />
                  </div>
                )}
              </div>
              <div className="mt-2.5 sm:mt-3">
                <div className="font-display text-[20px] sm:text-[24px] font-extrabold leading-none text-navy">
                  {stat.value}
                </div>
              </div>
              <div className="mt-2 sm:mt-3 border-t border-border/40 pt-2 sm:pt-3 text-[10px] sm:text-[12px] font-medium text-muted-foreground line-clamp-1">
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Recent Registrations */}
        <div className="overflow-hidden rounded-[16px] bg-card shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <div>
              <h3 className="font-display text-[14px] font-bold text-navy">Recent Registrations</h3>
              <p className="text-[11px] text-muted-foreground">
                Latest clinics & hospitals onboarded
              </p>
            </div>
            <button className="flex items-center gap-1 rounded-[8px] bg-secondary/60 px-3 py-1.5 text-[12px] font-bold text-primary transition-colors hover:bg-primary/10">
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/20">
                  <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
                    Clinic / Hospital
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.length > 0 ? (
                  recentRegs.map((reg, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/20 transition-colors last:border-0 hover:bg-secondary/20"
                    >
                      <td className="px-6 py-3.5">
                        <div className="text-[13px] font-semibold text-navy">{reg.name}</div>
                        <div className="text-[11px] text-muted-foreground">{reg.location}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                          {reg.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] font-medium text-muted-foreground">
                        {reg.date}
                      </td>
                      <td className="px-4 py-3.5">{statusBadge(reg.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-[13px] text-muted-foreground"
                    >
                      No recent registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="rounded-[16px] bg-card shadow-sm ring-1 ring-border">
          <div className="border-b border-border/50 px-5 py-4">
            <h3 className="font-display text-[14px] font-bold text-navy">System Alerts</h3>
            <p className="text-[11px] text-muted-foreground">Recent platform activity</p>
          </div>
          <div className="divide-y divide-border/30 p-2">
            {dynamicAlerts.length > 0 ? (
              dynamicAlerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-[10px] p-3.5 transition-colors hover:bg-secondary/30"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/60">
                    {alertIcon(alert.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-navy">{alert.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                      {alert.desc}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wide">
                      <Clock size={10} />
                      {alert.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[12px] text-muted-foreground">
                No recent alerts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
