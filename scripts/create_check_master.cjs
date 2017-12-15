const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\Schema;
use App\\Models\\HrisMasterSetting;

echo "=== hris_master_settings columns ===\\n";
if (Schema::hasTable('hris_master_settings')) {
    print_r(Schema::getColumnListing('hris_master_settings'));
    echo "Content:\\n";
    print_r(HrisMasterSetting::all()->toArray());
} else {
    echo "hris_master_settings does not exist.\\n";
}

echo "\\n=== hris_leave_types ===\\n";
if (Schema::hasTable('hris_leave_types')) {
    print_r(\\App\\Models\\HrisLeaveType::all()->toArray());
}
`;

fs.writeFileSync(path.join(backendDir, 'check_master_settings.php'), testScript, 'utf8');
