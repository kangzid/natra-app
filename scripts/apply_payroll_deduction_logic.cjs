const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');

let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');

if (!ctrlContent.includes('use App\\Models\\HrisRequest;')) {
    ctrlContent = ctrlContent.replace(
        'use App\\Models\\HrisSalaryAdjustmentBatch;',
        'use App\\Models\\HrisSalaryAdjustmentBatch;\nuse App\\Models\\HrisRequest;\nuse App\\Models\\HrisRequestPolicy;'
    );
}

// Update generateMonthly inside loop
const oldCalcPattern = `                // 4. BPJS Ketenagakerjaan
                $bpjsTk = HrisEmployeeBpjs::where('tenant_id', $tenantId)
                    ->where('employee_id', $emp->id)
                    ->where('bpjs_type', 'ketenagakerjaan')
                    ->latest('effective_date')
                    ->first();
                $bpjsTkAmount = $bpjsTk ? (float)$bpjsTk->amount : 0;

                // 5. Adjustments
                $adjAdd = 0;
                $adjDed = 0;
                if ($adjBatch) {
                    $empAdjs = $adjBatch->items->where('employee_id', $emp->id);
                    $adjAdd = (float)$empAdjs->where('type', 'addition')->sum('amount');
                    $adjDed = (float)$empAdjs->where('type', 'deduction')->sum('amount');
                }

                // Net salary calculation
                $netSalary = max(0, ($basicSalary + $allowances + $overtimePay + $adjAdd) - ($bpjsKesehatanAmount + $bpjsTkAmount + $loanDeductions + $adjDed));
                if ($netSalary < 0) $netSalary = 0;

                HrisPayslip::create([
                    'payroll_id' => $payroll->id,
                    'employee_id' => $emp->id,
                    'basic_salary' => $basicSalary,
                    'allowances' => $allowances,
                    'overtime_pay' => $overtimePay,
                    'loan_deductions' => $loanDeductions,
                    'reimbursements' => $reimbursements,
                    'bpjs_kesehatan' => $bpjsKesehatanAmount,
                    'bpjs_ketenagakerjaan' => $bpjsTkAmount,
                    'adjustments_addition' => $adjAdd,
                    'adjustments_deduction' => $adjDed,
                    'net_salary' => $netSalary,
                    'status' => 'draft',
                ]);`;

const newCalcPattern = `                // 4. BPJS Ketenagakerjaan
                $bpjsTk = HrisEmployeeBpjs::where('tenant_id', $tenantId)
                    ->where('employee_id', $emp->id)
                    ->where('bpjs_type', 'ketenagakerjaan')
                    ->latest('effective_date')
                    ->first();
                $bpjsTkAmount = $bpjsTk ? (float)$bpjsTk->amount : 0;

                // 5. Potongan Ketidakhadiran / Unpaid Leave (Izin Tidak Berbayar)
                // Diambil dari permohonan yang disetujui pada periode ini
                $approvedRequests = HrisRequest::where('tenant_id', $tenantId)
                    ->where('employee_id', $emp->id)
                    ->where('status', 'approved')
                    ->where(function ($q) use ($request) {
                        $q->whereBetween('start_date', [$request->period_start, $request->period_end])
                          ->orWhereBetween('end_date', [$request->period_start, $request->period_end]);
                    })
                    ->with('leaveType')
                    ->get();

                $unpaidDays = 0;
                $absencePolicy = HrisRequestPolicy::where('tenant_id', $tenantId)->where('policy_type', 'absence')->first();
                $sickPolicy = HrisRequestPolicy::where('tenant_id', $tenantId)->where('policy_type', 'sick')->first();

                foreach ($approvedRequests as $reqItem) {
                    $days = (int)($reqItem->days_count ?? 1);
                    if ($reqItem->request_type === 'izin_absen') {
                        if ($absencePolicy && !$absencePolicy->is_paid) {
                            $unpaidDays += $days;
                        }
                    } elseif ($reqItem->request_type === 'izin_cuti') {
                        if ($reqItem->leaveType && !$reqItem->leaveType->is_paid) {
                            $unpaidDays += $days;
                        }
                    } elseif ($reqItem->request_type === 'izin_sakit') {
                        if ($sickPolicy && !$sickPolicy->is_paid) {
                            $unpaidDays += $days;
                        }
                    }
                }

                // Daily rate standar 25 hari kerja
                $dailyRate = $basicSalary > 0 ? ($basicSalary / 25) : 0;
                $absenceDeductions = round($unpaidDays * $dailyRate, 2);

                // 6. Adjustments
                $adjAdd = 0;
                $adjDed = 0;
                if ($adjBatch) {
                    $empAdjs = $adjBatch->items->where('employee_id', $emp->id);
                    $adjAdd = (float)$empAdjs->where('type', 'addition')->sum('amount');
                    $adjDed = (float)$empAdjs->where('type', 'deduction')->sum('amount');
                }

                // Net salary calculation
                $netSalary = max(0, ($basicSalary + $allowances + $overtimePay + $adjAdd) - ($bpjsKesehatanAmount + $bpjsTkAmount + $loanDeductions + $absenceDeductions + $adjDed));
                if ($netSalary < 0) $netSalary = 0;

                HrisPayslip::create([
                    'payroll_id' => $payroll->id,
                    'employee_id' => $emp->id,
                    'basic_salary' => $basicSalary,
                    'allowances' => $allowances,
                    'overtime_pay' => $overtimePay,
                    'loan_deductions' => $loanDeductions,
                    'absence_deductions' => $absenceDeductions,
                    'reimbursements' => $reimbursements,
                    'bpjs_kesehatan' => $bpjsKesehatanAmount,
                    'bpjs_ketenagakerjaan' => $bpjsTkAmount,
                    'adjustments_addition' => $adjAdd,
                    'adjustments_deduction' => $adjDed,
                    'net_salary' => $netSalary,
                    'status' => 'draft',
                ]);`;

ctrlContent = ctrlContent.replace(oldCalcPattern, newCalcPattern);
fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
console.log('Successfully updated HrisPayrollController.php with automatic absence deductions calculation!');
