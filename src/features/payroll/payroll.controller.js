/**
 * NATRA Mobile - Payroll Controller
 * Handles UI logic and real API binding for employee payslip.
 */

import { PayrollService } from './payroll.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showAlert } from '../../utils/ui-helpers.js';

class PayrollController {
  constructor() {
    this._currentSlip = null;
    this._currentPayroll = null;
    this.init();
  }

  async init() {
    Auth.requireAuth();
    if (window.lucide) window.lucide.createIcons();

    this.setupEventListeners();
    await this.loadPayrollData();
  }

  async loadPayrollData() {
    try {
      const user = Auth.getUser();
      const employee = user?.employee || {};
      const employeeId = employee.id || user?.employee_id;

      const data = await PayrollService.getMyLatestPayslip(employeeId);
      console.log('[PayrollController] Resolved payslip data:', data);

      if (data?.slip) {
        this.renderPayslip(data.payroll, data.slip, user, employee);
      } else {
        this.renderEmptyState(user, employee);
      }
    } catch (e) {
      console.warn('[PayrollController] Error loading payroll data:', e.message);
      this.renderEmptyState(Auth.getUser(), Auth.getUser()?.employee || {});
    }
  }

  renderPayslip(payroll, slip, user, employee) {
    this._currentSlip = slip;
    this._currentPayroll = payroll;

    // 1. Period in header
    const periodEl = document.getElementById('payroll-period');
    if (periodEl) {
      const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const periodName = payroll?.batch_name || `Gaji ${monthNames[payroll?.month] || ''} ${payroll?.year || ''}`;
      periodEl.textContent = periodName;
    }

    // 2. Take Home Pay
    const thpEl = document.getElementById('thp-amount');
    if (thpEl) {
      const netSalary = parseFloat(slip.net_salary || 0);
      thpEl.textContent = new Intl.NumberFormat('id-ID').format(netSalary);
    }

    // 3. Employee Info
    const empNameEl = document.getElementById('emp-name-pos');
    if (empNameEl) {
      empNameEl.textContent = `${slip.employee?.user?.name || user?.name || 'Karyawan'}`;
    }
    const empIdEl = document.getElementById('emp-id-num');
    if (empIdEl) {
      empIdEl.textContent = `${slip.employee?.employee_id || employee.employee_id || 'EMP'} • ${slip.employee?.position || employee.position || 'Staf'}`;
    }

    // 4. Status Badge
    const statusBadge = document.getElementById('payroll-status-badge');
    if (statusBadge) {
      const isPublished = slip.status === 'published' || payroll?.status === 'published';
      statusBadge.textContent = isPublished ? 'TERBIT' : 'DRAFT';
      statusBadge.className = isPublished
        ? 'px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0'
        : 'px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0';
    }

    // 5. Earnings List (iOS Card style with generous padding & line height)
    const earningsContainer = document.getElementById('earnings-container');
    if (earningsContainer) {
      const basicSalary = parseFloat(slip.basic_salary || 0);
      const allowances = parseFloat(slip.allowances || 0);
      const overtimePay = parseFloat(slip.overtime_pay || 0);
      const adjAdd = parseFloat(slip.adjustments_addition || 0);

      earningsContainer.innerHTML = `
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="briefcase" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Gaji Pokok</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Upah Dasar Bulanan</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex-shrink-0 ml-3">Rp ${new Intl.NumberFormat('id-ID').format(basicSalary)}</p>
        </div>

        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="utensils" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Tunjangan</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Tunjangan Makan & Operasional</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex-shrink-0 ml-3">Rp ${new Intl.NumberFormat('id-ID').format(allowances)}</p>
        </div>

        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="timer" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Lembur & Overtime</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Insentif Jam Kerja Lembur</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-3">+ Rp ${new Intl.NumberFormat('id-ID').format(overtimePay)}</p>
        </div>

        ${adjAdd > 0 ? `
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="plus-circle" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Penyesuaian (+)</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Bonus / Koreksi Positif</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-3">+ Rp ${new Intl.NumberFormat('id-ID').format(adjAdd)}</p>
        </div>` : ''}
      `;
    }

    // 6. Deductions List (iOS Card style with generous padding & line height)
    const deductionsContainer = document.getElementById('deductions-container');
    if (deductionsContainer) {
      const loanDed = parseFloat(slip.loan_deductions || 0);
      const absenceDed = parseFloat(slip.absence_deductions || 0);
      const bpjsKes = parseFloat(slip.bpjs_kesehatan || 0);
      const bpjsTk = parseFloat(slip.bpjs_ketenagakerjaan || 0);
      const taxDed = parseFloat(slip.tax_deductions || 0);
      const adjDed = parseFloat(slip.adjustments_deduction || 0);

      deductionsContainer.innerHTML = `
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="badge-dollar-sign" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Potongan Pinjaman / Kasbon</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Cicilan Kasbon Aktif</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 flex-shrink-0 ml-3">- Rp ${new Intl.NumberFormat('id-ID').format(loanDed)}</p>
        </div>

        ${absenceDed > 0 ? `
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="calendar-x-2" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Potongan Kehadiran / Unpaid Leave</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Izin Tidak Masuk Tanpa Upah</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 flex-shrink-0 ml-3">- Rp ${new Intl.NumberFormat('id-ID').format(absenceDed)}</p>
        </div>` : ''}

        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="heart-pulse" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">BPJS Kesehatan</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Iuran BPJS Kesehatan</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 flex-shrink-0 ml-3">- Rp ${new Intl.NumberFormat('id-ID').format(bpjsKes)}</p>
        </div>

        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="shield-half" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">BPJS Ketenagakerjaan</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">JHT & Jaminan Pensiun</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 flex-shrink-0 ml-3">- Rp ${new Intl.NumberFormat('id-ID').format(bpjsTk)}</p>
        </div>

        ${taxDed > 0 ? `
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="file-warning" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">PPh 21 / Pajak</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Pajak Penghasilan</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 flex-shrink-0 ml-3">- Rp ${new Intl.NumberFormat('id-ID').format(taxDed)}</p>
        </div>` : ''}

        ${adjDed > 0 ? `
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="minus-circle" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Penyesuaian (-)</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Koreksi Gaji Negatif</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 flex-shrink-0 ml-3">- Rp ${new Intl.NumberFormat('id-ID').format(adjDed)}</p>
        </div>` : ''}
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  renderEmptyState(user, employee) {
    const periodEl = document.getElementById('payroll-period');
    if (periodEl) periodEl.textContent = 'Periode Berjalan';

    const thpEl = document.getElementById('thp-amount');
    if (thpEl) thpEl.textContent = '0';

    const empNameEl = document.getElementById('emp-name-pos');
    if (empNameEl) empNameEl.textContent = `${user?.name || 'Karyawan'}`;

    const empIdEl = document.getElementById('emp-id-num');
    if (empIdEl) empIdEl.textContent = `${employee?.employee_id || 'EMP'} • ${employee?.position || 'Staf'}`;

    const statusBadge = document.getElementById('payroll-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'BELUM TERBIT';
      statusBadge.className = 'px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0';
    }

    const earningsContainer = document.getElementById('earnings-container');
    if (earningsContainer) {
      earningsContainer.innerHTML = '<div class="p-6 text-center text-slate-400 text-xs font-medium">Belum ada slip gaji yang diterbitkan untuk periode ini.</div>';
    }

    const deductionsContainer = document.getElementById('deductions-container');
    if (deductionsContainer) {
      deductionsContainer.innerHTML = '<div class="p-6 text-center text-slate-400 text-xs font-medium">Belum ada data potongan gaji.</div>';
    }
  }

  setupEventListeners() {
    const downloadBtn = document.getElementById('btn-download-slip');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const slip = this._currentSlip;
        const payroll = this._currentPayroll;

        if (!slip || !slip.id) {
          showAlert('Informasi', 'Slip gaji belum tersedia untuk periode ini.');
          return;
        }

        const isPublished = slip.status === 'published' || payroll?.status === 'published';
        if (!isPublished) {
          showAlert('Menunggu Publikasi', 'Slip gaji Anda masih dalam proses verifikasi oleh HRD dan belum dipublikasikan.');
          return;
        }

                downloadBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span>Membuka Dokumen...</span>';
        if (window.lucide) window.lucide.createIcons();

        try {
          const baseUrl = ApiClient.getBaseUrl();
          const token = Storage.getToken() || localStorage.getItem('token') || '';
          const downloadUrl = `${baseUrl}/hris/payrolls/payslips/${slip.id}/download-pdf?token=${token}&autoprint=1`;

          if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            // Android Native Capacitor App: Direct streaming
            window.location.href = downloadUrl;
          } else {
            // Web Browser: Open in new tab for viewing & printing/saving as PDF
            const newWindow = window.open(downloadUrl, '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
              // Fallback if popup is blocked
              window.location.href = downloadUrl;
            }
          }
        } catch (err) {
          console.error('Download error:', err);
          showToast('Gagal mengunduh slip gaji', 'error');
        } finally {
          setTimeout(() => {
            downloadBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> <span>Unduh Slip Gaji (PDF)</span>';
            if (window.lucide) window.lucide.createIcons();
          }, 1500);
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PayrollController();
});

export { PayrollController };
