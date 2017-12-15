/**
 * NATRA Mobile - Overtime Service
 * Handles overtime submissions, summary metrics, and history
 */

import { ApiClient } from '../../core/api/api-client.js';

export const OvertimeService = {
  /**
   * Get employee overtime history list
   */
  async getOvertimes() {
    return ApiClient.get('/hris/overtimes');
  },

  /**
   * Get overtime summary stats
   */
  async getSummary() {
    return ApiClient.get('/hris/overtimes/summary');
  },

  /**
   * Submit new overtime request
   * @param {Object} data { task_name, start_time, end_time, date, notes }
   */
  async submitOvertime(data) {
    return ApiClient.post('/hris/overtimes', data);
  },
};
