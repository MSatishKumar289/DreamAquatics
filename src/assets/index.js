// Assets helper for importing images from src/assets/
// Uses Vite's URL constructor with import.meta.url for dynamic asset imports

/**
 * Get image URL from src/assets/ directory
 * If image doesn't exist, returns null (fallback handled in component)
 * @param {string} filename - Image filename (e.g., 'neon-tetra.jpg')
 * @returns {string|null} - URL to the image or null if not found
 */
export const getAssetImage = (filename) => {
  try {
    // Vite handles dynamic imports from src/assets/ using import.meta.url
    // This creates a proper URL that Vite can resolve during build
    const imageUrl = new URL(`./${filename}`, import.meta.url).href;
    return imageUrl;
  } catch (error) {
    // If image doesn't exist, return null (component will use fallback)
    // In development, this might log warnings but won't break the app
    return null;
  }
};

/**
 * Get image with fallback to placeholder
 * @param {string} filename - Image filename (e.g., 'neon-tetra.jpg')
 * @param {string} productTitle - Product title for placeholder
 * @returns {string} - Image URL or placeholder SVG
 */
export const getImageWithFallback = (filename, productTitle = 'Product') => {
  if (!filename) {
    // If no filename provided, return placeholder
    return createPlaceholderSVG(productTitle);
  }
  
  const imageUrl = getAssetImage(filename);
  if (imageUrl) {
    return imageUrl;
  }
  
  // Return SVG placeholder if image not found
  return createPlaceholderSVG(productTitle);
};

/**
 * Create SVG placeholder image
 * @param {string} productTitle - Product title to display in placeholder
 * @returns {string} - Data URI for SVG placeholder
 */
const createPlaceholderSVG = (productTitle) => {
  const encodedTitle = encodeURIComponent(productTitle);
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E${encodedTitle}%3C/text%3E%3C/svg%3E`;
};
