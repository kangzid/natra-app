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
echo "Response JSON keys:\\n";
$data = json_decode($res->getContent(), true);
print_r(array_keys($data));
if (isset($data['attendances'])) {
    echo "attendances count: " . count($data['attendances']) . "\\n";
    if (count($data['attendances']) > 0) {
        echo "First item keys:\\n";
        print_r(array_keys($data['attendances'][0]));
        print_r($data['attendances'][0]);
    }
}
if (isset($data['data'])) {
    echo "data keys:\\n";
    print_r(array_keys($data['data']));
}
`;

fs.writeFileSync(path.join(backendDir, 'debug_emp_att_json.php'), testScript, 'utf8');
