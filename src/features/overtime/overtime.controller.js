/**
 * Overtime Controller
 */
class OvertimeController {
  constructor() {
    this.init();
  }

  init() {
    console.log('Overtime Controller Initialized');
    if (window.lucide) {
      window.lucide.createIcons();
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    const overtimeBtn = document.getElementById('btn-request-overtime');
    if (overtimeBtn) {
      overtimeBtn.addEventListener('click', () => {
        overtimeBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span class="font-bold">Mengirim Laporan...</span>';
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
          alert('Laporan lembur Anda telah diajukan ke sistem.');
          overtimeBtn.innerHTML = '<i data-lucide="plus" class="w-5 h-5"></i> <span class="font-bold">Ajukan Lembur</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 1500);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OvertimeController();
});
