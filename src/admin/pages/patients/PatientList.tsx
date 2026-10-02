import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Zap,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  MoreHorizontal,
  Filter,
  X,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DEPARTMENTS, PATIENT_STATUSES } from "./utils/constants";
import { usePatients, type PatientSummary } from "./hooks/usePatients";

export function PatientList() {
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";

  const { patients, loading, totalCount, page, totalPages, search, goToPage, pageSize } =
    usePatients(clinicKey);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, search]);

  const filteredPatients = patients.filter((p) => {
    if (filterDept && p.department !== filterDept) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const found = PATIENT_STATUSES.find((s) => s.value === status);
    return found || { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  const clearFilters = () => {
    setFilterDept("");
    setFilterStatus("");
    setSearchTerm("");
  };

  const hasActiveFilters = filterDept || filterStatus || searchTerm;

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy font-display">
            Patients
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount} total patient{totalCount !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-10"
            onClick={() => navigate({ to: "/admin/patients/quick" })}
          >
            <Zap size={15} className="mr-1.5 text-amber-500" /> Quick Register
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 shadow-sm"
            onClick={() => navigate({ to: "/admin/patients/new" })}
          >
            <Plus size={15} className="mr-1.5" /> Register Patient
          </Button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
            Total Patients
          </p>
          <p className="mt-1 text-[20px] sm:text-[26px] font-display font-extrabold text-navy">
            {totalCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
            Active
          </p>
          <p className="mt-1 text-[20px] sm:text-[26px] font-display font-extrabold text-green-600">
            {patients.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
            Today's Visits
          </p>
          <p className="mt-1 text-[20px] sm:text-[26px] font-display font-extrabold text-blue-600">
            {
              patients.filter((p) => {
                const today = new Date().toISOString().split("T")[0];
                return p.createdAt?.startsWith(today);
              }).length
            }
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
            Follow-ups
          </p>
          <p className="mt-1 text-[20px] sm:text-[26px] font-display font-extrabold text-sky-600">
            {patients.filter((p) => p.status === "follow-up").length}
          </p>
        </div>
      </div>

      {/* ─── Table Card ─── */}
      <div className="bg-card rounded-xl border border-border shadow-sm ring-1 ring-border/50 overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="p-4 border-b border-border bg-secondary/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Name, Mobile, or UHID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-background border-border"
              />
            </div>
            <Button
              variant="outline"
              className="h-10 rounded-lg shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={15} className="mr-1.5" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] text-white font-bold">
                  {[filterDept, filterStatus].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row gap-3 items-end animate-in slide-in-from-top-1 duration-200">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Department
                </label>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {PATIENT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-muted-foreground shrink-0"
                  onClick={clearFilters}
                >
                  <X size={14} className="mr-1" /> Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ─── Table ─── */}
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading patients…</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="grid size-16 place-items-center rounded-full bg-secondary/50 mb-4">
              <Users size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-bold text-navy">
              {hasActiveFilters ? "No patients match your filters" : "No patients registered yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {hasActiveFilters
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by registering your first patient."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" className="mt-4 rounded-xl" onClick={clearFilters}>
                <X size={14} className="mr-1.5" /> Clear Filters
              </Button>
            ) : (
              <Button
                className="mt-4 rounded-xl bg-primary text-white"
                onClick={() => navigate({ to: "/admin/patients/quick" })}
              >
                <UserPlus size={15} className="mr-1.5" /> Register First Patient
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="font-bold text-navy py-3 w-16 text-center">#</TableHead>
                    <TableHead className="font-bold text-navy py-3">UHID</TableHead>
                    <TableHead className="font-bold text-navy">Patient</TableHead>
                    <TableHead className="font-bold text-navy hidden sm:table-cell">
                      Gender / Age
                    </TableHead>
                    <TableHead className="font-bold text-navy hidden md:table-cell">
                      Mobile
                    </TableHead>
                    <TableHead className="font-bold text-navy hidden lg:table-cell">
                      Department
                    </TableHead>
                    <TableHead className="font-bold text-navy">Status</TableHead>
                    <TableHead className="font-bold text-navy text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient, index) => {
                    const statusBadge = getStatusBadge(patient.status);
                    return (
                      <TableRow
                        key={patient.id}
                        className="hover:bg-secondary/10 transition-colors cursor-pointer"
                        onClick={() =>
                          navigate({
                            to: "/admin/patients/$patientId",
                            params: { patientId: patient.id },
                          })
                        }
                      >
                        <TableCell className="text-center text-muted-foreground font-medium text-sm">
                          {(page - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                          <span className="text-[13px] font-mono font-semibold text-primary">
                            {patient.uhid}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-[12px]">
                              {patient.name
                                ? patient.name
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "?"}
                            </div>
                            <span className="text-[14px] font-semibold text-navy truncate max-w-[180px]">
                              {patient.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-[13px] text-navy capitalize">{patient.gender}</span>
                          {patient.age && (
                            <span className="text-[12px] text-muted-foreground ml-1.5">
                              • {patient.age}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-[13px] text-navy">{patient.mobile}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-[13px] text-navy">
                            {DEPARTMENTS.find((d) => d.id === patient.department)?.label ||
                              patient.department}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusBadge.color} px-2 py-0.5 rounded-full text-[11px] font-bold`}
                          >
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              title="View Patient"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate({
                                  to: "/admin/patients/$patientId",
                                  params: { patientId: patient.id },
                                });
                              }}
                            >
                              <Eye size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-navy"
                              title="Edit"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Pencil size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-[13px] text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-navy">
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}
                  </span>{" "}
                  of <span className="font-semibold text-navy">{totalCount}</span>
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === 1}
                    onClick={() => goToPage(page - 1, searchTerm)}
                  >
                    <ChevronLeft size={15} />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="icon"
                      className={`h-8 w-8 text-[12px] ${p === page ? "bg-primary text-white" : ""}`}
                      onClick={() => goToPage(p, searchTerm)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === totalPages}
                    onClick={() => goToPage(page + 1, searchTerm)}
                  >
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
