// src/api/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api'; // Base URL for your API

// Utility function for making API requests
const request = async (endpoint, method, data = {}, headers = {}) => {
  const token = localStorage.getItem("jwt_token") || "";
  const authHeaders =
    endpoint !== "auth/login" && token
      ? { Authorization: `Bearer ${token}` }
      : {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: method !== "GET" ? JSON.stringify(data) : undefined,
  });

  const contentType = response.headers.get("content-type");

  let responseData;

  if (contentType?.includes("application/json")) {
    responseData = await response.json();
  } else if (contentType?.includes("text")) {
    responseData = await response.text();
  } else {
    responseData = await response.blob();
  }

  if (!response.ok) {
    throw new Error(responseData?.message || response.statusText);
  }

  return responseData;
};

// Export API methods
export const get = (endpoint, headers) => request(endpoint, 'GET', {}, headers);
export const post = (endpoint, data, headers) => request(endpoint, 'POST', data, headers);
export const put = (endpoint, data, headers) => request(endpoint, 'PUT', data, headers);
export const patch = (endpoint, data, headers) => request(endpoint, 'PATCH', data, headers);
export const del = (endpoint, headers) => request(endpoint, 'DELETE', {}, headers);
