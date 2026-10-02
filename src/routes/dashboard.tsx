import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bell, CalendarDays, Users, BarChart3, Settings } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-navy">
            <span className="grid size-8 place-items-center rounded bg-primary text-primary-foreground">
              <Activity size={18} />
            </span>
            CareFirst Panel
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <button className="hover:text-foreground">
              <Bell size={20} />
            </button>
            <div className="grid size-8 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">
              DR
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-border bg-background px-4 py-6 md:flex h-[calc(100vh-65px)] sticky top-[65px]">
          <nav className="space-y-2 flex-1">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium"
            >
              <BarChart3 size={18} /> Dashboard
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <CalendarDays size={18} /> Appointments
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Users size={18} /> Patients
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Settings size={18} /> Settings
            </a>
          </nav>

          <div className="mt-auto rounded-lg border border-border bg-secondary p-4">
            <h4 className="text-sm font-bold text-navy">7-Day Free Trial</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              You have 7 days left in your trial.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-navy">
              Welcome to your Demo Account!
            </h1>
            <p className="text-sm text-muted-foreground">
              Here is a quick overview of your clinic today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Today's Appointments", value: "14", change: "+2 from yesterday" },
              { label: "Total Patients", value: "1,248", change: "+12 this week" },
              { label: "Pending Bills", value: "5", change: "Requires attention" },
              { label: "New Messages", value: "3", change: "Unread" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-navy">{stat.value}</p>
                <p className="mt-1 text-xs text-success">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-8 rounded-xl border border-border bg-background shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h3 className="font-display font-bold text-navy">Recent Appointments</h3>
            </div>
            <div className="divide-y divide-border">
              {["Ananya S. - 10:00 AM", "Rahul P. - 11:30 AM", "Priya K. - 01:15 PM"].map(
                (appt, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary font-bold">
                        {appt[0]}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-navy">{appt.split(" - ")[0]}</p>
                        <p className="text-xs text-muted-foreground">General Checkup</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {appt.split(" - ")[1]}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
