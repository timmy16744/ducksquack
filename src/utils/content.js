/**
 * Get a preview excerpt from content
 * @param {string} content - The full content
 * @param {number} maxLength - Maximum length of preview
 * @returns {string} Preview text
 */
export function getPreview(content, maxLength = 150) {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const preview = lines.slice(0, 3).join(' ').trim();

  if (preview.length > maxLength) {
    return preview.substring(0, maxLength - 3) + '...';
  }
  return preview;
}

/**
 * Fetch the writings index (metadata only)
 * @returns {Promise<Array>} Array of writing metadata
 */
export async function fetchWritingsIndex() {
  const response = await fetch('/writings/index.json');
  if (!response.ok) {
    throw new Error('Failed to fetch writings index');
  }
  return response.json();
}

/**
 * Fetch a single writing by slug
 * @param {string} slug - The writing slug
 * @returns {Promise<Object>} Writing data with content
 */
export async function fetchWriting(slug) {
  const response = await fetch(`/writings/${slug}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch writing: ${slug}`);
  }
  return response.json();
}
