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
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$attCtrl = app(App\\Http\\Controllers\\Api\\AttendanceController::class);

$req = Request::create('/api/admin/attendances/employee/7?month=8&year=2026', 'GET');
$req->setUserResolver(fn() => $admin);

try {
    $res = $attCtrl->getEmployeeAttendances($req, 7);
    echo "Status: " . $res->getStatusCode() . "\\n";
    echo "Content sample: " . substr($res->getContent(), 0, 300) . "...\\n";
} catch (\\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\\n" . $e->getTraceAsString() . "\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'test_admin_emp_att.php'), testScript, 'utf8');
