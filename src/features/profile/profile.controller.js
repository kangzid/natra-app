/**
 * NATRA Mobile - Profile Controller
 * Handles user profile, dark mode, password change, and comprehensive employee detail modal (Read-Only).
 */

import { ProfileService } from './profile.service.js';
import { AuthService } from '../auth/auth.service.js';
import { Auth } from '../../core/auth/auth.js';
import { ThemeManager } from '../../core/theme/theme-manager.js';
import { showToast, showAlert, showConfirm, setLoading, setText, formatRupiah, formatDate } from '../../utils/ui-helpers.js';

const ProfileController = {
  _profileData: null,
  _comprehensiveData: null,
  _activeDetailTab: 'financial',

    async init() {
    // 1. Instant Render from local session / cache (Zero latency)
    const localUser = Auth.getUser();
    if (localUser) {
      this._profileData = localUser;
      this._renderProfile(localUser);
    }

    this._bindEvents();
    
    // 2. Background silent refresh for fresh stats & status
    await this._loadProfile();
  },

  async _loadProfile() {
    try {
      const user = await ProfileService.getProfile();
      if (user) {
        this._profileData = user;
        this._renderProfile(user);
        // Update stored session with fresh user data
        Auth.setUser(user);
      }
    } catch (err) {
      console.warn('[ProfileController] Silent background refresh note:', err.message);
    }
  },

  _renderProfile(user) {
    if (!user) return;
    const emp = user.employee || {};

    setText('profile-name', user.name || 'Karyawan');
    setText('profile-email', user.email || '-');
    setText('profile-phone', emp.phone || user.phone || '-');
    setText('profile-address', emp.address || user.address || '-');
    setText('profile-emp-id', emp.employee_id || 'EMP001');
    setText('profile-role', `${emp.position || 'Staf Operasional'} • ${emp.department || 'Divisi Kerja'}`);

    // Avatar rendering
    const avatarImg = document.getElementById('avatar-img');
    const avatarText = document.getElementById('avatar-text');
    const photoBase64 = user.photo_base64 || emp.photo_base64;

    if (avatarImg && photoBase64) {
      avatarImg.src = photoBase64;
      avatarImg.classList.remove('hidden');
      if (avatarText) avatarText.classList.add('hidden');
    } else if (avatarText) {
      avatarText.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      avatarText.classList.remove('hidden');
      if (avatarImg) avatarImg.classList.add('hidden');
    }

    // Status Pill
    const statusEl = document.getElementById('profile-status');
    if (statusEl) {
      statusEl.textContent = user.is_active ? 'Aktif' : 'Nonaktif';
      statusEl.className = user.is_active
        ? 'text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full uppercase tracking-wider'
        : 'text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-full uppercase tracking-wider';
    }

    const modalEmpCode = document.getElementById('modal-emp-code');
    if (modalEmpCode) modalEmpCode.textContent = emp.employee_id || 'EMP001';
  },

  _bindEvents() {
    // 1. Comprehensive Detail Modal Trigger
    const openDetailBtn = document.getElementById('btn-open-detail-modal');
    if (openDetailBtn) {
      openDetailBtn.onclick = () => this._openDetailModal();
    }

    const closeDetailBtn = document.getElementById('btn-close-detail-modal');
    if (closeDetailBtn) {
      closeDetailBtn.onclick = () => this._closeDetailModal();
    }

    // 2. Detail Modal Navigation Tabs
    const tabButtons = document.querySelectorAll('.detail-tab-btn');
    tabButtons.forEach(btn => {
      btn.onclick = () => {
        const tab = btn.getAttribute('data-detail-tab');
        this._switchDetailTab(tab, btn);
      };
    });

    // 3. Password Modal Logic
    const pwOverlay = document.getElementById('pw-modal-overlay');
    const openPwBtn = document.getElementById('btn-open-pw-modal');
    const closePwBtn = document.getElementById('btn-close-pw-modal');

    if (openPwBtn && pwOverlay) {
      openPwBtn.onclick = () => {
        pwOverlay.classList.remove('hidden');
        pwOverlay.classList.add('flex');
      };
    }

    if (closePwBtn && pwOverlay) {
      const closePw = () => {
        pwOverlay.classList.add('hidden');
        pwOverlay.classList.remove('flex');
        document.getElementById('change-password-form')?.reset();
        const errorEl = document.getElementById('pw-error');
        if (errorEl) errorEl.classList.add('hidden');
      };
      closePwBtn.onclick = closePw;
      pwOverlay.onclick = (e) => {
        if (e.target === pwOverlay) closePw();
      };
    }

    // 4. Privacy Modal
    const privOverlay = document.getElementById('privacy-modal-overlay');
    const openPrivBtn = document.getElementById('btn-open-privacy-modal');
    const closePrivBtn = document.getElementById('btn-close-privacy-modal');

    if (openPrivBtn && privOverlay) {
      openPrivBtn.onclick = () => {
        privOverlay.classList.remove('hidden');
        privOverlay.classList.add('flex');
      };
    }

    if (closePrivBtn && privOverlay) {
      closePrivBtn.onclick = () => {
        privOverlay.classList.add('hidden');
        privOverlay.classList.remove('flex');
      };
      privOverlay.onclick = (e) => {
        if (e.target === privOverlay) {
          privOverlay.classList.add('hidden');
          privOverlay.classList.remove('flex');
        }
      };
    }

    // 5. Info Modal
    const infoOverlay = document.getElementById('info-modal-overlay');
    const openInfoBtn = document.getElementById('btn-open-info-modal');
    const closeInfoBtn = document.getElementById('btn-close-info-modal');

    if (openInfoBtn && infoOverlay) {
      openInfoBtn.onclick = () => {
        infoOverlay.classList.remove('hidden');
        infoOverlay.classList.add('flex');
      };
    }

    if (closeInfoBtn && infoOverlay) {
      closeInfoBtn.onclick = () => {
        infoOverlay.classList.add('hidden');
        infoOverlay.classList.remove('flex');
      };
      infoOverlay.onclick = (e) => {
        if (e.target === infoOverlay) {
          infoOverlay.classList.add('hidden');
          infoOverlay.classList.remove('flex');
        }
      };
    }

    // 6. Dark Mode Toggle
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
      darkToggle.checked = ThemeManager.isDark();
      darkToggle.onchange = () => {
        const isDark = ThemeManager.toggle();
        showToast(isDark ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
      };
    }

    // 7. Submit change password
    const changePwForm = document.getElementById('change-password-form');
    if (changePwForm) {
      changePwForm.onsubmit = (e) => this._handleChangePassword(e);
    }

    // 8. Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => this._handleLogout();
    }
  },

  async _openDetailModal() {
    const modal = document.getElementById('employee-detail-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Show loading state in tab content
    const container = document.getElementById('detail-tab-content');
    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center text-xs text-slate-400 font-medium space-y-2">
          <div class="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Memuat rincian data karyawan...</p>
        </div>
      `;
    }

    try {
      const user = Auth.getUser();
      const empId = user?.employee?.id || 7;
      const data = await ProfileService.getComprehensiveProfile(empId);
      this._comprehensiveData = data;
      this._switchDetailTab(this._activeDetailTab);
    } catch (err) {
      console.error('Error fetching comprehensive profile:', err);
      if (container) {
        container.innerHTML = `
          <div class="p-6 text-center text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 rounded-2xl">
            Gagal memuat rincian data karyawan. Silakan coba lagi.
          </div>
        `;
      }
    }
  },

  _closeDetailModal() {
    const modal = document.getElementById('employee-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  },

  _switchDetailTab(tab, activeBtn = null) {
    this._activeDetailTab = tab;

    // Update Tab Buttons UI
    const tabButtons = document.querySelectorAll('.detail-tab-btn');
    tabButtons.forEach(btn => {
      btn.className = 'detail-tab-btn px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap';
    });

    if (activeBtn) {
      activeBtn.className = 'detail-tab-btn px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 text-white dark:bg-white dark:text-slate-900 whitespace-nowrap shadow-sm';
    } else {
      const defaultBtn = document.querySelector(`.detail-tab-btn[data-detail-tab="${tab}"]`);
      if (defaultBtn) {
        defaultBtn.className = 'detail-tab-btn px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 text-white dark:bg-white dark:text-slate-900 whitespace-nowrap shadow-sm';
      }
    }

    const container = document.getElementById('detail-tab-content');
    if (!container || !this._comprehensiveData) return;

    const data = this._comprehensiveData;
    const emp = data.employee || {};
    const user = emp.user || {};

    let html = '';

    if (tab === 'financial') {
      const basicSalary = data.salary?.amount || 2000000;
      const bankName = data.salary?.bank_name || 'BCA (Bank Central Asia)';
      const bankAcc = data.salary?.bank_account_number || '8830192811';
      const bankHolder = data.salary?.bank_account_holder || user.name || 'Agus Darsono';

      const allowances = data.contract_allowances && data.contract_allowances.length > 0
        ? data.contract_allowances
        : (data.allowances?.items || []);

      const bpjsKes = data.bpjs?.bpjs_kesehatan_number || data.bpjs?.kesehatan?.bpjs_number || 'Belum Terdaftar';
      const bpjsTk = data.bpjs?.bpjs_tk_number || data.bpjs?.ketenagakerjaan?.bpjs_number || 'Belum Terdaftar';

      html = `
        <!-- Basic Salary & Bank Card -->
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Upah Pokok Bulanan</span>
            <span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold uppercase border border-emerald-100 dark:border-emerald-800/40">Aktif</span>
          </div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">${formatRupiah(basicSalary)}</p>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-2xl space-y-1.5 text-xs border border-slate-100 dark:border-slate-700/40">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rekening Penerimaan Gaji</p>
            <p class="font-extrabold text-slate-800 dark:text-slate-200">${bankName}</p>
            <p class="font-mono font-bold text-primary-600 dark:text-primary-400">${bankAcc} <span class="font-normal text-slate-400">a.n. ${bankHolder}</span></p>
          </div>
        </div>

        <!-- Allowances Card -->
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
          <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">Rincian Tunjangan Rutin</p>
          ${allowances.length > 0 ? allowances.map(a => `
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 text-xs">
              <span class="text-slate-600 dark:text-slate-300 font-medium">${a.name || a.allowance_type?.name || 'Tunjangan'}</span>
              <span class="font-extrabold text-slate-800 dark:text-slate-200">${formatRupiah(a.amount || 0)}</span>
            </div>
          `).join('') : '<p class="text-xs text-slate-400 italic">Tidak ada tunjangan tetap aktif.</p>'}
        </div>

        <!-- BPJS Card -->
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
          <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">Jaminan Sosial & Kesehatan (BPJS)</p>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-2xl space-y-1 text-xs border border-slate-100 dark:border-slate-700/40">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BPJS Kesehatan</p>
            <p class="font-mono font-bold text-slate-800 dark:text-slate-200">${bpjsKes}</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-2xl space-y-1 text-xs border border-slate-100 dark:border-slate-700/40">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BPJS Ketenagakerjaan (JHT & JP)</p>
            <p class="font-mono font-bold text-slate-800 dark:text-slate-200">${bpjsTk}</p>
          </div>
        </div>
      `;
    } else if (tab === 'contracts') {
      const contracts = data.contracts || [];
      html = contracts.length > 0 ? contracts.map(c => `
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-[10px] font-extrabold uppercase font-mono border border-primary-100 dark:border-primary-800/40">${c.contract_number || 'KONTRAK'}</span>
            <span class="px-2.5 py-1 ${c.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40' : 'bg-slate-100 text-slate-500'} rounded-lg text-[9px] font-extrabold uppercase">${c.status === 'active' ? 'Aktif' : 'Selesai'}</span>
          </div>
          <div>
            <p class="text-sm font-extrabold text-slate-800 dark:text-slate-200">${c.contract_type || 'PKWTT (Tetap)'}</p>
            <p class="text-xs text-slate-400 font-medium mt-0.5">${c.position || emp.position} • ${c.department || emp.department}</p>
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/40">
            Periode: <b>${formatDate(c.start_date)}</b> s/d <b>${c.end_date ? formatDate(c.end_date) : 'Seterusnya (Tetap)'}</b>
          </div>
        </div>
      `).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Belum ada data riwayat kontrak.</div>';
    } else if (tab === 'mutations') {
      const mutations = data.mutations || [];
      html = mutations.length > 0 ? mutations.map(m => `
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-2">
          <span class="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-[9px] font-extrabold uppercase border border-primary-100 dark:border-primary-800/40">${m.type || 'PROMOSI'}</span>
          <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">${m.from_position || '-'} &rarr; ${m.to_position || '-'}</p>
          <p class="text-[11px] text-slate-400 font-medium">Tgl Efektif: ${formatDate(m.effective_date)}</p>
        </div>
      `).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Belum ada riwayat mutasi atau promosi jabatan.</div>';
    } else if (tab === 'kpi') {
      const reviews = data.performance_reviews || [];
      html = reviews.length > 0 ? reviews.map(r => `
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200">${r.period || 'Periode Kuartal'}</span>
            <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black border border-emerald-100 dark:border-emerald-800/40">${r.score || 90}/100</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/30 p-2.5 rounded-xl italic border border-slate-100 dark:border-slate-700/40">"${r.feedback || 'Kinerja sangat baik dan disiplin dalam penugasan.'}"</p>
        </div>
      `).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Belum ada catatan evaluasi KPI.</div>';
    } else if (tab === 'assets') {
      const assets = data.assets || [];
      html = assets.length > 0 ? assets.map(a => `
        <div class="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[9px] font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-800/40">${a.asset_code || 'AST'}</span>
              <span class="text-[10px] text-slate-400 font-bold">SN: ${a.serial_number || '-'}</span>
            </div>
            <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">${a.name}</p>
          </div>
          <span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold uppercase border border-emerald-100 dark:border-emerald-800/40">${a.condition || 'BAIK'}</span>
        </div>
      `).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Tidak ada aset yang sedang dipinjamkan.</div>';
    } else if (tab === 'loans') {
      const loans = data.loans || [];
      html = loans.length > 0 ? loans.map(l => {
        const totalAmount = l.amount || l.loan_amount || 0;
        const tenor = l.tenor_months || (l.tenor ? parseInt(l.tenor) : 1);
        const monthly = l.monthly_deduction || l.monthly_installment || (tenor > 0 ? (totalAmount / tenor) : 0);
        return `
          <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200">Pinjaman Kasbon</span>
                ${l.code ? `<span class="ml-1.5 text-[10px] font-mono text-slate-400">(${l.code})</span>` : ''}
              </div>
              <span class="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-extrabold uppercase border border-amber-100 dark:border-amber-800/40">${l.status || 'Berjalan'}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/40">
                <p class="text-[10px] text-slate-400 font-bold uppercase">Total Pinjaman</p>
                <p class="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">${formatRupiah(totalAmount)}</p>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/40">
                <p class="text-[10px] text-slate-400 font-bold uppercase">Cicilan / Bulan</p>
                <p class="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">${formatRupiah(monthly)}</p>
              </div>
            </div>
            ${l.remaining_amount !== undefined ? `
              <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                <span>Sisa Saldo Pinjaman:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${formatRupiah(l.remaining_amount)}</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Tidak ada pinjaman kasbon aktif.</div>';
    } else if (tab === 'trainings') {
      const trainings = data.trainings || [];
      html = trainings.length > 0 ? trainings.map(t => `
        <div class="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-1.5">
          <span class="px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-md text-[9px] font-extrabold uppercase border border-primary-100 dark:border-primary-800/40">Sertifikasi</span>
          <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">${t.training?.title || 'Defensive Driving & Safety Delivery'}</p>
          <p class="text-[11px] text-slate-400">Lembaga: ${t.training?.provider || 'Pusat Pelatihan Transportasi'}</p>
        </div>
      `).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Belum ada riwayat pelatihan.</div>';
    } else if (tab === 'compliance') {
      const compliance = data.compliance_items || [];
      html = compliance.length > 0 ? compliance.map(c => `
        <div class="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">${c.name || 'Surat Izin Mengemudi (SIM B1 Umum)'}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Berlaku s/d: ${formatDate(c.expiry_date || '2028-12-31')}</p>
          </div>
          <span class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold uppercase border border-emerald-100 dark:border-emerald-800/40">VALID</span>
        </div>
      `).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Tidak ada dokumen kepatuhan yang dicatat.</div>';
    } else if (tab === 'leave') {
      const requests = data.requests || [];
      html = `
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200">Hak Cuti Tahunan 2026</span>
            <span class="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold border border-primary-100 dark:border-primary-800/40">12 Hari / Tahun</span>
          </div>
        </div>
        <div class="space-y-3">
          <p class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Riwayat Pengajuan Terbaru</p>
          ${requests.length > 0 ? requests.map(r => `
            <div class="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-[9px] font-mono font-bold text-primary-600 dark:text-primary-400">${r.code || 'REQ'}</span>
                <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200">${r.request_type ? r.request_type.toUpperCase().replace('_', ' ') : 'Pengajuan'}</p>
                <p class="text-[10px] text-slate-400">${formatDate(r.start_date)} • ${r.days_count || 1} Hari</p>
              </div>
              <span class="px-2.5 py-1 ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40' : 'bg-amber-50 text-amber-600'} rounded-lg text-[9px] font-extrabold uppercase">${r.status || 'PENDING'}</span>
            </div>
          `).join('') : '<div class="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Belum ada pengajuan lembur/cuti.</div>'}
        </div>
      `;
    }

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  async _handleChangePassword(e) {
    e.preventDefault();
    const currentPw = document.getElementById('current-password')?.value;
    const newPw = document.getElementById('new-password')?.value;
    const confirmPw = document.getElementById('confirm-password')?.value;
    const btn = document.getElementById('change-pw-btn');
    const errorEl = document.getElementById('pw-error');

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    if (newPw !== confirmPw) {
      if (errorEl) {
        errorEl.textContent = 'Konfirmasi password tidak cocok.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    setLoading(btn, true, 'Memperbarui...');
    try {
      await ProfileService.changePassword(currentPw, newPw, confirmPw);
      showToast('Password Anda berhasil diperbarui!', 'success');

      // Close Modal
      const pwOverlay = document.getElementById('pw-modal-overlay');
      if (pwOverlay) {
        pwOverlay.classList.add('hidden');
        pwOverlay.classList.remove('flex');
      }
      e.target.reset();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Gagal mengubah password. Pastikan password lama benar.';
        errorEl.classList.remove('hidden');
      }
      showToast(err.message || 'Gagal mengubah password', 'error');
    } finally {
      setLoading(btn, false, 'Perbarui Password Sekarang');
    }
  },

  async _handleLogout() {
    const confirmed = await showConfirm(
      'Keluar dari NATRA?', 
      'Sesi Anda akan dihentikan dan Anda harus masuk kembali untuk mengakses data.',
      { okText: 'Keluar', cancelText: 'Batal', isDestructive: true }
    );

    if (!confirmed) return;

    const btn = document.getElementById('logout-btn');
    setLoading(btn, true, 'Keluar...');
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      Auth.logout();
    }
  },
};

// Global handlers for immediate, reliable button triggering
window.openEmployeeDetailModal = () => ProfileController._openDetailModal();
window.closeEmployeeDetailModal = () => ProfileController._closeDetailModal();

document.addEventListener('DOMContentLoaded', () => ProfileController.init());

export { ProfileController };
