/**
 * Assets Controller
 */
class AssetsController {
  constructor() {
    this.init();
  }

  init() {
    console.log('Assets Controller Initialized');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AssetsController();
});
