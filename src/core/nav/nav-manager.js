/**
 * NATRA Mobile - Navigation Manager
 * Handles hardware back button behavior and app lifecycle
 */

const getPlugins = () => window.Capacitor?.Plugins || {};
const App = getPlugins().App;

// App configuration
const CONFIG = {
  HOME_PATH: 'dashboard.html',
  LOGIN_PATH: 'login.html', // index.html often redirects here
  SPLASH_PATH: 'index.html'
};

const NavManager = {
  /**
   * Initialize hardware back button listener
   */
  async init() {
    if (!App) {
      console.warn('[NavManager] App plugin not available');
      return;
    }

    console.log('[NavManager] Initializing hardware back button listener');

    await App.addListener('backButton', async (data) => {
      const path = window.location.pathname;
      const fileName = path.split('/').pop() || 'index.html';

      console.log('[NavManager] Back button pressed on:', fileName);

      // 1. If on Dashboard or Root, exit app (minimized to background on Android)
      if (fileName === CONFIG.HOME_PATH || fileName === CONFIG.SPLASH_PATH || fileName === CONFIG.LOGIN_PATH) {
        console.log('[NavManager] Exiting app...');
        await App.exitApp();
        return;
      }

      // 2. Default: Go to Dashboard
      console.log('[NavManager] Navigating to Dashboard');
      window.location.href = CONFIG.HOME_PATH;
    });
  }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  NavManager.init();
});

export { NavManager };
