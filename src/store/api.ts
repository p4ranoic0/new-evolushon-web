export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message); this.status = status; this.code = code; this.details = details;
  }
}
let unauthorized: (() => void) | undefined;
export function onUnauthorized(fn?: () => void) { unauthorized = fn; }
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Requested-With', 'evolushon');
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch('/api' + path, { ...options, headers, credentials: 'same-origin' });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/me') unauthorized?.();
    throw new ApiError(response.status, result.error?.code || 'HTTP_ERROR', result.error?.message || 'No se pudo completar la petición.', result.error?.details);
  }
  return response.status === 204 ? undefined as T : response.json();
}
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, headers?: HeadersInit) => request<T>(path, {method:'POST', body:body === undefined ? undefined : JSON.stringify(body), headers}),
  put: <T>(path: string, body: unknown) => request<T>(path, {method:'PUT', body:JSON.stringify(body)}),
  patch: <T>(path: string, body: unknown) => request<T>(path, {method:'PATCH', body:JSON.stringify(body)}),
  del: <T = void>(path: string) => request<T>(path, {method:'DELETE'}),
  upload: <T>(path: string, body: FormData) => request<T>(path, {method:'POST', body}),
};
