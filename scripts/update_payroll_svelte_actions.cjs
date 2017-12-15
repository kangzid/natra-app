const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
let content = fs.readFileSync(payrollPage, 'utf8');

// 1. Ensure Download is imported from lucide-svelte
if (!content.includes('Download,')) {
    content = content.replace('RefreshCw', 'RefreshCw,\n        Download');
}

// 2. Add downloadBatchReport and downloadIndividualSlip functions
const helperFuncs = `    function downloadBatchReport(payrollId: number) {
        if (!payrollId) return;
        const url = \`\${PUBLIC_API_URL}/hris/payrolls/\${payrollId}/batch-report?token=\${data.token}\`;
        window.open(url, '_blank');
    }

    function downloadIndividualSlip(slipId: number) {
        if (!slipId) return;
        const url = \`\${PUBLIC_API_URL}/hris/payrolls/payslips/\${slipId}/download-pdf?token=\${data.token}\`;
        window.open(url, '_blank');
    }
`;

if (!content.includes('function downloadBatchReport')) {
    content = content.replace('function openSlipPreview(slip: any) {', helperFuncs + '\n    function openSlipPreview(slip: any) {');
}

// 3. In the Batch Detail table: update action cell for each employee slip row
const oldActionCell = `<td class="px-3 py-3 text-right whitespace-nowrap">
                                    <button 
                                        onclick={() => openSlipPreview(slip)}
                                        class="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                        title="Preview Slip Individual"
                                    >
                                        <Eye class="w-4 h-4" />
                                    </button>
                                </td>`;

const newActionCell = `<td class="px-3 py-3 text-right whitespace-nowrap">
                                    <div class="flex items-center justify-end gap-1.5">
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
                                    </div>
                                </td>`;

content = content.replace(oldActionCell, newActionCell);

// 4. In the Batch Detail footer: update button to download batch report
const oldFooterActions = `<div class="flex items-center gap-2">
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

const newFooterActions = `<div class="flex items-center gap-2">
                    <button 
                        onclick={() => downloadBatchReport(activePayroll.id)}
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold transition-colors shadow-xs cursor-pointer"
                        title="Unduh rekapitulasi seluruh slip gaji karyawan dalam batch ini"
                    >
                        <Download class="w-4 h-4" /> Unduh Seluruh Slip (Laporan Batch)
                    </button>
                    {#if activePayroll.status !== 'published'}
                        <button 
                            onclick={() => handlePublishPayroll(activePayroll.id)}
                            class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <Send class="w-3.5 h-3.5" /> Publish Batch Ini
                        </button>
                    {/if}
                    <button 
                        onclick={() => isDetailModalOpen = false} 
                        class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>`;

content = content.replace(oldFooterActions, newFooterActions);

// Also replace the simpler fallback if present
const simplerFooter = `<div class="flex items-center gap-2">
                    {#if activePayroll.status !== 'published'}
                        <button 
                            onclick={() => handlePublishPayroll(activePayroll.id)}
                            class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-xs font-semibold transition-colors"
                        >
                            <Send class="w-3.5 h-3.5" /> Publish Batch Ini
                        </button>
                    {/if}
                    <button 
                        onclick={() => isDetailModalOpen = false}
                        class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted"
                    >
                        Tutup
                    </button>
                </div>`;

content = content.replace(simplerFooter, newFooterActions);

// 5. In the Individual Slip Preview modal: update buttons
const oldPreviewModalFooter = `<div class="flex items-center justify-between pt-2">
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
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-xs font-medium transition-colors"
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

const newPreviewModalFooter = `<div class="flex items-center justify-between pt-3 border-t border-border">
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

content = content.replace(oldPreviewModalFooter, newPreviewModalFooter);

fs.writeFileSync(payrollPage, content, 'utf8');
console.log('Updated payroll page with interactive download buttons and token routing!');
