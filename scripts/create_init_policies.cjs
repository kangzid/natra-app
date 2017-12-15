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

echo "Checking tables in DB...\\n";

if (!Schema::hasTable('hris_request_policies')) {
    Schema::create('hris_request_policies', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('tenant_id')->index();
        $table->string('policy_type', 50)->index(); // 'sick', 'absence', 'duty'
        $table->integer('max_days_per_year')->default(14);
        $table->boolean('requires_attachment')->default(true);
        $table->boolean('is_paid')->default(true);
        $table->text('description')->nullable();
        $table->timestamps();

        $table->unique(['tenant_id', 'policy_type']);
    });
    echo "Created hris_request_policies table successfully!\\n";
} else {
    echo "hris_request_policies already exists.\\n";
}

// Check category column on hris_employee_leave_balances
if (!Schema::hasColumn('hris_employee_leave_balances', 'category')) {
    Schema::table('hris_employee_leave_balances', function (Blueprint $table) {
        $table->string('category', 50)->default('leave')->after('leave_type_id')->index(); // 'leave', 'sick', 'absence'
        $table->unsignedBigInteger('leave_type_id')->nullable()->change();
    });
    echo "Added category column to hris_employee_leave_balances!\\n";
} else {
    echo "category column already exists in hris_employee_leave_balances.\\n";
}
`;

fs.writeFileSync(path.join(backendDir, 'init_policies_table.php'), testScript, 'utf8');
