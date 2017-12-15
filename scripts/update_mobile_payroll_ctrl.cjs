const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const payrollCtrlPath = path.join(mobileDir, 'src/features/payroll/payroll.controller.js');
let content = fs.readFileSync(payrollCtrlPath, 'utf8');

// 1. Update deductions container in payroll.controller.js
const oldDeductionsBlock = `      deductionsContainer.innerHTML = \`
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="badge-dollar-sign" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Potongan Pinjaman / Kasbon</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Cicilan Kasbon Aktif</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 flex-shrink-0 ml-3">- Rp \${new Intl.NumberFormat('id-ID').format(loanDed)}</p>
        </div>`;

const newDeductionsBlock = `      const absenceDed = parseFloat(slip.absence_deductions || 0);

      deductionsContainer.innerHTML = \`
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="badge-dollar-sign" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Potongan Pinjaman / Kasbon</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Cicilan Kasbon Aktif</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 flex-shrink-0 ml-3">- Rp \${new Intl.NumberFormat('id-ID').format(loanDed)}</p>
        </div>

        \${absenceDed > 0 ? \`
        <div class="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 transition-colors">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="calendar-x-2" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">Potongan Kehadiran / Unpaid Leave</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Izin Tidak Masuk Tanpa Upah</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 flex-shrink-0 ml-3">- Rp \${new Intl.NumberFormat('id-ID').format(absenceDed)}</p>
        </div>\` : ''}`;

if (content.includes(oldDeductionsBlock)) {
    content = content.replace(oldDeductionsBlock, newDeductionsBlock);
    console.log('Added absence_deductions row to mobile payroll.controller.js!');
}

// 2. Update setupEventListeners to trigger PDF download
const oldSetupListeners = `  setupEventListeners() {
    const downloadBtn = document.getElementById('btn-download-slip');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        downloadBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span>Menyiapkan PDF...</span>';
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
          showAlert('Slip Gaji Terunduh', 'Dokumen PDF slip gaji resmi telah siap dan tersimpan di perangkat Anda.');
          downloadBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> <span>Unduh Slip Gaji (PDF)</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 1500);
      });
    }
  }`;

const newSetupListeners = `  setupEventListeners() {
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
        const downloadUrl = \`\${apiUrl}/hris/payrolls/payslips/\${slip.id}/download-pdf\`;
        
        window.open(downloadUrl, '_blank');

        setTimeout(() => {
          downloadBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> <span>Unduh Slip Gaji (PDF)</span>';
          if (window.lucide) window.lucide.createIcons();
        }, 1000);
      });
    }
  }`;

// Save slip in state
content = content.replace(
    'this.renderPayslipDetails(slip, user, employee);',
    'this._currentSlip = slip;\n    this.renderPayslipDetails(slip, user, employee);'
);

if (content.includes(oldSetupListeners)) {
    content = content.replace(oldSetupListeners, newSetupListeners);
    console.log('Updated download button listener to trigger real PDF stream download in mobile!');
}

fs.writeFileSync(payrollCtrlPath, content, 'utf8');
console.log('Updated payroll.controller.js successfully!');

// Copy to www if exists
const wwwPath = path.join(mobileDir, 'www/src/features/payroll/payroll.controller.js');
if (fs.existsSync(wwwPath)) {
    fs.writeFileSync(wwwPath, content, 'utf8');
}
