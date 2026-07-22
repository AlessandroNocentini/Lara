/**
 * Prefixes an absolute site-root path (e.g. "/images/foo.jpg") with Astro's
 * configured `base` (e.g. "/Lara"), so image paths stored in siteContent.json
 * keep working when the site is deployed under a GitHub Pages project path
 * instead of the domain root. External URLs pass through unchanged.
 */
export function withBase(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
