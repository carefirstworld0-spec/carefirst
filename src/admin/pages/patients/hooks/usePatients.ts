import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  ref,
  query,
  orderByChild,
  limitToFirst,
  startAt,
  endAt,
  onValue,
  get,
} from "firebase/database";

export type PatientSummary = {
  id: string;
  uhid: string;
  name: string;
  gender: string;
  dob: string;
  age: string;
  mobile: string;
  department: string;
  doctor: string;
  status: string;
  lastVisit: string;
  createdAt: string;
};

const PAGE_SIZE = 20;

/**
 * Paginated patient list hook.
 * Fetches patients in pages from Firebase, supports search by name/mobile/UHID.
 */
export function usePatients(clinicKey: string) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const allPatientsRef = useRef<PatientSummary[]>([]);

  // Fetch all patients once (for a single clinic the count is manageable)
  // and do client-side pagination + search for responsiveness
  const fetchPatients = useCallback(async () => {
    if (!clinicKey) return;
    setLoading(true);

    try {
      const indexRef = ref(db, `carefirst/users/${clinicKey}/patient_index`);
      const snapshot = await get(indexRef);
      const list: PatientSummary[] = [];

      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const id in data) {
          const p = data[id];
          list.push({
            id,
            uhid: p.uhid || "",
            name: p.name || "",
            gender: p.gender || "",
            dob: p.dob || "",
            age: p.age || "",
            mobile: p.mobile || "",
            department: p.department || "",
            doctor: p.doctor || "",
            status: p.status || "active",
            lastVisit: p.lastVisit || "",
            createdAt: p.createdAt || "",
          });
        }
      } else {
        // Fallback and auto-migration for legacy data
        const legacyRef = ref(db, `carefirst/users/${clinicKey}/patients`);
        const legacySnap = await get(legacyRef);
        
        if (legacySnap.exists()) {
          const data = legacySnap.val();
          const { update } = await import("firebase/database");
          const migrationUpdates: any = {};

          for (const id in data) {
            const p = data[id];
            const identity = p.identity || {};
            const contact = p.contact || {};
            const meta = p.meta || {};

            const summary = {
              id,
              uhid: identity.uhid || "",
              name: identity.name || "",
              gender: identity.gender || "",
              dob: identity.dob || "",
              age: identity.age || "",
              mobile: contact.mobile || "",
              department: meta.department || "",
              doctor: meta.doctor || "",
              status: meta.status || "active",
              lastVisit: meta.lastVisit || "",
              createdAt: meta.createdAt || "",
            };
            list.push(summary);

            // Prepare migration update
            migrationUpdates[`patient_index/${id}`] = {
              uhid: summary.uhid,
              name: summary.name,
              gender: summary.gender,
              dob: summary.dob,
              age: summary.age,
              mobile: summary.mobile,
              department: summary.department,
              doctor: summary.doctor,
              status: summary.status,
              lastVisit: summary.lastVisit,
              createdAt: summary.createdAt,
            };
          }
          
          // Silently run the migration to fix the database going forward
          update(ref(db, `carefirst/users/${clinicKey}`), migrationUpdates).catch(e => console.error("Auto-migration failed:", e));
        }
      }

      if (list.length > 0) {

        // Sort by createdAt descending
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        allPatientsRef.current = list;
        setTotalCount(list.length);
        setPatients(list.slice(0, PAGE_SIZE));
      } else {
        allPatientsRef.current = [];
        setPatients([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  }, [clinicKey]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Search filter (client-side for speed)
  const search = useCallback(
    (term: string) => {
      const t = term.toLowerCase().trim();
      if (!t) {
        setPatients(allPatientsRef.current.slice(0, PAGE_SIZE));
        setTotalCount(allPatientsRef.current.length);
        setPage(1);
        return;
      }

      const filtered = allPatientsRef.current.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.mobile.includes(t) ||
          p.uhid.toLowerCase().includes(t)
      );

      setPatients(filtered.slice(0, PAGE_SIZE));
      setTotalCount(filtered.length);
      setPage(1);
    },
    []
  );

  // Go to a specific page
  const goToPage = useCallback(
    (p: number, searchTerm = "") => {
      const t = searchTerm.toLowerCase().trim();
      const source = t
        ? allPatientsRef.current.filter(
            (pt) =>
              pt.name.toLowerCase().includes(t) ||
              pt.mobile.includes(t) ||
              pt.uhid.toLowerCase().includes(t)
          )
        : allPatientsRef.current;

      const start = (p - 1) * PAGE_SIZE;
      setPatients(source.slice(start, start + PAGE_SIZE));
      setPage(p);
    },
    []
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    patients,
    loading,
    totalCount,
    page,
    totalPages,
    search,
    goToPage,
    refetch: fetchPatients,
    pageSize: PAGE_SIZE,
  };
}
