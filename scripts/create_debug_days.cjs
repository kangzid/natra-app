const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);

$req = Request::create('/api/admin/attendances/employee/7?month=8&year=2026', 'GET');
$req->setUserResolver(fn() => $admin);

$res = $attCtrl->getEmployeeAttendances($req, 7);
$data = json_decode($res->getContent(), true);

echo "Days count: " . count($data['days']) . "\\n";
print_r($data['days'][0]);
print_r($data['days'][22]); // Aug 23 (today)
`;

fs.writeFileSync(path.join(backendDir, 'debug_days_item.php'), testScript, 'utf8');
