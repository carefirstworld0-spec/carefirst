import { Outlet, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight, Trash2, Ban, CheckCircle2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, child, onValue, off } from "firebase/database";

export function AdminLayout() {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState(() => typeof window !== 'undefined' ? localStorage.getItem("user_name") || "Loading..." : "Loading...");
  const [clinicName, setClinicName] = useState(() => typeof window !== 'undefined' ? localStorage.getItem("user_clinic") || "" : "");
  const [initials, setInitials] = useState(() => {
    if (typeof window === 'undefined') return "AU";
    const name = localStorage.getItem("user_name");
    if (name) {
      const nameParts = name.trim().split(" ");
      if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }
    }
    return "AU";
  });
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendMessage, setSuspendMessage] = useState("Your account has been suspended by the administrator. Please contact CareFirst support to restore your access.");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDate, setSuspendDate] = useState("");
  const [showActivatedScreen, setShowActivatedScreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("user_uid");
    const clinicKey = localStorage.getItem("user_clinic");
    
    if (uid && clinicKey) {
      const userRef = ref(db, `carefirst/users/${clinicKey}/signup`);
      
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.name) {
            setUserName(data.name);
            const nameParts = data.name.trim().split(" ");
            if (nameParts.length > 1) {
              setInitials((nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase());
            } else if (nameParts.length === 1 && nameParts[0].length > 0) {
              setInitials(nameParts[0].substring(0, 2).toUpperCase());
            }
          }
          if (data.clinic) {
            setClinicName(data.clinic);
          }
          
          if (data.trialExpires) {
            const expiryDate = new Date(data.trialExpires);
            const now = new Date();
            if (now.getTime() > expiryDate.getTime()) {
              setIsExpired(true);
            } else {
              setIsExpired(false);
            }
          }
          
          if (data.suspended === true) {
            setIsSuspended(true);
            if (data.suspendDescription) setSuspendMessage(data.suspendDescription);
            if (data.suspendReason) setSuspendReason(data.suspendReason);
            if (data.suspendDate) setSuspendDate(new Date(data.suspendDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));
          } else {
            setIsSuspended(false);
            if (data.lastActivatedAt) {
              const storageKey = `seen_activation_${data.lastActivatedAt}`;
              if (!localStorage.getItem(storageKey)) {
                setShowActivatedScreen(true);
                localStorage.setItem(storageKey, "true");
                setTimeout(() => {
                  setShowActivatedScreen(false);
                }, 4000);
              }
            }
          }
        } else {
          setUserName("Admin User");
          setInitials("AU");
        }
      });
      
      return () => {
        off(userRef);
      };
    } else {
      setUserName("Admin User");
      setInitials("AU");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_uid");
    navigate({ to: "/login" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/30 font-sans relative">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-navy/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`flex flex-col border-r border-border bg-background transition-all duration-300 fixed inset-y-0 left-0 z-40 md:relative ${isMobileMenuOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'} ${!isMobileMenuOpen && isCollapsed ? 'md:w-[80px]' : 'md:w-[260px]'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[26px] z-50 hidden lg:flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-navy hover:bg-secondary focus:outline-none transition-transform hover:scale-110"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <div className={`flex h-[72px] items-center border-b border-border transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'px-0 justify-center' : 'px-6 justify-between'}`}>
          {!isCollapsed ? (
            <Link to="/" className="font-display text-xl font-bold text-navy">
              CareFirst <span className="text-primary">Clinic</span>
            </Link>
          ) : (
            <Link to="/" className="font-display text-xl font-bold text-primary">
              C<span className="text-navy">F</span>
            </Link>
          )}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-muted-foreground hover:text-navy transition-colors p-1 -mr-2"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 overflow-x-hidden">
          <nav className="space-y-1 px-3">
            {!isCollapsed ? (
              <div className="mb-4 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Main Menu
              </div>
            ) : (
              <div className="mb-4 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
                —
              </div>
            )}

            <Link
              to="/admin"
              exact
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center rounded-[8px] text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'gap-3 px-3 py-2.5 w-full'}`}
              activeProps={{ className: "!text-primary !bg-primary/10 !font-semibold" }}
              title={isCollapsed ? "Dashboard" : undefined}
            >
              <LayoutDashboard size={18} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
            </Link>

            <Link
              to="/admin/appointments"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center rounded-[8px] text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'gap-3 px-3 py-2.5 w-full'}`}
              activeProps={{ className: "!text-primary !bg-primary/10 !font-semibold" }}
              title={isCollapsed ? "Appointments" : undefined}
            >
              <Calendar size={18} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Appointments</span>}
            </Link>

            <Link
              to="/admin/patients"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center rounded-[8px] text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'gap-3 px-3 py-2.5 w-full'}`}
              activeProps={{ className: "!text-primary !bg-primary/10 !font-semibold" }}
              title={isCollapsed ? "Patients" : undefined}
            >
              <Users size={18} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Patients</span>}
            </Link>

            <Link
              to="/admin/billing"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center rounded-[8px] text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'gap-3 px-3 py-2.5 w-full'}`}
              activeProps={{ className: "!text-primary !bg-primary/10 !font-semibold" }}
              title={isCollapsed ? "Billing" : undefined}
            >
              <FileText size={18} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Billing</span>}
            </Link>

            <Link
              to="/admin/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center rounded-[8px] text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'gap-3 px-3 py-2.5 w-full'}`}
              activeProps={{ className: "!text-primary !bg-primary/10" }}
              title={isCollapsed ? "Settings" : undefined}
            >
              <Settings size={18} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
            </Link>

            <div className="pt-2 mt-2 border-t border-border/50">
              <Link
                to="/admin/trash"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center rounded-[8px] text-[14px] font-medium text-navy/70 transition-colors hover:bg-destructive/10 hover:text-destructive ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'gap-3 px-3 py-2.5 w-full'}`}
                activeProps={{ className: "!text-destructive !bg-destructive/10 !font-semibold" }}
                title={isCollapsed ? "Trash" : undefined}
              >
                <Trash2 size={18} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Trash</span>}
              </Link>
            </div>
          </nav>
        </div>

        <div className="border-t border-border p-4 flex flex-col gap-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 rounded-[8px] bg-secondary/50 px-3 py-3 whitespace-nowrap overflow-hidden">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-navy">
                  {userName}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {clinicName || "Loading..."}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground shadow-sm">
              {initials}
            </div>
          )}

          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-2'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center rounded-[8px] text-destructive transition-colors hover:bg-destructive/10 ${isCollapsed ? 'size-10' : 'w-full gap-2 px-3 py-2 text-[13px] font-medium'}`}
              title="Logout"
            >
              <LogOut size={16} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        {/* Topbar */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-navy hover:bg-secondary rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="font-display text-[14px] md:text-[16px] font-bold text-navy truncate max-w-[120px] sm:max-w-xs md:max-w-none">
              Welcome, {userName !== "Loading..." && userName !== "Admin User" ? userName : "Doctor"} 👋
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6 relative">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-[8px] sm:rounded-[10px] bg-secondary/30 px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm ring-1 ring-border/50">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/70" />
              <span className="text-[10.5px] sm:text-[12px] font-semibold text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[13px] font-bold text-navy">{userName !== "Loading..." ? userName : "Admin User"}</div>
                <div className="text-[11px] text-muted-foreground">Admin</div>
              </div>
              <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 focus:outline-none"
            >
              {initials}
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute right-0 top-12 z-50 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                  <Link 
                    to="/admin/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy transition-colors hover:bg-secondary"
                  >
                    <Settings size={16} />
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative flex-1 overflow-y-auto p-4 md:p-8 bg-background">
          {(isExpired || isSuspended) ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
              <div className="mx-auto max-w-md text-center">
                <div className={`mx-auto mb-4 grid size-16 place-items-center rounded-full ${isSuspended ? 'bg-orange/10' : 'bg-destructive/10'}`}>
                  {isSuspended ? <Ban size={32} className="text-orange" /> : <LogOut size={32} className="text-destructive" />}
                </div>
                <h2 className="font-display text-2xl font-extrabold text-navy">{isSuspended ? 'Account Suspended' : 'Trial Expired'}</h2>
                
                {isSuspended && suspendReason && (
                  <div className="mt-4 mb-2 inline-block rounded-full bg-orange/10 px-4 py-1.5 text-[13px] font-bold text-orange">
                    Reason: {suspendReason}
                  </div>
                )}
                
                <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
                  {isSuspended ? suspendMessage : 'Your 7-day trial period has ended. You can no longer operate the admin panel until you upgrade your subscription.'}
                </p>

                {isSuspended && suspendDate && (
                  <p className="mt-4 text-[12px] font-medium text-muted-foreground/60">
                    Suspended on {suspendDate}
                  </p>
                )}

                {!isSuspended && (
                  <button className="mt-6 rounded-full bg-primary px-8 py-3 text-[14px] font-bold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5">
                    Upgrade Subscription
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Activated Success Screen */}
          {showActivatedScreen && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-500">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 relative flex size-20 items-center justify-center rounded-full bg-success/10">
                  <div className="absolute inset-0 rounded-full border-4 border-success/30 animate-[spin_3s_linear_infinite]" />
                  <CheckCircle2 size={36} className="text-success animate-in zoom-in duration-500 delay-150" />
                </div>
                <h2 className="font-display text-2xl font-extrabold text-navy animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                  Account Activated!
                </h2>
                <p className="mt-2 text-[15px] font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
                  Your account has been fully restored. Welcome back to the CareFirst Admin Panel.
                </p>
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
