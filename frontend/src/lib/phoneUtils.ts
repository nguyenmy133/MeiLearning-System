/**
 * Vietnamese phone number validation — single source of truth.
 *
 * Accepted formats:
 *   0xxxxxxxxx   (10 digits, leading 0)
 *   84xxxxxxxxx  (11 digits, country code without +)
 *   +84xxxxxxxxx (12 chars, country code with +)
 *
 * All formats map to the same 9-digit subscriber number.
 */
export const PHONE_REGEX_VN = /^(0|\+?84)\d{9}$/;

export const PHONE_ERROR_MSG = "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)";

/** Returns true if the phone number is a valid VN number. */
export function validatePhoneVN(value: string): boolean {
  return PHONE_REGEX_VN.test(value.trim());
}

/**
 * Returns an error message string if invalid, empty string if valid.
 * Treats empty/null input as valid (use required-check separately).
 */
export function phoneError(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return validatePhoneVN(trimmed) ? "" : PHONE_ERROR_MSG;
}
