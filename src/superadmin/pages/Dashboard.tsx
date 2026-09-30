import { Users, Building2, Activity, Wallet } from 'lucide-react'

export function SuperAdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-[28px] font-extrabold text-navy">Dashboard Overview</h1>
        <p className="mt-1 text-[15px] font-medium text-muted-foreground">
          Here is a summary of your platform's activity today.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Clinics", value: "142", trend: "+12 this month", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Doctors", value: "1,842", trend: "+45 this week", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Platform Uptime", value: "99.98%", trend: "All systems operational", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Total Revenue", value: "₹4.2M", trend: "+18% vs last month", icon: Wallet, color: "text-indigo-500", bg: "bg-indigo-500/10" }
        ].map((stat, i) => (
          <div key={i} className="rounded-[16px] border border-border bg-background p-6 shadow-[0_4px_20px_rgba(18,63,93,0.03)]">
            <div className="flex items-center gap-4">
              <div className={`grid size-12 place-items-center rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                <div className="font-display text-[26px] font-extrabold text-navy leading-none mt-1">{stat.value}</div>
              </div>
            </div>
            <div className="mt-4 text-[13px] font-medium text-muted-foreground pt-4 border-t border-border/50">
              {stat.trend}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[16px] border border-border bg-background p-6 shadow-[0_4px_20px_rgba(18,63,93,0.03)] min-h-[400px]">
          <h3 className="font-display text-lg font-bold text-navy mb-4">Recent Registrations</h3>
          <div className="flex h-full items-center justify-center text-[14px] text-muted-foreground bg-secondary/20 rounded-[8px] border border-dashed border-border p-8 text-center">
            Detailed chart and registration table components will go here. <br/> (Connect to your backend data)
          </div>
        </div>
        
        <div className="rounded-[16px] border border-border bg-background p-6 shadow-[0_4px_20px_rgba(18,63,93,0.03)] min-h-[400px]">
          <h3 className="font-display text-lg font-bold text-navy mb-4">System Alerts</h3>
          <div className="space-y-3">
            {[
              { title: "New Clinic Registration", time: "10 mins ago", type: "info" },
              { title: "Database Backup Completed", time: "2 hours ago", type: "success" },
              { title: "Failed Login Attempt", time: "4 hours ago", type: "warning" },
              { title: "Subscription Renewed", time: "5 hours ago", type: "success" }
            ].map((alert, i) => (
              <div key={i} className="p-3 rounded-[8px] border border-border bg-secondary/10 flex items-start justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-navy">{alert.title}</div>
                  <div className="text-[11px] font-medium text-muted-foreground mt-0.5">{alert.time}</div>
                </div>
                <div className={`size-2 rounded-full mt-1.5 ${alert.type === 'success' ? 'bg-success' : alert.type === 'warning' ? 'bg-orange' : 'bg-primary'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
