/**
 * NATRA Mobile - API Client
 * Centralized fetch wrapper with auth headers and error handling
 */

import { Storage } from '../storage/storage.js';

// Detect current host to handle IP-based access (useful for mobile testing)
const currentHost = window.location.hostname;
const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(currentHost);
export const BASE_URL = 'http://192.168.100.50:8000/api';

function _getLoginPath() {
  return window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
}

/**
 * Returns true if the current page is the login page.
 * Prevents auto-logout redirect on 401 when on login page
 * (wrong password should show error, not redirect in a loop).
 */
function _isLoginPage() {
  return window.location.pathname.includes('login.html');
}

/**
 * Core request function
 * @param {string} endpoint - API endpoint (e.g. '/login')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} - parsed JSON response
 */
async function request(endpoint, options = {}) {
  const token = Storage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  // Auto-serialize body
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Parse response body first (needed for all status codes)
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    // --- Global 401 handler: auto-logout ---
    // EXCEPTION: if we are on the login page, do NOT redirect.
    // Instead throw error so auth.controller can display "email/password salah".
    if (response.status === 401) {
      if (_isLoginPage()) {
        const error = new Error(data?.message || 'Email atau password salah.');
        error.status = 401;
        error.data = data;
        throw error;
      }
      Storage.clear();
      window.location.replace(_getLoginPath());
      return null;
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Server error (${response.status})`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Re-throw structured API errors (they already have .status set)
    if (err.status) throw err;

    // Network / CORS / connection error — err.message is the raw browser message
    // e.g. "Failed to fetch" (Chrome) or "NetworkError when attempting to fetch resource" (Firefox)
    const networkError = new Error('Terjadi gangguan koneksi ke server. Silakan coba lagi nanti atau hubungi administrator jika masalah berlanjut.');
    networkError.status = 0;
    networkError.data = null;
    throw networkError;
  }
}

const ApiClient = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body = {}, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body = {}, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};

export { ApiClient };
