const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPagePath = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
let content = fs.readFileSync(payrollPagePath, 'utf8');

// 1. In Batch Detail Modal footer: Add button to download batch report
const oldBatchFooter = `                <div class="flex items-center gap-2">
                    {#if activePayroll.status !== 'published'}
                        <button 
                            onclick={() => handlePublishPayroll(activePayroll.id)}
                            class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-xs font-semibold transition-colors"
                        >
                            <CheckCircle2 class="w-4 h-4" /> Publish Slip Gaji ke Karyawan
                        </button>
                    {/if}
                    <button 
                        onclick={() => isDetailModalOpen = false} 
                        class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted"
                    >
                        Tutup
                    </button>
                </div>`;

const newBatchFooter = `                <div class="flex items-center gap-2">
                    {#if activePayroll.status === 'published'}
                        <a 
                            href="{PUBLIC_API_URL}/hris/payrolls/{activePayroll.id}/batch-report" 
                            target="_blank"
                            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold transition-colors shadow-xs"
                        >
                            <Download class="w-4 h-4" /> Unduh Laporan Batch Lengkap
                        </a>
                    {/if}
                    {#if activePayroll.status !== 'published'}
                        <button 
                            onclick={() => handlePublishPayroll(activePayroll.id)}
                            class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-xs font-semibold transition-colors"
                        >
                            <CheckCircle2 class="w-4 h-4" /> Publish Slip Gaji ke Karyawan
                        </button>
                    {/if}
                    <button 
                        onclick={() => isDetailModalOpen = false} 
                        class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted"
                    >
                        Tutup
                    </button>
                </div>`;

if (content.includes(oldBatchFooter)) {
    content = content.replace(oldBatchFooter, newBatchFooter);
    console.log('Added batch report download button to payroll/+page.svelte!');
}

// 2. In Individual Slip Preview Modal: Update Print / Download button
const oldSlipFooter = `            <div class="flex items-center justify-between pt-2">
                <button 
                    onclick={() => window.print()}
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-xs font-medium transition-colors"
                >
                    <Printer class="w-3.5 h-3.5" /> Cetak Slip
                </button>
                <button 
                    onclick={() => isSlipPreviewModalOpen = false} 
                    class="px-4 py-1.5 border border-input rounded-md text-xs font-medium hover:bg-muted"
                >
                    Tutup
                </button>
            </div>`;

const newSlipFooter = `            <div class="flex items-center justify-between pt-2">
                <div class="flex items-center gap-2">
                    <a 
                        href="{PUBLIC_API_URL}/hris/payrolls/payslips/{activeSlip.id}/download-pdf" 
                        target="_blank"
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold transition-colors shadow-xs"
                    >
                        <Download class="w-3.5 h-3.5" /> Unduh Dokumen Resmi
                    </a>
                    <button 
                        onclick={() => window.print()}
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-xs font-medium transition-colors"
                    >
                        <Printer class="w-3.5 h-3.5" /> Cetak
                    </button>
                </div>
                <button 
                    onclick={() => isSlipPreviewModalOpen = false} 
                    class="px-4 py-1.5 border border-input rounded-md text-xs font-medium hover:bg-muted"
                >
                    Tutup
                </button>
            </div>`;

if (content.includes(oldSlipFooter)) {
    content = content.replace(oldSlipFooter, newSlipFooter);
    console.log('Added individual slip PDF download button to payroll/+page.svelte!');
}

fs.writeFileSync(payrollPagePath, content, 'utf8');
console.log('Updated payroll/+page.svelte successfully!');
