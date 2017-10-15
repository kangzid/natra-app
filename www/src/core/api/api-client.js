/**
 * NATRA Mobile - API Client
 * Centralized fetch wrapper with auth headers and error handling
 */

import { Storage } from '../storage/storage.js';

// Detect current host to handle IP-based access (useful for mobile testing)
const currentHost = window.location.hostname;
const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(currentHost);
export const BASE_URL = 'https://locatrack.zalfyan.my.id/api';

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
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const isNative = window.Capacitor && window.Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const { CapacitorHttp } = window.Capacitor.Plugins;
      const response = await CapacitorHttp.request({
        url,
        method: options.method || 'GET',
        headers,
        data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
      });

      const data = response.data;

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

      if (response.status >= 400) {
        const error = new Error(data?.message || `Server error (${response.status})`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status) throw err;
      console.error('[ApiClient] Native Error:', err);
      const networkError = new Error('Terjadi gangguan koneksi ke server. Silakan coba lagi nanti.');
      networkError.status = 0;
      throw networkError;
    }
  }

  // --- Browser Fallback (Standard fetch) ---
  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

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
    if (err.status) throw err;
    const networkError = new Error('Terjadi gangguan koneksi ke server. Silakan coba lagi nanti.');
    networkError.status = 0;
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
