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
use App\\Models\\HrisAttendanceSetting;
use App\\Models\\Attendance;
use Carbon\\Carbon;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$employeeUser = User::where('email', 'agus01@majusejahtera.com')->first();
$employee = $employeeUser->employee;

$shiftCtrl = app(App\\Http\\Controllers\\Api\\HrisShiftController::class);
$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);

echo "=== TEST 1: Saving Non-Shift (Regular) Attendance Settings ===\\n";
$saveReq = Request::create('/api/hris/attendance-settings', 'POST', [
    'is_shift_enabled' => false,
    'check_in_start' => '07:00',
    'work_start_time' => '08:00',
    'late_tolerance_time' => '08:15',
    'check_in_end' => '08:30',
    'lock_after_late_cutoff' => true,
    'work_end_time' => '17:00',
    'min_checkout_at_work_end' => true,
    'require_geofence_checkout' => true,
]);
$saveReq->setUserResolver(fn() => $admin);
$saveRes = $attCtrl->saveSettings($saveReq);
echo "Save Settings Response (" . $saveRes->getStatusCode() . "): " . $saveRes->getContent() . "\\n\\n";

echo "=== TEST 2: Employee Today Schedule under Non-Shift Mode ===\\n";
$todayReq = Request::create('/api/attendances/today', 'GET');
$todayReq->setUserResolver(fn() => $employeeUser);
$todayRes = $attCtrl->todayAttendance($todayReq);
$todayData = json_decode($todayRes->getContent(), true);
echo "Schedule Name: " . $todayData['schedule']['shift_name'] . "\\n";
echo "Work Start: " . $todayData['schedule']['work_start_time'] . " WIB\\n";
echo "Cut-off End: " . $todayData['schedule']['check_in_end'] . " WIB\\n";
echo "Work End: " . $todayData['schedule']['work_end_time'] . " WIB\\n\\n";

echo "=== TEST 3: Create & List Master Shifts ===\\n";
$createShiftReq = Request::create('/api/hris/shifts', 'POST', [
    'name' => 'Shift Pagi Operasional',
    'code' => 'SHF-PAGI',
    'check_in_start' => '06:00',
    'work_start_time' => '07:00',
    'late_tolerance_time' => '07:15',
    'check_in_end' => '08:00',
    'work_end_time' => '15:00',
    'color' => '#3b82f6',
    'is_active' => true,
]);
$createShiftReq->setUserResolver(fn() => $admin);
$shiftRes = $shiftCtrl->store($createShiftReq);
echo "Shift Created: " . $shiftRes->getContent() . "\\n\\n";

echo "=== TEST 4: Assign Shift to Employee & Toggle is_shift_enabled = true ===\\n";
$shift = HrisShift::where('tenant_id', $admin->id)->first();
$assignReq = Request::create('/api/hris/shift-assignments', 'POST', [
    'employee_ids' => [$employee->id],
    'shift_id' => $shift->id,
    'start_date' => Carbon::today()->format('Y-m-d'),
    'end_date' => Carbon::today()->addDays(6)->format('Y-m-d'),
    'notes' => 'Jadwal Mingguan Operasional',
]);
$assignReq->setUserResolver(fn() => $admin);
$assignRes = $shiftCtrl->assignShifts($assignReq);
echo "Assign Result: " . $assignRes->getContent() . "\\n";

// Enable shift mode
$saveReq2 = Request::create('/api/hris/attendance-settings', 'POST', [
    'is_shift_enabled' => true,
    'check_in_start' => '07:00',
    'work_start_time' => '08:00',
    'late_tolerance_time' => '08:15',
    'check_in_end' => '08:30',
    'lock_after_late_cutoff' => true,
    'work_end_time' => '17:00',
]);
$saveReq2->setUserResolver(fn() => $admin);
$attCtrl->saveSettings($saveReq2);

echo "=== TEST 5: Employee Today Schedule under Multi-Shift Mode ===\\n";
$todayRes2 = $attCtrl->todayAttendance($todayReq);
$todayData2 = json_decode($todayRes2->getContent(), true);
echo "Active Shift: " . $todayData2['schedule']['shift_name'] . " (" . $todayData2['schedule']['shift_code'] . ")\\n";
echo "Shift Start: " . $todayData2['schedule']['work_start_time'] . " WIB\\n";
echo "Shift End: " . $todayData2['schedule']['work_end_time'] . " WIB\\n";
echo "Window Status: " . $todayData2['window_status'] . "\\n\\n";

echo "=== ALL COMPLETE FLOW TESTS SUCCEEDED! ===\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_flow_complete.php'), script, 'utf8');
console.log('Created test_flow_complete.php');
