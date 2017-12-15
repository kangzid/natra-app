(function () {
  try {
    const savedTheme = localStorage.getItem('theme');
    // Default to 'light' instead of dark or system preference unless explicitly set to dark
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (!savedTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
  } catch (e) {
    document.documentElement.classList.remove('dark');
  }
})();
