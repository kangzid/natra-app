/**
 * NATRA Mobile - Assets Service
 * Handles company assets & inventory assigned to employee
 */

import { ApiClient } from '../../core/api/api-client.js';

export const AssetsService = {
  /**
   * Get employee assigned assets
   */
  async getAssets(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/hris/assets?${query}` : '/hris/assets';
    return ApiClient.get(endpoint);
  },

  /**
   * Get asset summary statistics
   */
  async getSummary(employeeId = null) {
    const endpoint = employeeId ? `/hris/assets/summary?employee_id=${employeeId}` : '/hris/assets/summary';
    return ApiClient.get(endpoint);
  },

  /**
   * Get asset categories
   */
  async getCategories() {
    return ApiClient.get('/hris/asset-categories');
  },

  /**
   * Report asset issue / damage
   */
  async reportDamage(assetId, payload) {
    return ApiClient.post(`/hris/assets/${assetId}/report-damage`, payload);
  }
};
