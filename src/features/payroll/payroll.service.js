/**
 * NATRA Mobile - Payroll Service
 * Handles fetching payroll batch and specific employee payslip data
 */

import { ApiClient } from '../../core/api/api-client.js';
import { Auth } from '../../core/auth/auth.js';

export const PayrollService = {
  /**
   * Fetch all payroll batches (monthly & daily)
   */
  async getPayrolls() {
    return ApiClient.get('/hris/payrolls');
  },

  /**
   * Fetch specific payroll slips by payrollId
   */
  async getPayrollSlips(payrollId) {
    return ApiClient.get(`/hris/payrolls/${payrollId}/slips`);
  },

  /**
   * Get employee's latest payslip
   */
  async getMyLatestPayslip(employeeId) {
    try {
      const payrollsRes = await this.getPayrolls();
      const monthlyList = payrollsRes?.monthly || [];
      const dailyList = payrollsRes?.daily || [];

      // Prefer monthly payrolls, fallback to daily
      const targetBatch = monthlyList[0] || dailyList[0];
      if (!targetBatch) return null;

      const slipsRes = await this.getPayrollSlips(targetBatch.id);
      const allSlips = slipsRes?.payslips || [];

      const user = Auth.getUser();
      const emp = user?.employee || {};
      const empId = employeeId || emp.id || user?.employee_id;

      // Find slip for this employee with multiple fallback matching
      const mySlip = allSlips.find(s => 
        (empId && (s.employee_id === Number(empId) || s.employee_id === empId)) ||
        (user?.id && s.employee?.user_id === user.id) ||
        (user?.email && s.employee?.user?.email === user.email) ||
        (user?.name && s.employee?.user?.name === user.name)
      ) || allSlips[0];

      return {
        payroll: targetBatch,
        slip: mySlip
      };
    } catch (e) {
      console.warn('[PayrollService] Error fetching latest payslip:', e.message);
      return null;
    }
  }
};
