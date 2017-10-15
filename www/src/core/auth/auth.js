/**
 * NATRA Mobile - Auth Module
 * Handles auth guards and redirects
 */

import { Storage } from '../storage/storage.js';

function _isInPages() {
  return window.location.pathname.includes('/pages/');
}

function _getLoginPath() {
  return _isInPages() ? 'login.html' : 'pages/login.html';
}

function _getDashboardPath() {
  return _isInPages() ? 'dashboard.html' : 'pages/dashboard.html';
}

const Auth = {
  /**
   * Returns true if a valid token is present
   */
  isAuthenticated() {
    return !!Storage.getToken();
  },

  /**
   * Call at the top of every protected page.
   * Redirects to login if no token found.
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.replace(_getLoginPath());
      return false;
    }
    return true;
  },

  /**
   * Call on the login page.
   * Redirects to dashboard if already authenticated.
   */
  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.replace(_getDashboardPath());
    }
  },

  /**
   * Get stored user object
   */
  getUser() {
    return Storage.getUser();
  },

  /**
   * Get stored employee object
   */
  getEmployee() {
    return Storage.getEmployee();
  },

  /**
   * Get display name (user name or 'Karyawan')
   */
  getDisplayName() {
    const user = this.getUser();
    return user?.name || 'Karyawan';
  },

  /**
   * Get employee ID string (e.g. EMP003)
   */
  getEmployeeId() {
    const emp = this.getEmployee();
    return emp?.employee_id || '-';
  },

  /**
   * Get internal employee numeric ID (for location tracking)
   */
  getEmployeeNumericId() {
    const emp = this.getEmployee();
    return emp?.id || null;
  },

  /**
   * Clear session and redirect to login
   */
  logout() {
    Storage.clear();
    window.location.replace(_getLoginPath());
  },
};

export { Auth };
