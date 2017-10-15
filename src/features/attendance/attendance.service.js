/**
 * NATRA Mobile - Attendance Service
 * Handles all attendance-related API calls
 */

import { ApiClient } from '../../core/api/api-client.js';

const AttendanceService = {
  /**
   * Check In
   * POST /attendances { latitude, longitude, type: 'check_in' }
   */
  async checkIn(latitude, longitude) {
    return ApiClient.post('/attendances', {
      latitude,
      longitude,
      type: 'check_in',
    });
  },

  /**
   * Check Out
   * POST /attendances { latitude, longitude, type: 'check_out' }
   */
  async checkOut(latitude, longitude) {
    return ApiClient.post('/attendances', {
      latitude,
      longitude,
      type: 'check_out',
    });
  },

  /**
   * Check if current location is within office radius
   * POST /attendances/check-location
   */
  async checkLocation(latitude, longitude) {
    return ApiClient.post('/attendances/check-location', { latitude, longitude });
  },

  /**
   * Get today's attendance record
   * GET /attendances/today
   */
  async getToday() {
    return ApiClient.get('/attendances/today');
  },

  /**
   * Get current month's attendance summary
   * GET /attendances/monthly
   */
  async getMonthly() {
    return ApiClient.get('/attendances/monthly');
  },

  /**
   * Get full attendance history (paginated)
   * GET /attendances
   */
  async getHistory(page = 1) {
    return ApiClient.get(`/attendances?page=${page}`);
  },

  /**
   * Get attendance detail by ID
   * GET /attendances/{id}
   */
  async getById(id) {
    return ApiClient.get(`/attendances/${id}`);
  },
};

export { AttendanceService };
