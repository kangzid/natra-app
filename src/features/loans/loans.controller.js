/**
 * NATRA Mobile - Loans Controller
 * Handles UI logic and API binding for employee cash advances & loans.
 */

import { LoansService } from './loans.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showAlert } from '../../utils/ui-helpers.js';

class LoansController {
  constructor() {
    this.init();
  }

  async init() {
    Auth.requireAuth();
    if (window.lucide) window.lucide.createIcons();

    this.setupEventListeners();
    await this.loadData();
  }

  setupEventListeners() {
    const applyBtn = document.querySelector('button.bg-slate-100, button.bg-slate-700, button.bg-primary-600');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        showAlert('Pengajuan Kasbon', 'Anda memiliki pinjaman kasbon aktif. Pelunasan atau persetujuan HRD diperlukan sebelum mengajukan pinjaman baru.');
      });
    }
  }

  async loadData() {
    try {
      const [loansRes, summaryRes] = await Promise.allSettled([
        LoansService.getLoans(),
        LoansService.getSummary()
      ]);

      const user = Auth.getUser();
      const employeeId = user?.employee?.id;

      let loans = [];
      if (loansRes.status === 'fulfilled' && loansRes.value) {
        loans = Array.isArray(loansRes.value) ? loansRes.value : (loansRes.value.data || []);
      }

      // Filter for this employee if list has multiple
      if (employeeId && loans.length > 0) {
        const empLoans = loans.filter(l => l.employee_id === employeeId);
        if (empLoans.length > 0) loans = empLoans;
      }

      if (loans.length > 0) {
        this.renderActiveLoan(loans[0]);
        this.renderSchedule(loans[0]);
      } else if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        this.renderSummary(summaryRes.value.data);
      } else {
        this.renderEmptyState();
      }
    } catch (e) {
      console.warn('[LoansController] Error loading loan data:', e.message);
    }
  }

  renderActiveLoan(loan) {
    const balanceEl = document.querySelector('h2.text-4xl');
    if (balanceEl && loan.remaining_amount !== undefined) {
      balanceEl.textContent = 'Rp ' + new Intl.NumberFormat('id-ID').format(loan.remaining_amount);
    }

    const tenorEl = document.querySelector('.border-t > div:first-child p.text-sm');
    if (tenorEl && loan.tenor_months) {
      tenorEl.textContent = `${loan.tenor_months} Bulan`;
    }

    const deductionEl = document.querySelector('.border-t > div:last-child p.text-sm');
    if (deductionEl && loan.monthly_deduction !== undefined) {
      deductionEl.textContent = 'Rp ' + new Intl.NumberFormat('id-ID').format(loan.monthly_deduction);
    }
  }

  renderSchedule(loan) {
    const container = document.querySelector('section .bg-white, section .dark\\:bg-slate-800');
    if (!container) return;

    const monthly = loan.monthly_deduction || (loan.amount / (loan.tenor_months || 1));
    const formattedMonthly = new Intl.NumberFormat('id-ID').format(monthly);
    const tenor = loan.tenor_months || 6;

    let rowsHtml = '';
    for (let i = 1; i <= Math.min(tenor, 3); i++) {
      const isPaid = i === 1 && parseFloat(loan.paid_amount || 0) >= monthly;
      const statusText = isPaid ? 'Lunas' : 'Mendatang';
      const icon = isPaid
        ? '<div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm"><i data-lucide="check" class="w-5 h-5"></i></div>'
        : '<div class="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-sm"><i data-lucide="clock" class="w-5 h-5"></i></div>';

      rowsHtml += `
        <div class="flex items-center justify-between px-5 py-4.5 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-700/50 last:border-none">
          <div class="flex items-center gap-3.5 min-w-0">
            ${icon}
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Cicilan Ke-${i}</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">${statusText} • ${loan.code || 'LOAN'}</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex-shrink-0 ml-3">- Rp ${formattedMonthly}</p>
        </div>
      `;
    }

    container.innerHTML = rowsHtml;
    if (window.lucide) window.lucide.createIcons();
  }

  renderEmptyState() {
    const balanceEl = document.querySelector('h2.text-4xl');
    if (balanceEl) balanceEl.textContent = 'Rp 0';
    const tenorEl = document.querySelector('.border-t > div:first-child p.text-sm');
    if (tenorEl) tenorEl.textContent = '0 Bulan';
    const deductionEl = document.querySelector('.border-t > div:last-child p.text-sm');
    if (deductionEl) deductionEl.textContent = 'Rp 0';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LoansController();
});

export { LoansController };
