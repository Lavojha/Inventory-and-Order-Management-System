const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(Array.isArray(message) ? message.map((item) => item.msg).join(', ') : message);
  }

  if (response.status === 204) return null;
  return response.json();
}
