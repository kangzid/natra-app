const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
let pageContent = fs.readFileSync(payrollPage, 'utf8');

const oldPotongan = `                    {#if Number(activeSlip.loan_deductions || 0) > 0}
                        <div class="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                            <span>Potongan Pinjaman / Kasbon:</span>
                            <span class="font-mono">- Rp {Number(activeSlip.loan_deductions).toLocaleString('id-ID')}</span>
                        </div>
                    {/if}`;

const newPotongan = `                    {#if Number(activeSlip.loan_deductions || 0) > 0}
                        <div class="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                            <span>Potongan Pinjaman / Kasbon:</span>
                            <span class="font-mono">- Rp {Number(activeSlip.loan_deductions).toLocaleString('id-ID')}</span>
                        </div>
                    {/if}
                    {#if Number(activeSlip.absence_deductions || 0) > 0}
                        <div class="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                            <span>Potongan Kehadiran / Unpaid Leave:</span>
                            <span class="font-mono">- Rp {Number(activeSlip.absence_deductions).toLocaleString('id-ID')}</span>
                        </div>
                    {/if}`;

if (pageContent.includes(oldPotongan)) {
    pageContent = pageContent.replace(oldPotongan, newPotongan);
    fs.writeFileSync(payrollPage, pageContent, 'utf8');
    console.log('Updated payroll/+page.svelte modal with absence_deductions row!');
} else {
    console.log('Could not find oldPotongan pattern in payroll/+page.svelte');
}
