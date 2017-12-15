const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');
let content = fs.readFileSync(ctrlPath, 'utf8');

const cleanBatchMethod = `    private function renderProfessionalBatchReportHtml(HrisPayroll $payroll): string
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
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
        body { background: #f8fafc; padding: 24px 12px; color: #0f172a; }
        .report-card { max-width: 960px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: 800; text-transform: uppercase; }
        .meta-box { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
        th { background: #f1f5f9; padding: 10px 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 700; }
        td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
        .total-box { background: #0f172a; color: #ffffff; padding: 14px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700; }
        .print-btn { display: block; width: 220px; margin: 20px auto 0; padding: 10px; background: #2563eb; color: #fff; text-align: center; border-radius: 6px; text-decoration: none; font-weight: 700; cursor: pointer; border: none; }
        @media print { .print-btn { display: none; } body { padding: 0; } .report-card { border: none; box-shadow: none; } }
    </style>
</head>
<body>
<div class="report-card">
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

    <button onclick="window.print()" class="print-btn">🖨️ Cetak / Simpan Laporan</button>
</div>
</body>
</html>
HTML;
    }`;

content = content.replace(/private function renderProfessionalBatchReportHtml\(HrisPayroll \$payroll\): string[\s\S]*?private function formatNumber/, cleanBatchMethod + "\n\n    private function formatNumber");

fs.writeFileSync(ctrlPath, content, 'utf8');
console.log('Fixed quotes and variables in renderProfessionalBatchReportHtml!');
