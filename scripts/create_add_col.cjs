const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Database\\Schema\\Blueprint;

if (!Schema::hasColumn('hris_payrolls', 'report_file_path')) {
    Schema::table('hris_payrolls', function (Blueprint $table) {
        $table->string('report_file_path')->nullable()->after('status');
    });
    echo "Added report_file_path column to hris_payrolls!\\n";
} else {
    echo "report_file_path column already exists in hris_payrolls.\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'add_payroll_report_column.php'), testScript, 'utf8');
