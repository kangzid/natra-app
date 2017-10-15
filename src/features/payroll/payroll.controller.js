/**
 * Payroll Controller
 * Handles UI logic for the payroll information page.
 */
class PayrollController {
  constructor() {
    this.init();
  }

  init() {
    console.log('Payroll Controller Initialized');
    // Ensure icons are rendered
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    const downloadBtn = document.querySelector('button.bg-slate-800');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        // Animation feedback
        downloadBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span class="font-bold">Menyiapkan PDF...</span>';
        if (window.lucide) window.lucide.createIcons();
        
        setTimeout(() => {
          alert('Slip gaji berhasil diunduh (Simulasi PDF)');
          downloadBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> <span class="font-bold">Unduh Slip Gaji (PDF)</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PayrollController();
});
