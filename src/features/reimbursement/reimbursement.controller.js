/**
 * Reimbursement Controller
 */
class ReimbursementController {
  constructor() {
    this.init();
  }

  init() {
    console.log('Reimbursement Controller Initialized');
    if (window.lucide) {
      window.lucide.createIcons();
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    const submitBtn = document.getElementById('btn-submit-reimbursement');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span class="font-extrabold">Verifikasi Nota...</span>';
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
          alert('Pengajuan reimbursement Anda telah dikirim. Kami akan memverifikasi nota Anda dalam 1-2 hari kerja.');
          submitBtn.innerHTML = originalContent;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ReimbursementController();
});
