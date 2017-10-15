/**
 * Permission Controller
 */
class PermissionController {
  constructor() {
    this.init();
  }

  init() {
    console.log('Permission Controller Initialized');
    if (window.lucide) {
      window.lucide.createIcons();
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    const sendBtn = document.querySelector('button.bg-primary-600');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        sendBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span class="font-bold">Mengirim...</span>';
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
          alert('Permohonan izin Anda telah dikirim. Mohon tunggu persetujuan admin.');
          sendBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> <span class="font-bold">Kirim Permohonan</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 1500);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PermissionController();
});
