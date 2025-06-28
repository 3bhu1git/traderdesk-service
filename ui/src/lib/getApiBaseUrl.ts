// src/lib/getApiBaseUrl.ts

/**
 * Returns the correct API base URL depending on PROFILE (dev/prod) and npm script.
 * - If VITE_API_BASE_URL is set, use it directly
 * - If PROFILE=dev, returns LOCAL_URL
 * - If PROFILE=prod or running under npm run git, returns CODESPACE_URL
 */
export function getApiBaseUrl(): string {
  // Check for direct API base URL first
  const directApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (directApiUrl) {
    return directApiUrl;
  }

  // Fallback to the profile-based logic
  const codespaceUrl = import.meta.env.VITE_CODESPACE_URL || process.env.CODESPACE_URL || '';
  const profile = import.meta.env.VITE_PROFILE || process.env.PROFILE || 'dev';
  const localUrl = import.meta.env.VITE_LOCAL_URL || process.env.LOCAL_URL || 'http://localhost:3002';

  if (codespaceUrl && profile === 'prod') {
    return codespaceUrl;
  }
  if (profile === 'prod') {
    return codespaceUrl || localUrl;
  }
  return localUrl;
}
