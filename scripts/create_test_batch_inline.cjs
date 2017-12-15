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
$token = $admin->createToken('admin-test')->plainTextToken;

$payroll = HrisPayroll::where('tenant_id', 2)->where('month', 8)->where('year', 2026)->first();
$payrollCtrl = app(App\\Http\\Controllers\\Api\\HrisPayrollController::class);

$req = Request::create('/api/hris/payrolls/' . $payroll->id . '/batch-report?token=' . $token . '&autoprint=1', 'GET');
$res = $payrollCtrl->downloadBatchReport($payroll->id, $req);

echo "Status Code: " . $res->getStatusCode() . "\\n";
echo "Content-Type: " . $res->headers->get('content-type') . "\\n";
echo "Content-Disposition: " . $res->headers->get('content-disposition') . "\\n";
echo "Contains window.print? " . (str_contains($res->getContent(), 'window.print()') ? 'YES' : 'NO') . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_batch_inline.php'), testScript, 'utf8');
