import { Outlet, Link, useNavigate } from '@tanstack/react-router'
import { LayoutDashboard, Users, Building2, Settings, LogOut } from 'lucide-react'

export function SuperAdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    navigate({ to: '/superadmin/login' })
  }

  return (
    <div className="flex min-h-screen bg-secondary/30 font-sans">
      {/* Sidebar */}
      <div className="flex w-[260px] flex-col border-r border-border bg-background">
        <div className="flex h-[72px] items-center border-b border-border px-6">
          <Link to="/" className="font-display text-xl font-bold text-navy">
            CareFirst <span className="text-primary">Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-4">
            <div className="mb-4 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Overview
            </div>
            
            <Link to="/superadmin" className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-semibold text-primary bg-primary/10 transition-colors">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            
            <Link to="/superadmin" className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy">
              <Building2 size={18} />
              Clinics & Hospitals
            </Link>
            
            <Link to="/superadmin" className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy">
              <Users size={18} />
              Users & Staff
            </Link>
            
            <div className="mt-8 mb-4 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Configuration
            </div>
            
            <Link to="/superadmin" className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy">
              <Settings size={18} />
              Settings
            </Link>
          </nav>
        </div>
        
        <div className="border-t border-border p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-[72px] items-center justify-end border-b border-border bg-background px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-bold text-navy">Super Admin</div>
              <div className="text-[11px] font-medium text-muted-foreground">admin@carefirst.world</div>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground">
              SA
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* This renders the child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
