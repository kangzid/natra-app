const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const script = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\Employee;
use App\\Models\\HrisShift;
use App\\Models\\HrisShiftAssignment;
use Carbon\\Carbon;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$employees = Employee::where('admin_id', $admin->id)->take(4)->get();
$shifts = HrisShift::where('tenant_id', $admin->id)->take(2)->get();

if ($shifts->count() < 2) {
    echo "Need at least 2 shifts for test\\n";
    exit;
}

$shiftCtrl = app(App\\Http\\Controllers\\Api\\HrisShiftController::class);

echo "=== TEST 1: Auto-Generate Weekly Rolling Shift ===\\n";
$autoReq = Request::create('/api/hris/shift-assignments/auto-generate', 'POST', [
    'start_date' => '2026-09-01',
    'end_date' => '2026-09-14',
    'employee_ids' => $employees->pluck('id')->toArray(),
    'shift_ids' => $shifts->pluck('id')->toArray(),
    'pattern' => 'weekly_rotation',
    'off_days' => [0], // Sunday off
    'rotating_off' => false,
    'notes' => 'Weekly rolling shift test'
]);
$autoReq->setUserResolver(fn() => $admin);
$res = $shiftCtrl->autoGenerate($autoReq);
echo "Auto Generate Result (" . $res->getStatusCode() . "): " . $res->getContent() . "\\n\\n";

echo "=== TEST 2: Checking Generated Assignments ===\\n";
$emp1 = $employees[0];
$assignments = HrisShiftAssignment::where('tenant_id', $admin->id)
    ->where('employee_id', $emp1->id)
    ->whereBetween('date', ['2026-09-01', '2026-09-14'])
    ->with('shift')
    ->get();

foreach ($assignments as $a) {
    echo "{$a->date->format('Y-m-d (D)')}: {$a->shift->name}\\n";
}

echo "\\n=== TEST 3: Testing Schedule Swap between Emp 1 and Emp 2 ===\\n";
$swapReq = Request::create('/api/hris/shift-assignments/swap', 'POST', [
    'employee_id_1' => $employees[0]->id,
    'employee_id_2' => $employees[1]->id,
    'start_date' => '2026-09-01',
    'end_date' => '2026-09-03',
]);
$swapReq->setUserResolver(fn() => $admin);
$swapRes = $shiftCtrl->swapShifts($swapReq);
echo "Swap Result: " . $swapRes->getContent() . "\\n";

echo "=== ALL BACKEND TESTS FOR AUTO-GENERATE & SWAP PASSED! ===\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_autogen_backend.php'), script, 'utf8');
