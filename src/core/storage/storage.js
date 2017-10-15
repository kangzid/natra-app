/**
 * NATRA Mobile - Storage Module
 * Wrapper for localStorage with type-safe getters/setters
 */

const KEYS = {
  TOKEN: 'natra_token',
  USER: 'natra_user',
  EMPLOYEE: 'natra_employee',
  TRACKING_ACTIVE: 'natra_tracking_active',
};

const Storage = {
  /**
   * Set a value in localStorage (auto JSON.stringify for objects)
   */
  set(key, value) {
    try {
      const data = typeof value === 'object' ? JSON.stringify(value) : String(value);
      localStorage.setItem(key, data);
    } catch (e) {
      console.error('[Storage] set error:', e);
    }
  },

  /**
   * Get a value from localStorage (auto JSON.parse)
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (e) {
      console.error('[Storage] get error:', e);
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },

  // --- Typed helpers ---

  getToken() {
    return this.get(KEYS.TOKEN);
  },

  setToken(token) {
    this.set(KEYS.TOKEN, token);
  },

  getUser() {
    return this.get(KEYS.USER);
  },

  setUser(user) {
    this.set(KEYS.USER, user);
  },

  getEmployee() {
    return this.get(KEYS.EMPLOYEE);
  },

  setEmployee(emp) {
    this.set(KEYS.EMPLOYEE, emp);
  },

  isTrackingActive() {
    return this.get(KEYS.TRACKING_ACTIVE) === true;
  },

  setTrackingActive(value) {
    this.set(KEYS.TRACKING_ACTIVE, value);
  },
};

export { Storage, KEYS };
