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

$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);

$req = Request::create('/api/attendances/today', 'GET');
$req->setUserResolver(fn() => $user);

$res = $attCtrl->todayAttendance($req);
$data = json_decode($res->getContent(), true);

echo "=== WEEKLY ROSTER FOR AGUS ===\\n";
foreach ($data['weekly_roster'] as $d) {
    $offStr = !empty($d['is_day_off']) ? '[LIBUR/OFF]' : '[KERJA]';
    echo "{$d['day_name']} ({$d['date']}): {$d['shift_name']} {$offStr}\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'test_day_off_roster.php'), testScript, 'utf8');
