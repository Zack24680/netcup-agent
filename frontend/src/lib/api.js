/**
 * Thin API client — all calls go through Vite's proxy to http://localhost:4000
 */

const BASE = '/api';

function getToken() {
  return localStorage.getItem('hs_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),
};

// ── Scripts ───────────────────────────────────────────────────────────────────
export const scripts = {
  generate: ({ symptoms, tone, duration, title }) =>
    request('/scripts/generate', {
      method: 'POST',
      body: JSON.stringify({ symptoms, tone, duration, title }),
    }),

  list: () => request('/scripts'),

  get: (id) => request(`/scripts/${id}`),

  delete: (id) => request(`/scripts/${id}`, { method: 'DELETE' }),
};
