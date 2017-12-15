const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Task;

$task9 = Task::find(9);
if ($task9) {
    $task9->update([
        'destination_lat' => -7.795600,
        'destination_lng' => 110.369500,
    ]);
    echo "Updated task #9 with destination coordinates!\\n";
    print_r(Task::find(9)->toArray());
}
`;

fs.writeFileSync(path.join(backendDir, 'fix_task_9_coords.php'), testScript, 'utf8');
