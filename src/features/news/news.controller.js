/**
 * News Controller
 */
class NewsController {
  constructor() {
    this.init();
  }

  init() {
    console.log('News Controller Initialized');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NewsController();
});
