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

echo "=== TEST INCREMENT VIEW ===\\n";
$firstNews = HrisNews::first();
echo "Before views for News #{$firstNews->id}: {$firstNews->views}\\n";

$req = Request::create("/api/hris/news/{$firstNews->id}/view", 'POST');
$req->setUserResolver(fn() => $admin);
$res = $newsCtrl->incrementView($req, $firstNews->id);
echo "Response: " . $res->getContent() . "\\n";

$firstNews->refresh();
echo "After views for News #{$firstNews->id}: {$firstNews->views}\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_view_inc.php'), testScript, 'utf8');
