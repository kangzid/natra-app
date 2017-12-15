const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;

echo "=== Columns in hris_compliance_items ===\\n";
$cols = DB::select('DESCRIBE hris_compliance_items');
foreach ($cols as $c) {
    echo "- {$c->Field} ({$c->Type}), Null: {$c->Null}\\n";
}

echo "\\n=== Columns in hris_violations ===\\n";
$colsV = DB::select('DESCRIBE hris_violations');
foreach ($colsV as $c) {
    echo "- {$c->Field} ({$c->Type}), Null: {$c->Null}\\n";
}

echo "\\n=== Columns in hris_violation_types ===\\n";
$colsVT = DB::select('DESCRIBE hris_violation_types');
foreach ($colsVT as $c) {
    echo "- {$c->Field} ({$c->Type}), Null: {$c->Null}\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'inspect_comp_viol_schema.php'), testScript, 'utf8');
