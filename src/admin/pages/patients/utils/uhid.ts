/**
 * UHID format helpers.
 *
 * UHID pattern: UHID-{YYYY}-{6-digit padded}
 * Example: UHID-2026-001245
 */

/** Build a formatted UHID string from a numeric counter */
export function formatUHID(counter: number): string {
  const year = new Date().getFullYear();
  const padded = String(counter).padStart(6, "0");
  return `UHID-${year}-${padded}`;
}

/** Extract the numeric portion from a UHID string */
export function parseUHID(uhid: string): number | null {
  const match = uhid.match(/^UHID-\d{4}-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
