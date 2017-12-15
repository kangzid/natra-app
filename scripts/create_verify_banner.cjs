const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\HrisNews;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$newsCtrl = app(App\\Http\\Controllers\\Api\\HrisNewsController::class);

echo "=== VERIFY: GET /api/hris/news response banner attributes ===\\n";
$req = Request::create('/api/hris/news', 'GET');
$req->setUserResolver(fn() => $admin);
$res = $newsCtrl->index($req);

$items = json_decode($res->getContent(), true);
foreach ($items as $item) {
    $hasBase64 = !empty($item['banner_base64']);
    $b64Len = $hasBase64 ? strlen($item['banner_base64']) : 0;
    echo "- News [{$item['id']}]: '{$item['title']}' | banner_path: {$item['banner_path']} | has_base64: " . ($hasBase64 ? "YES (length $b64Len)" : "NO") . " | banner_url: {$item['banner_url']}\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'verify_banner_json.php'), testScript, 'utf8');
