// Shared validation rules for KutumbKosh forms

export type ValidationError = string | null;

// Email
export function validateEmail(email: string): ValidationError {
  if (!email.trim()) return "Email is required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return "Please enter a valid email address";
  return null;
}

// Full name
export function validateFullName(name: string): ValidationError {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.trim().length > 100) return "Name must be under 100 characters";
  if (!/^[a-zA-Z\s.''-]+$/.test(name.trim())) return "Name can only contain letters, spaces, and basic punctuation";
  return null;
}

// Phone (Indian format) — optional field
export function validatePhone(phone: string): ValidationError {
  if (!phone.trim()) return null; // Optional field
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+91")) {
    if (!/^\+91[6-9]\d{9}$/.test(cleaned)) return "Invalid Indian phone number (e.g. +91 98765 43210)";
  } else if (cleaned.length === 10) {
    if (!/^[6-9]\d{9}$/.test(cleaned)) return "Invalid phone number — must start with 6-9";
  } else {
    return "Phone must be 10 digits or start with +91";
  }
  return null;
}

// Mobile number — mandatory variant (Profile Setup, Trusted Contact)
export function validateMobileRequired(mobile: string): ValidationError {
  if (!mobile.trim()) return "Mobile number is required";
  const cleaned = mobile.replace(/[\s\-()]/g, "");
  const digits = cleaned.startsWith("+91") ? cleaned.slice(3) : cleaned;
  if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit Indian mobile number";
  return null;
}

// Mobile number — optional variant (Nominee form)
export function validateMobileOptional(mobile: string): ValidationError {
  if (!mobile.trim()) return null;
  const cleaned = mobile.replace(/[\s\-()]/g, "");
  const digits = cleaned.startsWith("+91") ? cleaned.slice(3) : cleaned;
  if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit Indian mobile number";
  return null;
}

// Normalise mobile to 10-digit string for storage
export function normaliseMobile(mobile: string): string {
  const cleaned = mobile.replace(/[\s\-()]/g, "");
  return cleaned.startsWith("+91") ? cleaned.slice(3) : cleaned;
}

// PAN (Indian PAN card format)
export function validatePAN(pan: string): ValidationError {
  if (!pan.trim()) return null; // Optional field
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())) {
    return "Invalid PAN format (e.g. ABCDE1234F)";
  }
  return null;
}

// Date of birth — optional (legacy, used for nominees DOB)
export function validateDOB(dob: string): ValidationError {
  if (!dob) return null;
  const date = new Date(dob);
  if (isNaN(date.getTime())) return "Invalid date";
  const today = new Date();
  if (date > today) return "Date of birth cannot be in the future";
  const age = today.getFullYear() - date.getFullYear();
  if (age > 120) return "Please enter a valid date of birth";
  return null;
}

// Date of birth — mandatory with 18+ check (Profile Setup)
export function validateDOBMandatory(dob: string): ValidationError {
  if (!dob) return "Date of birth is required";
  const date = new Date(dob);
  if (isNaN(date.getTime())) return "Invalid date";
  const today = new Date();
  if (date > today) return "Date of birth cannot be in the future";
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const exactAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
      ? age - 1
      : age;
  if (exactAge < 18) return "You must be 18 or older to create a KutumbKosh vault.";
  if (exactAge > 120) return "Please enter a valid date of birth";
  return null;
}

// Calculate age from date string — returns null if invalid
export function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const date = new Date(dob);
  if (isNaN(date.getTime())) return null;
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
    ? age - 1
    : age;
}

// Relationship dropdown — shared between Nominee and Trusted Contact
export function validateRelationshipDropdown(value: string): ValidationError {
  if (!value) return "Please select a relationship";
  return null;
}

// Institution name
export function validateInstitution(name: string): ValidationError {
  if (!name.trim()) return "Institution name is required";
  if (name.trim().length < 2) return "Institution name must be at least 2 characters";
  if (name.trim().length > 150) return "Institution name is too long";
  return null;
}

// Account identifier (last 4 digits only — must be digits)
export function validateAccountId(id: string): ValidationError {
  if (!id.trim()) return null; // Optional
  if (!/^\d+$/.test(id.trim())) return "Only digits are allowed (last 4 digits of your account)";
  if (id.trim().length > 4) return "Enter only the last 4 digits";
  return null;
}

// Notes
export function validateNotes(notes: string): ValidationError {
  if (notes.length > 1000) return "Notes must be under 1000 characters";
  return null;
}

// Share percentage
export function validateSharePercentage(value: number, available: number): ValidationError {
  if (isNaN(value) || value <= 0) return "Share must be greater than 0%";
  if (value > 100) return "Share cannot exceed 100%";
  if (value > available) return `Only ${available}% available for this asset`;
  return null;
}

// Contact name
export function validateContactName(name: string): ValidationError {
  if (!name.trim()) return "Contact name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return null;
}

// Relation
export function validateRelation(relation: string): ValidationError {
  if (!relation) return "Please select a relation";
  return null;
}

// Generic required field
export function validateRequired(value: string, fieldName: string): ValidationError {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
}

// Metadata text field (asset-specific details)
export function validateMetadataText(value: string, fieldName: string, required: boolean): ValidationError {
  const trimmed = value.trim();
  if (required && !trimmed) return `${fieldName} is required`;
  if (trimmed.length > 500) return `${fieldName} must be under 500 characters`;
  return null;
}

// Metadata textarea (longer descriptions)
export function validateMetadataTextarea(value: string, fieldName: string, maxLen: number = 1000): ValidationError {
  if (value.length > maxLen) return `${fieldName} must be under ${maxLen} characters`;
  return null;
}

// Metadata select (dropdown)
export function validateMetadataSelect(value: string, fieldName: string, required: boolean): ValidationError {
  if (required && !value) return `Please select a ${fieldName.toLowerCase()}`;
  return null;
}

// Metadata date (with optional future-date restriction)
export function validateMetadataDate(value: string, fieldName: string, allowFuture: boolean = true): ValidationError {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return `Invalid ${fieldName.toLowerCase()}`;
  if (!allowFuture && date > new Date()) return `${fieldName} cannot be in the future`;
  return null;
}

// Emergency instructions (textarea, generous limit)
export function validateInstructions(text: string, fieldName: string = "Instructions"): ValidationError {
  if (text.length > 5000) return `${fieldName} must be under 5,000 characters`;
  return null;
}

// Form-level helper: returns true if no errors
export function isFormValid(errors: Record<string, ValidationError>): boolean {
  return Object.values(errors).every((e) => e === null);
}

// Inline error component helper text
export function getErrorClass(error: ValidationError): string {
  return error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
}
