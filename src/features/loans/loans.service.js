/**
 * NATRA Mobile - Loans Service
 * Handles employee cash advances & loan requests
 */

import { ApiClient } from '../../core/api/api-client.js';

export const LoansService = {
  /**
   * Get employee loans list
   */
  async getLoans() {
    return ApiClient.get('/hris/loans');
  },

  /**
   * Get loans summary stats
   */
  async getSummary() {
    return ApiClient.get('/hris/loans/summary');
  },

  /**
   * Submit a new loan request
   * @param {Object} data { amount, tenor_months, reason }
   */
  async submitLoan(data) {
    return ApiClient.post('/hris/loans', data);
  },

  /**
   * Get installment / payment history for a loan
   */
  async getLoanHistory(loanId) {
    return ApiClient.get(`/hris/loans/${loanId}/history`);
  },
};
