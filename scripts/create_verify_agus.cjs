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
use App\\Models\\HrisPayroll;
use App\\Models\\HrisPayslip;
use Illuminate\\Http\\Request;

$user = User::where('email', 'agus01@majusejahtera.com')->first();
$token = $user->createToken('agus-check')->plainTextToken;

$payrollCtrl = app(App\\Http\\Controllers\\Api\\HrisPayrollController::class);

// 1. Get Payrolls
$req = Request::create('/api/hris/payrolls', 'GET');
$req->setUserResolver(fn() => $user);
$res = $payrollCtrl->index($req);
$monthly = $res->getData()->monthly ?? [];
echo "Monthly batches count: " . count($monthly) . "\\n";

if (count($monthly) > 0) {
    $batch = $monthly[0];
    echo "Latest Batch: ID {$batch->id}, Code: {$batch->code}, Status: {$batch->status}\\n";

    // 2. Get slips
    $reqSlips = Request::create('/api/hris/payrolls/' . $batch->id . '/slips', 'GET');
    $reqSlips->setUserResolver(fn() => $user);
    $resSlips = $payrollCtrl->slips($batch->id, $reqSlips);
    $allSlips = $resSlips->getData()->payslips ?? [];
    echo "Total slips in batch: " . count($allSlips) . "\\n";

    $agusSlip = collect($allSlips)->first(function($s) use ($user) {
        return $s->employee_id == 7 || ($s->employee && $s->employee->user_id == $user->id);
    });

    if ($agusSlip) {
        echo "=== MATCHED AGUS DARSONO SLIP ===\\n";
        echo "Slip ID: {$agusSlip->id}\\n";
        echo "Gaji Pokok: Rp " . number_format($agusSlip->basic_salary, 0, ',', '.') . "\\n";
        echo "Tunjangan: + Rp " . number_format($agusSlip->allowances, 0, ',', '.') . "\\n";
        echo "Lembur: + Rp " . number_format($agusSlip->overtime_pay, 0, ',', '.') . "\\n";
        echo "Kasbon: - Rp " . number_format($agusSlip->loan_deductions, 0, ',', '.') . "\\n";
        echo "Potongan Kehadiran: - Rp " . number_format($agusSlip->absence_deductions, 0, ',', '.') . "\\n";
        echo "Gaji Bersih (THP): Rp " . number_format($agusSlip->net_salary, 0, ',', '.') . "\\n";
        echo "Status: {$agusSlip->status}\\n";
    } else {
        echo "Agus slip not found in batch!\\n";
    }
}
`;

fs.writeFileSync(path.join(backendDir, 'verify_agus_mobile_payroll.php'), testScript, 'utf8');
