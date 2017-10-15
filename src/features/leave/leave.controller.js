/**
 * Leave Controller
 */
class LeaveController {
  constructor() {
    this.init();
  }

  init() {
    console.log('Leave Controller Initialized');
    if (window.lucide) {
      window.lucide.createIcons();
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    const applyBtn = document.querySelector('button.bg-primary-600');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        applyBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span class="font-bold">Mengajukan...</span>';
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
          alert('Pengajuan cuti berhasil dikirim ke HRD!');
          applyBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> <span class="font-bold">Ajukan Cuti</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 1500);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LeaveController();
});
