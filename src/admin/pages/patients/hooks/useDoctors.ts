import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export type Doctor = {
  id: string;
  name: string;
  department: string;
};

/**
 * Hook that fetches doctors from Firebase in real-time.
 * Doctors are stored at: carefirst/users/{clinicKey}/doctors
 * 
 * Each doctor record should have: { name, department }
 * 
 * If no doctors exist in Firebase yet, returns an empty array.
 * The admin can add doctors via the Settings or a future Doctors management page.
 */
export function useDoctors(clinicKey: string) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicKey) {
      setLoading(false);
      return;
    }

    const doctorsRef = ref(db, `carefirst/users/${clinicKey}/doctors`);

    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      const list: Doctor[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const id in data) {
          list.push({
            id,
            name: data[id].name || "",
            department: data[id].department || "",
          });
        }
      }
      // Sort alphabetically
      list.sort((a, b) => a.name.localeCompare(b.name));
      setDoctors(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clinicKey]);

  /** Get doctors filtered by department */
  const getDoctorsByDepartment = (departmentId: string): Doctor[] => {
    if (!departmentId) return [];
    return doctors.filter((d) => d.department === departmentId);
  };

  return { doctors, loading, getDoctorsByDepartment };
}
