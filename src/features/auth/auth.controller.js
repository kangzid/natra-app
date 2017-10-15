/**
 * NATRA Mobile - Auth Controller
 * Handles login page UI & form logic
 */

import { AuthService } from './auth.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showAlert, setLoading } from '../../utils/ui-helpers.js';

const EYE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

const AuthController = {
  init() {
    // Redirect to dashboard if already logged in
    Auth.redirectIfAuthenticated();
    this._bindEvents();
  },

  _bindEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => this._handleLogin(e));
    }

    // Toggle password visibility
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener('click', () => {
        const isText = passwordInput.type === 'text';
        passwordInput.type = isText ? 'password' : 'text';
        toggleBtn.innerHTML = isText ? EYE_ICON : EYE_OFF_ICON;
      });
    }
  },

  async _handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const btn = document.getElementById('login-btn');
    const errorEl = document.getElementById('form-error');

    if (errorEl) errorEl.textContent = '';

    if (!email || !password) {
      if (errorEl) errorEl.textContent = 'Email dan password wajib diisi.';
      return;
    }

    setLoading(btn, true, 'Masuk...');

    try {
      await AuthService.login(email, password);
      showToast('Login berhasil! Selamat datang 👋', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } catch (err) {
      const msg = err.message || 'Login gagal. Periksa email dan password Anda.';
      if (errorEl) errorEl.textContent = msg;
      showAlert('Gagal Masuk', msg);
      setLoading(btn, false, 'Masuk');
    }
  },
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => AuthController.init());

export { AuthController };
