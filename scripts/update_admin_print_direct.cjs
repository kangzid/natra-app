const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
let content = fs.readFileSync(payrollPage, 'utf8');

// 1. Add printIndividualSlip function
const oldHelperFuncs = `    function downloadBatchReport(payrollId: number) {
        if (!payrollId) return;
        const url = \`\${PUBLIC_API_URL}/hris/payrolls/\${payrollId}/batch-report?token=\${data.token}\`;
        window.open(url, '_blank');
    }

    function downloadIndividualSlip(slipId: number) {
        if (!slipId) return;
        const url = \`\${PUBLIC_API_URL}/hris/payrolls/payslips/\${slipId}/download-pdf?token=\${data.token}\`;
        window.open(url, '_blank');
    }`;

const newHelperFuncs = `    function downloadBatchReport(payrollId: number) {
        if (!payrollId) return;
        const url = \`\${PUBLIC_API_URL}/hris/payrolls/\${payrollId}/batch-report?token=\${data.token}\`;
        window.open(url, '_blank');
    }

    function downloadIndividualSlip(slipId: number) {
        if (!slipId) return;
        const url = \`\${PUBLIC_API_URL}/hris/payrolls/payslips/\${slipId}/download-pdf?token=\${data.token}\`;
        window.open(url, '_blank');
    }

    function printIndividualSlip(slipId: number) {
        if (!slipId) return;
        const url = \`\${PUBLIC_API_URL}/hris/payrolls/payslips/\${slipId}/download-pdf?token=\${data.token}\`;
        const printWin = window.open(url, '_blank');
        if (printWin) {
            printWin.focus();
        }
    }`;

if (content.includes(oldHelperFuncs)) {
    content = content.replace(oldHelperFuncs, newHelperFuncs);
}

// 2. Update Action cell in Batch Detail Table to have Eye, Printer, and Download
const oldActionCell = `<div class="flex items-center justify-end gap-1.5">
                                        <button 
                                            onclick={() => openSlipPreview(slip)}
                                            class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                            title="Lihat Detail Slip"
                                        >
                                            <Eye class="w-4 h-4" />
                                        </button>
                                        <button 
                                            onclick={() => downloadIndividualSlip(slip.id)}
                                            class="p-1.5 rounded hover:bg-muted text-primary hover:text-primary/80 transition-colors"
                                            title="Unduh Slip Gaji (PDF)"
                                        >
                                            <Download class="w-4 h-4" />
                                        </button>
                                    </div>`;

const newActionCell = `<div class="flex items-center justify-end gap-1">
                                        <button 
                                            onclick={() => openSlipPreview(slip)}
                                            class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            title="Lihat Detail Slip Karyawan"
                                        >
                                            <Eye class="w-4 h-4" />
                                        </button>
                                        <button 
                                            onclick={() => printIndividualSlip(slip.id)}
                                            class="p-1.5 rounded hover:bg-muted text-slate-700 dark:text-slate-300 hover:text-foreground transition-colors cursor-pointer"
                                            title="Cetak Slip Resmi"
                                        >
                                            <Printer class="w-4 h-4" />
                                        </button>
                                        <button 
                                            onclick={() => downloadIndividualSlip(slip.id)}
                                            class="p-1.5 rounded hover:bg-muted text-primary hover:text-primary/80 transition-colors cursor-pointer"
                                            title="Unduh Dokumen Slip Resmi"
                                        >
                                            <Download class="w-4 h-4" />
                                        </button>
                                    </div>`;

content = content.replace(oldActionCell, newActionCell);

// 3. Update Preview Modal footer: Direct Print & Direct Download of the official document
const oldModalFooter = `<div class="flex items-center justify-between pt-3 border-t border-border">
                <div class="flex items-center gap-2">
                    <button 
                        onclick={() => downloadIndividualSlip(activeSlip.id)}
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                        <Download class="w-4 h-4" /> Unduh Slip Gaji (PDF)
                    </button>
                    <button 
                        onclick={() => window.print()}
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                        <Printer class="w-3.5 h-3.5" /> Cetak
                    </button>
                </div>
                <button 
                    onclick={() => isSlipPreviewModalOpen = false} 
                    class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted cursor-pointer"
                >
                    Tutup
                </button>
            </div>`;

const newModalFooter = `<div class="flex items-center justify-between pt-3 border-t border-border">
                <div class="flex items-center gap-2">
                    <button 
                        onclick={() => printIndividualSlip(activeSlip.id)}
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                        <Printer class="w-4 h-4" /> Cetak Slip Resmi
                    </button>
                    <button 
                        onclick={() => downloadIndividualSlip(activeSlip.id)}
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <Download class="w-3.5 h-3.5" /> Unduh Dokumen (PDF)
                    </button>
                </div>
                <button 
                    onclick={() => isSlipPreviewModalOpen = false} 
                    class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted cursor-pointer"
                >
                    Tutup
                </button>
            </div>`;

content = content.replace(oldModalFooter, newModalFooter);

fs.writeFileSync(payrollPage, content, 'utf8');
console.log('Successfully updated print and download triggers in admin payroll page!');
