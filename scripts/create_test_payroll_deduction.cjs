const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\Employee;
use App\\Models\\HrisRequest;
use App\\Models\\HrisRequestPolicy;
use App\\Models\\HrisPayroll;
use App\\Models\\HrisPayslip;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$emp = Employee::find(7); // Agus Darsono

echo "=== 1. Ensure Absence Policy is Unpaid (is_paid = false) ===\\n";
HrisRequestPolicy::updateOrCreate(
    ['tenant_id' => 2, 'policy_type' => 'absence'],
    ['max_days_per_year' => 3, 'is_paid' => false, 'requires_attachment' => false, 'description' => 'Izin tidak masuk kerja / unpaid']
);
echo "Absence policy is set to Unpaid (is_paid = false).\\n";

echo "\\n=== 2. Check or Create Approved Izin Absen Request for Agus (2 Days) ===\\n";
$req = HrisRequest::updateOrCreate(
    [
        'tenant_id' => 2,
        'employee_id' => 7,
        'code' => 'REQ-TEST-ABS-01',
    ],
    [
        'request_type' => 'izin_absen',
        'start_date' => '2026-08-10',
        'end_date' => '2026-08-11',
        'days_count' => 2,
        'reason' => 'Keperluan keluarga mendesak',
        'status' => 'approved',
        'approved_by' => 2,
        'approved_at' => now(),
    ]
);
echo "Approved request {$req->code} for {$req->days_count} days.\\n";

echo "\\n=== 3. Simulate Generate Monthly Payroll for August 2026 ===\\n";
// Delete any existing draft for this month to test clean generate
HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->delete();

$postReq = Request::create('/api/hris/payrolls/generate-monthly', 'POST', [
    'month' => 8,
    'year' => 2026,
    'period_start' => '2026-08-01',
    'period_end' => '2026-08-31',
]);
$postReq->setUserResolver(fn() => $admin);
$ctrl = app(App\\Http\\Controllers\\Api\\HrisPayrollController::class);
$res = $ctrl->generateMonthly($postReq);
echo "Generate response code: " . $res->getStatusCode() . "\\n";

$payroll = HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->first();
if ($payroll) {
    echo "Created Payroll ID: {$payroll->id}, Code: {$payroll->code}, Batch: {$payroll->batch_name}\\n";
    $slip = HrisPayslip::where('payroll_id', $payroll->id)->where('employee_id', 7)->first();
    if ($slip) {
        echo "=== Slip Gaji Agus Darsono ===\\n";
        echo "- Gaji Pokok: Rp " . number_format($slip->basic_salary, 0, ',', '.') . "\\n";
        echo "- Upah Lembur: Rp " . number_format($slip->overtime_pay, 0, ',', '.') . "\\n";
        echo "- Potongan Kasbon: - Rp " . number_format($slip->loan_deductions, 0, ',', '.') . "\\n";
        echo "- Potongan Unpaid (absence_deductions): - Rp " . number_format($slip->absence_deductions, 0, ',', '.') . "\\n";
        echo "- TOTAL GAJI BERSIH (Net Salary): Rp " . number_format($slip->net_salary, 0, ',', '.') . "\\n";
    }
}
`;

fs.writeFileSync(path.join(backendDir, 'test_payroll_deduction.php'), testScript, 'utf8');
