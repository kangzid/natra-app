/**
 * NATRA Mobile - Dashboard Service
 * GET /employee/dashboard
 */

import { ApiClient } from '../../core/api/api-client.js';

const DashboardService = {
  /**
   * Fetch dashboard summary data
   * @returns {Promise<{employee, attendance_today, tasks_summary, unread_notifications, monthly_attendance}>}
   */
  async getDashboard() {
    return ApiClient.get('/employee/dashboard');
  },
};

export { DashboardService };
