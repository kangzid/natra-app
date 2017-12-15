/**
 * NATRA Mobile - Assets Controller
 * Handles UI logic, category filtering, detail modal, and damage reporting for company assets.
 */

import { AssetsService } from './assets.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showAlert, setLoading } from '../../utils/ui-helpers.js';

class AssetsController {
  constructor() {
    this.allAssets = [];
    this.filteredAssets = [];
    this.activeCategory = 'all';
    this.selectedAssetForReport = null;
    this.init();
  }

  async init() {
    Auth.requireAuth();
    if (window.lucide) window.lucide.createIcons();

    this.renderUserInfo();
    this.setupEventListeners();
    await this.loadData();
  }

  renderUserInfo() {
    const user = Auth.getUser();
    const employee = user?.employee || {};

    const nameEl = document.getElementById('hero-emp-name');
    const posEl = document.getElementById('hero-emp-pos');

    if (nameEl) nameEl.textContent = user?.name || employee?.user?.name || 'Karyawan';
    if (posEl) posEl.textContent = `${employee.employee_id || 'EMP'} • ${employee.position || 'Staf Operasional'}`;
  }

  setupEventListeners() {
    // 1. Category Filter Buttons
    const catButtons = document.querySelectorAll('.asset-cat-btn');
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        this.filterCategory(cat, btn);
      });
    });

    // 2. Report Damage Modals Open & Close
    const openReportBtn = document.getElementById('btn-open-report-modal');
    const closeReportBtn = document.getElementById('btn-close-report-modal');
    const reportModal = document.getElementById('asset-report-modal');

    if (openReportBtn) {
      openReportBtn.addEventListener('click', () => this.openReportModal());
    }

    if (closeReportBtn && reportModal) {
      closeReportBtn.addEventListener('click', () => reportModal.classList.add('hidden'));
      reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) reportModal.classList.add('hidden');
      });
    }

    // 3. Detail Modal Close
    const closeDetailBtn = document.getElementById('btn-close-detail-modal');
    const detailModal = document.getElementById('asset-detail-modal');

    if (closeDetailBtn && detailModal) {
      closeDetailBtn.addEventListener('click', () => detailModal.classList.add('hidden'));
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) detailModal.classList.add('hidden');
      });
    }

    // 4. Shortcut from Detail to Report
    const detailReportBtn = document.getElementById('btn-detail-report-shortcut');
    if (detailReportBtn) {
      detailReportBtn.addEventListener('click', () => {
        if (detailModal) detailModal.classList.add('hidden');
        this.openReportModal(this.currentDetailAsset?.id);
      });
    }

    // 5. Submit Report Form
    const reportForm = document.getElementById('form-report-damage');
    if (reportForm) {
      reportForm.addEventListener('submit', (e) => this.handleReportSubmit(e));
    }
  }

  async loadData() {
    try {
      const user = Auth.getUser();
      const employeeId = user?.employee?.id;

      const [assetsRes, summaryRes] = await Promise.allSettled([
        AssetsService.getAssets({ employee_id: employeeId || 7 }),
        AssetsService.getSummary(employeeId || 7)
      ]);

      if (assetsRes.status === 'fulfilled') {
        const data = assetsRes.value;
        this.allAssets = Array.isArray(data) ? data : (data?.data || []);
        this.filterCategory(this.activeCategory);
      }

      if (summaryRes.status === 'fulfilled') {
        this.renderSummary(summaryRes.value.data || summaryRes.value);
      } else {
        this.renderSummaryFallback();
      }

      this.populateReportDropdown();
    } catch (e) {
      console.warn('[AssetsController] Error loading assets data:', e.message);
    }
  }

  renderSummary(summary) {
    const countPill = document.getElementById('asset-count-pill');
    const totalEl = document.getElementById('stat-total-assets');
    const goodEl = document.getElementById('stat-good-assets');
    const checkEl = document.getElementById('stat-check-assets');

    const total = summary.total_assets ?? this.allAssets.length;
    const good = summary.good_condition_count ?? this.allAssets.filter(a => (a.condition || '').toLowerCase().includes('baik')).length;
    const check = total - good;

    if (countPill) countPill.textContent = `${total} Perangkat`;
    if (totalEl) totalEl.textContent = total;
    if (goodEl) goodEl.textContent = good;
    if (checkEl) checkEl.textContent = check > 0 ? check : 0;
  }

  renderSummaryFallback() {
    const total = this.allAssets.length;
    const good = this.allAssets.filter(a => (a.condition || '').toLowerCase().includes('baik')).length;
    const check = total - good;

    const countPill = document.getElementById('asset-count-pill');
    const totalEl = document.getElementById('stat-total-assets');
    const goodEl = document.getElementById('stat-good-assets');
    const checkEl = document.getElementById('stat-check-assets');

    if (countPill) countPill.textContent = `${total} Perangkat`;
    if (totalEl) totalEl.textContent = total;
    if (goodEl) goodEl.textContent = good;
    if (checkEl) checkEl.textContent = check > 0 ? check : 0;
  }

  filterCategory(cat, activeBtn = null) {
    this.activeCategory = cat;

    // Update buttons
    const catButtons = document.querySelectorAll('.asset-cat-btn');
    catButtons.forEach(btn => {
      btn.className = 'asset-cat-btn px-4 py-2 rounded-full text-xs font-extrabold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap';
    });

    if (activeBtn) {
      activeBtn.className = 'asset-cat-btn px-4 py-2 rounded-full text-xs font-extrabold bg-slate-800 text-white dark:bg-white dark:text-slate-900 whitespace-nowrap shadow-sm';
    } else {
      const defaultBtn = document.querySelector(`.asset-cat-btn[data-category="${cat}"]`);
      if (defaultBtn) {
        defaultBtn.className = 'asset-cat-btn px-4 py-2 rounded-full text-xs font-extrabold bg-slate-800 text-white dark:bg-white dark:text-slate-900 whitespace-nowrap shadow-sm';
      }
    }

    if (cat === 'all') {
      this.filteredAssets = this.allAssets;
    } else if (cat === 'laptop') {
      this.filteredAssets = this.allAssets.filter(a => {
        const text = `${a.name} ${a.category}`.toLowerCase();
        return text.includes('laptop') || text.includes('macbook') || text.includes('komputer') || text.includes('pc') || text.includes('it');
      });
    } else if (cat === 'smartphone') {
      this.filteredAssets = this.allAssets.filter(a => {
        const text = `${a.name} ${a.category}`.toLowerCase();
        return text.includes('phone') || text.includes('hp') || text.includes('samsung') || text.includes('gadget') || text.includes('smartphone');
      });
    } else if (cat === 'vehicle') {
      this.filteredAssets = this.allAssets.filter(a => {
        const text = `${a.name} ${a.category}`.toLowerCase();
        return text.includes('motor') || text.includes('mobil') || text.includes('vario') || text.includes('kendaraan') || text.includes('truk') || text.includes('vehicle');
      });
    } else if (cat === 'apd') {
      this.filteredAssets = this.allAssets.filter(a => {
        const text = `${a.name} ${a.category}`.toLowerCase();
        return text.includes('apd') || text.includes('rompi') || text.includes('helm') || text.includes('tools') || text.includes('keselamatan') || text.includes('bengkel');
      });
    }

    this.renderAssetsList();
  }

  getAssetStyle(item) {
    const text = `${item.name} ${item.category}`.toLowerCase();
    if (text.includes('laptop') || text.includes('macbook') || text.includes('komputer')) {
      return { icon: 'laptop', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' };
    }
    if (text.includes('phone') || text.includes('smartphone') || text.includes('hp') || text.includes('samsung')) {
      return { icon: 'smartphone', color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' };
    }
    if (text.includes('motor') || text.includes('mobil') || text.includes('vario') || text.includes('kendaraan')) {
      return { icon: 'car', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' };
    }
    if (text.includes('apd') || text.includes('rompi') || text.includes('helm') || text.includes('keselamatan')) {
      return { icon: 'shield-check', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' };
    }
    return { icon: 'package', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' };
  }

  renderAssetsList() {
    const container = document.getElementById('assets-container');
    if (!container) return;

    if (!Array.isArray(this.filteredAssets) || this.filteredAssets.length === 0) {
      container.innerHTML = `
        <div class="p-8 bg-white dark:bg-slate-800 rounded-3xl text-center text-slate-400 text-xs font-medium border border-slate-100 dark:border-slate-700 shadow-sm">
          Tidak ada aset inventaris dalam kategori ini.
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredAssets.map(item => {
      const style = this.getAssetStyle(item);
      const isGood = (item.condition || '').toLowerCase().includes('baik');
      const conditionBadge = isGood
        ? '<span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">KONDISI BAIK</span>'
        : '<span class="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">PERLU PENGECEKAN</span>';

      const handoverDate = item.handover_date
        ? new Date(item.handover_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '-';

      return `
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/80 shadow-sm space-y-4">
          <!-- Top Row: Icon, Code, Title & Condition Badge -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl ${style.color} flex items-center justify-center flex-shrink-0 shadow-sm">
                <i data-lucide="${style.icon}" class="w-5 h-5"></i>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md font-mono">${item.asset_code || 'AST'}</span>
                  <span class="text-[10px] font-bold text-slate-400 truncate">• SN: ${item.serial_number || '-'}</span>
                </div>
                <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">${item.name || 'Perangkat Aset'}</p>
                <p class="text-[11px] text-slate-400 font-medium mt-0.5">${item.category || 'Inventaris Perusahaan'}</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              ${conditionBadge}
            </div>
          </div>

          <!-- Middle Row: Handover Notes if available -->
          ${item.notes ? `
            <div class="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-2.5 rounded-xl italic leading-relaxed">
              "${item.notes}"
            </div>
          ` : ''}

          <!-- Bottom Row: Handover Date and Actions -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
            <span class="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>Serah Terima: <b>${handoverDate}</b></span>
            </span>

            <div class="flex items-center gap-2">
              <button type="button" onclick="window.showAssetDetail(${item.id})" class="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-colors">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>Detail</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  populateReportDropdown() {
    const select = document.getElementById('report-asset-select');
    if (!select || !Array.isArray(this.allAssets) || this.allAssets.length === 0) return;

    select.innerHTML = this.allAssets.map(a => `<option value="${a.id}">${a.name} (${a.asset_code})</option>`).join('');
  }

  openReportModal(preferredAssetId = null) {
    const modal = document.getElementById('asset-report-modal');
    const select = document.getElementById('report-asset-select');
    const issueText = document.getElementById('report-issue-text');

    if (!modal) return;

    if (select && preferredAssetId) {
      select.value = preferredAssetId;
    }

    if (issueText) issueText.value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }

  async handleReportSubmit(e) {
    e.preventDefault();
    const select = document.getElementById('report-asset-select');
    const conditionSelect = document.getElementById('report-condition-select');
    const issueText = document.getElementById('report-issue-text');
    const submitBtn = document.getElementById('btn-submit-report');
    const modal = document.getElementById('asset-report-modal');

    const assetId = select?.value;
    const condition = conditionSelect?.value || 'Perlu Pengecekan';
    const issue = issueText?.value?.trim();

    if (!assetId) {
      showAlert('Pilih Aset', 'Silakan pilih aset yang mengalami kendala.');
      return;
    }

    if (!issue) {
      showAlert('Isi Deskripsi Kendala', 'Silakan tuliskan kronologi atau bentuk kerusakan yang dialami.');
      return;
    }

    setLoading(submitBtn, true, 'Mengirim Laporan...');

    try {
      await AssetsService.reportDamage(assetId, {
        issue_description: issue,
        condition: condition
      });

      showToast('Laporan kendala aset berhasil dikirim ke Admin / HRD!', 'success');
      if (modal) modal.classList.add('hidden');
      await this.loadData();
    } catch (err) {
      showAlert('Gagal Kirim Laporan', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(submitBtn, false, 'Kirim Laporan Kendala');
    }
  }
}

// Global helper for opening asset detail modal
window.showAssetDetail = (assetId) => {
  const modal = document.getElementById('asset-detail-modal');
  if (!modal) return;

  const controller = window._assetsControllerInstance;
  const asset = controller?.allAssets?.find(a => a.id === assetId);

  if (!asset) return;
  controller.currentDetailAsset = asset;

  const codeEl = document.getElementById('modal-asset-code');
  const nameEl = document.getElementById('modal-asset-name');
  const catEl = document.getElementById('modal-asset-category');
  const snEl = document.getElementById('modal-asset-sn');
  const condEl = document.getElementById('modal-asset-condition');
  const dateEl = document.getElementById('modal-asset-date');
  const notesEl = document.getElementById('modal-asset-notes');

  if (codeEl) codeEl.textContent = asset.asset_code || 'AST';
  if (nameEl) nameEl.textContent = asset.name || '-';
  if (catEl) catEl.textContent = asset.category || '-';
  if (snEl) snEl.textContent = asset.serial_number || 'Tidak ada serial number';
  if (condEl) {
    condEl.textContent = (asset.condition || 'BAIK').toUpperCase();
    condEl.className = (asset.condition || '').toLowerCase().includes('baik')
      ? 'font-bold text-emerald-600 dark:text-emerald-400 mt-0.5'
      : 'font-bold text-amber-600 dark:text-amber-400 mt-0.5';
  }
  if (dateEl) {
    dateEl.textContent = asset.handover_date
      ? new Date(asset.handover_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-';
  }
  if (notesEl) notesEl.textContent = asset.notes || 'Tidak ada catatan serah terima.';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
};

document.addEventListener('DOMContentLoaded', () => {
  window._assetsControllerInstance = new AssetsController();
});

export { AssetsController };
