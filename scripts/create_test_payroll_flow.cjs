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
use App\\Models\\HrisContract;
use App\\Models\\HrisEmployeeAllowance;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Storage;

$admin = User::where('email', 'admin@majusejahtera.com')->first();

echo "=== 1. Test Contracts Summary API ===\\n";
$req = Request::create('/api/hris/contracts/summary', 'GET');
$req->setUserResolver(fn() => $admin);
$contractCtrl = app(App\\Http\\Controllers\\Api\\HrisContractController::class);
$summaryRes = $contractCtrl->summary($req);
echo "Summary JSON: " . json_encode($summaryRes->getData()) . "\\n";

echo "\\n=== 2. Test Allowances API ===\\n";
$reqAlw = Request::create('/api/hris/allowances', 'GET');
$reqAlw->setUserResolver(fn() => $admin);
$masterCtrl = app(App\\Http\\Controllers\\Api\\HrisPayrollMasterController::class);
$allowancesRes = $masterCtrl->getEmployeeAllowances($reqAlw);
echo "Allowances count: " . count($allowancesRes->getData()) . "\\n";
foreach ($allowancesRes->getData() as $alw) {
    echo "  - Emp: {$alw->employee?->user?->name}, Code: {$alw->code}, Items: " . count($alw->items ?? []) . "\\n";
}

echo "\\n=== 3. Test Generate Monthly & Publish (Encrypted Batch Document) ===\\n";
HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->delete();

$postReq = Request::create('/api/hris/payrolls/generate-monthly', 'POST', [
    'month' => 8,
    'year' => 2026,
    'period_start' => '2026-08-01',
    'period_end' => '2026-08-31',
]);
$postReq->setUserResolver(fn() => $admin);
$payrollCtrl = app(App\\Http\\Controllers\\Api\\HrisPayrollController::class);
$genRes = $payrollCtrl->generateMonthly($postReq);
$payroll = HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->first();
echo "Generated Payroll ID: {$payroll->id}, Status: {$payroll->status}\\n";

// Publish
$pubReq = Request::create('/api/hris/payrolls/' . $payroll->id . '/publish', 'POST');
$pubReq->setUserResolver(fn() => $admin);
$pubRes = $payrollCtrl->publish($payroll->id, $pubReq);
$payroll->refresh();
echo "Published Status: {$payroll->status}, Report Path: {$payroll->report_file_path}\\n";

echo "\\n=== 4. Test Download Batch Report (Decrypted Stream) ===\\n";
$dlReq = Request::create('/api/hris/payrolls/' . $payroll->id . '/batch-report', 'GET');
$dlReq->setUserResolver(fn() => $admin);
$batchReportRes = $payrollCtrl->downloadBatchReport($payroll->id, $dlReq);
echo "Batch Report Response Status: {$batchReportRes->getStatusCode()}, Content Length: " . strlen($batchReportRes->getContent()) . "\\n";

echo "\\n=== 5. Test Download Individual Payslip On-The-Fly ===\\n";
$slip = HrisPayslip::where('payroll_id', $payroll->id)->where('employee_id', 7)->first();
$slipReq = Request::create('/api/hris/payrolls/payslips/' . $slip->id . '/download-pdf', 'GET');
$slipReq->setUserResolver(fn() => $admin);
$slipRes = $payrollCtrl->downloadIndividualPayslipPdf($slip->id, $slipReq);
echo "Individual Payslip Status: {$slipRes->getStatusCode()}, Content Length: " . strlen($slipRes->getContent()) . "\\n";

echo "\\n=== 6. Test Destroy Cleanup ===\\n";
$reportPath = $payroll->report_file_path;
echo "File exists before delete? " . (Storage::disk('private')->exists($reportPath) ? 'YES' : 'NO') . "\\n";
$delReq = Request::create('/api/hris/payrolls/' . $payroll->id, 'DELETE');
$delReq->setUserResolver(fn() => $admin);
$payrollCtrl->destroy($payroll->id, $delReq);
echo "File exists after delete? " . (Storage::disk('private')->exists($reportPath) ? 'YES' : 'NO') . "\\n";
echo "Payroll exists in DB? " . (HrisPayroll::find($payroll->id) ? 'YES' : 'NO') . "\\n";

echo "\\n=== All Tests Completed Successfully! ===\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_full_payroll_flow.php'), testScript, 'utf8');
