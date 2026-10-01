export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-navy">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Patients</div>
          <div className="mt-2 text-3xl font-bold text-navy">1,284</div>
        </div>
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Appointments Today</div>
          <div className="mt-2 text-3xl font-bold text-navy">42</div>
        </div>
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Revenue (This Month)</div>
          <div className="mt-2 text-3xl font-bold text-navy">₹24,800</div>
        </div>
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Active Staff</div>
          <div className="mt-2 text-3xl font-bold text-navy">12</div>
        </div>
      </div>
      
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm min-h-[400px]">
        <h3 className="text-lg font-semibold text-navy mb-4">Recent Activity</h3>
        <p className="text-muted-foreground">Welcome to your new CareFirst admin panel.</p>
      </div>
    </div>
  );
}
