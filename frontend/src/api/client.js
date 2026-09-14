export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000";

let sessionVersion = 0;
let refreshRequest = null;

export function clearTokens() {
  sessionVersion += 1;
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
}

export function saveTokens(tokens) {
  sessionVersion += 1;
  localStorage.setItem("token", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);
}

export function buildApiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.detail) return getErrorMessage(error.detail);
  if (error.data) return getErrorMessage(error.data);
  if (Array.isArray(error)) return error.map(getErrorMessage).join(" ");
  return Object.entries(error)
    .map(([field, value]) => `${field}: ${getErrorMessage(value)}`)
    .join(" ");
}

async function request(path, options) {
  const response = await fetch(buildApiUrl(path), options);
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = text; }
  }
  if (!response.ok) {
    const error = new Error(getErrorMessage(data) || `Error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function assertSession(version) {
  if (version !== sessionVersion) {
    throw new DOMException("La sesion ha cambiado.", "AbortError");
  }
}

async function refreshAccess(version) {
  // Concurrent 401 responses share one refresh request.
  if (!refreshRequest || refreshRequest.version !== version) {
    const refresh = localStorage.getItem("refresh");
    const entry = { version };
    entry.promise = request("/api-auth/jwt/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).then((tokens) => {
      assertSession(version);
      localStorage.setItem("token", tokens.access);
      if (tokens.refresh) localStorage.setItem("refresh", tokens.refresh);
    }).finally(() => {
      if (refreshRequest === entry) refreshRequest = null;
    });
    refreshRequest = entry;
  }
  await refreshRequest.promise;
}

export async function apiFetch(path, { auth = true, ...options } = {}) {
  const version = sessionVersion;
  const token = auth ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `JWT ${token}`);

  try {
    const data = await request(path, { ...options, headers });
    if (auth) assertSession(version);
    return data;
  } catch (error) {
    if (auth) assertSession(version);
    if (!auth || error.status !== 401 || !localStorage.getItem("refresh")) throw error;
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      if (token === localStorage.getItem("token")) await refreshAccess(version);
    } catch (refreshError) {
      assertSession(version);
      throw refreshError;
    }
    assertSession(version);
    headers.set("Authorization", `JWT ${localStorage.getItem("token")}`);
    try {
      const data = await request(path, { ...options, headers });
      assertSession(version);
      return data;
    } catch (retryError) {
      assertSession(version);
      throw retryError;
    }
  }
}
