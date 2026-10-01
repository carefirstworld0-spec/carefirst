import { Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Menu,
  X,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  Globe
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/superadmin" },
      { label: "Analytics", icon: BarChart3, to: "/superadmin/analytics" },
    ],
  },
  {
    group: "Management",
    items: [
      {
        label: "Clinics & Hospitals",
        icon: Building2,
        subItems: [
          { label: "Subscription", to: "/superadmin/subscription" },
          { label: "White Label", to: "/superadmin/white-label" },
        ]
      },
      { label: "Users & Staff", icon: Users, to: "/superadmin/users-staff" },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", icon: Settings, to: "/superadmin/settings" },
    ],
  },
];

export function SuperAdminLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    navigate({ to: "/superadmin/login" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-full flex-col bg-card border-r border-border shadow-[4px_0_24px_rgba(15,23,42,0.02)] transition-all duration-300 lg:static lg:z-auto lg:translate-x-0 relative ${
          mobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-[80px]" : "lg:w-[260px]"}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[26px] z-50 hidden lg:flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-navy hover:bg-secondary focus:outline-none transition-transform hover:scale-110"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        {/* Logo */}
        <div className={`flex h-[76px] shrink-0 items-center border-b border-border overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'px-0 justify-center' : 'px-6 gap-3'}`}>
          <img
            src="https://ik.imagekit.io/dn3ch7b5a/WhatsApp_Image_2026-09-28_at_14.06.54-removebg-preview.png?updatedAt=1790594212831"
            alt="CareFirst Logo"
            className={`${isCollapsed ? 'h-[28px]' : 'h-[36px]'} w-auto object-contain transition-all duration-300`}
          />
          {!isCollapsed && (
            <div className="flex flex-col justify-center">
              <span className="font-display text-[20px] font-extrabold text-navy leading-none tracking-tight">
                CareFirst
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
                Super Admin
              </span>
            </div>
          )}
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-navy absolute right-4"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 overflow-x-hidden">
          {navItems.map((group) => (
            <div key={group.group} className="mb-6">
              {!isCollapsed ? (
                <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/80 whitespace-nowrap">
                  {group.group}
                </div>
              ) : (
                <div className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/50">
                  —
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.label}>
                    {item.subItems ? (
                      <div>
                        <button
                          onClick={() => {
                            if (isCollapsed) {
                              setIsCollapsed(false);
                              if (!expandedMenus.includes(item.label)) {
                                toggleMenu(item.label);
                              }
                            } else {
                              toggleMenu(item.label);
                            }
                          }}
                          className={`group flex items-center rounded-[10px] text-[13.5px] font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-navy ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'w-full gap-3 px-3 py-2.5'}`}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <item.icon size={17} className="shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="whitespace-nowrap">{item.label}</span>
                              <ChevronRight
                                size={14}
                                className={`ml-auto shrink-0 transition-transform ${expandedMenus.includes(item.label) ? "rotate-90 opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                              />
                            </>
                          )}
                        </button>
                        {!isCollapsed && expandedMenus.includes(item.label) && (
                          <div className="ml-9 mt-1 space-y-1">
                            {item.subItems.map((sub) => (
                              <Link
                                key={sub.label}
                                to={sub.to}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-[8px] px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-navy whitespace-nowrap"
                                activeProps={{ className: "!text-primary font-semibold !bg-primary/5" }}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.to!}
                        onClick={() => {
                          setMobileOpen(false);
                          if (isCollapsed) setIsCollapsed(false);
                        }}
                        className={`group flex items-center rounded-[10px] text-[13.5px] font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-navy ${isCollapsed ? 'justify-center size-[42px] mx-auto' : 'gap-3 px-3 py-2.5'}`}
                        activeProps={{ className: "!bg-primary/10 !text-primary" }}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon size={17} className="shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="whitespace-nowrap">{item.label}</span>
                            <ChevronRight
                              size={14}
                              className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                            />
                          </>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-4 flex flex-col gap-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 rounded-[10px] bg-secondary px-3 py-2.5 whitespace-nowrap overflow-hidden">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground">
                SA
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold text-navy">Super Admin</div>
              </div>
              <ShieldCheck size={15} className="ml-auto shrink-0 text-success" />
            </div>
          ) : (
            <div className="mx-auto grid size-10 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground shadow-sm">
              SA
            </div>
          )}
          
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-2'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center rounded-[10px] text-destructive transition-colors hover:bg-destructive/10 ${isCollapsed ? 'size-10' : 'w-full gap-2.5 px-3 py-2 text-[13px] font-semibold'}`}
              title="Sign out"
            >
              <LogOut size={16} />
              {!isCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[68px] shrink-0 items-center gap-4 border-b border-border bg-card/90 px-6 shadow-[0_1px_3px_rgba(15,23,42,0.02)] backdrop-blur-md">
          <button
            className="lg:hidden text-navy hover:text-primary transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="hidden text-[13px] font-semibold text-muted-foreground lg:block">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit Website"
              className="flex size-9 items-center justify-center rounded-full bg-secondary text-navy transition-colors hover:bg-secondary/80"
            >
              <Globe size={17} />
            </a>
            <button className="relative flex size-9 items-center justify-center rounded-full bg-secondary text-navy transition-colors hover:bg-secondary/80">
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange ring-2 ring-white" />
            </button>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="hidden text-right sm:block">
                <div className="text-[13px] font-bold text-navy">Super Admin</div>
              </div>
              <div className="grid size-8 place-items-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
