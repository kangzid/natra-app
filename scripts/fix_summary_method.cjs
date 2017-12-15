const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const contractCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisContractController.php');
let contractCtrl = fs.readFileSync(contractCtrlPath, 'utf8');

const badLine = `                // Auto Sync to Payroll (Gaji Pokok & Tunjangan)
        $this->syncContractToPayroll($tenantId, $contract->employee_id, $contract->basic_salary, $contract->allowances_json, $contract->start_date, $contract->contract_number);`;

contractCtrl = contractCtrl.replace(badLine, '');
fs.writeFileSync(contractCtrlPath, contractCtrl, 'utf8');
console.log('Removed misplaced sync line from summary method in HrisContractController.php!');
