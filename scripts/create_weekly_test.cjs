const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const script = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use Illuminate\\Http\\Request;

$employeeUser = User::where('email', 'agus01@majusejahtera.com')->first();
$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);

$todayReq = Request::create('/api/attendances/today', 'GET');
$todayReq->setUserResolver(fn() => $employeeUser);
$res = $attCtrl->todayAttendance($todayReq);
$data = json_decode($res->getContent(), true);

echo "Month Label: " . $data['current_month_label'] . "\\n";
echo "Weekly Roster Days:\\n";
foreach ($data['weekly_roster'] as $day) {
    $todayMark = $day['is_today'] ? ' [TODAY]' : '';
    echo "{$day['day_name']} ({$day['date']}): {$day['shift_name']} ({$day['work_start_time']}-{$day['work_end_time']}){$todayMark}\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'test_weekly_roster.php'), script, 'utf8');
