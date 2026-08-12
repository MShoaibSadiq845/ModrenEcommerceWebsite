/**
 * Retrieves the stored JWT from localStorage, stripping any extra double-quotes
 * that may have been added by JSON.stringify.
 * Returns null if no valid token exists.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('token');
  if (!raw) return null;
  const trimmed = raw.trim();
  // Only strip outer double-quotes when BOTH sides have them
  const token =
    trimmed.startsWith('"') && trimmed.endsWith('"')
      ? trimmed.slice(1, -1).trim()
      : trimmed;
  // Validate basic JWT structure: 3 base64url segments
  if (token.split('.').length !== 3) return null;
  return token || null;
}
