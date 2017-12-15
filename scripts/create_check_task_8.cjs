const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Task;

$task = Task::with('vehicle', 'assignee')->find(8);
if ($task) {
    echo "Task #8 details:\\n";
    print_r($task->toArray());
} else {
    echo "Task #8 not found, listing last 3 tasks:\\n";
    foreach (Task::with('vehicle')->latest()->take(3)->get() as $t) {
        print_r($t->toArray());
    }
}
`;

fs.writeFileSync(path.join(backendDir, 'check_task_8.php'), testScript, 'utf8');
