import { useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, runTransaction } from "firebase/database";
import { formatUHID } from "../utils/uhid";

/**
 * Hook that generates a unique UHID using an atomic Firebase transaction.
 * Guarantees no two patients share the same UHID even under concurrent writes.
 */
export function useUHID() {
  const [uhid, setUhid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (clinicKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const counterRef = ref(db, `carefirst/users/${clinicKey}/patientCounter`);
      const result = await runTransaction(counterRef, (currentVal) => {
        return (currentVal || 0) + 1;
      });

      if (result.committed && result.snapshot.exists()) {
        const newCounter = result.snapshot.val() as number;
        const generated = formatUHID(newCounter);
        setUhid(generated);
        return generated;
      } else {
        throw new Error("Transaction not committed");
      }
    } catch (err) {
      const msg = "Failed to generate Patient ID. Please try again.";
      setError(msg);
      console.error("UHID generation error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uhid, loading, error, generate };
}
