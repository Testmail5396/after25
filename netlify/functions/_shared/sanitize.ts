/** Strips control characters and collapses whitespace for safe storage/search of free-text fields. */
export function sanitizeText(input: string, maxLength = 200): string {
  const stripped = Array.from(input)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return !(code <= 0x1f || code === 0x7f);
    })
    .join("");
  return stripped.replace(/\s+/g, " ").trim().slice(0, maxLength);
}
