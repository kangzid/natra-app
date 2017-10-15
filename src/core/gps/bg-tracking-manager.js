/**
 * NATRA Mobile - Background Tracking Manager
 * Manages foreground service for GPS and periodic background task checking
 */

import { GpsService } from '../../features/gps/gps.service.js';
import { TasksService } from '../../features/tasks/tasks.service.js';
import { Storage } from '../storage/storage.js';
import { Auth } from '../auth/auth.js';

// Safe plugin access (works in both browser and native)
const getPlugins = () => window.Capacitor?.Plugins || {};
const BackgroundGeolocation = getPlugins().BackgroundGeolocation;
const LocalNotifications = getPlugins().LocalNotifications;


let watcherId = null;
let lastTaskCheckTime = 0;
let startTime = 0;
const TASK_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const BgTrackingManager = {
  /**
   * Start background geolocation and periodic task checking
   */
  async start() {
    if (watcherId) return;

    try {
      // 1. Request Notifications Permission (Android 13+)
      if (LocalNotifications) {
        await LocalNotifications.requestPermissions();
      }

      startTime = Date.now();
      lastTaskCheckTime = 0; // Force immediate check on start

      // 2. Start Background Geolocation
      if (BackgroundGeolocation) {
        watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'NATRA - Lacak GPS Aktif',
          backgroundTitle: 'Fitur Pelacakan Berjalan',
          requestPermissions: true,
          stale: false,
          distanceFilter: 0,   // Max sensitivity (update even if tiny movement)
          interval: 60000,     // 60s
          fastestInterval: 30000, // 30s
        },
        async (location, error) => {
          if (error) {
            console.error('[BgTracking] Geolocation Error:', error);
            this.saveSyncStatus('error', error.message || 'GPS Error');
            return;
          }

          if (location) {
            // Map plugin bearing to heading for GpsService consistency
            location.heading = location.bearing;
            await this._onLocationUpdate(location);
          }
        }
      );
      }

      console.log('[BgTracking] Started with ID:', watcherId);
      this.saveSyncStatus('active', 'Memulai pelacakan...');
      this._updatePersistentNotification(); 
    } catch (err) {
      console.error('[BgTracking] Failed to start:', err);
      this.saveSyncStatus('error', err.message);
      throw err;
    }
  },

  /**
   * Stop background services
   */
  async stop() {
    if (watcherId && BackgroundGeolocation) {
      await BackgroundGeolocation.removeWatcher({ id: watcherId });
      watcherId = null;
    }
    this.saveSyncStatus('inactive', 'Pelacakan dimatikan');
    console.log('[BgTracking] Stopped');
  },

  /**
   * Handle location update and check for tasks
   */
  async _onLocationUpdate(location) {
    const employeeId = Auth.getEmployeeNumericId();
    if (!employeeId) {
      console.warn('[BgTracking] No valid employee ID found');
      return;
    }

    // A. Update Location to Server
    try {
      await GpsService.updateLocation(location, employeeId);
      this._updatePersistentNotification('GPS Aktif & Sinkron');
      this.saveSyncStatus('success', 'Lokasi berhasil terkirim');
    } catch (e) {
      console.warn('[BgTracking] Location Sync Failed:', e);
      this._updatePersistentNotification('GPS Aktif - Offline');
      this.saveSyncStatus('warning', `Koneksi gagal: ${e.message}`);
    }

    // B. Periodic Task Check (Every 5 mins)
    const now = Date.now();
    if (now - lastTaskCheckTime >= TASK_CHECK_INTERVAL) {
      lastTaskCheckTime = now;
      await this._checkForNewTasks();
    }
  },

  /**
   * Fetch tasks and notify if there are new ones
   */
  async _checkForNewTasks() {
    try {
      console.log('[BgTracking] Checking for new tasks...');
      const response = await TasksService.getTasks({ status: 'pending' });
      const tasks = response.data || [];
      
      if (tasks.length > 0) {
        // Compare with last known task count or ID to avoid duplicate notifications
        const lastSeenCount = parseInt(localStorage.getItem('natra_last_task_count') || '0');
        
        if (tasks.length > lastSeenCount && LocalNotifications) {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: 'Tugas Baru Tersedia!',
                body: `Ada ${tasks.length} tugas pending yang menunggu Anda.`,
                id: 101,
                schedule: { at: new Date(Date.now() + 1000) },
                sound: 'default',
                actionTypeId: '',
                extra: null,
              },
            ],
          });
        }
        localStorage.setItem('natra_last_task_count', tasks.length.toString());
      }
    } catch (e) {
      console.error('[BgTracking] Task check failed:', e);
    }
  },

  /**
   * Helper to save sync status for Dashboard display
   */
  saveSyncStatus(status, message) {
    const syncData = {
      status, // 'success' | 'error' | 'warning' | 'active'
      message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('natra_bg_sync_status', JSON.stringify(syncData));
    
    // Dispatch event to notify Dashboard if it's open
    window.dispatchEvent(new CustomEvent('natra-sync-update', { detail: syncData }));
  },

  /**
   * Update the persistent notification text (Native only)
   */
  _updatePersistentNotification(status = 'GPS Aktif') {
    const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
    // console.log logic remains for dev
    console.log(`[BgTracking] Status: ${status}, Time: ${elapsedMinutes}m`);
  }
};
