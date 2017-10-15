/**
 * NATRA Mobile - GPS Controller
 * Auto-tracking singleton — sends location every 30 seconds
 */

import { GpsService } from './gps.service.js';
import { Auth } from '../../core/auth/auth.js';
import { Storage } from '../../core/storage/storage.js';
import { showToast } from '../../utils/ui-helpers.js';
import { BgTrackingManager } from '../../core/gps/bg-tracking-manager.js';

const TRACKING_INTERVAL_MS = 60_000; // 60 seconds (as requested)

const GpsController = {
  _interval: null,
  _isTracking: false,

  /**
   * Is GPS tracking currently active?
   */
  get isTracking() {
    return this._isTracking;
  },

  /**
   * Start auto-tracking. Safe to call multiple times.
   */
  async startTracking() {
    if (this._isTracking) return;

    const employeeId = Auth.getEmployeeNumericId();
    if (!employeeId) {
      console.warn('[GpsController] Cannot start tracking: no employee ID');
      return;
    }

    this._isTracking = true;
    Storage.setTrackingActive(true);

    // Start native background service if available
    // Always start time-based interval (Foreground Heartbeat)
    await this._sendOnce(employeeId);
    this._interval = setInterval(() => this._sendOnce(employeeId), TRACKING_INTERVAL_MS);

    // Start native background service if available
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        await BgTrackingManager.start();
      } catch (e) {
        console.error('[GpsController] BgTracking start failed:', e);
      }
    }

    console.info('[GpsController] Tracking started');
    this._updateUI(true);
  },

  /**
   * Stop auto-tracking.
   */
  async stopTracking() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }

    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      await BgTrackingManager.stop();
    }

    this._isTracking = false;
    Storage.setTrackingActive(false);
    console.info('[GpsController] Tracking stopped');
    this._updateUI(false);
  },

  /**
   * Toggle tracking on/off
   */
  async toggle() {
    if (this._isTracking) {
      await this.stopTracking();
      showToast('GPS tracking dinonaktifkan', 'info');
    } else {
      // Background Location Hint for Android
      if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
        const hasBackgroundHint = localStorage.getItem('natra_bg_hint_shown');
        if (!hasBackgroundHint) {
          localStorage.setItem('natra_bg_hint_shown', 'true');
          alert('PENTING: Agar pelacakan tetap berjalan saat aplikasi ditutup, pilih "Izinkan Sepanjang Waktu" (Allow all the time) pada pengaturan izin lokasi yang akan muncul.');
        }
      }

      showToast('Mengaktifkan GPS tracking...', 'info');
      await this.startTracking();
      if (this._isTracking) {
        showToast('GPS tracking aktif', 'success');
      }
    }
  },

  /**
   * Internal: get position and send to API
   */
  async _sendOnce(employeeId) {
    try {
      const coords = await GpsService.getCurrentPosition();
      await GpsService.updateLocation(coords, employeeId);
      console.debug('[GpsController] Location sent:', coords.latitude, coords.longitude);
      
      // Update Sync Bar (Universal)
      BgTrackingManager.saveSyncStatus('success', 'Lokasi berhasil terkirim');
    } catch (err) {
      console.error('[GpsController] Failed to send location:', err.message);
      BgTrackingManager.saveSyncStatus('warning', `Gagal kirim: ${err.message}`);
    }
  },

  /**
   * Update GPS toggle UI elements if present on the page
   */
  _updateUI(active) {
    const toggleEl = document.getElementById('gps-toggle');
    const statusEl = document.getElementById('gps-status-text');
    const dotEl = document.getElementById('gps-dot');

    if (toggleEl) toggleEl.checked = active;
    if (statusEl) statusEl.textContent = active ? 'Aktif' : 'Nonaktif';
    if (dotEl) {
      dotEl.classList.toggle('dot-active', active);
      dotEl.classList.toggle('dot-inactive', !active);
    }
  },
};

export { GpsController };
