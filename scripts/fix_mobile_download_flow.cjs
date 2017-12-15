const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const payrollCtrlPath = path.join(mobileDir, 'src/features/payroll/payroll.controller.js');
let ctrlContent = fs.readFileSync(payrollCtrlPath, 'utf8');

// 1. Ensure this._currentSlip and this._currentPayroll are set inside renderPayslip
const oldRenderHead = `  renderPayslip(payroll, slip, user, employee) {
    // 1. Period in header`;

const newRenderHead = `  renderPayslip(payroll, slip, user, employee) {
    this._currentSlip = slip;
    this._currentPayroll = payroll;
    // 1. Period in header`;

ctrlContent = ctrlContent.replace(oldRenderHead, newRenderHead);

// 2. Ensure setupEventListeners properly checks slip and triggers download
const oldListeners = `  setupEventListeners() {
    const downloadBtn = document.getElementById('btn-download-slip');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const slip = this._currentSlip;
        if (!slip || !slip.id) {
          showAlert('Informasi', 'Slip gaji belum tersedia untuk periode ini.');
          return;
        }

        if (slip.status !== 'published') {
          showAlert('Menunggu Publikasi', 'Slip gaji Anda masih dalam proses verifikasi oleh HRD dan belum dipublikasikan.');
          return;
        }

        downloadBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span>Membuka Dokumen...</span>';
        if (window.lucide) window.lucide.createIcons();

        const apiUrl = window.ENV?.API_URL || 'http://127.0.0.1:8000/api';
        const token = localStorage.getItem('token') || '';
        const downloadUrl = \`\${apiUrl}/hris/payrolls/payslips/\${slip.id}/download-pdf?token=\${token}\`;
        
        window.open(downloadUrl, '_blank');

        setTimeout(() => {
          downloadBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> <span>Unduh Slip Gaji (PDF)</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 1000);
      });
    }
  }`;

const newListeners = `  setupEventListeners() {
    const downloadBtn = document.getElementById('btn-download-slip');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const slip = this._currentSlip;
        const payroll = this._currentPayroll;

        if (!slip || !slip.id) {
          showAlert('Informasi', 'Slip gaji belum tersedia untuk periode ini.');
          return;
        }

        const isPublished = slip.status === 'published' || payroll?.status === 'published';
        if (!isPublished) {
          showAlert('Menunggu Publikasi', 'Slip gaji Anda masih dalam proses verifikasi oleh HRD dan belum dipublikasikan.');
          return;
        }

        downloadBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span>Membuka Dokumen...</span>';
        if (window.lucide) window.lucide.createIcons();

        const apiUrl = window.ENV?.API_URL || 'http://127.0.0.1:8000/api';
        const token = localStorage.getItem('token') || '';
        const downloadUrl = \`\${apiUrl}/hris/payrolls/payslips/\${slip.id}/download-pdf?token=\${token}\`;
        
        window.open(downloadUrl, '_blank');

        setTimeout(() => {
          downloadBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> <span>Unduh Slip Gaji (PDF)</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 1000);
      });
    }
  }`;

ctrlContent = ctrlContent.replace(/setupEventListeners\(\)[\s\S]*?\n  \}/, newListeners.trim());

fs.writeFileSync(payrollCtrlPath, ctrlContent, 'utf8');
console.log('Fixed this._currentSlip and download listener in mobile payroll.controller.js!');

const wwwPath = path.join(mobileDir, 'www/src/features/payroll/payroll.controller.js');
if (fs.existsSync(wwwPath)) {
    fs.writeFileSync(wwwPath, ctrlContent, 'utf8');
}
