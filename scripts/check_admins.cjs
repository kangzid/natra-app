const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const script = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$users = App\\Models\\User::where('role', 'admin')->get(['id', 'name', 'email']);
echo "Admin Users:\\n";
foreach ($users as $u) {
    echo "ID: {$u->id}, Name: {$u->name}, Email: {$u->email}\\n";
}
`;
fs.writeFileSync(path.join(backendDir, 'check_admins.php'), script, 'utf8');
