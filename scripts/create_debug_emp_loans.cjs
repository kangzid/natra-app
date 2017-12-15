const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\Employee;
use App\\Models\\HrisLoan;
use Illuminate\\Http\\Request;

$agus = User::where('email', 'agus01@majusejahtera.com')->first();
$emp = Employee::with(['loans'])->where('user_id', $agus->id)->first();

echo "Employee loans directly via Eloquent:\\n";
print_r($emp->loans->toArray());

echo "\\nLoans in HrisLoan table for employee {$emp->id}:\\n";
print_r(HrisLoan::where('employee_id', $emp->id)->get()->toArray());
`;

fs.writeFileSync(path.join(backendDir, 'debug_emp_loans.php'), testScript, 'utf8');
