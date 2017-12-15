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
$req = Request::create('/api/hris/request-policies', 'GET');
$req->setUserResolver(fn() => $admin);
$ctrl = app(App\\Http\\Controllers\\Api\\HrisLeaveSettingController::class);
$res = $ctrl->getPolicies($req);
echo "Policies JSON:\\n";
echo json_encode($res->getData(), JSON_PRETTY_PRINT) . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_policies_response.php'), testScript, 'utf8');
