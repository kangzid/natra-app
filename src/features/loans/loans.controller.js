/**
 * Loans Controller
 */
class LoansController {
  constructor() {
    this.init();
  }

  init() {
    console.log('Loans Controller Initialized');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LoansController();
});
