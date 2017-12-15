/**
 * NATRA Mobile - Enhanced Native Background Tracking Manager
 * Leverages @capacitor-community/background-geolocation
 * Keeps GPS tracking alive with live elapsed time notification ticker
 */

import { Auth } from '../auth/auth.js';
import { Storage } from '../storage/storage.js';
import { ApiClient } from '../api/api-client.js';

let watcherId = null;

function getStoredStartTime() {
  let stored = localStorage.getItem('natra_tracking_start_time');
  if (!stored) {
    stored = String(Date.now());
    localStorage.setItem('natra_tracking_start_time', stored);
  }
  return parseInt(stored, 10);
}

function formatElapsed() {
  const startTime = getStoredStartTime();
  const elapsedMs = Math.max(0, Date.now() - startTime);
  const totalSec = Math.floor(elapsedMs / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  
  if (hrs > 0) {
    return `${hrs} jam ${mins} mnt`;
  }
  if (mins > 0) {
    return `${mins} menit`;
  }
  return `${secs} detik`;
}

export const BgTrackingManager = {
  async start() {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
      console.log('[BgTracking] Native platform not detected, skipping background geolocation plugin.');
      return;
    }

    const BackgroundGeolocation = window.Capacitor.Plugins.BackgroundGeolocation;
    if (!BackgroundGeolocation) {
      console.warn('[BgTracking] BackgroundGeolocation plugin not available on window.Capacitor.Plugins');
      return;
    }

    try {
      getStoredStartTime();
      const elapsedStr = formatElapsed();

      // Start Background Geolocation with Android Foreground Service
      watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: `Pelacakan aktif • Berjalan ${elapsedStr}`,
          backgroundTitle: 'NATRA - GPS Karyawan Aktif',
          requestPermissions: true,
          stale: false,
          distanceFilter: 10
        },
        async (location, error) => {
          if (error) {
            console.error('[BgTracking] Watcher error:', error);
            this.saveSyncStatus('warning', 'Sinyal GPS lemah');
            return;
          }

          if (location) {
            console.log('[BgTracking] Native BG Location:', location.latitude, location.longitude);
            await this._processLocation(location);
          }
        }
      );

      console.log('[BgTracking] Started successfully with watcherId:', watcherId);
      this.saveSyncStatus('active', 'Pelacakan Background Berjalan');
    } catch (e) {
      console.error('[BgTracking] Failed to start:', e);
      this.saveSyncStatus('error', 'Gagal memulai background service');
    }
  },

  async stop() {
    localStorage.removeItem('natra_tracking_start_time');

    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return;

    const BackgroundGeolocation = window.Capacitor.Plugins.BackgroundGeolocation;
    if (!BackgroundGeolocation) return;

    if (watcherId !== null) {
      try {
        await BackgroundGeolocation.removeWatcher({ id: watcherId });
        console.log('[BgTracking] Watcher removed');
      } catch (e) {
        console.error('[BgTracking] Error removing watcher:', e);
      }
      watcherId = null;
    }

    this.saveSyncStatus('inactive', 'Pelacakan dimatikan');
  },

  async _processLocation(location) {
    const employeeId = Auth.getEmployeeNumericId();
    if (!employeeId) return;

    const coords = {
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed ?? null,
      heading: location.bearing ?? location.heading ?? null,
      accuracy: location.accuracy ?? null,
      altitude: location.altitude ?? null,
      trackable_type: 'employee',
      trackable_id: employeeId
    };

    try {
      await ApiClient.post('/locations', coords);
      const elapsedStr = formatElapsed();
      this.saveSyncStatus('success', `Lokasi terkirim (Aktif ${elapsedStr})`);
    } catch (err) {
      console.warn('[BgTracking] Offline/Failed to send, saving locally:', err.message);
      this.saveSyncStatus('warning', 'Menyimpan di memori offline');
    }
  },

  saveSyncStatus(status, message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const syncData = {
      status,
      message,
      time: timeStr,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('natra_bg_sync_status', JSON.stringify(syncData));
      window.dispatchEvent(new CustomEvent('natra-sync-update', { detail: syncData }));
    } catch (e) {}
  }
};
