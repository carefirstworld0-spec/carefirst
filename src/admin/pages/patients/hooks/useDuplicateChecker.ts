import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export type DuplicateMatch = {
  id: string;
  uhid: string;
  name: string;
  mobile: string;
  lastVisit: string;
};

/**
 * Checks for duplicate patients by mobile number with debounce.
 */
export function useDuplicateChecker(clinicKey: string) {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkDuplicate = useCallback(
    (mobile: string) => {
      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current);

      const digits = mobile.replace(/\D/g, "");

      // Only search when we have enough digits
      if (digits.length < 10 || !clinicKey) {
        setMatches([]);
        setChecking(false);
        return;
      }

      setChecking(true);

      // Debounce 300ms
      timerRef.current = setTimeout(async () => {
        try {
          const patientsRef = ref(db, `carefirst/users/${clinicKey}/patients`);
          const snapshot = await get(patientsRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const found: DuplicateMatch[] = [];

            for (const id in data) {
              const contact = data[id]?.contact;
              const identity = data[id]?.identity;
              const meta = data[id]?.meta;

              if (contact?.mobile) {
                const existingDigits = contact.mobile.replace(/\D/g, "");
                if (existingDigits.includes(digits) || digits.includes(existingDigits)) {
                  found.push({
                    id,
                    uhid: identity?.uhid || "",
                    name: identity?.name || "Unknown",
                    mobile: contact.mobile,
                    lastVisit: meta?.lastVisit || meta?.createdAt || "",
                  });
                }
              }
            }

            setMatches(found);
          } else {
            setMatches([]);
          }
        } catch (err) {
          console.error("Duplicate check failed:", err);
          setMatches([]);
        } finally {
          setChecking(false);
        }
      }, 300);
    },
    [clinicKey]
  );

  const clearMatches = useCallback(() => {
    setMatches([]);
    setChecking(false);
  }, []);

  return { matches, checking, checkDuplicate, clearMatches };
}
