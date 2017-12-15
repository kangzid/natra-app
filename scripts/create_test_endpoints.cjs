const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\HrisPayroll;
use App\\Models\\HrisPayslip;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$token = $admin->createToken('test-token')->plainTextToken;

echo "Admin Token: {$token}\\n";

// Ensure August 2026 payroll exists and published
$payroll = HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->first();
$payrollCtrl = app(App\\Http\\Controllers\\Api\\HrisPayrollController::class);

if (!$payroll) {
    echo "Generating August 2026 Payroll...\\n";
    $postReq = Request::create('/api/hris/payrolls/generate-monthly', 'POST', [
        'month' => 8,
        'year' => 2026,
        'period_start' => '2026-08-01',
        'period_end' => '2026-08-31',
    ]);
    $postReq->setUserResolver(fn() => $admin);
    $payrollCtrl->generateMonthly($postReq);
    $payroll = HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->first();
}

// Publish
$pubReq = Request::create('/api/hris/payrolls/' . $payroll->id . '/publish', 'POST');
$pubReq->setUserResolver(fn() => $admin);
$payrollCtrl->publish($payroll->id, $pubReq);
$payroll->refresh();

echo "Payroll Batch Code: {$payroll->code}, Status: {$payroll->status}\\n";
echo "Total Payslips in Batch: " . $payroll->payslips()->count() . "\\n";

// Test Batch Report with token
$reqBatch = Request::create('/api/hris/payrolls/' . $payroll->id . '/batch-report?token=' . $token, 'GET');
$resBatch = $payrollCtrl->downloadBatchReport($payroll->id, $reqBatch);
echo "Batch Report Response HTTP: {$resBatch->getStatusCode()}, Length: " . strlen($resBatch->getContent()) . "\\n";

// Test Individual Slip for Agus Darsono with token
$agusSlip = HrisPayslip::where('payroll_id', $payroll->id)->where('employee_id', 7)->first();
$reqSlip = Request::create('/api/hris/payrolls/payslips/' . $agusSlip->id . '/download-pdf?token=' . $token, 'GET');
$resSlip = $payrollCtrl->downloadIndividualPayslipPdf($agusSlip->id, $reqSlip);
echo "Individual Slip (Agus Darsono) HTTP: {$resSlip->getStatusCode()}, Length: " . strlen($resSlip->getContent()) . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_payroll_endpoints.php'), testScript, 'utf8');
