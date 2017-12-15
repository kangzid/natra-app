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
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$payroll = HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->first();

if ($payroll) {
    echo "Publishing Payroll ID {$payroll->id} ({$payroll->code})...\\n";
    $req = Request::create('/api/hris/payrolls/' . $payroll->id . '/publish', 'POST');
    $req->setUserResolver(fn() => $admin);
    $ctrl = app(App\\Http\\Controllers\\Api\\HrisPayrollController::class);
    $res = $ctrl->publish($payroll->id, $req);
    $payroll->refresh();
    echo "Payroll Published: Status = {$payroll->status}, Report Path = {$payroll->report_file_path}\\n";
    echo "Payslips Count: " . $payroll->payslips()->count() . ", Published Count = " . $payroll->payslips()->where('status', 'published')->count() . "\\n";
} else {
    echo "No August 2026 payroll found!\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'publish_august_payroll.php'), testScript, 'utf8');
