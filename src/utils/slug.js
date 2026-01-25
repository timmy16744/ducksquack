/**
 * Create a URL-friendly slug from a title
 * @param {string} title - The title to convert
 * @returns {string} URL-friendly slug
 */
export function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
