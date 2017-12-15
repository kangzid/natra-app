const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;

echo "Columns in hris_news:\\n";
print_r(Schema::getColumnListing('hris_news'));

if (!Schema::hasColumn('hris_news', 'views')) {
    DB::statement("ALTER TABLE hris_news ADD COLUMN views INT UNSIGNED DEFAULT 0 AFTER is_published");
    echo "Added 'views' column to hris_news!\\n";
} else {
    echo "'views' column already exists.\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'add_views_col.php'), testScript, 'utf8');
