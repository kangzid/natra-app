/**
 * NATRA Mobile - API Client
 * Centralized fetch wrapper with auth headers and error handling
 */

import { Storage } from '../storage/storage.js';

export function getBaseUrl() {
  // Check localStorage if custom URL is provided
  if (typeof localStorage !== 'undefined') {
    const customUrl = localStorage.getItem('natra_api_base_url');
    if (customUrl && !customUrl.includes('zalfyan.my.id')) {
      return customUrl.replace(/\/$/, '');
    }
  }

  // If running in Native Capacitor App (Android / iOS)
  const isNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
  if (isNative) {
    // Default WiFi LAN IP of development server
    return 'http://192.168.100.50:8000/api';
  }

  // If running in browser
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api';
    }
    if (hostname && hostname !== '' && hostname !== '0.0.0.0') {
      return `http://${hostname}:8000/api`;
    }
  }

  return 'http://192.168.100.50:8000/api';
}

export const BASE_URL = getBaseUrl();

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
  const currentBaseUrl = getBaseUrl();
  const url = `${currentBaseUrl}${endpoint}`;
  console.log(`[ApiClient] ${options.method || 'GET'} -> ${url}`);

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
        let errorMsg = data?.message || `Server error (${response.status})`;
        if (data?.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
            errorMsg = data.errors[firstKey][0];
          }
        }
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status !== undefined) throw err;
      console.error('[ApiClient] Native Error:', err);
      const networkError = new Error('Terjadi gangguan koneksi ke server (192.168.100.50:8000). Pastikan HP & Laptop terhubung ke WiFi yang sama.');
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
      let errorMsg = data?.message || `Server error (${response.status})`;
      if (data?.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
          errorMsg = data.errors[firstKey][0];
        }
      }
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status !== undefined) throw err;
    console.error('[ApiClient] Fetch Error:', err);
    const networkError = new Error('Terjadi gangguan koneksi ke server. Silakan coba lagi nanti.');
    networkError.status = 0;
    throw networkError;
  }
}

const ApiClient = {
  getBaseUrl() {
    return getBaseUrl();
  },

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
