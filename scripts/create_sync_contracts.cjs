const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\HrisContract;
use App\\Models\\HrisEmployeeSalary;
use App\\Models\\HrisEmployeeAllowance;
use App\\Models\\HrisEmployeeAllowanceItem;

echo "=== Syncing All Existing Contracts to Payroll Salaries & Allowances ===\\n";
$contracts = HrisContract::where('status', '!=', 'terminated')->get();

foreach ($contracts as $c) {
    echo "Processing Contract {$c->contract_number} (Emp ID: {$c->employee_id})...\\n";

    // 1. Sync Salary
    if ((float)$c->basic_salary > 0) {
        $sal = HrisEmployeeSalary::updateOrCreate(
            ['tenant_id' => $c->tenant_id, 'employee_id' => $c->employee_id],
            [
                'code' => 'SAL-' . date('Ym') . '-' . str_pad($c->employee_id, 4, '0', STR_PAD_LEFT),
                'wage_type' => 'Bulanan',
                'amount' => (float)$c->basic_salary,
                'effective_date' => $c->start_date ?? date('Y-m-d'),
            ]
        );
        echo "  -> Salary synced: Rp " . number_format($sal->amount, 0, ',', '.') . "\\n";
    }

    // 2. Sync Allowances
    $allowancesList = $c->allowances_json;
    if (!empty($allowancesList)) {
        if (is_string($allowancesList)) {
            $allowancesList = json_decode($allowancesList, true) ?: [];
        }
        if (is_array($allowancesList)) {
            $validItems = array_filter($allowancesList, fn($i) => (float)($i['amount'] ?? 0) > 0);
            if (!empty($validItems)) {
                $empAllowance = HrisEmployeeAllowance::updateOrCreate(
                    ['tenant_id' => $c->tenant_id, 'employee_id' => $c->employee_id],
                    [
                        'code' => 'ALW-' . date('Ym') . '-' . str_pad($c->employee_id, 4, '0', STR_PAD_LEFT),
                        'effective_date' => $c->start_date ?? date('Y-m-d'),
                    ]
                );

                $empAllowance->items()->delete();
                foreach ($validItems as $item) {
                    $typeId = $item['allowance_type_id'] ?? $item['id'] ?? 1;
                    $amt = (float)$item['amount'];
                    HrisEmployeeAllowanceItem::create([
                        'employee_allowance_id' => $empAllowance->id,
                        'allowance_type_id' => $typeId,
                        'amount' => $amt,
                    ]);
                    echo "  -> Allowance item added: Type ID {$typeId}, Amount: Rp " . number_format($amt, 0, ',', '.') . "\\n";
                }
            }
        }
    }
}

echo "=== Finished Syncing Contracts to Payroll ===\\n";
`;

fs.writeFileSync(path.join(backendDir, 'sync_contracts_to_payroll.php'), testScript, 'utf8');
