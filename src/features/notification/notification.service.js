/**
 * NATRA Mobile - Notification Service
 */

import { ApiClient } from '../../core/api/api-client.js';

const NotificationService = {
  /**
   * Get all notifications (paginated)
   * GET /notifications
   */
  async getAll(page = 1) {
    return ApiClient.get(`/notifications?page=${page}`);
  },

  /**
   * Get unread notifications + count
   * GET /notifications/unread
   */
  async getUnread() {
    return ApiClient.get('/notifications/unread');
  },

  /**
   * Mark a single notification as read
   * POST /notifications/{id}/read
   */
  async markRead(id) {
    return ApiClient.post(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications as read
   * POST /notifications/read-all
   */
  async markAllRead() {
    return ApiClient.post('/notifications/read-all', {});
  },
};

export { NotificationService };
