const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\HrisAttendanceSetting;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);

// Set limit to 7 days
HrisAttendanceSetting::updateOrCreate(
    ['tenant_id' => $admin->id],
    ['edit_delete_limit_days' => 7]
);

echo "=== TEST 1: CREATE 14 DAYS AGO (2026-08-09) ===\\n";
$reqCreate = Request::create('/api/admin/attendances', 'POST', [
    'employee_id' => 7,
    'date' => '2026-08-09',
    'status' => 'present',
    'check_in' => '08:00',
    'check_out' => '17:00'
]);
$reqCreate->setUserResolver(fn() => $admin);
$res1 = $attCtrl->storeAdmin($reqCreate);
echo "Status: " . $res1->getStatusCode() . " | " . $res1->getContent() . "\\n";

echo "\\n=== TEST 2: CREATE 3 DAYS AGO (2026-08-20) ===\\n";
$reqCreate2 = Request::create('/api/admin/attendances', 'POST', [
    'employee_id' => 7,
    'date' => '2026-08-20',
    'status' => 'present',
    'check_in' => '08:00',
    'check_out' => '17:00'
]);
$reqCreate2->setUserResolver(fn() => $admin);
$res2 = $attCtrl->storeAdmin($reqCreate2);
echo "Status: " . $res2->getStatusCode() . " | " . $res2->getContent() . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_limit_enforcement.php'), testScript, 'utf8');
