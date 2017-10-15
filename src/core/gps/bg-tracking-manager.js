/**
 * NATRA Mobile - Background Tracking Manager
 * Manages foreground service for GPS and periodic background task checking
 */

import { GpsService } from '../../features/gps/gps.service.js';
import { TasksService } from '../../features/tasks/tasks.service.js';
import { Storage } from '../storage/storage.js';

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
          distanceFilter: 10, // Update every 10 meters
        },
        async (location, error) => {
          if (error) {
            console.error('[BgTracking] Geolocation Error:', error);
            return;
          }

          if (location) {
            await this._onLocationUpdate(location);
          }
        }
      );
      }

      console.log('[BgTracking] Started with ID:', watcherId);
      this._updatePersistentNotification(); // Initial update
    } catch (err) {
      console.error('[BgTracking] Failed to start:', err);
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
    console.log('[BgTracking] Stopped');
  },

  /**
   * Handle location update and check for tasks
   */
  async _onLocationUpdate(location) {
    const employee = Storage.getUser();
    if (!employee) return;

    // A. Update Location to Server
    try {
      await GpsService.updateLocation(location, employee.id);
      this._updatePersistentNotification('GPS Aktif & Sinkron');
    } catch (e) {
      console.warn('[BgTracking] Location Sync Failed:', e);
      this._updatePersistentNotification('GPS Aktif - Offline');
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
   * Update the persistent notification text
   */
  _updatePersistentNotification(status = 'GPS Aktif') {
    const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
    // Note: The plugin automatically updates the notification if we re-configure, 
    // but the backgroundMessage/Title are usually set at start.
    // Periodic UI updates in background on Android are tricky; 
    // for now we focus on the core requirement.
    console.log(`[BgTracking] Status: ${status}, Time: ${elapsedMinutes}m`);
  }
};
