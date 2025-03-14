// src/api/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+'/api'; // Base URL for your API

// Utility function for making API requests
const request = async (endpoint, method, data = {}, headers = {}) => {
  try {
    const token = localStorage.getItem('jwt_token') || "";
    const authHeaders = endpoint !== "auth/login" && token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      // credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`${responseData?.message || response.statusText}`);
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

// Export API methods
export const get = (endpoint, headers) => request(endpoint, 'GET', {}, headers);
export const post = (endpoint, data, headers) => request(endpoint, 'POST', data, headers);
export const put = (endpoint, data, headers) => request(endpoint, 'PUT', data, headers);
export const del = (endpoint, headers) => request(endpoint, 'DELETE', {}, headers);
