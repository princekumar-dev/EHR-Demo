export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const handleResponse = async (res) => {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || res.statusText || 'API error');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

const buildHeaders = (token, isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const apiClient = {
  get: async (path, token) => {
    const res = await fetch(`${apiBaseUrl}${path}`, {
      method: 'GET',
      headers: buildHeaders(token, false),
    });
    return handleResponse(res);
  },
  post: async (path, body, token) => {
    const res = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  put: async (path, body, token) => {
    const res = await fetch(`${apiBaseUrl}${path}`, {
      method: 'PUT',
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  patch: async (path, body, token) => {
    const res = await fetch(`${apiBaseUrl}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  delete: async (path, token) => {
    const res = await fetch(`${apiBaseUrl}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(token, false),
    });
    return handleResponse(res);
  },
};
