/**
 * Centralized API client for the NexBill app.
 *
 * In production (Vercel / hosted build) set:
 *   NEXT_PUBLIC_API_URL=https://billing-customer-app.vercel.app
 *
 * In development (local / Electron dev) the variable is left empty so that
 * all requests go to the current origin (i.e. relative URLs are used).
 */

const BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  '';

/**
 * Drop-in replacement for `fetch` that automatically prepends the configured
 * base URL to any path that starts with `/api`.
 *
 * Usage:
 *   import { apiFetch } from '@/lib/apiClient'
 *   const res = await apiFetch('/api/products', { headers: { ... } })
 */
export function apiFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string' && input.startsWith('/')) {
    input = `${BASE_URL}${input}`;
  }
  return fetch(input, init);
}

export default apiFetch;
