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
use App\\Models\\HrisEmployeeLeaveBalance;
use App\\Models\\HrisLoan;
use Illuminate\\Http\\Request;

echo "=== 1. Check Employee Loans Relation ===\\n";
$emp = Employee::with('loans')->find(7);
echo "Emp {$emp->id} ({$emp->user?->name}) loans count: " . $emp->loans->count() . "\\n";
foreach ($emp->loans as $l) {
    echo "- Loan: {$l->code}, Amount: {$l->amount}, Monthly Deduction: {$l->monthly_deduction}, Status: {$l->status}\\n";
}

echo "\\n=== 2. Check Leave Balances in DB ===\\n";
foreach (HrisEmployeeLeaveBalance::with(['employee.user', 'leaveType'])->where('employee_id', 7)->get() as $b) {
    echo "- Leave Type: {$b->leaveType?->name} ({$b->leaveType?->code}), Quota: {$b->quota}, Used: {$b->used}, Remaining: {$b->remaining}, Appended RemainingDays: {$b->remaining_days}\\n";
}

echo "\\n=== 3. Simulate HrisLeaveSettingController@getLeaveBalances ===\\n";
$admin = User::where('email', 'admin@majusejahtera.com')->first();
$req = Request::create('/api/hris/leave-balances?year=2026', 'GET');
$req->setUserResolver(fn() => $admin);
$ctrl = app(App\\Http\\Controllers\\Api\\HrisLeaveSettingController::class);
$res = $ctrl->getLeaveBalances($req);
echo "Response count: " . count($res->getData()) . "\\n";
foreach ($res->getData() as $item) {
    echo "  * Emp: {$item->employee?->user?->name}, Type: {$item->leave_type?->name}, Quota: {$item->quota}, Used: {$item->used}, Remaining: {$item->remaining}\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'verify_all_fixes.php'), testScript, 'utf8');
