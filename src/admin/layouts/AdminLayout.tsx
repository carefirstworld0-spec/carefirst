import { Outlet, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, child } from "firebase/database";

export function AdminLayout() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Loading...");
  const [clinicName, setClinicName] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = localStorage.getItem("user_uid");
      const clinicKey = localStorage.getItem("user_clinic");
      
      if (uid && clinicKey) {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `carefirst/users/${clinicKey}/signup`));
        
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
        } else {
          setUserName("Admin User");
          setInitials("AU");
        }
      } else {
        setUserName("Admin User");
        setInitials("AU");
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_uid");
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-secondary/30 font-sans">
      {/* Sidebar */}
      <div className="flex w-[260px] flex-col border-r border-border bg-background">
        <div className="flex h-[72px] items-center border-b border-border px-6">
          <Link to="/" className="font-display text-xl font-bold text-navy">
            CareFirst <span className="text-primary">Clinic</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-4">
            <div className="mb-4 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Main Menu
            </div>

            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-semibold text-primary bg-primary/10 transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy"
            >
              <Calendar size={18} />
              Appointments
            </Link>

            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy"
            >
              <Users size={18} />
              Patients
            </Link>

            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy"
            >
              <FileText size={18} />
              Billing
            </Link>

            <div className="mt-8 mb-4 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Configuration
            </div>

            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-navy/70 transition-colors hover:bg-secondary hover:text-navy"
            >
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
              <div className="text-[13px] font-bold text-navy">{userName}</div>
              {clinicName && (
                <div className="text-[11px] font-medium text-muted-foreground">
                  {clinicName}
                </div>
              )}
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground uppercase tracking-wider">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* This renders the child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
