const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const cutiPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.svelte');
let cutiContent = fs.readFileSync(cutiPath, 'utf8');

// Update line 265 in table:
cutiContent = cutiContent.replace(
    '<td class="px-4 py-3.5 font-mono text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{bal.remaining} Hari</td>',
    '<td class="px-4 py-3.5 font-mono text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{Math.max(0, (bal.quota || 0) - (bal.used || 0))} Hari</td>'
);

// In handleSaveBalance, ensure state updates correctly
const oldSaveBalance = `            if (res.ok) {
                const updated = await res.json();
                leaveBalances = leaveBalances.map((b: any) => b.id === activeBalance.id ? { ...b, quota: editQuota, used: editUsed } : b);
                isEditBalanceModalOpen = false;
            }`;

const newSaveBalance = `            if (res.ok) {
                const updated = await res.json();
                const remaining = Math.max(0, editQuota - editUsed);
                leaveBalances = leaveBalances.map((b: any) => b.id === activeBalance.id ? { ...b, quota: editQuota, used: editUsed, remaining } : b);
                isEditBalanceModalOpen = false;
            }`;

if (cutiContent.includes(oldSaveBalance)) {
    cutiContent = cutiContent.replace(oldSaveBalance, newSaveBalance);
}

fs.writeFileSync(cutiPath, cutiContent, 'utf8');
console.log('Updated pengaturan-cuti/+page.svelte table and state update!');
