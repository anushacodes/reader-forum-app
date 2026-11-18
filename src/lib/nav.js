/**
 * Validates a "next" redirect parameter to ensure it is a safe relative path.
 * Disallows absolute URLs, protocol-relative URLs (//), and javascript: URLs.
 * @param {string|null} next
 * @returns {string}
 */
export function getSafeNextPath(next) {
  if (!next || typeof next !== 'string') return '/'
  const trimmed = next.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed
  }
  return '/'
}
