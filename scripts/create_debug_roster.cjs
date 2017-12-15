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
use App\\Models\\HrisShift;
use App\\Models\\HrisShiftAssignment;
use Carbon\\Carbon;
use Illuminate\\Http\\Request;

$user = User::where('email', 'agus01@majusejahtera.com')->first();
$employee = $user->employee;

echo "Employee: {$employee->id} - {$user->name}\\n";

$startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
$endOfWeek = Carbon::now()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

echo "Current Week: {$startOfWeek} to {$endOfWeek}\\n";

$assignments = HrisShiftAssignment::where('employee_id', $employee->id)
    ->whereBetween('date', [$startOfWeek, $endOfWeek])
    ->with('shift')
    ->get();

echo "Assignments in DB for current week (" . $assignments->count() . "):\\n";
foreach ($assignments as $a) {
    echo "- {$a->date->format('Y-m-d')}: " . ($a->shift ? $a->shift->name : 'No shift') . "\\n";
}

echo "\\nAll assignments for Agus in DB:\\n";
$all = HrisShiftAssignment::where('employee_id', $employee->id)->orderBy('date', 'asc')->get();
echo "Total: " . $all->count() . "\\n";
foreach ($all->take(10) as $a) {
    echo "- {$a->date->format('Y-m-d')}: " . ($a->shift ? $a->shift->name : 'No shift') . "\\n";
}

$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);
$req = Request::create('/api/attendances/today', 'GET');
$req->setUserResolver(fn() => $user);
$res = $attCtrl->todayAttendance($req);
echo "\\nAPI Response todayAttendance:\\n";
echo $res->getContent() . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'debug_agus_roster.php'), testScript, 'utf8');
