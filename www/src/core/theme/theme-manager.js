export const ThemeManager = {
  init() {
    const isDark = this.isDark();
    this.setTheme(isDark);
  },

  isDark() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Fallback to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  setTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  },

  toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    this.setTheme(!isDark);
    return !isDark;
  }
};
