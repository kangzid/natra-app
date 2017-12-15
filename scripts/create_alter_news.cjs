const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;
use App\\Models\\User;
use Illuminate\\Http\\Request;

// Alter table column
DB::statement("ALTER TABLE hris_news MODIFY COLUMN target_audience VARCHAR(100) NOT NULL DEFAULT 'all'");
echo "Altered target_audience column to VARCHAR(100) successfully!\\n";

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$newsCtrl = app(App\\Http\\Controllers\\Api\\HrisNewsController::class);

$req3 = Request::create('/api/hris/news/1', 'PUT', [
    'title' => 'Pembaruan Kebijakan Keselamatan Berkendara (Safety Driving 2026)',
    'category' => 'Keamanan & K3',
    'priority' => 'urgent',
    'target_audience' => 'Operasional Driver & Pengiriman'
]);
$req3->setUserResolver(fn() => $admin);
$res3 = $newsCtrl->update($req3, 1);
echo "Status: " . $res3->getStatusCode() . "\\n";
echo "Updated Target Audience: " . json_decode($res3->getContent(), true)['target_audience'] . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'alter_and_test_news.php'), testScript, 'utf8');
