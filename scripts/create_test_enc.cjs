const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Services\\EncryptedStorageService;

try {
    echo "Testing EncryptedStorageService::storeEncrypted...\\n";
    $res = EncryptedStorageService::storeEncrypted(
        '<html><body>Test Batch Report</body></html>',
        2,
        'payrolls',
        'batch_18',
        'Laporan_Batch_Payroll_GJ82026.html'
    );
    print_r($res);
} catch (\\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\\n" . $e->getTraceAsString();
}
`;

fs.writeFileSync(path.join(backendDir, 'test_enc_store.php'), testScript, 'utf8');
