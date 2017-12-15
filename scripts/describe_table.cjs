const fs = require('fs');
const { execSync } = require('child_process');

const phpCode = `<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
$cols = DB::select('DESCRIBE hris_requests');
echo json_encode($cols, JSON_PRETTY_PRINT);
`;

fs.writeFileSync('../backup/tracker-loc-backend/describe_requests.php', phpCode);
try {
  const out = execSync('php describe_requests.php', { cwd: '../backup/tracker-loc-backend' }).toString();
  console.log('COLUMNS:\n', out);
} catch (e) {
  console.error(e.message);
}
fs.unlinkSync('../backup/tracker-loc-backend/describe_requests.php');
