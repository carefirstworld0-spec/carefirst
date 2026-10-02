/**
 * Patient module validation utilities
 */

/** Validate Indian mobile number (10 digits, starts with 6-9) */
export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/** Strip non-digit characters */
export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Calculate age from date of birth */
export function calculateAge(dob: string | Date): { years: number; months: number; days: number } {
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/** Format age as a human-readable string */
export function formatAge(dob: string | Date): string {
  const { years, months } = calculateAge(dob);
  if (years === 0 && months === 0) return "Newborn";
  if (years === 0) return `${months} month${months > 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}Y ${months}M`;
}

/** Check if patient is a minor */
export function isMinor(dob: string | Date, threshold = 18): boolean {
  return calculateAge(dob).years < threshold;
}

/** Mask Aadhaar number: show only last 4 digits */
export function maskAadhaar(aadhaar: string): string {
  const digits = stripNonDigits(aadhaar);
  if (digits.length < 4) return aadhaar;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

/** Validate Aadhaar (12 digits) */
export function isValidAadhaar(value: string): boolean {
  return /^\d{12}$/.test(stripNonDigits(value));
}

/** Format phone for display: e.g. 9876543210 → 98765 43210 */
export function formatPhone(phone: string): string {
  const digits = stripNonDigits(phone);
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/** Generate a DOB from approximate age in years */
export function dobFromAge(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().split("T")[0];
}

/** Required field check */
export function isRequired(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}

/** Debounce helper */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
