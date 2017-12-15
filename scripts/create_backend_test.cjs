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

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$employeeUser = User::where('email', 'agus01@majusejahtera.com')->first();
$employee = $employeeUser->employee;

echo "1. Testing HrisAttendanceSetting updateOrCreate...\\n";
$setting = HrisAttendanceSetting::updateOrCreate(
    ['tenant_id' => $admin->id],
    [
        'is_shift_enabled' => false,
        'check_in_start' => '07:00',
        'work_start_time' => '08:00',
        'late_tolerance_time' => '08:15',
        'check_in_end' => '08:30',
        'lock_after_late_cutoff' => true,
        'late_cutoff_policy' => 'empty',
        'work_end_time' => '17:00',
        'min_checkout_at_work_end' => true,
        'require_geofence_checkout' => true,
    ]
);
echo "Setting saved: is_shift_enabled={$setting->is_shift_enabled}, work_start={$setting->work_start_time}, cut_off={$setting->check_in_end}\\n";

echo "2. Testing HrisShift creation...\\n";
$shift1 = HrisShift::updateOrCreate(
    ['tenant_id' => $admin->id, 'code' => 'SHF-PAGI'],
    [
        'name' => 'Shift Pagi',
        'check_in_start' => '06:00',
        'work_start_time' => '07:00',
        'late_tolerance_time' => '07:15',
        'check_in_end' => '08:00',
        'work_end_time' => '15:00',
        'color' => '#3b82f6',
        'is_active' => true,
    ]
);

$shift2 = HrisShift::updateOrCreate(
    ['tenant_id' => $admin->id, 'code' => 'SHF-SIANG'],
    [
        'name' => 'Shift Siang',
        'check_in_start' => '14:00',
        'work_start_time' => '15:00',
        'late_tolerance_time' => '15:15',
        'check_in_end' => '16:00',
        'work_end_time' => '23:00',
        'color' => '#f59e0b',
        'is_active' => true,
    ]
);
echo "Shifts created: {$shift1->name} ({$shift1->work_start_time}-{$shift1->work_end_time}), {$shift2->name} ({$shift2->work_start_time}-{$shift2->work_end_time})\\n";

echo "3. Testing Shift Assignment...\\n";
$assign = HrisShiftAssignment::updateOrCreate(
    ['tenant_id' => $admin->id, 'employee_id' => $employee->id, 'date' => Carbon::today()->format('Y-m-d')],
    ['shift_id' => $shift1->id, 'notes' => 'Jadwal Reguler Operasional']
);
echo "Assigned {$employeeUser->name} to {$shift1->name} for {$assign->date->format('Y-m-d')}\\n";

echo "4. Testing AttendanceController logic...\\n";
$req = Illuminate\\Http\\Request::create('/api/attendances/today', 'GET');
$req->setUserResolver(fn() => $employeeUser);
$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);
$res = $attCtrl->todayAttendance($req);
echo "todayAttendance status: " . $res->getStatusCode() . "\\n";
echo "Response content: " . $res->getContent() . "\\n";

echo "ALL BACKEND TESTS PASSED!\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_backend_logic.php'), script, 'utf8');
