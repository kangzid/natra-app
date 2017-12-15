const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;

echo "=== All tables containing contract ===\\n";
$tables = DB::select('SHOW TABLES');
foreach ($tables as $t) {
    $tArr = (array)$t;
    $tName = reset($tArr);
    if (str_contains($tName, 'contract')) {
        echo "Table: $tName\\n";
        print_r(DB::table($tName)->get()->toArray());
    }
}
`;

fs.writeFileSync(path.join(backendDir, 'inspect_contract_tables.php'), testScript, 'utf8');

const svelteFile = path.join(svelteDir, 'src/routes/admin/hris/contracts/+page.svelte');
const content = fs.readFileSync(svelteFile, 'utf8');
console.log('=== KPI summary cards in contracts/+page.svelte ===');
console.log(content.split('\n').slice(140, 240).join('\n'));
