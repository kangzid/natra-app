/**
 * NATRA Mobile - Reimbursement Service
 * Handles claims API, categories, and submissions
 */

import { ApiClient } from '../../core/api/api-client.js';

export const ReimbursementService = {
  /**
   * Get employee claims list
   */
  async getClaims() {
    return ApiClient.get('/hris/claims');
  },

  /**
   * Get claim types / categories
   */
  async getClaimTypes() {
    return ApiClient.get('/hris/claims/types');
  },

  /**
   * Get claim summary stats
   */
  async getSummary() {
    return ApiClient.get('/hris/claims/summary');
  },

  /**
   * Submit a new reimbursement claim
   * @param {Object} data { claim_type_id, title, amount, date, description, receipt_file }
   */
  async submitClaim(data) {
    return ApiClient.post('/hris/claims', data);
  },
};
