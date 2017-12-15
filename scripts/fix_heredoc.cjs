const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');
let content = fs.readFileSync(ctrlPath, 'utf8');

// Replace renderProfessionalPayslipHtml and finishPayslipHtml with a clean, unindented single method
const cleanRenderMethods = `    private function renderProfessionalPayslipHtml(HrisPayslip $slip): string
    {
        $emp = $slip->employee;
        $user = $emp ? $emp->user : null;
        $payroll = $slip->payroll;

        $basic = (float)$slip->basic_salary;
        $allowances = (float)$slip->allowances;
        $overtime = (float)$slip->overtime_pay;
        $adjAdd = (float)$slip->adjustments_addition;
        $totalGross = $basic + $allowances + $overtime + $adjAdd;

        $bpjsKes = (float)$slip->bpjs_kesehatan;
        $bpjsTk = (float)$slip->bpjs_ketenagakerjaan;
        $loanDed = (float)$slip->loan_deductions;
        $absenceDed = (float)$slip->absence_deductions;
        $adjDed = (float)$slip->adjustments_deduction;
        $totalDed = $bpjsKes + $bpjsTk + $loanDed + $absenceDed + $adjDed;

        $netSalary = (float)$slip->net_salary;
        $terbilangText = $this->terbilang($netSalary) . ' Rupiah';

        $periodText = $payroll ? ($payroll->batch_name ?: ('Periode ' . date('d/m/Y', strtotime($payroll->period_start)) . ' - ' . date('d/m/Y', strtotime($payroll->period_end)))) : 'Bulan Ini';
        $printDate = date('d F Y, H:i');

        $empName = htmlspecialchars($user?->name ?: 'Karyawan');
        $empId = htmlspecialchars($emp?->employee_id ?: '-');
        $empDept = htmlspecialchars($emp?->department ?: '-');
        $empPos = htmlspecialchars($emp?->position ?: '-');
        $batchCode = htmlspecialchars($payroll?->code ?: '-');

        $basicFmt = $this->formatNumber($basic);
        $allowancesFmt = $this->formatNumber($allowances);
        $overtimeFmt = $this->formatNumber($overtime);
        $adjAddFmt = $this->formatNumber($adjAdd);
        $totalGrossFmt = $this->formatNumber($totalGross);

        $bpjsKesFmt = $this->formatNumber($bpjsKes);
        $bpjsTkFmt = $this->formatNumber($bpjsTk);
        $loanDedFmt = $this->formatNumber($loanDed);
        $absenceDedFmt = $this->formatNumber($absenceDed);
        $adjDedFmt = $this->formatNumber($adjDed);
        $totalDedFmt = $this->formatNumber($totalDed);
        $netSalaryFmt = $this->formatNumber($netSalary);

        $adjAddRow = $adjAdd > 0 ? "<div class=\\"item-row\\"><span class=\\"item-name\\">Penyesuaian (+)</span><span class=\\"item-amt\\">Rp {$adjAddFmt}</span></div>" : "";
        $loanRow = $loanDed > 0 ? "<div class=\\"item-row\\"><span class=\\"item-name\\">Potongan Kasbon / Pinjaman</span><span class=\\"item-amt\\" style=\\"color: #b91c1c;\\">- Rp {$loanDedFmt}</span></div>" : "";
        $absenceRow = $absenceDed > 0 ? "<div class=\\"item-row\\"><span class=\\"item-name\\">Potongan Kehadiran (Unpaid)</span><span class=\\"item-amt\\" style=\\"color: #b91c1c;\\">- Rp {$absenceDedFmt}</span></div>" : "";
        $adjDedRow = $adjDed > 0 ? "<div class=\\"item-row\\"><span class=\\"item-name\\">Penyesuaian (-)</span><span class=\\"item-amt\\" style=\\"color: #b91c1c;\\">- Rp {$adjDedFmt}</span></div>" : "";

        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slip Gaji - {$empId} - {$empName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
        body { background: #f1f5f9; padding: 24px 12px; color: #1e293b; }
        .payslip-card { max-width: 780px; margin: 0 auto; background: #ffffff; padding: 36px 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .company-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px double #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
        .company-title { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; text-transform: uppercase; }
        .company-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
        .confidential-badge { display: inline-block; background: #fee2e2; color: #b91c1c; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; }
        .doc-title { text-align: center; margin: 16px 0; font-size: 16px; font-weight: 800; letter-spacing: 1px; color: #0f172a; text-transform: uppercase; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 12px; }
        .meta-row { display: flex; justify-content: space-between; }
        .meta-label { color: #64748b; font-weight: 500; }
        .meta-val { font-weight: 700; color: #0f172a; }
        .table-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .section-box { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .section-header { background: #f8fafc; padding: 10px 14px; font-size: 12px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
        .item-list { padding: 8px 14px; font-size: 12px; }
        .item-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #f1f5f9; }
        .item-row:last-child { border-bottom: none; }
        .item-name { color: #334155; }
        .item-amt { font-family: 'Courier New', monospace; font-weight: 700; color: #0f172a; }
        .section-total { background: #f8fafc; padding: 8px 14px; font-size: 12px; font-weight: 800; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; }
        .thp-container { background: #0f172a; color: #ffffff; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .thp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
        .thp-terbilang { font-size: 11px; font-style: italic; opacity: 0.8; margin-top: 3px; }
        .thp-val { font-size: 22px; font-weight: 900; font-family: 'Courier New', monospace; color: #34d399; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; text-align: center; font-size: 11px; margin-top: 24px; }
        .sig-space { height: 50px; }
        .sig-name { font-weight: 700; text-decoration: underline; }
        .print-btn { display: block; width: 100%; max-width: 220px; margin: 20px auto 0; padding: 12px 20px; background: #2563eb; color: #ffffff; text-align: center; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; }
        @media print {
            body { background: #ffffff; padding: 0; }
            .payslip-card { box-shadow: none; border: none; padding: 0; width: 100%; max-width: 100%; }
            .print-btn { display: none; }
        }
    </style>
</head>
<body>

<div class="payslip-card">
    <div class="company-header">
        <div>
            <div class="company-title">PT MAJU SEJAHTERA BERSAMA</div>
            <div class="company-sub">Sistem Manajemen Operasional & Human Resource Information System</div>
            <div class="company-sub">Jl. Pemuda No. 108, Jakarta Pusat &bull; support@majusejahtera.com</div>
        </div>
        <div style="text-align: right;">
            <span class="confidential-badge">CONFIDENTIAL</span>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Kode: <b>{$batchCode}</b></div>
        </div>
    </div>

    <div class="doc-title">SLIP GAJI KARYAWAN</div>

    <div class="meta-grid">
        <div class="meta-row"><span class="meta-label">Nama Karyawan:</span><span class="meta-val">{$empName}</span></div>
        <div class="meta-row"><span class="meta-label">ID Karyawan:</span><span class="meta-val">{$empId}</span></div>
        <div class="meta-row"><span class="meta-label">Departemen:</span><span class="meta-val">{$empDept}</span></div>
        <div class="meta-row"><span class="meta-label">Jabatan:</span><span class="meta-val">{$empPos}</span></div>
        <div class="meta-row"><span class="meta-label">Periode Gaji:</span><span class="meta-val">{$periodText}</span></div>
        <div class="meta-row"><span class="meta-label">Tanggal Cetak:</span><span class="meta-val">{$printDate}</span></div>
    </div>

    <div class="table-container">
        <!-- PENGHASILAN -->
        <div class="section-box">
            <div class="section-header" style="color: #047857;">Komponen Penghasilan (+)</div>
            <div class="item-list">
                <div class="item-row">
                    <span class="item-name">Gaji Pokok</span>
                    <span class="item-amt">Rp {$basicFmt}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">Tunjangan Tetap</span>
                    <span class="item-amt">Rp {$allowancesFmt}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">Upah Lembur</span>
                    <span class="item-amt">Rp {$overtimeFmt}</span>
                </div>
                {$adjAddRow}
            </div>
            <div class="section-total">
                <span>Total Penghasilan Kotor:</span>
                <span class="item-amt" style="color: #047857;">Rp {$totalGrossFmt}</span>
            </div>
        </div>

        <!-- POTONGAN -->
        <div class="section-box">
            <div class="section-header" style="color: #b91c1c;">Komponen Potongan (-)</div>
            <div class="item-list">
                {$loanRow}
                {$absenceRow}
                <div class="item-row">
                    <span class="item-name">BPJS Kesehatan</span>
                    <span class="item-amt" style="color: #b91c1c;">- Rp {$bpjsKesFmt}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">BPJS Ketenagakerjaan</span>
                    <span class="item-amt" style="color: #b91c1c;">- Rp {$bpjsTkFmt}</span>
                </div>
                {$adjDedRow}
            </div>
            <div class="section-total">
                <span>Total Potongan:</span>
                <span class="item-amt" style="color: #b91c1c;">- Rp {$totalDedFmt}</span>
            </div>
        </div>
    </div>

    <div class="thp-container">
        <div>
            <div class="thp-label">Gaji Bersih Diterima (Take Home Pay)</div>
            <div class="thp-terbilang">Terbilang: {$terbilangText}</div>
        </div>
        <div class="thp-val">Rp {$netSalaryFmt}</div>
    </div>

    <div class="signature-grid">
        <div>
            <p>Penerima,</p>
            <div class="sig-space"></div>
            <p class="sig-name">{$empName}</p>
            <p style="font-size: 10px; color: #64748b;">Karyawan</p>
        </div>
        <div>
            <p>Disetujui Oleh,</p>
            <div class="sig-space"></div>
            <p class="sig-name">HRD & Finance Dept.</p>
            <p style="font-size: 10px; color: #64748b;">PT Maju Sejahtera Bersama</p>
        </div>
    </div>

    <button onclick="window.print()" class="print-btn">🖨️ Cetak / Simpan PDF</button>
</div>

</body>
</html>
HTML;
    }`;

// Replace renderProfessionalPayslipHtml and finishPayslipHtml in file
content = content.replace(/private function renderProfessionalPayslipHtml\(HrisPayslip \$slip\): string[\s\S]*?private function renderProfessionalBatchReportHtml/, cleanRenderMethods + "\n\n    private function renderProfessionalBatchReportHtml");

fs.writeFileSync(ctrlPath, content, 'utf8');
console.log('Fixed heredoc syntax in HrisPayrollController.php!');
