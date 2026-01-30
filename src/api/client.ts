const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const getToken = () => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

const parseError = async (response: Response) => {
  try {
    const data = await response.clone().json();
    return data?.error || response.statusText;
  } catch {
    return response.statusText;
  }
};

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = path.startsWith('http://') || path.startsWith('https://') ? path : `${baseUrl}/api${path}`;

  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });

  if (!response.ok) {
    const message = await parseError(response);
    const err = new Error(message || `Request failed with status ${response.status}`) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  return response;
}

export async function apiJson<T = unknown>(path: string, init: RequestInit = {}) {
  const response = await apiFetch(path, init);
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}
