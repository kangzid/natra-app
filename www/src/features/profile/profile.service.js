/**
 * NATRA Mobile - Profile Service
 */

import { ApiClient } from '../../core/api/api-client.js';

const ProfileService = {
  /**
   * Get user profile
   * GET /profile
   */
  async getProfile() {
    return ApiClient.get('/profile');
  },

  /**
   * Get comprehensive employee profile data (Finances, Contracts, KPI, Assets, Loans, BPJS, etc.)
   * GET /employees/{id}/profile
   */
  async getComprehensiveProfile(employeeId = 'me') {
    return ApiClient.get(`/employees/${employeeId}/profile`);
  },

  /**
   * Change password
   * PUT /change-password
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    return ApiClient.put('/change-password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
  },
};

export { ProfileService };
