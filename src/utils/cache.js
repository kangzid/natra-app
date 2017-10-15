/**
 * NATRA Mobile - Cache Utility
 * Simple wrapper for localStorage with TTL (Time To Live)
 */

const CACHE_PREFIX = 'natra_cache_';

export const Cache = {
  /**
   * Set cache with TTL
   * @param {string} key 
   * @param {any} data 
   * @param {number} ttlMinutes Default 5 minutes
   */
  set(key, data, ttlMinutes = 5) {
    try {
      const entry = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (ttlMinutes * 60 * 1000)
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      console.error('[Cache] set error:', e);
    }
  },

  /**
   * Get cache data
   * @param {string} key 
   * @returns {any|null}
   */
  get(key) {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const entry = JSON.parse(item);
      return entry.data;
    } catch (e) {
      console.error('[Cache] get error:', e);
      return null;
    }
  },

  /**
   * Check if cache is still valid (not expired)
   * @param {string} key 
   * @returns {boolean}
   */
  isValid(key) {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return false;

      const entry = JSON.parse(item);
      return Date.now() < entry.expiry;
    } catch (e) {
      return false;
    }
  },

  /**
   * Remove specific cache
   */
  remove(key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  },

  /**
   * Clear all natra caches
   */
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};
