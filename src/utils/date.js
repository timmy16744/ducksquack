/**
 * Format a date string to a human-readable format
 * @param {string} dateStr - ISO date string (e.g., "2025-01-26")
 * @returns {string} Formatted date (e.g., "January 26, 2025")
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
