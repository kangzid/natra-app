/**
 * NATRA Mobile - Leave & Request Service
 * Handles leave requests, permission requests, sick leave, leave balances, and leave types.
 */

import { ApiClient } from '../../core/api/api-client.js';

export const LeaveService = {
  /**
   * Get employee leave balance and requests summary
   */
  async getSummary() {
    return ApiClient.get('/hris/requests/summary');
  },

  /**
   * Get available leave types (Cuti Tahunan, Izin Sakit, Cuti Khusus, dll.)
   */
  async getLeaveTypes() {
    return ApiClient.get('/hris/leave-types');
  },

  /**
   * Get employee requests list (leave, permission, sick leave)
   */
  async getRequests() {
    return ApiClient.get('/hris/requests');
  },

  /**
   * Submit new leave / permission / sick request
   * @param {Object} data { employee_id, request_type, leave_type_id, start_date, end_date, days_count, reason, attachment_base64, attachment_name }
   */
  async submitRequest(data) {
    return ApiClient.post('/hris/requests', data);
  },
};
