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
use Illuminate\\Support\\Facades\\Schema;

echo "Columns in hris_news:\\n";
print_r(Schema::getColumnListing('hris_news'));

echo "\\nCount of hris_news: " . HrisNews::count() . "\\n";
foreach (HrisNews::all() as $n) {
    echo "- [{$n->id}] {$n->title} | Cat: {$n->category} | Priority: {$n->priority} | Audience: {$n->target_audience} | Published: {$n->is_published}\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'debug_news_db.php'), testScript, 'utf8');
