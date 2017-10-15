/**
 * NATRA Mobile - GPS Service
 * Handles geolocation and location update API calls
 */

import { ApiClient } from '../../core/api/api-client.js';

const GpsService = {
  /**
   * Get current device position
   * Uses Capacitor Geolocation if available, falls back to browser API
   * @returns {Promise<GeolocationCoordinates>}
   */
  async getCurrentPosition() {
    // Capacitor native platform check
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        const Geolocation = window.Capacitor.Plugins.Geolocation;
        if (!Geolocation) throw new Error('Plugin Geolocation tidak terdeteksi via Global Capacitor');
        
        // Check and request permissions
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            throw new Error('Izin lokasi ditolak. Buka pengaturan HP Anda.');
          }
        }

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000, // 20 seconds for cold-start GPS
          maximumAge: 0
        });
        return pos.coords;
      } catch (e) {
        let msg = 'Gagal memuat GPS.';
        if (e.message?.toLowerCase().includes('timeout')) msg = 'Sinyal GPS lemah (Timeout). Coba ke jendela/luar.';
        if (e.message?.toLowerCase().includes('denied')) msg = 'Izin lokasi diblokir sistem.';
        if (e.message?.toLowerCase().includes('disabled')) msg = 'GPS HP non-aktif. Mohon nyalakan.';
        
        console.error('[GpsService] Native Error:', e);
        throw new Error(msg + ' (' + (e.message || 'Unknown Native Error') + ')');
      }
    }

    // Browser geolocation fallback (Web Dev Mode)
    return new Promise((resolve, reject) => {
      // Logic for developers/browsers
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isInsecure = !window.isSecureContext && !isLocal;
      
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation tidak didukung browser ini.'));
      }

      // Proactive prompt: Tetap coba minta izin dulu
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => {
          // Fallback ke Jogja hanya jika ga bisa dapet koordinat asli
          if (isLocal || isInsecure || err.code === err.PERMISSION_DENIED) {
            console.warn(`[GpsService] Menggunakan Mock Jogja karena: ${err.message}`);
            resolve({ latitude: -7.7956, longitude: 110.3695, accuracy: 10 });
          } else {
            reject(new Error(`Browser GPS Error: ${err.message}`));
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  },

  /**
   * Send location update to backend
   * POST /locations
   * @param {object} coords - GeolocationCoordinates-like object
   * @param {number} employeeId - numeric employee ID
   */
  async updateLocation(coords, employeeId) {
    const body = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: coords.speed ?? null,
      heading: coords.heading ?? null,
      accuracy: coords.accuracy ?? null,
      altitude: coords.altitude ?? null,
      trackable_type: 'employee',
      trackable_id: employeeId,
    };
    return ApiClient.post('/locations', body);
  },

  /**
   * Share location link
   * POST /locations/share
   * @param {number} durationMinutes
   */
  async shareLocation(durationMinutes = 60) {
    return ApiClient.post('/locations/share', { duration_minutes: durationMinutes });
  },
};

export { GpsService };
