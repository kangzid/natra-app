/**
 * NATRA Mobile - GPS Controller
 * Auto-tracking singleton — sends location every 30 seconds
 */

import { GpsService } from './gps.service.js';
import { Auth } from '../../core/auth/auth.js';
import { Storage } from '../../core/storage/storage.js';
import { showToast } from '../../utils/ui-helpers.js';

const TRACKING_INTERVAL_MS = 15_000; // 15 seconds

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

    // First send immediately
    await this._sendOnce(employeeId);

    // Then on interval
    this._interval = setInterval(() => this._sendOnce(employeeId), TRACKING_INTERVAL_MS);

    console.info('[GpsController] Tracking started');
    this._updateUI(true);
  },

  /**
   * Stop auto-tracking.
   */
  stopTracking() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
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
      this.stopTracking();
      showToast('GPS tracking dinonaktifkan', 'info');
    } else {
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
    } catch (err) {
      console.error('[GpsController] Failed to send location:', err.message);
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
