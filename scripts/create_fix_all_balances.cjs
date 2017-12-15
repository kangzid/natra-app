const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\HrisEmployeeLeaveBalance;

echo "Fixing all leave balances in DB...\\n";
foreach (HrisEmployeeLeaveBalance::all() as $b) {
    $quota = (int)$b->quota;
    $used = (int)$b->used;
    $remaining = max(0, $quota - $used);
    $b->update(['remaining' => $remaining]);
    echo "ID: {$b->id}, Emp ID: {$b->employee_id}, Type ID: {$b->leave_type_id}, Quota: {$quota}, Used: {$used}, Remaining: {$remaining}\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'fix_all_leave_balances.php'), testScript, 'utf8');
