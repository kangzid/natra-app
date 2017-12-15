const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;

$tables = DB::select('SHOW TABLES');
$dbName = 'tables_in_' . env('DB_DATABASE', 'tracker_loc');
foreach ($tables as $t) {
    $tArr = (array)$t;
    $tName = reset($tArr);
    if (str_contains($tName, 'payroll') || str_contains($tName, 'salary') || str_contains($tName, 'slip')) {
        echo "Found table: $tName\\n";
        print_r(\\Illuminate\\Support\\Facades\\Schema::getColumnListing($tName));
    }
}
`;

fs.writeFileSync(path.join(backendDir, 'check_all_payroll_tables.php'), testScript, 'utf8');
