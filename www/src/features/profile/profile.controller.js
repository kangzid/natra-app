/**
 * NATRA Mobile - Profile Controller
 */

import { ProfileService } from './profile.service.js';
import { AuthService } from '../auth/auth.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, setLoading, setText, getInitials } from '../../utils/ui-helpers.js';

const ProfileController = {
  async init() {
    if (!Auth.requireAuth()) return;
    await this._loadProfile();
    this._bindEvents();
  },

  async _loadProfile() {
    try {
      const data = await ProfileService.getProfile();
      this._renderProfile(data);
    } catch (err) {
      // Fallback to stored data
      const user = Auth.getUser();
      const employee = Auth.getEmployee();
      if (user) this._renderProfile({ ...user, employee });
      else showToast('Gagal memuat profil', 'error');
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

    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) avatarEl.textContent = getInitials(data.name || '?');

    // Active status
    const statusEl = document.getElementById('profile-status');
    if (statusEl) {
      statusEl.textContent = data.is_active ? 'Aktif' : 'Tidak Aktif';
      statusEl.className = `badge ${data.is_active ? 'badge-success' : 'badge-danger'}`;
    }
  },

  _bindEvents() {
    // Toggle change password form
    const toggleBtn = document.getElementById('toggle-change-password');
    const formEl = document.getElementById('change-password-form');
    if (toggleBtn && formEl) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = formEl.classList.contains('hidden');
        formEl.classList.toggle('hidden', !isHidden);
        toggleBtn.textContent = isHidden ? '✕ Batal' : '🔑 Ganti Password';
      });
    }

    // Submit change password
    const changePwForm = document.getElementById('change-password-form');
    if (changePwForm) {
      changePwForm.addEventListener('submit', (e) => this._handleChangePassword(e));
    }

    // Toggle password visibility (change password form)
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.togglePassword;
        const input = document.getElementById(targetId);
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
        }
      });
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => this._handleLogout());
  },

  async _handleChangePassword(e) {
    e.preventDefault();
    const currentPw = document.getElementById('current-password')?.value;
    const newPw = document.getElementById('new-password')?.value;
    const confirmPw = document.getElementById('confirm-password')?.value;
    const btn = document.getElementById('change-pw-btn');
    const errorEl = document.getElementById('pw-error');

    if (errorEl) errorEl.textContent = '';

    if (!currentPw || !newPw || !confirmPw) {
      if (errorEl) errorEl.textContent = 'Semua field wajib diisi.';
      return;
    }

    if (newPw !== confirmPw) {
      if (errorEl) errorEl.textContent = 'Konfirmasi password tidak cocok.';
      return;
    }

    if (newPw.length < 8) {
      if (errorEl) errorEl.textContent = 'Password baru minimal 8 karakter.';
      return;
    }

    setLoading(btn, true, 'Menyimpan...');
    try {
      await ProfileService.changePassword(currentPw, newPw, confirmPw);
      showToast('Password berhasil diubah!', 'success');
      e.target.reset();
      document.getElementById('change-password-form')?.classList.add('hidden');
      document.getElementById('toggle-change-password').textContent = '🔑 Ganti Password';
    } catch (err) {
      if (errorEl) errorEl.textContent = err.message || 'Gagal mengubah password.';
      showToast(err.message || 'Gagal mengubah password', 'error');
    } finally {
      setLoading(btn, false, 'Simpan Password');
    }
  },

  async _handleLogout() {
    const btn = document.getElementById('logout-btn');
    setLoading(btn, true, 'Keluar...');
    try {
      await AuthService.logout();
    } finally {
      Auth.logout();
    }
  },
};

document.addEventListener('DOMContentLoaded', () => ProfileController.init());

export { ProfileController };
