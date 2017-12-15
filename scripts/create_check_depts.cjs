const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;
use App\\Models\\User;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$depts = DB::table('hris_departments')->where('tenant_id', $admin->id)->get();
echo "Departments for tenant 2 count: " . $depts->count() . "\\n";
foreach ($depts as $d) {
    echo "- ID: {$d->id}, Name: {$d->name}, Code: {$d->code}\\n";
}

$empDepts = DB::table('employees')->where('admin_id', $admin->id)->pluck('department')->unique()->filter();
echo "\\nDistinct employee departments count: " . $empDepts->count() . "\\n";
foreach ($empDepts as $ed) {
    echo "- $ed\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'check_depts.php'), testScript, 'utf8');
