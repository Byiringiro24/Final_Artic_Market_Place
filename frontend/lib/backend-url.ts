import 'server-only';

/** Resolve a backend API path for server-side requests inside the app runtime. */
export function backendApiUrl(path: string): string {
  const cleanPath = path.replace(/^\/+/, '');
  const serviceBase = process.env.ARTIC_BACKEND_URL;

  if (serviceBase) {
    const base = `${serviceBase.replace(/\/+$/, '')}/`;
    return new URL(`api/v1/${cleanPath}`, base).toString();
  }

  const configuredBase = process.env.ARTIC_BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiBase = configuredBase?.startsWith('http')
    ? configuredBase
    : process.env.NODE_ENV === 'production'
      ? 'http://backend:5000/api/v1'
      : 'http://localhost:5000/api/v1';
  return new URL(`${cleanPath}`, `${apiBase.replace(/\/+$/, '')}/`).toString();
}
