const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const profileHtmlPath = path.join(mobileDir, 'pages/profile.html');
const profileCtrlPath = path.join(mobileDir, 'src/features/profile/profile.controller.js');

// 1. Update profile.html (remove "Mode Hanya Baca (Read-Only)")
let profileHtml = fs.readFileSync(profileHtmlPath, 'utf8');

const targetBadge = `<span class="inline-flex items-center gap-1 text-[9px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
              <i data-lucide="shield-check" class="w-3 h-3"></i> Mode Hanya Baca (Read-Only)
            </span>`;

if (profileHtml.includes(targetBadge)) {
    profileHtml = profileHtml.replace(targetBadge, '');
    fs.writeFileSync(profileHtmlPath, profileHtml, 'utf8');
    console.log('Successfully removed "Mode Hanya Baca (Read-Only)" from profile.html!');
} else {
    // Regex replace in case of whitespace differences
    profileHtml = profileHtml.replace(/<span class="[^"]*">\s*<i data-lucide="shield-check"[^>]*><\/i>\s*Mode Hanya Baca \(Read-Only\)\s*<\/span>/gi, '');
    fs.writeFileSync(profileHtmlPath, profileHtml, 'utf8');
    console.log('Regex removed "Mode Hanya Baca (Read-Only)" from profile.html!');
}

// 2. Update profile.controller.js (fix monthly installment reading)
let profileCtrl = fs.readFileSync(profileCtrlPath, 'utf8');

const oldLoansBlock = `    } else if (tab === 'loans') {
      const loans = data.loans || [];
      html = loans.length > 0 ? loans.map(l => \`
        <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200">Pinjaman Kasbon</span>
            <span class="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-extrabold uppercase border border-amber-100 dark:border-amber-800/40">\${l.status || 'Berjalan'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/40">
              <p class="text-[10px] text-slate-400 font-bold uppercase">Total Pinjaman</p>
              <p class="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">\${formatRupiah(l.amount || 0)}</p>
            </div>
            <div class="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/40">
              <p class="text-[10px] text-slate-400 font-bold uppercase">Cicilan / Bulan</p>
              <p class="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">\${formatRupiah(l.monthly_installment || 0)}</p>
            </div>
          </div>
        </div>
      \`).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Tidak ada pinjaman kasbon aktif.</div>';`;

const newLoansBlock = `    } else if (tab === 'loans') {
      const loans = data.loans || [];
      html = loans.length > 0 ? loans.map(l => {
        const totalAmount = l.amount || l.loan_amount || 0;
        const tenor = l.tenor_months || (l.tenor ? parseInt(l.tenor) : 1);
        const monthly = l.monthly_deduction || l.monthly_installment || (tenor > 0 ? (totalAmount / tenor) : 0);
        return \`
          <div class="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200">Pinjaman Kasbon</span>
                \${l.code ? \`<span class="ml-1.5 text-[10px] font-mono text-slate-400">(\${l.code})</span>\` : ''}
              </div>
              <span class="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-extrabold uppercase border border-amber-100 dark:border-amber-800/40">\${l.status || 'Berjalan'}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/40">
                <p class="text-[10px] text-slate-400 font-bold uppercase">Total Pinjaman</p>
                <p class="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">\${formatRupiah(totalAmount)}</p>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/40">
                <p class="text-[10px] text-slate-400 font-bold uppercase">Cicilan / Bulan</p>
                <p class="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">\${formatRupiah(monthly)}</p>
              </div>
            </div>
            \${l.remaining_amount !== undefined ? \`
              <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                <span>Sisa Saldo Pinjaman:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">\${formatRupiah(l.remaining_amount)}</span>
              </div>
            \` : ''}
          </div>
        \`;
      }).join('') : '<div class="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-800">Tidak ada pinjaman kasbon aktif.</div>';`;

profileCtrl = profileCtrl.replace(oldLoansBlock, newLoansBlock);
fs.writeFileSync(profileCtrlPath, profileCtrl, 'utf8');
console.log('Successfully updated profile.controller.js loans monthly deduction resolution!');
