const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\DB;

$cols = DB::select("SHOW COLUMNS FROM hris_news WHERE Field = 'target_audience'");
print_r($cols);
`;

fs.writeFileSync(path.join(backendDir, 'check_target_aud_col.php'), testScript, 'utf8');
