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
$trainingCtrl = app(App\\Http\\Controllers\\Api\\HrisTrainingController::class);

echo "=== TEST 1: GET /api/hris/training ===\\n";
$req = Request::create('/api/hris/training', 'GET');
$req->setUserResolver(fn() => $admin);
$res1 = $trainingCtrl->index($req);
echo "Status: " . $res1->getStatusCode() . "\\n";
$data1 = json_decode($res1->getContent(), true);
echo "Trainings count: " . count($data1) . "\\n";
foreach ($data1 as $t) {
    echo "- [{$t['id']}] {$t['title']} | Status: {$t['status']} | Participants: " . count($t['participants']) . "\\n";
}

echo "\\n=== TEST 2: GET /api/hris/training/summary ===\\n";
$req2 = Request::create('/api/hris/training/summary', 'GET');
$req2->setUserResolver(fn() => $admin);
$res2 = $trainingCtrl->summary($req2);
echo "Status: " . $res2->getStatusCode() . "\\n";
echo "Summary JSON: " . $res2->getContent() . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_training_endpoints.php'), testScript, 'utf8');
