const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getHeaders = (includeContentType = true) => {
  const token = localStorage.getItem("token");
  return {
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
};

export const api = {
  get: (path) =>
    fetch(`${API_BASE}${path}`, { headers: getHeaders() }).then(handleResponse),

  post: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  postForm: (path, formData) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: getHeaders(false),
      body: formData,
    }).then(handleResponse),

  put: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),
};
