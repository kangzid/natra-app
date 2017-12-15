const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Task;

echo "All tasks in DB count: " . Task::count() . "\\n";
foreach (Task::all() as $t) {
    echo "- ID: {$t->id}, Title: {$t->title}, Origin: '{$t->origin_address}' (Lat: {$t->origin_lat}, Lng: {$t->origin_lng}), Dest: '{$t->destination_address}' (Lat: {$t->destination_lat}, Lng: {$t->destination_lng})\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'list_all_tasks_db.php'), testScript, 'utf8');
