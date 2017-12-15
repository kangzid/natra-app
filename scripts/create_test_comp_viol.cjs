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
use App\\Models\\Vehicle;
use App\\Models\\HrisComplianceItem;
use App\\Models\\HrisViolation;
use App\\Models\\HrisViolationType;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
$token = $admin->createToken('admin-comp-test')->plainTextToken;

$compCtrl = app(App\\Http\\Controllers\\Api\\HrisComplianceController::class);
$violCtrl = app(App\\Http\\Controllers\\Api\\HrisViolationController::class);

echo "=== 1. Test Compliance API ===\\n";
// Create compliance doc for Agus Darsono (Emp ID 7)
$storeCompReq = Request::create('/api/hris/compliance', 'POST', [
    'target_type' => 'employee',
    'target_id' => 7,
    'doc_name' => 'SIM B1 Umum',
    'doc_number' => 'SIM-902182910',
    'expiry_date' => date('Y-m-d', strtotime('+180 days')),
    'reminder_days_before' => 30,
    'notes' => 'SIM Driver Operasional Aktif',
]);
$storeCompReq->setUserResolver(fn() => $admin);
$storeCompRes = $compCtrl->store($storeCompReq);
echo "Store Compliance Status: {$storeCompRes->getStatusCode()}\\n";
$createdComp = $storeCompRes->getData();
echo "Created Doc: {$createdComp->doc_name}, Number: {$createdComp->doc_number}, Status: {$createdComp->status}, Target Employee: {$createdComp->employee?->user?->name}\\n";

// Summary check
$sumCompReq = Request::create('/api/hris/compliance/summary', 'GET');
$sumCompReq->setUserResolver(fn() => $admin);
$sumCompRes = $compCtrl->summary($sumCompReq);
echo "Compliance Summary: " . json_encode($sumCompRes->getData()) . "\\n";

echo "\\n=== 2. Test Violations API ===\\n";
// Get Types
$typesReq = Request::create('/api/hris/violations/types', 'GET');
$typesReq->setUserResolver(fn() => $admin);
$typesRes = $violCtrl->getViolationTypes($typesReq);
echo "Violation Types Count: " . count($typesRes->getData()) . "\\n";
foreach ($typesRes->getData() as $t) {
    echo "  - {$t->name} (Code: {$t->code}, Duration: {$t->default_duration_months} Bln)\\n";
}

// Store new violation
$storeViolReq = Request::create('/api/hris/violations', 'POST', [
    'employee_id' => 7,
    'violation_type' => 'Surat Peringatan I (Pertama)',
    'violation_date' => date('Y-m-d'),
    'valid_from' => date('Y-m-d'),
    'description' => 'Terlambat melakukan pengiriman tanpa konfirmasi PIC logistik.',
    'legal_basis' => 'Pasal 12 PKB Perusahaan Ayat 3 tentang Ketepatan Waktu Kerja',
    'notes' => 'Telah diberikan konseling tahap 1',
]);
$storeViolReq->setUserResolver(fn() => $admin);
$storeViolRes = $violCtrl->store($storeViolReq);
echo "Store Violation Status: {$storeViolRes->getStatusCode()}\\n";
$createdViol = $storeViolRes->getData();
echo "Created Violation Doc: {$createdViol->document_number}, Type: {$createdViol->violation_type}, Employee: {$createdViol->employee?->user?->name}, Valid Until: {$createdViol->valid_until}\\n";

// Summary check
$sumViolReq = Request::create('/api/hris/violations/summary', 'GET');
$sumViolReq->setUserResolver(fn() => $admin);
$sumViolRes = $violCtrl->summary($sumViolReq);
echo "Violation Summary: " . json_encode($sumViolRes->getData()) . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'test_comp_viol_flow.php'), testScript, 'utf8');
