const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Vehicle;
use Illuminate\\Support\\Facades\\Schema;

echo "Columns in vehicles table:\\n";
print_r(Schema::getColumnListing('vehicles'));

echo "\\nVehicle #4 (or all vehicles):\\n";
foreach (Vehicle::all() as $v) {
    print_r($v->toArray());
}
`;

fs.writeFileSync(path.join(backendDir, 'check_vehicle_cols.php'), testScript, 'utf8');
