/**
 * NATRA Mobile - Overtime Controller
 * Handles UI logic, real-time duration preview, 1-overtime-per-day validation, and API binding.
 */

import { OvertimeService } from './overtime.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showAlert, setLoading } from '../../utils/ui-helpers.js';

class OvertimeController {
  constructor() {
    this.init();
  }

  async init() {
    Auth.requireAuth();
    if (window.lucide) window.lucide.createIcons();

    this.initFormDefaults();
    this.setupEventListeners();
    await this.loadData();
  }

  initFormDefaults() {
    const dateInput = document.getElementById('overtime-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  setupEventListeners() {
    const startInput = document.getElementById('overtime-start');
    const endInput = document.getElementById('overtime-end');

    if (startInput && endInput) {
      startInput.addEventListener('change', () => this.calculateDurationPreview());
      endInput.addEventListener('change', () => this.calculateDurationPreview());
    }

    const applyBtn = document.getElementById('btn-request-overtime');
    if (applyBtn) {
      applyBtn.addEventListener('click', (e) => this.handleSubmit(e, applyBtn));
    }
  }

  calculateDurationPreview() {
    const startVal = document.getElementById('overtime-start')?.value;
    const endVal = document.getElementById('overtime-end')?.value;
    const previewEl = document.getElementById('duration-preview-text');

    if (!startVal || !endVal || !previewEl) return;

    const [startH, startM] = startVal.split(':').map(Number);
    const [endH, endM] = endVal.split(':').map(Number);

    let startMins = startH * 60 + startM;
    let endMins = endH * 60 + endM;

    if (endMins < startMins) {
      // Over midnight
      endMins += 24 * 60;
    }

    const diffMins = endMins - startMins;
    const diffHours = (diffMins / 60).toFixed(1);

    previewEl.textContent = `${diffHours.endsWith('.0') ? parseInt(diffHours) : diffHours} Jam (${diffMins} Menit)`;
  }

  async loadData() {
    try {
      const user = Auth.getUser();
      const employeeId = user?.employee?.id;

      const [historyRes, summaryRes] = await Promise.allSettled([
        OvertimeService.getOvertimes(),
        OvertimeService.getSummary()
      ]);

      let items = [];
      if (historyRes.status === 'fulfilled' && historyRes.value) {
        items = Array.isArray(historyRes.value) ? historyRes.value : (historyRes.value.data || []);
      }

      // Filter for this employee if records exist
      if (employeeId && items.length > 0) {
        const empItems = items.filter(i => i.employee_id === employeeId);
        if (empItems.length > 0) items = empItems;
      }

      this.renderHistory(items);
      this.renderSummary(items, summaryRes.status === 'fulfilled' ? summaryRes.value : null);
    } catch (e) {
      console.warn('[OvertimeController] Error loading overtime data:', e.message);
    }
  }

  renderSummary(items, summaryApi) {
    const hoursEl = document.getElementById('total-overtime-hours');
    const payEl = document.getElementById('total-overtime-pay');

    let totalHours = 0;
    let totalPay = 0;

    if (Array.isArray(items) && items.length > 0) {
      const approvedItems = items.filter(i => i.status === 'approved');
      totalHours = approvedItems.reduce((sum, i) => sum + parseFloat(i.duration_hours || i.hours || 0), 0);
      totalPay = approvedItems.reduce((sum, i) => sum + parseFloat(i.total_pay || i.amount || 0), 0);
    } else if (summaryApi) {
      totalHours = summaryApi.total_hours || 0;
      totalPay = summaryApi.total_estimated_payout || 0;
    }

    if (hoursEl) hoursEl.textContent = totalHours.toFixed(1).replace('.0', '');
    if (payEl) payEl.textContent = 'Rp ' + new Intl.NumberFormat('id-ID').format(totalPay);
  }

  renderHistory(items) {
    const container = document.getElementById('overtime-history-container');
    if (!container) return;

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `
        <div class="p-6 bg-white dark:bg-slate-800 rounded-2xl text-center text-slate-400 text-xs font-medium border border-slate-100 dark:border-slate-700">
          Belum ada riwayat pengajuan lembur.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const dateObj = new Date(item.date || item.created_at || Date.now());
      const day = dateObj.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = monthNames[dateObj.getMonth()] || 'Bln';
      const year = dateObj.getFullYear();

      const isApproved = item.status === 'approved';
      const isRejected = item.status === 'rejected';

      const statusBadge = isApproved
        ? '<span class="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md uppercase">DISETUJUI</span>'
        : isRejected
        ? '<span class="text-[9px] font-extrabold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md uppercase">DITOLAK</span>'
        : '<span class="text-[9px] font-extrabold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md uppercase">MENUNGGU</span>';

      const startStr = item.start_time ? item.start_time.slice(0, 5) : '-';
      const endStr = item.end_time ? item.end_time.slice(0, 5) : '-';
      const durationStr = item.duration_hours ? `${parseFloat(item.duration_hours)} Jam` : '-';
      const payStr = item.total_pay ? ` • Rp ${new Intl.NumberFormat('id-ID').format(item.total_pay)}` : '';

      return `
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-700/70 flex flex-col items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-600/50">
              <span class="text-xs font-black text-slate-800 dark:text-white leading-none">${day}</span>
              <span class="text-[8px] font-extrabold text-slate-400 uppercase mt-0.5">${month}</span>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">${item.reason || item.task_name || 'Lembur Operasional'}</p>
              <p class="text-[10px] text-slate-400 font-medium mt-0.5">${startStr} - ${endStr} (${durationStr})${payStr}</p>
            </div>
          </div>
          <div class="flex-shrink-0">
            ${statusBadge}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async handleSubmit(e, btn) {
    e.preventDefault();
    const user = Auth.getUser();
    const employeeId = user?.employee?.id;

    const dateInput = document.getElementById('overtime-date');
    const startInput = document.getElementById('overtime-start');
    const endInput = document.getElementById('overtime-end');
    const reasonInput = document.getElementById('overtime-reason');

    const date = dateInput?.value;
    const start_time = startInput?.value;
    const end_time = endInput?.value;
    const reason = reasonInput?.value.trim();

    if (!date || !start_time || !end_time || !reason) {
      showAlert('Lengkapi Formulir', 'Silakan pilih tanggal, jam mulai, jam selesai, dan isi alasan lembur.');
      return;
    }

    setLoading(btn, true, 'Mengajukan...');

    try {
      await OvertimeService.submitOvertime({
        employee_id: employeeId || 7,
        date: date,
        start_time: start_time,
        end_time: end_time,
        reason: reason
      });

      showToast('Pengajuan lembur berhasil dikirim!', 'success');
      if (reasonInput) reasonInput.value = '';
      if (startInput) startInput.value = '';
      if (endInput) endInput.value = '';

      const previewEl = document.getElementById('duration-preview-text');
      if (previewEl) previewEl.textContent = '0 Jam';

      await this.loadData();
    } catch (err) {
      console.warn('[OvertimeController] Error submitting overtime:', err);
      const msg = err.message || 'Gagal mengajukan lembur.';
      showAlert('Pengajuan Gagal', msg);
    } finally {
      setLoading(btn, false, 'Ajukan Lembur');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OvertimeController();
});

export { OvertimeController };
