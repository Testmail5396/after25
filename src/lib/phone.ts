/**
 * Normalizes an Indian phone number to a stable matching key.
 * Strips formatting, country code (+91 / 91), and leading trunk 0,
 * so the same customer matches across differently-formatted entries.
 * The original, unnormalized string should still be used for display.
 */
export function normalizePhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(digits.length - 10);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  return digits;
}

export function formatPhoneForDisplay(raw: string): string {
  return raw.trim();
}

export function telHref(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

export function whatsappHref(raw: string, message: string): string {
  const normalized = normalizePhoneNumber(raw);
  const withCountryCode = normalized.length === 10 ? `91${normalized}` : normalized;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
