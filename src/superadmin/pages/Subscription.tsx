import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, child, remove, update, onValue, off, set } from "firebase/database";
import {
  Search,
  Calendar,
  UserPlus,
  Pencil,
  Trash2,
  CreditCard,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  Building,
  Timer,
  UserCheck,
  UserX,
  MoreVertical,
  Eye,
  Ban,
  Play
} from "lucide-react";

type UserRecord = {
  clinicKey: string;
  clinicName: string;
  userName: string;
  phone: string;
  email: string;
  password?: string;
  plan: string;
  createdAt: string;
  createdAtMs: number;
  trialExpires: string;
  status: string;
};

const statusBadge = (status: string) => {
  if (status === "Trial")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/15 px-2.5 py-1 text-[11px] font-bold text-orange">
        <span className="size-1.5 rounded-full bg-orange" /> Trial
      </span>
    );
  if (status === "Active")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
        <span className="size-1.5 rounded-full bg-success" /> Active
      </span>
    );
  if (status === "Suspended")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-bold text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" /> Suspended
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-bold text-destructive">
      <span className="size-1.5 rounded-full bg-destructive" /> Expired
    </span>
  );
};

const planBadge = (plan: string) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
    <CreditCard size={10} />
    {plan}
  </span>
);

export function Subscription() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState<keyof UserRecord>("createdAtMs");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "trial">("all");
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    clinicName: "",
    userName: "",
    phone: "",
    email: "",
    password: ""
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    clinicName: "",
    userName: "",
    phone: "",
    email: "",
    password: "",
    status: "Trial"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<UserRecord | null>(null);
  const [suspending, setSuspending] = useState(false);
  const suspendReasons = [
    "Payment Overdue",
    "Violation of Terms",
    "Security Concern",
    "Requested by Owner",
    "Other"
  ];
  const [suspendForm, setSuspendForm] = useState({
    reason: "Payment Overdue",
    description: "Your account has been suspended due to an overdue payment. Please clear the pending dues to restore access."
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "carefirst/users"));
      parseSnapshot(snapshot);
    } catch (err) {
      console.error("Failed to fetch users manually:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600); // Give a visual delay to show something happened
    }
  };

  const parseSnapshot = (snapshot: any) => {
    const list: UserRecord[] = [];

    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const clinicKey in data) {
        const sd = data[clinicKey]?.signup;
        if (sd) {
          list.push({
            clinicKey,
            clinicName: sd.clinic || clinicKey,
            userName: sd.name || "N/A",
            phone: sd.phone || "N/A",
            email: sd.email || "N/A",
            password: sd.password || "",
            plan: "7-Day Trial",
            createdAt: sd.createdAt || "",
            createdAtMs: sd.createdAt ? new Date(sd.createdAt).getTime() : 0,
            trialExpires: sd.trialExpires || "",
            status:
              sd.suspended === true
                ? "Suspended"
                : sd.isActive === true
                ? "Active"
                : sd.trialExpires && new Date(sd.trialExpires) > new Date()
                ? "Trial"
                : "Expired",
          });
        }
      }
    }

    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    // Real-time listener: auto-updates when a new user signs up
    const usersRef = ref(db, "carefirst/users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      parseSnapshot(snapshot);
    });

    return () => {
      off(usersRef);
    };
  }, []);

  const handleSort = (field: keyof UserRecord) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleAddUser = async () => {
    if (!addForm.clinicName || !addForm.email || !addForm.password || !addForm.userName || !addForm.phone) return;
    setIsAdding(true);
    try {
      const { initializeApp, deleteApp } = await import("firebase/app");
      const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { firebaseConfig } = await import("@/lib/firebase");
      
      const secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, addForm.email, addForm.password);
      await updateProfile(userCredential.user, { displayName: addForm.userName });
      
      const safeClinicName = addForm.clinicName.replace(/[.#$\[\]\/]/g, '').trim();
      const now = new Date();
      
      await set(ref(db, `carefirst/users/${safeClinicName}/signup`), {
        name: addForm.userName,
        email: addForm.email,
        phone: addForm.phone,
        password: addForm.password,
        clinic: addForm.clinicName,
        uid: userCredential.user.uid,
        createdAt: now.toISOString(),
        trialExpires: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: addForm.status === "Active"
      });
      
      await deleteApp(secondaryApp);
      setShowAddModal(false);
      setAddForm({ clinicName: "", userName: "", phone: "", email: "", password: "", status: "Trial" });
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to add user.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(ref(db, `carefirst/users/${deleteTarget.clinicKey}`));
      setUsers((prev) => prev.filter((u) => u.clinicKey !== deleteTarget.clinicKey));
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    }
    setDeleting(false);
  };

  const handleEditClick = (user: UserRecord) => {
    setEditTarget(user);
    setEditForm({
      clinicName: user.clinicName,
      userName: user.userName,
      phone: user.phone,
      email: user.email,
      password: user.password || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      const userRef = ref(db, `carefirst/users/${editTarget.clinicKey}/signup`);
      const updates: any = {
        clinic: editForm.clinicName,
        name: editForm.userName,
        phone: editForm.phone,
        email: editForm.email
      };
      
      if (editForm.password.trim() !== "") {
        updates.password = editForm.password;
      }
      
      await update(userRef, updates);
      setEditTarget(null);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setSuspending(true);
    try {
      const userRef = ref(db, `carefirst/users/${suspendTarget.clinicKey}/signup`);
      await update(userRef, { 
        suspended: true,
        suspendReason: suspendForm.reason,
        suspendDescription: suspendForm.description,
        suspendDate: new Date().toISOString()
      });
      setSuspendTarget(null);
    } catch (error) {
      console.error("Failed to suspend user:", error);
    } finally {
      setSuspending(false);
    }
  };

  const filtered = users
    .filter((u) => {
      if (activeTab === "trial" && u.status !== "Trial") return false;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.clinicName.toLowerCase().includes(q) ||
        u.userName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);

      const created = u.createdAtMs;
      const matchFrom = !fromDate || created >= new Date(fromDate).getTime();
      const matchTo = !toDate || created <= new Date(toDate + "T23:59:59").getTime();

      return matchSearch && matchFrom && matchTo;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const dir = sortDir === "asc" ? 1 : -1;
      if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
      return String(aVal).localeCompare(String(bVal)) * dir;
    });

  const SortIcon = ({ field }: { field: keyof UserRecord }) => (
    <span className="ml-1 inline-flex flex-col opacity-40">
      <ChevronUp size={10} className={sortField === field && sortDir === "asc" ? "opacity-100 text-primary" : ""} />
      <ChevronDown size={10} className={sortField === field && sortDir === "desc" ? "opacity-100 text-primary" : ""} />
    </span>
  );

  const statsData = [
    {
      label: "Total Clinics",
      value: users.length.toString(),
      icon: Building,
      color: "text-primary",
      bg: "bg-primary/10",
      gradient: "from-primary/5 to-primary/0",
    },
    {
      label: "Trial Users",
      value: users.filter((u) => u.status === "Trial").length.toString(),
      icon: Timer,
      color: "text-orange",
      bg: "bg-orange/10",
      gradient: "from-orange/5 to-orange/0",
    },
    {
      label: "Active Users",
      value: users.filter((u) => u.status === "Active").length.toString(),
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
      gradient: "from-success/5 to-success/0",
    },
    {
      label: "Closed / Expired",
      value: users.filter((u) => u.status === "Expired").length.toString(),
      icon: UserX,
      color: "text-destructive",
      bg: "bg-destructive/10",
      gradient: "from-destructive/5 to-destructive/0",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[22px] sm:text-[26px] font-extrabold tracking-tight text-navy">
            Subscription Management
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-medium text-muted-foreground">
            All registered clinics and their plan details.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={isRefreshing}
            className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-[10px] bg-secondary/60 px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold text-navy/80 transition-colors hover:bg-secondary disabled:opacity-70"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-[12px] sm:text-[13px] font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5"
          >
            <UserPlus size={14} />
            Add User
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-[14px] bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
            <div className="relative flex items-center gap-3.5">
              <div className={`grid size-10 shrink-0 place-items-center rounded-[10px] ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
                  {stat.label}
                </div>
                <div className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-navy">
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by clinic, name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-border/40 bg-card py-2.5 pl-9 pr-4 text-[12px] sm:text-[13px] shadow-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex w-full lg:w-auto items-center gap-2">
          <Calendar size={15} className="hidden sm:block shrink-0 text-muted-foreground" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full sm:w-auto rounded-[10px] border border-border/40 bg-card px-3 py-2.5 text-[12px] sm:text-[13px] shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          <span className="text-muted-foreground text-[11px] sm:text-[12px] font-medium">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full sm:w-auto rounded-[10px] border border-border/40 bg-card px-3 py-2.5 text-[12px] sm:text-[13px] shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); }}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-navy transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[16px] bg-card shadow-sm ring-1 ring-border/30">
        {/* Tabs / Table Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/50 px-4 sm:px-6 pt-4 gap-4 sm:gap-0">
          <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 border-b-2 pb-3 transition-colors ${
                activeTab === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-navy"
              }`}
            >
              <span className="text-[12px] sm:text-[13px] font-semibold whitespace-nowrap">All Clinics</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                  activeTab === "all" ? "bg-primary/10" : "bg-secondary"
                }`}
              >
                {users.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("trial")}
              className={`flex items-center gap-2 border-b-2 pb-3 transition-colors ${
                activeTab === "trial"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-navy"
              }`}
            >
              <span className="text-[12px] sm:text-[13px] font-semibold whitespace-nowrap">Trial Users</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                  activeTab === "trial" ? "bg-primary/10" : "bg-secondary"
                }`}
              >
                {users.filter((u) => u.status === "Trial").length}
              </span>
            </button>
          </div>
          <span className="pb-2 sm:pb-3 text-[11px] sm:text-[12px] text-muted-foreground self-start sm:self-auto">
            {filtered.length} of {activeTab === "all" ? users.length : users.filter((u) => u.status === "Trial").length} records
          </span>
        </div>

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-secondary/20">
                <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
                  Sr No.
                </th>
                <th
                  className="whitespace-nowrap cursor-pointer px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70 hover:text-navy"
                  onClick={() => handleSort("clinicName")}
                >
                  <div className="flex items-center gap-1.5">Clinic Name <SortIcon field="clinicName" /></div>
                </th>
                <th
                  className="whitespace-nowrap cursor-pointer px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70 hover:text-navy"
                  onClick={() => handleSort("userName")}
                >
                  <div className="flex items-center gap-1.5">Name <SortIcon field="userName" /></div>
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
                  Mobile Number
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
                  Email
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
                  Plan
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
                  Status
                </th>
                <th
                  className="whitespace-nowrap cursor-pointer px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70 hover:text-navy"
                  onClick={() => handleSort("createdAtMs")}
                >
                  <div className="flex items-center gap-1.5">Joined <SortIcon field="createdAtMs" /></div>
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
                  Expires
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-center text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20 last:border-0">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3.5 w-full animate-pulse rounded-full bg-secondary/80" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-secondary/60">
                        <Search size={20} className="text-muted-foreground" />
                      </div>
                      <p className="text-[14px] font-semibold text-muted-foreground">
                        {search || fromDate || toDate ? "No records match your filters." : "No registered clinics yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user.clinicKey}
                    className="group border-b border-border/20 transition-colors last:border-0 hover:bg-secondary/10"
                  >
                    <td className="px-5 py-4">
                      <span className="flex size-7 items-center justify-center rounded-full bg-secondary/70 text-[12px] font-bold text-navy/60">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-primary/10 text-[12px] font-extrabold text-primary">
                          {user.clinicName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-navy/90">{user.clinicName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-semibold text-navy/85">{user.userName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-medium text-navy/70">{user.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-medium text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-5 py-4">{planBadge(user.plan)}</td>
                    <td className="px-5 py-4">{statusBadge(user.status)}</td>
                    <td className="px-5 py-4">
                      <div className="text-[12px] font-medium text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`text-[12px] font-bold ${user.status === "Expired" ? "text-destructive" : "text-navy/80"}`}>
                        {user.trialExpires
                          ? new Date(user.trialExpires).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5 relative">
                        <button
                          title="Edit"
                          onClick={() => handleEditClick(user)}
                          className="flex size-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteTarget(user)}
                          className="flex size-8 items-center justify-center rounded-[8px] bg-destructive/10 text-destructive transition-all hover:bg-destructive hover:text-white"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === user.clinicKey ? null : user.clinicKey);
                            }}
                            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-navy"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {activeDropdown === user.clinicKey && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                }}
                              />
                              <div className="absolute right-8 top-0 z-50 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in zoom-in-95">
                                <button 
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-navy transition-colors hover:bg-secondary"
                                >
                                  <Eye size={14} className="text-muted-foreground" /> View Details
                                </button>
                                
                                {user.status !== "Suspended" ? (
                                  <button 
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      setSuspendTarget(user);
                                      setSuspendForm({
                                        reason: suspendReasons[0],
                                        description: "Your account has been suspended due to an overdue payment. Please clear the pending dues to restore access."
                                      });
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-orange transition-colors hover:bg-orange/10 hover:text-orange"
                                  >
                                    <Ban size={14} className="opacity-70" /> Suspend Account
                                  </button>
                                ) : (
                                  <button 
                                    onClick={async () => {
                                      setActiveDropdown(null);
                                      const userRef = ref(db, `carefirst/users/${user.clinicKey}/signup`);
                                      await update(userRef, { 
                                        suspended: false,
                                        suspendReason: null,
                                        suspendDescription: null,
                                        suspendDate: null,
                                        lastActivatedAt: new Date().getTime()
                                      });
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-success transition-colors hover:bg-success/10 hover:text-success"
                                  >
                                    <Play size={14} className="opacity-70" /> Activate Account
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary"
                                >
                                  <RefreshCw size={14} className="opacity-70" /> Manual Renewal
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-[420px] overflow-hidden rounded-[20px] bg-card shadow-2xl">
            <div className="bg-gradient-to-br from-destructive/5 to-destructive/0 p-8 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 size={22} className="text-destructive" />
              </div>
              <h3 className="font-display text-[20px] font-extrabold text-navy/90">Delete Clinic?</h3>
              <p className="mt-2 text-[14px] font-medium text-muted-foreground">
                You are about to permanently remove{" "}
                <span className="font-bold text-navy/90">{deleteTarget.clinicName}</span> and all their data. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-[12px] border border-border py-2.5 text-[14px] font-semibold text-navy/70 transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-[12px] bg-destructive py-2.5 text-[14px] font-bold text-white transition-all hover:bg-destructive/90 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setSuspendTarget(null)}
          />
          <div className="relative w-full max-w-[420px] overflow-hidden rounded-[20px] bg-card shadow-2xl">
            <div className="bg-gradient-to-br from-orange/5 to-orange/0 p-8 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-orange/10">
                <Ban size={22} className="text-orange" />
              </div>
              <h3 className="font-display text-[20px] font-extrabold text-navy/90">Suspend Account?</h3>
              <p className="mt-2 text-[14px] font-medium text-muted-foreground">
                Are you sure you want to suspend{" "}
                <span className="font-bold text-navy/90">{suspendTarget.clinicName}</span>?
              </p>
            </div>
            
            <div className="p-6 pt-2 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Select Reason</label>
                <select
                  value={suspendForm.reason}
                  onChange={(e) => {
                    const r = e.target.value;
                    let desc = "";
                    if (r === "Payment Overdue") desc = "Your account has been suspended due to an overdue payment. Please clear the pending dues to restore access.";
                    else if (r === "Violation of Terms") desc = "Your account has been suspended due to a violation of our terms of service.";
                    else if (r === "Security Concern") desc = "Your account has been temporarily suspended due to suspicious activity. Please contact support.";
                    else if (r === "Requested by Owner") desc = "Your account has been suspended at the request of the clinic owner.";
                    else desc = "Your account has been suspended. Please contact CareFirst support for more information.";
                    
                    setSuspendForm({ reason: r, description: desc });
                  }}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2.5 text-[14px] text-navy focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
                >
                  {suspendReasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Description (Visible to user)</label>
                <textarea
                  rows={3}
                  value={suspendForm.description}
                  onChange={(e) => setSuspendForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full resize-none rounded-[10px] border border-border bg-background px-4 py-3 text-[14px] text-navy focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setSuspendTarget(null)}
                className="flex-1 rounded-[12px] border border-border py-2.5 text-[14px] font-semibold text-navy/70 transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspending}
                className="flex-1 rounded-[12px] bg-orange py-2.5 text-[14px] font-bold text-white transition-all hover:bg-orange/90 disabled:opacity-60"
              >
                {suspending ? "Suspending..." : "Yes, Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setEditTarget(null)}
          />
          <div className="relative w-full max-w-[500px] overflow-hidden rounded-[20px] bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h3 className="font-display text-[18px] font-extrabold text-navy">Edit Clinic Profile</h3>
              <button
                onClick={() => setEditTarget(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-navy transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Clinic Name</label>
                <input
                  type="text"
                  value={editForm.clinicName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, clinicName: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">User Name</label>
                <input
                  type="text"
                  value={editForm.userName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, userName: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Mobile Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Password</label>
                <input
                  type="text"
                  placeholder="Enter password"
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Note: Updating this will save to the database, but Firebase Auth requires a backend Cloud Function to securely apply password changes.
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border/60 p-6 bg-secondary/20">
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 rounded-[12px] border border-border py-2.5 text-[14px] font-semibold text-navy/70 transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 rounded-[12px] bg-primary py-2.5 text-[14px] font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] bg-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              <h3 className="font-display text-[18px] font-extrabold text-navy">Add New User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-navy transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-navy">Clinic Name</label>
                <input
                  type="text"
                  value={addForm.clinicName}
                  onChange={(e) => setAddForm(prev => ({ ...prev, clinicName: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">User Name</label>
                <input
                  type="text"
                  value={addForm.userName}
                  onChange={(e) => setAddForm(prev => ({ ...prev, userName: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Mobile Number</label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Email Address</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Password</label>
                <input
                  type="text"
                  value={addForm.password}
                  onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Status</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-[10px] border border-border bg-background px-4 py-2 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Trial">Trial</option>
                  <option value="Active">Active User</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-navy">Created Date</label>
                <input
                  type="text"
                  disabled
                  value={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  className="w-full rounded-[10px] border border-border bg-secondary/50 px-4 py-2 text-[14px] text-muted-foreground cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border/60 p-6 bg-secondary/20">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-[12px] border border-border py-2.5 text-[14px] font-semibold text-navy/70 transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={isAdding}
                className="flex-1 rounded-[12px] bg-primary py-2.5 text-[14px] font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                {isAdding ? "Adding..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
