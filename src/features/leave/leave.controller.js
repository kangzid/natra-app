/**
 * NATRA Mobile - Leave & Request Controller
 * Handles UI logic, category selection, live duration calculator, attachment picker, and API binding.
 */

import { LeaveService } from './leave.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showAlert, setLoading } from '../../utils/ui-helpers.js';
import { ApiClient } from '../../core/api/api-client.js';

class LeaveController {
  constructor() {
    this.selectedType = 'cuti';
    this.leaveTypes = [];
    this.allRequests = [];
    this.activeFilter = 'all';
    this.selectedAttachmentFile = null;
    this.selectedAttachmentBase64 = null;
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
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('req-start-date');
    const endDateInput = document.getElementById('req-end-date');

    if (startDateInput && !startDateInput.value) startDateInput.value = today;
    if (endDateInput && !endDateInput.value) endDateInput.value = today;

    this.updateDurationCalculation();
  }

  setupEventListeners() {
    // 1. Category Selector Buttons
    const typeButtons = document.querySelectorAll('.req-type-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        this.selectRequestCategory(type);
      });
    });

    // 2. Leave Type Dropdown change
    const leaveTypeSelect = document.getElementById('leave-type-select');
    if (leaveTypeSelect) {
      leaveTypeSelect.addEventListener('change', () => {
        const selected = this.leaveTypes.find(t => t.id == leaveTypeSelect.value);
        const infoEl = document.getElementById('leave-type-info');
        if (infoEl && selected) {
          infoEl.textContent = `Default: ${selected.default_days} Hari (${selected.is_paid ? 'Dibayar' : 'Unpaid'})`;
        }
      });
    }

    // 3. Date Inputs for live duration calculation
    const startDateInput = document.getElementById('req-start-date');
    const endDateInput = document.getElementById('req-end-date');

    if (startDateInput) {
      startDateInput.addEventListener('change', () => {
        if (endDateInput && (!endDateInput.value || endDateInput.value < startDateInput.value)) {
          endDateInput.value = startDateInput.value;
        }
        this.updateDurationCalculation();
      });
    }

    if (endDateInput) {
      endDateInput.addEventListener('change', () => {
        if (startDateInput && startDateInput.value && endDateInput.value < startDateInput.value) {
          startDateInput.value = endDateInput.value;
        }
        this.updateDurationCalculation();
      });
    }

    // 4. File Attachment Handler
    const fileInput = document.getElementById('attachment-file-input');
    const uploadTrigger = document.getElementById('attachment-upload-trigger');
    const removeFileBtn = document.getElementById('btn-remove-attachment');

    if (uploadTrigger && fileInput) {
      uploadTrigger.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelected(e));
    }

    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearSelectedFile();
      });
    }

    // 5. Submit Button
    const submitBtn = document.getElementById('btn-submit-request');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.handleSubmit(e, submitBtn));
    }

    // 6. History Filter Pills
    const filterButtons = document.querySelectorAll('.history-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        this.setHistoryFilter(filter, btn);
      });
    });

    // 7. Modal Close Handler
    const closeBtn = document.getElementById('btn-close-attachment-modal');
    const modal = document.getElementById('attachment-modal');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }
  }

  selectRequestCategory(type) {
    this.selectedType = type;
    const typeButtons = document.querySelectorAll('.req-type-btn');
    const leaveTypeWrapper = document.getElementById('leave-type-wrapper');
    const attachmentLabel = document.getElementById('attachment-label');

    typeButtons.forEach(btn => {
      const btnType = btn.getAttribute('data-type');
      if (btnType === type) {
        btn.className = 'req-type-btn py-2.5 px-3 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1.5 border transition-all bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-950/40 dark:border-primary-500 dark:text-primary-400 shadow-sm';
      } else {
        btn.className = 'req-type-btn py-2.5 px-3 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50';
      }
    });

    if (type === 'cuti') {
      if (leaveTypeWrapper) leaveTypeWrapper.classList.remove('hidden');
      if (attachmentLabel) attachmentLabel.innerHTML = 'Lampiran / Dokumen <span class="text-slate-400 font-medium">(Opsional)</span>';
    } else if (type === 'izin_sakit') {
      if (leaveTypeWrapper) leaveTypeWrapper.classList.add('hidden');
      if (attachmentLabel) attachmentLabel.innerHTML = 'Surat Keterangan Dokter <span class="text-rose-500 font-black">* (Wajib/Disarankan)</span>';
    } else { // izin_absen
      if (leaveTypeWrapper) leaveTypeWrapper.classList.add('hidden');
      if (attachmentLabel) attachmentLabel.innerHTML = 'Bukti Izin / Surat <span class="text-slate-400 font-medium">(Opsional)</span>';
    }

    if (window.lucide) window.lucide.createIcons();
  }

  updateDurationCalculation() {
    const startDateInput = document.getElementById('req-start-date');
    const endDateInput = document.getElementById('req-end-date');
    const badge = document.getElementById('calculated-duration-badge');

    if (!startDateInput || !endDateInput || !badge) return;

    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      badge.textContent = '1 Hari';
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    badge.textContent = `${diffDays} Hari Kerja`;
  }

  handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert('File Terlalu Besar', 'Maksimal ukuran file lampiran adalah 10 MB.');
      e.target.value = '';
      return;
    }

    this.selectedAttachmentFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.selectedAttachmentBase64 = event.target.result;

      const previewContainer = document.getElementById('attachment-preview-container');
      const uploadArea = document.getElementById('attachment-upload-trigger');
      const previewImg = document.getElementById('attachment-preview-img');
      const fileNameEl = document.getElementById('attachment-file-name');
      const fileSizeEl = document.getElementById('attachment-file-size');

      if (previewImg) previewImg.src = event.target.result;
      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileSizeEl) fileSizeEl.textContent = `${(file.size / 1024).toFixed(0)} KB`;

      if (uploadArea) uploadArea.classList.add('hidden');
      if (previewContainer) {
        previewContainer.classList.remove('hidden');
        previewContainer.classList.add('flex');
      }

      if (window.lucide) window.lucide.createIcons();
    };

    reader.readAsDataURL(file);
  }

  clearSelectedFile() {
    this.selectedAttachmentFile = null;
    this.selectedAttachmentBase64 = null;

    const fileInput = document.getElementById('attachment-file-input');
    if (fileInput) fileInput.value = '';

    const previewContainer = document.getElementById('attachment-preview-container');
    const uploadArea = document.getElementById('attachment-upload-trigger');

    if (previewContainer) {
      previewContainer.classList.add('hidden');
      previewContainer.classList.remove('flex');
    }
    if (uploadArea) uploadArea.classList.remove('hidden');
  }

  async loadData() {
    try {
      const [summaryRes, typesRes, requestsRes] = await Promise.allSettled([
        LeaveService.getSummary(),
        LeaveService.getLeaveTypes(),
        LeaveService.getRequests()
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        this.renderSummary(summaryRes.value.data || summaryRes.value);
      }

      if (typesRes.status === 'fulfilled' && typesRes.value) {
        const types = Array.isArray(typesRes.value) ? typesRes.value : (typesRes.value.data || []);
        this.leaveTypes = types;
        this.renderLeaveTypes(types);
      }

      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        const items = Array.isArray(requestsRes.value) ? requestsRes.value : (requestsRes.value.data || []);
        this.allRequests = items;
        this.renderHistory();
      }
    } catch (e) {
      console.warn('[LeaveController] Error loading leave data:', e.message);
    }
  }

  renderSummary(summary) {
    const remainingEl = document.getElementById('stat-remaining-leave');
    const usedEl = document.getElementById('stat-used-leave');
    const pendingEl = document.getElementById('stat-pending-leave');

    if (remainingEl) remainingEl.textContent = summary.remaining_leave ?? 12;
    if (usedEl) usedEl.textContent = summary.used_leave ?? 0;
    if (pendingEl) pendingEl.textContent = summary.pending_count ?? 0;
  }

  renderLeaveTypes(types) {
    const select = document.getElementById('leave-type-select');
    if (!select || !Array.isArray(types) || types.length === 0) return;

    select.innerHTML = types.map(t => `<option value="${t.id}">${t.name} (${t.default_days} Hari)</option>`).join('');

    const firstType = types[0];
    const infoEl = document.getElementById('leave-type-info');
    if (infoEl && firstType) {
      infoEl.textContent = `Default: ${firstType.default_days} Hari (${firstType.is_paid ? 'Dibayar' : 'Unpaid'})`;
    }
  }

  setHistoryFilter(filter, activeBtn) {
    this.activeFilter = filter;

    const filterButtons = document.querySelectorAll('.history-filter-btn');
    filterButtons.forEach(btn => {
      btn.className = 'history-filter-btn px-3.5 py-1.5 rounded-full text-[11px] font-extrabold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap';
    });

    if (activeBtn) {
      activeBtn.className = 'history-filter-btn px-3.5 py-1.5 rounded-full text-[11px] font-extrabold bg-slate-800 text-white dark:bg-white dark:text-slate-900 whitespace-nowrap shadow-sm';
    }

    this.renderHistory();
  }

  renderHistory() {
    const container = document.getElementById('leave-history-container');
    if (!container) return;

    let items = this.allRequests;
    if (this.activeFilter !== 'all') {
      const targetType = this.activeFilter === 'cuti' ? 'izin_cuti' : this.activeFilter;
      items = items.filter(i => i.request_type === targetType || (this.activeFilter === 'cuti' && i.request_type === 'cuti'));
    }

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `
        <div class="p-8 bg-white dark:bg-slate-800 rounded-3xl text-center text-slate-400 text-xs font-medium border border-slate-100 dark:border-slate-700 shadow-sm">
          Belum ada riwayat pengajuan ${this.activeFilter !== 'all' ? this.activeFilter.replace('_', ' ') : ''}.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const isApproved = item.status === 'approved';
      const isRejected = item.status === 'rejected';

      const statusBadge = isApproved
        ? '<span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">DISETUJUI</span>'
        : isRejected
        ? '<span class="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">DITOLAK</span>'
        : '<span class="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">MENUNGGU</span>';

      // Type Badge & Title
      let typeLabel = 'Pengajuan Cuti';
      let iconColor = 'text-primary-600 bg-primary-50 dark:bg-primary-900/30';
      let iconName = 'sun';

      if (item.request_type === 'izin_sakit') {
        typeLabel = 'Izin Sakit';
        iconColor = 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
        iconName = 'heart-pulse';
      } else if (item.request_type === 'izin_absen') {
        typeLabel = 'Izin Absen';
        iconColor = 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
        iconName = 'calendar-x';
      } else if (item.leave_type?.name) {
        typeLabel = item.leave_type.name;
      }

      const startDate = new Date(item.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const endDate = item.end_date ? new Date(item.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : startDate;
      const dateRangeStr = item.start_date === item.end_date ? startDate : `${startDate} s/d ${endDate}`;
      const daysCount = item.days_count || 1;

      const hasAttachment = !!(item.attachment_path || item.attachment_name);

      return `
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/80 shadow-sm space-y-4">
          <!-- Top Row: Icon, Code, Title & Status -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm">
                <i data-lucide="${iconName}" class="w-5 h-5"></i>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md font-mono">${item.code || 'REQ'}</span>
                  <span class="text-[10px] font-bold text-slate-400">• ${daysCount} Hari</span>
                </div>
                <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">${typeLabel}</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic font-medium leading-relaxed">"${item.reason || '-'}"</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
              ${statusBadge}
              <p class="text-[10px] font-bold text-slate-400 mt-0.5">${dateRangeStr}</p>
            </div>
          </div>

          <!-- Bottom Row: Attachment preview trigger if available -->
          ${hasAttachment ? `
            <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <span class="text-[11px] text-slate-400 font-medium truncate max-w-[200px] flex items-center gap-1.5">
                <i data-lucide="paperclip" class="w-3.5 h-3.5 text-primary-500"></i>
                <span class="truncate">${item.attachment_name || 'Surat Keterangan'}</span>
              </span>
              <button type="button" onclick="window.previewRequestAttachment(${item.id}, '${item.attachment_name || typeLabel}')" class="px-3 py-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-colors">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>Lihat Surat</span>
              </button>
            </div>
          ` : ''}

          <!-- Bottom Row: Approver note if any -->
          ${item.approver_note ? `
            <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-2.5 rounded-xl">
              <span class="font-bold text-slate-700 dark:text-slate-300">Catatan HRD:</span> ${item.approver_note}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async handleSubmit(e, btn) {
    e.preventDefault();
    const user = Auth.getUser();
    const employeeId = user?.employee?.id || 7;

    const startDateInput = document.getElementById('req-start-date');
    const endDateInput = document.getElementById('req-end-date');
    const reasonInput = document.getElementById('req-reason');
    const leaveTypeSelect = document.getElementById('leave-type-select');

    const startDate = startDateInput?.value;
    const endDate = endDateInput?.value || startDate;
    const reason = reasonInput?.value?.trim();

    if (!startDate) {
      showAlert('Tanggal Mulai Wajib', 'Silakan pilih tanggal mulai pengajuan cuti atau izin.');
      return;
    }

    if (!reason) {
      showAlert('Alasan Wajib Diisi', 'Silakan masukkan alasan atau keperluan pengajuan.');
      return;
    }

    // Calculate days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

    setLoading(btn, true, 'Mengirim Pengajuan...');

    try {
      const payload = {
        employee_id: employeeId,
        request_type: this.selectedType,
        start_date: startDate,
        end_date: endDate,
        days_count: diffDays,
        reason: reason,
      };

      if (this.selectedType === 'cuti' && leaveTypeSelect?.value) {
        payload.leave_type_id = parseInt(leaveTypeSelect.value);
      }

      if (this.selectedAttachmentBase64) {
        payload.attachment_base64 = this.selectedAttachmentBase64;
        payload.attachment_name = this.selectedAttachmentFile?.name || 'lampiran.jpg';
      }

      await LeaveService.submitRequest(payload);

      showToast('Permohonan cuti / izin berhasil dikirim ke HRD!', 'success');
      if (reasonInput) reasonInput.value = '';
      this.clearSelectedFile();

      await this.loadData();
    } catch (err) {
      console.warn('[LeaveController] Error submitting request:', err);
      showAlert('Gagal Kirim Pengajuan', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(btn, false, 'Kirim Pengajuan Cuti / Izin');
    }
  }
}

// Global helper for secure attachment preview
window.previewRequestAttachment = (requestId, title) => {
  const modal = document.getElementById('attachment-modal');
  const img = document.getElementById('modal-attachment-img');
  const titleEl = document.getElementById('modal-attachment-title');

  if (!modal || !img) return;

  const baseUrl = ApiClient.getBaseUrl();
  const token = Auth.getToken();

  titleEl.textContent = title || 'Lampiran Surat Keterangan';
  img.src = `${baseUrl}/hris/requests/${requestId}/preview-attachment?token=${token}`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

document.addEventListener('DOMContentLoaded', () => {
  new LeaveController();
});

export { LeaveController };
