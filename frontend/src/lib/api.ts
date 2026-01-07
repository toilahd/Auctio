const API_BASE_URL = 'http://localhost:3000';

export async function fetchAPI(url: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // Important: include httpOnly cookies in all requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized - session expired
  if (response.status === 401) {
    // Redirect to login page
    window.location.href = '/log-in';
    throw new Error('Session expired. Please login again.');
  }

  return response;
}

// Convenience methods
export const api = {
  get: (url: string) => fetchAPI(url, { method: 'GET' }),
  
  post: (url: string, data?: any) =>
    fetchAPI(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (url: string, data?: any) =>
    fetchAPI(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: (url: string, data?: any) =>
    fetchAPI(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (url: string) => fetchAPI(url, { method: 'DELETE' }),
};
