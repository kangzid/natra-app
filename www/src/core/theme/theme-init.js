/**
 * Theme Initialization Script
 * Must be loaded synchronously in the <head> to prevent FOUC (Flash of Unstyled Content)
 */
(function() {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Ignore errors for SSR or if localStorage is blocked
  }
})();
