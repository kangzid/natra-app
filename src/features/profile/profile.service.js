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
