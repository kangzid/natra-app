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
$newsCtrl = app(App\\Http\\Controllers\\Api\\HrisNewsController::class);

echo "=== TEST 1: GET /api/hris/news ===\\n";
$req = Request::create('/api/hris/news', 'GET');
$req->setUserResolver(fn() => $admin);
$res1 = $newsCtrl->index($req);
echo "Status: " . $res1->getStatusCode() . "\\n";
$newsList = json_decode($res1->getContent(), true);
echo "News count: " . count($newsList) . "\\n";
foreach ($newsList as $n) {
    echo "- [{$n['id']}] {$n['title']} | Cat: {$n['category']} | Priority: {$n['priority']} | Published: {$n['is_published']}\\n";
}

echo "\\n=== TEST 2: GET /api/hris/news/summary ===\\n";
$req2 = Request::create('/api/hris/news/summary', 'GET');
$req2->setUserResolver(fn() => $admin);
$res2 = $newsCtrl->summary($req2);
echo "Status: " . $res2->getStatusCode() . "\\n";
echo "Summary: " . $res2->getContent() . "\\n";

echo "\\n=== TEST 3: PUT /api/hris/news/1 (UPDATE) ===\\n";
$req3 = Request::create('/api/hris/news/1', 'PUT', [
    'title' => 'Pembaruan Kebijakan Keselamatan Berkendara (Safety Driving 2026 - Updated)',
    'category' => 'Keamanan & K3',
    'priority' => 'urgent',
    'target_audience' => 'Operasional Driver & Pengiriman'
]);
$req3->setUserResolver(fn() => $admin);
$res3 = $newsCtrl->update($req3, 1);
echo "Status: " . $res3->getStatusCode() . "\\n";
echo "Updated Title: " . json_decode($res3->getContent(), true)['title'] . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_news_endpoints.php'), testScript, 'utf8');
