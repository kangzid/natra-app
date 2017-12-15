const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');
let content = fs.readFileSync(ctrlPath, 'utf8');

// Update downloadBatchReport to always stream inline with proper content-type and headers
const newDownloadBatchReport = `    public function downloadBatchReport($id, Request $request)
    {
        $payroll = HrisPayroll::where('id', $id)
            ->where('tenant_id', $this->getTenantId($request))
            ->with(['payslips.employee.user', 'processor'])
            ->firstOrFail();

        $html = '';
        if (!empty($payroll->report_file_path)) {
            try {
                $decrypted = EncryptedStorageService::getDecrypted($payroll->report_file_path);
                $html = $decrypted['content'];
            } catch (\\Exception $e) {
                // fallback to render
            }
        }

        if (empty($html)) {
            $html = $this->renderProfessionalBatchReportHtml($payroll);
        }

        // Ensure auto-print is included if requested
        if (!str_contains($html, 'window.print()')) {
            $html = str_replace('</body>', "<script>window.addEventListener('DOMContentLoaded', function() { setTimeout(function() { window.print(); }, 400); });</script></body>", $html);
        }

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=utf-8',
            'Content-Disposition' => 'inline; filename="Laporan_Batch_Payroll_' . $payroll->code . '.html"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }`;

content = content.replace(/public function downloadBatchReport\(.*?\)[\s\S]*?\n    \}/, newDownloadBatchReport);

// Also enhance renderProfessionalBatchReportHtml with landscape styling and auto-print
const updatedBatchHtmlRender = `    private function renderProfessionalBatchReportHtml(HrisPayroll $payroll): string
    {
        $slips = $payroll->payslips;
        $totalSlips = $slips->count();
        $totalAmount = (float)$payroll->total_amount;
        $totalAmountFmt = $this->formatNumber($totalAmount);
        $batchCode = htmlspecialchars($payroll->code);
        $batchName = htmlspecialchars($payroll->batch_name ?: ('Periode ' . date('d/m/Y', strtotime($payroll->period_start)) . ' s/d ' . date('d/m/Y', strtotime($payroll->period_end))));
        $status = htmlspecialchars($payroll->status);
        $printDate = date('d F Y, H:i');

        $rowsHtml = '';
        foreach ($slips as $idx => $s) {
            $num = $idx + 1;
            $empName = htmlspecialchars($s->employee?->user?->name ?: '-');
            $empId = htmlspecialchars($s->employee?->employee_id ?: '-');
            $dept = htmlspecialchars($s->employee?->department ?: '-');
            $basic = $this->formatNumber((float)$s->basic_salary);
            $allowances = $this->formatNumber((float)$s->allowances);
            $overtime = $this->formatNumber((float)$s->overtime_pay);
            $loan = $this->formatNumber((float)$s->loan_deductions);
            $absence = $this->formatNumber((float)$s->absence_deductions);
            $net = $this->formatNumber((float)$s->net_salary);

            $rowsHtml .= "
            <tr>
                <td style=\\"text-align: center;\\">{$num}</td>
                <td><b>{$empName}</b><br><span style=\\"font-size: 10px; color: #64748b;\\">{$empId} &bull; {$dept}</span></td>
                <td style=\\"text-align: right; font-family: monospace;\\">Rp {$basic}</td>
                <td style=\\"text-align: right; font-family: monospace; color: #047857;\\">+ Rp {$allowances}</td>
                <td style=\\"text-align: right; font-family: monospace; color: #047857;\\">+ Rp {$overtime}</td>
                <td style=\\"text-align: right; font-family: monospace; color: #b91c1c;\\">- Rp {$loan}</td>
                <td style=\\"text-align: right; font-family: monospace; color: #b91c1c;\\">- Rp {$absence}</td>
                <td style=\\"text-align: right; font-family: monospace; font-weight: 800; color: #0f172a;\\">Rp {$net}</td>
            </tr>";
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi Payroll Batch - {$batchCode}</title>
    <style>
        @page { size: landscape; margin: 10mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
        body { background: #f8fafc; padding: 24px 12px; color: #0f172a; }
        .report-card { max-width: 1100px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: 800; text-transform: uppercase; }
        .meta-box { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
        th { background: #f1f5f9; padding: 10px 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 700; }
        td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
        .total-box { background: #0f172a; color: #ffffff; padding: 14px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700; }
        .top-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; gap: 10px; }
        .btn-action { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; border: none; }
        .btn-action:hover { background: #1d4ed8; }
        @media print { 
            .top-bar, .print-btn { display: none !important; } 
            body { padding: 0; background: #fff; } 
            .report-card { border: none; box-shadow: none; padding: 0; max-width: 100%; } 
        }
    </style>
</head>
<body>
<div class="report-card">
    <div class="top-bar">
        <button onclick="window.print()" class="btn-action">🖨️ Simpan PDF / Cetak Laporan</button>
    </div>

    <div class="header">
        <div>
            <div class="title">PT MAJU SEJAHTERA BERSAMA</div>
            <div style="font-size: 12px; color: #64748b;">LAPORAN REKAPITULASI PAYROLL (BATCH REPORT)</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
            Kode Batch: <b>{$batchCode}</b><br>Tanggal: {$printDate}
        </div>
    </div>

    <div class="meta-box">
        <div>Nama Batch: <b>{$batchName}</b></div>
        <div>Total Karyawan: <b>{$totalSlips} Orang</b></div>
        <div>Status: <b style="color: #047857; text-transform: uppercase;">{$status}</b></div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 30px; text-align: center;">NO</th>
                <th>NAMA KARYAWAN & DEPT</th>
                <th style="text-align: right;">GAJI POKOK</th>
                <th style="text-align: right;">TUNJANGAN</th>
                <th style="text-align: right;">LEMBUR</th>
                <th style="text-align: right;">KASBON</th>
                <th style="text-align: right;">UNPAID</th>
                <th style="text-align: right;">GAJI BERSIH (THP)</th>
            </tr>
        </thead>
        <tbody>
            {$rowsHtml}
        </tbody>
    </table>

    <div class="total-box">
        <span>TOTAL PENGELUARAN GAJI (BATCH TOTAL):</span>
        <span style="font-size: 18px; font-family: monospace; color: #34d399;">Rp {$totalAmountFmt}</span>
    </div>
</div>

<script>
    window.addEventListener('DOMContentLoaded', function() {
        var params = new URLSearchParams(window.location.search);
        if (params.get('autoprint') === '1') {
            setTimeout(function() { window.print(); }, 400);
        }
    });
</script>
</body>
</html>
HTML;
    }`;

content = content.replace(/private function renderProfessionalBatchReportHtml\(HrisPayroll \$payroll\): string[\s\S]*?private function formatNumber/, updatedBatchHtmlRender + "\n\n    private function formatNumber");

fs.writeFileSync(ctrlPath, content, 'utf8');
console.log('Successfully updated downloadBatchReport in HrisPayrollController.php!');
