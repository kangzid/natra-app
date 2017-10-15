/**
 * NATRA Mobile - Profile Controller
 */

import { ProfileService } from './profile.service.js';
import { AuthService } from '../auth/auth.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showConfirm, setLoading, setText, getInitials, initPullToRefresh } from '../../utils/ui-helpers.js';
import { ThemeManager } from '../../core/theme/theme-manager.js';
import { Cache } from '../../utils/cache.js';

const ProfileController = {
  async init() {
    if (!Auth.requireAuth()) return;

    // SWR Pattern: Load from cache
    const cachedProfile = Cache.get('profile');
    if (cachedProfile) {
      this._renderProfile(cachedProfile);
      // Hide skeletons
      const headerSkeleton = document.getElementById('profile-skeleton-header');
      const headerContent = document.getElementById('profile-header-content');
      const infoSkeleton = document.getElementById('profile-info-loading');
      const infoContent = document.getElementById('profile-info-content');
      if (headerSkeleton) headerSkeleton.classList.add('hidden');
      if (headerContent) headerContent.classList.remove('hidden');
      if (infoSkeleton) infoSkeleton.classList.add('hidden');
      if (infoContent) infoContent.classList.remove('hidden');
    }

    await this._loadProfile();
    this._bindEvents();
  },

  async _loadProfile() {
    const headerSkeleton = document.getElementById('profile-skeleton-header');
    const headerContent = document.getElementById('profile-header-content');
    const infoSkeleton = document.getElementById('profile-info-loading');
    const infoContent = document.getElementById('profile-info-content');

    // Only show skeleton if NO cache exists
    const hasCache = !!Cache.get('profile');
    if (headerSkeleton && !hasCache) headerSkeleton.classList.remove('hidden');
    if (headerContent && !hasCache) headerContent.classList.add('hidden');
    if (infoSkeleton && !hasCache) infoSkeleton.classList.remove('hidden');
    if (infoContent && !hasCache) infoContent.classList.add('hidden');

    try {
      const data = await ProfileService.getProfile();
      
      // Save to cache (3-min TTL as requested)
      Cache.set('profile', data, 3);

      this._renderProfile(data);

      if (headerSkeleton) headerSkeleton.classList.add('hidden');
      if (headerContent) headerContent.classList.remove('hidden');
      if (infoSkeleton) infoSkeleton.classList.add('hidden');
      if (infoContent) infoContent.classList.remove('hidden');
    } catch (err) {
      // Fallback to stored data
      if (!Cache.get('profile')) {
        const user = Auth.getUser();
        const employee = Auth.getEmployee();
        if (user) {
          this._renderProfile({ ...user, employee });
          if (headerSkeleton) headerSkeleton.classList.add('hidden');
          if (headerContent) headerContent.classList.remove('hidden');
          if (infoSkeleton) infoSkeleton.classList.add('hidden');
          if (infoContent) infoContent.classList.remove('hidden');
        } else {
          showToast('Gagal memuat profil', 'error');
        }
      }
    }
  },

  _renderProfile(data) {
    const emp = data.employee;
    setText('profile-name', data.name || '-');
    setText('profile-email', data.email || '-');
    setText('profile-id', emp?.employee_id || '-');
    setText('profile-department', emp?.department || '-');
    setText('profile-position', emp?.position || '-');
    setText('profile-phone', emp?.phone || '-');
    setText('profile-role', data.role === 'employee' ? 'Karyawan' : data.role || '-');

    const avatarText = document.getElementById('profile-avatar-text');
    const avatarImg = document.getElementById('profile-avatar-img');
    
    if (avatarImg) {
      avatarImg.src = '../src/img/profile-employee.png';
      avatarImg.classList.remove('hidden');
    }
    if (avatarText) {
      avatarText.classList.add('hidden');
    }

    // Active status
    const statusEl = document.getElementById('profile-status');
    if (statusEl) {
      statusEl.textContent = data.is_active ? 'Aktif' : 'Tidak Aktif';
      statusEl.className = `badge ${data.is_active ? 'badge-success' : 'badge-danger'}`;
    }
  },

  _bindEvents() {
    // --- Password Modal Logic ---
    const modalOverlay = document.getElementById('pw-modal-overlay');
    const openModalBtn = document.getElementById('btn-open-pw-modal');
    const closeModalBtn = document.getElementById('btn-close-pw-modal');

    if (openModalBtn && modalOverlay) {
      openModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeModalBtn && modalOverlay) {
      const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('change-password-form')?.reset();
        const errorEl = document.getElementById('pw-error');
        if (errorEl) errorEl.classList.add('hidden');
      };

      closeModalBtn.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // --- Privacy Modal Logic ---
    const privOverlay = document.getElementById('privacy-modal-overlay');
    const openPrivBtn = document.getElementById('btn-open-privacy-modal');
    const closePrivBtn = document.getElementById('btn-close-privacy-modal');

    if (openPrivBtn && privOverlay) {
      openPrivBtn.addEventListener('click', () => {
        privOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closePrivBtn && privOverlay) {
      const closePriv = () => {
        privOverlay.classList.remove('active');
        document.body.style.overflow = '';
      };
      closePrivBtn.addEventListener('click', closePriv);
      privOverlay.addEventListener('click', (e) => {
        if (e.target === privOverlay) closePriv();
      });
    }

    // --- Policy Modal Logic ---
    const policyOverlay = document.getElementById('policy-modal-overlay');
    const openPolicyBtn = document.getElementById('btn-open-policy-modal');
    const closePolicyBtn = document.getElementById('btn-close-policy-modal');

    if (openPolicyBtn && policyOverlay) {
      openPolicyBtn.addEventListener('click', () => {
        policyOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closePolicyBtn && policyOverlay) {
      const closePolicy = () => {
        policyOverlay.classList.remove('active');
        document.body.style.overflow = '';
      };
      closePolicyBtn.addEventListener('click', closePolicy);
      policyOverlay.addEventListener('click', (e) => {
        if (e.target === policyOverlay) closePolicy();
      });
    }

    // --- Info Modal Logic ---
    const infoOverlay = document.getElementById('info-modal-overlay');
    const openInfoBtn = document.getElementById('btn-open-info-modal');
    const closeInfoBtn = document.getElementById('btn-close-info-modal');

    if (openInfoBtn && infoOverlay) {
      openInfoBtn.addEventListener('click', () => {
        infoOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeInfoBtn && infoOverlay) {
      const closeInfo = () => {
        infoOverlay.classList.remove('active');
        document.body.style.overflow = '';
      };
      closeInfoBtn.addEventListener('click', closeInfo);
      infoOverlay.addEventListener('click', (e) => {
        if (e.target === infoOverlay) closeInfo();
      });
    }


    // --- Dark Mode Toggle ---
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
      // Set initial state
      darkToggle.checked = ThemeManager.isDark();
      
      darkToggle.addEventListener('change', (e) => {
        const isDark = ThemeManager.toggle();
        showToast(isDark ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
      });
    }

    // --- Submit change password ---
    const changePwForm = document.getElementById('change-password-form');
    if (changePwForm) {
      changePwForm.addEventListener('submit', (e) => this._handleChangePassword(e));
    }

    // --- Toggle password visibility ---
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.togglePassword;
        const input = document.getElementById(targetId);
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';

          // Update icon if possible
          const icon = btn.querySelector('i');
          if (icon) {
            icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
            lucide.createIcons();
          }
        }
      });
    });

    // --- Logout ---
    document.getElementById('logout-btn')?.addEventListener('click', () => this._handleLogout());

    // --- Pull to Refresh ---
    initPullToRefresh('main-content', () => this._loadProfile());
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
      const modalOverlay = document.getElementById('pw-modal-overlay');
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
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

document.addEventListener('DOMContentLoaded', () => ProfileController.init());

export { ProfileController };
