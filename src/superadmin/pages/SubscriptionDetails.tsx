import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, get, child, update } from "firebase/database";
import { ArrowLeft, User, Box, BarChart2, CreditCard, Calendar, Activity, CheckCircle2 } from "lucide-react";

export function SubscriptionDetails() {
  const { clinicId } = useParams({ from: '/superadmin/subscription/$clinicId' });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"details" | "modules" | "analytics" | "plan">("details");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Subscription form state
  const [amount, setAmount] = useState("");
  const [planType, setPlanType] = useState<"monthly" | "quarterly" | "half_year" | "yearly">("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewDate, setRenewDate] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `carefirst/users/${clinicId}/signup`));
        if (snapshot.exists()) {
          setUser(snapshot.val());
        }
      } catch (err) {
        console.error("Failed to fetch user details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [clinicId]);

  useEffect(() => {
    if (!startDate) return;
    const start = new Date(startDate);
    const renew = new Date(start);
    
    switch (planType) {
      case "monthly":
        renew.setMonth(renew.getMonth() + 1);
        break;
      case "quarterly":
        renew.setMonth(renew.getMonth() + 3);
        break;
      case "half_year":
        renew.setMonth(renew.getMonth() + 6);
        break;
      case "yearly":
        renew.setFullYear(renew.getFullYear() + 1);
        break;
    }
    setRenewDate(renew.toISOString().split('T')[0]);
  }, [planType, startDate]);

  const handleConvertSubscription = async () => {
    if (!amount || !startDate || !renewDate) {
      alert("Please fill all required fields");
      return;
    }
    
    setSavingPlan(true);
    try {
      const userRef = ref(db, `carefirst/users/${clinicId}/signup`);
      await update(userRef, {
        plan: "Subscription",
        planType: planType,
        planAmount: amount,
        planStartDate: startDate,
        planRenewDate: renewDate,
        isActive: true, // Assuming converting to sub makes them active
        trialExpires: null // Clear trial
      });
      alert("Successfully converted client to subscription plan!");
      // Optionally fetch again or update local state
      setUser((prev: any) => ({
        ...prev,
        plan: "Subscription",
        planType,
        planAmount: amount,
        planStartDate: startDate,
        planRenewDate: renewDate,
        isActive: true,
      }));
    } catch (err) {
      console.error("Failed to update subscription", err);
      alert("Failed to save subscription.");
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center text-muted-foreground">Loading details...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center text-center">
        <h2 className="text-xl font-bold text-navy mb-2">Clinic not found</h2>
        <Link to="/superadmin/subscription" className="text-primary hover:underline">Go back to subscriptions</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate({ to: "/superadmin/subscription" })}
          className="flex size-10 items-center justify-center rounded-full bg-secondary/80 text-navy transition-colors hover:bg-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-[24px] font-extrabold tracking-tight text-navy">
            {user.clinic || "Clinic Details"}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground font-medium">
            Manage user details, analytics, and subscription plan
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-secondary/40 p-1">
        {[
          { id: "details", label: "User Details", icon: User },
          { id: "modules", label: "Modules", icon: Box },
          { id: "analytics", label: "Analytics", icon: BarChart2 },
          { id: "plan", label: "Overview Plan", icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-navy shadow-sm"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-navy"
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-[16px] border border-border bg-card p-6 shadow-sm min-h-[400px]">
        {/* User Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="font-display text-[18px] font-bold text-navy border-b border-border pb-3">General Information</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Clinic Name</label>
                <div className="mt-1 text-[15px] font-semibold text-navy">{user.clinic || "N/A"}</div>
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Owner Name</label>
                <div className="mt-1 text-[15px] font-semibold text-navy">{user.name || "N/A"}</div>
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                <div className="mt-1 text-[15px] font-semibold text-navy">{user.email || "N/A"}</div>
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Phone</label>
                <div className="mt-1 text-[15px] font-semibold text-navy">{user.phone || "N/A"}</div>
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                <div className="mt-1 flex items-center">
                   {user.suspended === true ? (
                     <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-[12px] font-bold text-destructive">Suspended</span>
                   ) : user.isActive === true || user.plan === "Subscription" ? (
                     <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[12px] font-bold text-success">Active Subscription</span>
                   ) : (
                     <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/15 px-2.5 py-1 text-[12px] font-bold text-orange">Trial</span>
                   )}
                </div>
              </div>
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Registered On</label>
                <div className="mt-1 text-[15px] font-semibold text-navy">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="space-y-6 animate-in fade-in text-center py-10">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Box size={28} className="text-primary" />
            </div>
            <h3 className="font-display text-[20px] font-bold text-navy">Enabled Modules</h3>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">
              Module management configuration will be integrated in the next update. All core clinic modules are currently active.
            </p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="font-display text-[18px] font-bold text-navy mb-4">Usage Analytics</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/20 p-5">
                <div className="text-[12px] font-bold uppercase text-muted-foreground">Total Patients</div>
                <div className="mt-2 text-3xl font-extrabold text-navy">124</div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-5">
                <div className="text-[12px] font-bold uppercase text-muted-foreground">Appointments</div>
                <div className="mt-2 text-3xl font-extrabold text-navy">892</div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-5">
                <div className="text-[12px] font-bold uppercase text-muted-foreground">Storage Used</div>
                <div className="mt-2 text-3xl font-extrabold text-navy">4.2 GB</div>
              </div>
            </div>
            <div className="mt-6 flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30">
              <div className="text-center text-muted-foreground">
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <span className="font-medium">Detailed charts available soon</span>
              </div>
            </div>
          </div>
        )}

        {/* Overview Plan Tab */}
        {activeTab === "plan" && (
          <div className="space-y-8 animate-in fade-in">
            <div>
              <h3 className="font-display text-[18px] font-bold text-navy">Subscription Plan</h3>
              <p className="text-[14px] text-muted-foreground mt-1">Convert this client from a trial to a paid subscription or manage their current plan.</p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                
                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-navy">Subscription Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-[10px] border border-border bg-background px-4 py-2.5 text-[14px] font-medium text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Plan Type */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-navy">Plan Type</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as any)}
                    className="w-full rounded-[10px] border border-border bg-background px-4 py-2.5 text-[14px] font-medium text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_year">Half Yearly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-navy">Start Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-[10px] border border-border bg-background py-2.5 pl-10 pr-4 text-[14px] font-medium text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Renew Date */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-navy">Renew Date (Auto-calculated)</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
                    <input
                      type="date"
                      value={renewDate}
                      readOnly
                      className="w-full rounded-[10px] border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-[14px] font-medium text-navy/70 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleConvertSubscription}
                  disabled={savingPlan}
                  className="flex items-center gap-2 rounded-[10px] bg-primary px-6 py-2.5 text-[14px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {savingPlan ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {user.plan === "Subscription" ? "Update Subscription" : "Convert to Subscription"}
                </button>
              </div>
            </div>
            
            {user.plan === "Subscription" && (
              <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-[13.5px] font-medium text-success-foreground flex items-start gap-3 mt-6">
                <CheckCircle2 size={18} className="text-success mt-0.5 shrink-0" />
                <div>
                  This client is currently on an active subscription plan ({user.planType}). <br/>
                  Valid until: <strong>{new Date(user.planRenewDate).toLocaleDateString()}</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
