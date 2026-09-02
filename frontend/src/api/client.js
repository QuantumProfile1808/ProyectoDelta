export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function buildApiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `JWT ${token}`;
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
