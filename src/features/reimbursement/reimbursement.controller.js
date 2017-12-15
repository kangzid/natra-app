/**
 * NATRA Mobile - Reimbursement Controller
 * Handles UI logic, image picker & preview, receipt stream modal, and API binding.
 */

import { ReimbursementService } from './reimbursement.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showAlert, setLoading } from '../../utils/ui-helpers.js';
import { ApiClient } from '../../core/api/api-client.js';

class ReimbursementController {
  constructor() {
    this.selectedReceiptFile = null;
    this.selectedReceiptBase64 = null;
    this.claimTypes = [];
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
    const dateInput = document.getElementById('claim-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  setupEventListeners() {
    const fileInput = document.getElementById('receipt-file-input');
    const uploadArea = document.getElementById('upload-trigger-area');
    const removeBtn = document.getElementById('btn-remove-receipt');
    const categorySelect = document.getElementById('claim-category');

    if (categorySelect) {
      categorySelect.addEventListener('change', () => this.handleCategoryChange());
    }

    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelected(e));
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearSelectedFile();
      });
    }

    const submitBtn = document.getElementById('btn-submit-reimbursement');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.handleSubmit(e, submitBtn));
    }

    // Modal Close
    const closeBtn = document.getElementById('btn-close-modal');
    const modal = document.getElementById('receipt-modal');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }
  }

  handleCategoryChange() {
    const select = document.getElementById('claim-category');
    const plafonEl = document.getElementById('type-plafon-info');
    const receiptLabel = document.getElementById('receipt-label');

    if (!select || !this.claimTypes || this.claimTypes.length === 0) return;

    const selectedType = this.claimTypes.find(t => t.id == select.value);
    if (!selectedType) return;

    // Plafon text
    const maxPerClaim = parseFloat(selectedType.max_amount_per_claim || 0);
    const maxPerMonth = parseFloat(selectedType.max_amount_per_month || 0);

    let plafonText = 'Unlimited';
    if (maxPerClaim > 0 && maxPerMonth > 0) {
      plafonText = `Maks Rp ${new Intl.NumberFormat('id-ID').format(maxPerClaim)}/klaim (Rp ${new Intl.NumberFormat('id-ID').format(maxPerMonth)}/bln)`;
    } else if (maxPerClaim > 0) {
      plafonText = `Maks Rp ${new Intl.NumberFormat('id-ID').format(maxPerClaim)}/klaim`;
    } else if (maxPerMonth > 0) {
      plafonText = `Maks Rp ${new Intl.NumberFormat('id-ID').format(maxPerMonth)}/bln`;
    }

    if (plafonEl) plafonEl.textContent = `Plafon: ${plafonText}`;

    // Requires receipt indicator
    if (receiptLabel) {
      if (selectedType.requires_receipt) {
        receiptLabel.innerHTML = 'Bukti Struk / Nota <span class="text-red-500 font-black">* (Wajib)</span>';
      } else {
        receiptLabel.innerHTML = 'Bukti Struk / Nota <span class="text-slate-400 font-medium">(Opsional)</span>';
      }
    }
  }

  handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert('File Terlalu Besar', 'Maksimal ukuran foto nota adalah 10 MB.');
      e.target.value = '';
      return;
    }

    this.selectedReceiptFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.selectedReceiptBase64 = event.target.result;

      const previewContainer = document.getElementById('receipt-preview-container');
      const uploadArea = document.getElementById('upload-trigger-area');
      const previewImg = document.getElementById('receipt-preview-img');
      const fileNameEl = document.getElementById('receipt-file-name');
      const fileSizeEl = document.getElementById('receipt-file-size');

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
    this.selectedReceiptFile = null;
    this.selectedReceiptBase64 = null;

    const fileInput = document.getElementById('receipt-file-input');
    if (fileInput) fileInput.value = '';

    const previewContainer = document.getElementById('receipt-preview-container');
    const uploadArea = document.getElementById('upload-trigger-area');

    if (previewContainer) {
      previewContainer.classList.add('hidden');
      previewContainer.classList.remove('flex');
    }
    if (uploadArea) uploadArea.classList.remove('hidden');
  }

  async loadData() {
    try {
      const user = Auth.getUser();
      const employeeId = user?.employee?.id;

      const [claimsRes, typesRes, summaryRes] = await Promise.allSettled([
        ReimbursementService.getClaims(),
        ReimbursementService.getClaimTypes(),
        ReimbursementService.getSummary()
      ]);

      if (typesRes.status === 'fulfilled' && typesRes.value) {
        const types = Array.isArray(typesRes.value) ? typesRes.value : (typesRes.value.data || []);
        this.claimTypes = types;
        this.renderTypes(types);
      }

      let items = [];
      if (claimsRes.status === 'fulfilled' && claimsRes.value) {
        items = Array.isArray(claimsRes.value) ? claimsRes.value : (claimsRes.value.data || []);
      }

      // Filter for this employee
      if (employeeId && items.length > 0) {
        const empItems = items.filter(i => i.employee_id === employeeId);
        if (empItems.length > 0) items = empItems;
      }

      this.renderHistory(items);
      this.renderSummary(items, summaryRes.status === 'fulfilled' ? summaryRes.value : null);
    } catch (e) {
      console.warn('[ReimbursementController] Error loading claims data:', e.message);
    }
  }

  renderTypes(types) {
    const select = document.getElementById('claim-category');
    if (!select || !Array.isArray(types) || types.length === 0) return;

    select.innerHTML = types.map(t => `<option value="${t.id}">${t.name} (${t.code})</option>`).join('');
    this.handleCategoryChange();
  }

  renderSummary(items, summaryApi) {
    const paidEl = document.getElementById('summary-paid-amount');
    const paidCountEl = document.getElementById('summary-paid-count');
    const pendingEl = document.getElementById('summary-pending-amount');
    const pendingCountEl = document.getElementById('summary-pending-count');

    let totalPaid = 0;
    let paidCount = 0;
    let totalPending = 0;
    let pendingCount = 0;

    if (Array.isArray(items) && items.length > 0) {
      const paidItems = items.filter(i => i.status === 'paid' || i.status === 'approved');
      const pendingItems = items.filter(i => i.status === 'pending');

      totalPaid = paidItems.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
      paidCount = paidItems.length;

      totalPending = pendingItems.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
      pendingCount = pendingItems.length;
    } else if (summaryApi) {
      const data = summaryApi.data || summaryApi;
      totalPaid = (data.total_approved_amount || data.total_paid_amount || data.total_approved || 0);
      paidCount = (data.approved_count || 0) + (data.paid_count || 0);
      totalPending = (data.total_pending_amount || data.total_pending || 0);
      pendingCount = data.pending_count || 0;
    }

    if (paidEl) paidEl.textContent = 'Rp ' + new Intl.NumberFormat('id-ID').format(totalPaid);
    if (paidCountEl) paidCountEl.textContent = `${paidCount} Disetujui / Selesai`;
    if (pendingEl) pendingEl.textContent = 'Rp ' + new Intl.NumberFormat('id-ID').format(totalPending);
    if (pendingCountEl) pendingCountEl.textContent = `${pendingCount} Menunggu`;
  }

  renderHistory(items) {
    const container = document.getElementById('claims-history-container');
    if (!container) return;

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `
        <div class="p-8 bg-white dark:bg-slate-800 rounded-3xl text-center text-slate-400 text-xs font-medium border border-slate-100 dark:border-slate-700 shadow-sm">
          Belum ada riwayat pengajuan klaim.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const isPaid = item.status === 'paid';
      const isApproved = item.status === 'approved';
      const isRejected = item.status === 'rejected';

      const statusBadge = isPaid
        ? '<span class="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">PAID (CASH)</span>'
        : isApproved
        ? '<span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">DISETUJUI</span>'
        : isRejected
        ? '<span class="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">DITOLAK</span>'
        : '<span class="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">MENUNGGU</span>';

      const amountFormatted = 'Rp ' + new Intl.NumberFormat('id-ID').format(item.amount || 0);
      const dateObj = new Date(item.claim_date || item.created_at || Date.now());
      const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const categoryName = item.claim_type?.name || 'Reimbursement';

      const hasReceipt = !!(item.receipt_path || item.receipt_name);

      return `
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/80 shadow-sm space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md font-mono">${item.code || 'CLM'}</span>
                <span class="text-[10px] font-bold text-slate-400">• ${dateStr}</span>
              </div>
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">${item.title || item.description || categoryName}</p>
              <p class="text-[11px] text-slate-400 font-medium mt-0.5">${categoryName}</p>
            </div>
            <div class="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
              <p class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">${amountFormatted}</p>
              <div>${statusBadge}</div>
            </div>
          </div>

          ${hasReceipt ? `
            <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <span class="text-[11px] text-slate-400 font-medium truncate max-w-[200px] flex items-center gap-1.5">
                <i data-lucide="paperclip" class="w-3.5 h-3.5 text-primary-500"></i>
                <span class="truncate">${item.receipt_name || 'Bukti Nota'}</span>
              </span>
              <button type="button" onclick="window.previewClaimReceipt(${item.id}, '${item.title || 'Klaim'}')" class="px-3 py-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-colors">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>Lihat Struk</span>
              </button>
            </div>
          ` : `
            <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 text-[10px] text-slate-400 font-medium">
              - Tanpa Lampiran Nota -
            </div>
          `}
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async handleSubmit(e, btn) {
    e.preventDefault();
    const user = Auth.getUser();
    const employeeId = user?.employee?.id;

    const select = document.getElementById('claim-category');
    const dateInput = document.getElementById('claim-date');
    const titleInput = document.getElementById('claim-title');
    const amountInput = document.getElementById('claim-amount');

    const amount = amountInput?.value;
    const date = dateInput?.value || new Date().toISOString().split('T')[0];
    const category = select?.value;
    const title = titleInput?.value.trim() || select?.options[select.selectedIndex]?.text || 'Klaim Biaya Operasional';

    if (!category) {
      showAlert('Pilih Jenis Klaim', 'Silakan pilih jenis reimbursement terlebih dahulu.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showAlert('Nominal Tidak Valid', 'Silakan masukkan nominal pengajuan klaim.');
      return;
    }

    // Check Plafon and Requires Receipt
    const selectedType = this.claimTypes.find(t => t.id == category);
    if (selectedType) {
      if (selectedType.requires_receipt && !this.selectedReceiptBase64) {
        showAlert('Wajib Lampirkan Nota', `Jenis klaim "${selectedType.name}" mewajibkan lampiran foto bukti nota atau struk pembayaran.`);
        return;
      }

      const maxPerClaim = parseFloat(selectedType.max_amount_per_claim || 0);
      if (maxPerClaim > 0 && parseFloat(amount) > maxPerClaim) {
        showAlert('Melebihi Batas Plafon', `Nominal klaim melebihi batas maksimum per transaksi untuk "${selectedType.name}" (Maks Rp ${new Intl.NumberFormat('id-ID').format(maxPerClaim)}).`);
        return;
      }
    }

    setLoading(btn, true, 'Mengirim...');

    try {
      const payload = {
        employee_id: employeeId || 7,
        claim_type_id: parseInt(category),
        title: title,
        amount: parseFloat(amount),
        claim_date: date,
        description: title,
      };

      if (this.selectedReceiptBase64) {
        payload.receipt_base64 = this.selectedReceiptBase64;
        payload.receipt_name = this.selectedReceiptFile?.name || 'nota.jpg';
      }

      await ReimbursementService.submitClaim(payload);

      showToast('Klaim dan bukti nota berhasil dikirim ke Finance!', 'success');
      if (titleInput) titleInput.value = '';
      if (amountInput) amountInput.value = '';
      this.clearSelectedFile();

      await this.loadData();
    } catch (err) {
      console.warn('[ReimbursementController] Error submitting claim:', err);
      const msg = err.message || 'Gagal mengirim pengajuan klaim.';
      showAlert('Gagal Kirim Klaim', msg);
    } finally {
      setLoading(btn, false, 'Kirim Pengajuan Klaim');
    }
  }
}

// Global helper for receipt preview
window.previewClaimReceipt = async (claimId, title) => {
  const modal = document.getElementById('receipt-modal');
  const img = document.getElementById('modal-receipt-img');
  const titleEl = document.getElementById('modal-receipt-title');

  if (!modal || !img) return;

  const baseUrl = ApiClient.getBaseUrl();
  const token = Auth.getToken();

  titleEl.textContent = title || 'Bukti Struk Pembayaran';
  img.src = `${baseUrl}/hris/claims/${claimId}/preview-receipt?token=${token}`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

document.addEventListener('DOMContentLoaded', () => {
  new ReimbursementController();
});

export { ReimbursementController };
