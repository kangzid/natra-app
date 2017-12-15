const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const contractCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisContractController.php');
let contractCtrl = fs.readFileSync(contractCtrlPath, 'utf8');

const updatedSyncFunction = `    private function syncContractToPayroll($tenantId, $employeeId, $basicSal, $allowancesList, $startDate, $contractNumber)
    {
        // 1. Sync Gaji Pokok (HrisEmployeeSalary)
        if ((float)$basicSal > 0) {
            try {
                $salaryCode = 'SAL-' . date('Ym') . '-' . str_pad($employeeId, 4, '0', STR_PAD_LEFT);
                HrisEmployeeSalary::updateOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'employee_id' => $employeeId
                    ],
                    [
                        'code' => $salaryCode,
                        'wage_type' => 'Bulanan',
                        'amount' => (float)$basicSal,
                        'effective_date' => $startDate ?? date('Y-m-d'),
                    ]
                );
            } catch (\\Exception $e) {
                \\Log::warning('HrisEmployeeSalary sync warning: ' . $e->getMessage());
            }
        }

        // 2. Sync Tunjangan (HrisEmployeeAllowance & Items)
        if (!empty($allowancesList)) {
            if (is_string($allowancesList)) {
                $allowancesList = json_decode($allowancesList, true) ?: [];
            }
            if (is_array($allowancesList) && count($allowancesList) > 0) {
                try {
                    $allowanceCode = 'ALW-' . date('Ym') . '-' . str_pad($employeeId, 4, '0', STR_PAD_LEFT);
                    $empAllowance = HrisEmployeeAllowance::updateOrCreate(
                        [
                            'tenant_id' => $tenantId,
                            'employee_id' => $employeeId
                        ],
                        [
                            'code' => $allowanceCode,
                            'effective_date' => $startDate ?? date('Y-m-d'),
                        ]
                    );

                    $empAllowance->items()->delete();
                    foreach ($allowancesList as $item) {
                        $typeId = $item['allowance_type_id'] ?? $item['id'] ?? null;
                        $amt = (float)($item['amount'] ?? 0);
                        if ($typeId && $amt > 0) {
                            HrisEmployeeAllowanceItem::create([
                                'employee_allowance_id' => $empAllowance->id,
                                'allowance_type_id' => $typeId,
                                'amount' => $amt,
                            ]);
                        }
                    }
                } catch (\\Exception $e) {
                    \\Log::warning('HrisEmployeeAllowance sync warning: ' . $e->getMessage());
                }
            }
        }
    }`;

// Replace syncContractToPayroll
contractCtrl = contractCtrl.replace(
    /private function syncContractToPayroll\([\s\S]*?\n    \}/,
    updatedSyncFunction.trim()
);

// Also make sure store & update pass $contract->allowances_json
contractCtrl = contractCtrl.replace(
    /\$this->syncContractToPayroll\(\$tenantId, \$contract->employee_id, \$basicSal, \$allowancesList, \$contract->start_date, \$contract->contract_number\);/g,
    `$this->syncContractToPayroll($tenantId, $contract->employee_id, $contract->basic_salary, $contract->allowances_json, $contract->start_date, $contract->contract_number);`
);

fs.writeFileSync(contractCtrlPath, contractCtrl, 'utf8');
console.log('Updated HrisContractController.php with robust allowances_json sync!');
