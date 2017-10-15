/**
 * NATRA Mobile - Auth Service
 * Handles login and logout API calls
 */

import { ApiClient } from '../../core/api/api-client.js';
import { Storage } from '../../core/storage/storage.js';

const AuthService = {
  /**
   * Login employee
   * POST /login
   */
  async login(email, password) {
    const data = await ApiClient.post('/login', { email, password });

    if (data?.token) {
      Storage.setToken(data.token);
      Storage.setUser(data.user);
      if (data.user?.employee) {
        Storage.setEmployee(data.user.employee);
      }
    }

    return data;
  },

  /**
   * Logout employee
   * POST /logout
   */
  async logout() {
    try {
      await ApiClient.post('/logout', {});
    } catch (e) {
      // Ignore API errors — always clear local storage
      console.warn('[AuthService] logout API error (ignored):', e.message);
    } finally {
      Storage.clear();
    }
  },
};

export { AuthService };
