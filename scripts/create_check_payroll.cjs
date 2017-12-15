const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\Schema;

echo "=== Payroll related tables ===\\n";
foreach (['hris_payrolls', 'hris_payroll_items', 'hris_salaries', 'payrolls'] as $t) {
    if (Schema::hasTable($t)) {
        echo "Table $t exists. Columns:\\n";
        print_r(Schema::getColumnListing($t));
    }
}
`;

fs.writeFileSync(path.join(backendDir, 'check_payroll_tables.php'), testScript, 'utf8');
