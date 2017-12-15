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

$empUser = User::where('email', 'agus.driver@majusejahtera.com')->first();
$emp = Employee::where('user_id', $empUser->id)->first();
echo "Agus Employee ID: {$emp->id}, User ID: {$empUser->id}, Admin ID: {$emp->admin_id}\\n";

$token = $empUser->createToken('emp-token')->plainTextToken;
echo "Agus Token: {$token}\\n";

$payrolls = HrisPayroll::all();
echo "\\nTotal Payrolls in DB: " . $payrolls->count() . "\\n";
foreach ($payrolls as $p) {
    echo "- ID: {$p->id}, Tenant: {$p->tenant_id}, Code: {$p->code}, Batch: {$p->batch_name}, Status: {$p->status}, Payslips: " . $p->payslips()->count() . "\\n";
}

// Test /hris/payrolls API as employee
$payrollCtrl = app(App\\Http\\Controllers\\Api\\HrisPayrollController::class);
$req = Request::create('/api/hris/payrolls', 'GET');
$req->setUserResolver(fn() => $empUser);
$res = $payrollCtrl->index($req);
echo "\\nIndex Response for Agus: " . json_encode($res->getData()) . "\\n";

if ($payrolls->count() > 0) {
    $latest = $payrolls->first();
    $reqSlips = Request::create('/api/hris/payrolls/' . $latest->id . '/slips', 'GET');
    $reqSlips->setUserResolver(fn() => $empUser);
    $resSlips = $payrollCtrl->slips($latest->id, $reqSlips);
    echo "\\nSlips Response for latest payroll (ID {$latest->id}): Payslips count = " . count($resSlips->getData()->payslips ?? []) . "\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'inspect_agus_payroll.php'), testScript, 'utf8');
