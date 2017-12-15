const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const reqCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisRequestController.php');

let reqCtrl = fs.readFileSync(reqCtrlPath, 'utf8');

const updatedDeductRestoreFunctions = `    /**
     * Helper: Deduct quota from leave / sick / absence balance based on request type
     */
    protected function deductLeaveQuota(HrisRequest $hrisReq, int $tenantId)
    {
        $year = (int)date('Y', strtotime($hrisReq->start_date));
        $reqType = $hrisReq->request_type;

        if ($reqType === 'izin_cuti') {
            $leaveTypeId = $hrisReq->leave_type_id;
            if (!$leaveTypeId) {
                $firstType = HrisLeaveType::where('tenant_id', $tenantId)->first();
                $leaveTypeId = $firstType ? $firstType->id : null;
            }

            if ($leaveTypeId) {
                $typeObj = HrisLeaveType::find($leaveTypeId);
                $defaultDays = $typeObj ? $typeObj->default_days : 12;

                $balance = HrisEmployeeLeaveBalance::firstOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'employee_id' => $hrisReq->employee_id,
                        'leave_type_id' => $leaveTypeId,
                        'category' => 'leave',
                        'year' => $year,
                    ],
                    [
                        'quota' => $defaultDays,
                        'used' => 0,
                        'remaining' => $defaultDays,
                    ]
                );

                $balance->used = (int)$balance->used + (int)$hrisReq->days_count;
                $balance->remaining = max(0, (int)$balance->quota - (int)$balance->used);
                $balance->save();

                if (!$hrisReq->leave_type_id) {
                    $hrisReq->leave_type_id = $leaveTypeId;
                    $hrisReq->saveQuietly();
                }
            }
        } elseif ($reqType === 'izin_sakit') {
            $policy = HrisRequestPolicy::where('tenant_id', $tenantId)->where('policy_type', 'sick')->first();
            $defaultDays = $policy ? $policy->max_days_per_year : 14;

            $balance = HrisEmployeeLeaveBalance::firstOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'employee_id' => $hrisReq->employee_id,
                    'category' => 'sick',
                    'year' => $year,
                ],
                [
                    'quota' => $defaultDays,
                    'used' => 0,
                    'remaining' => $defaultDays,
                ]
            );

            $balance->used = (int)$balance->used + (int)$hrisReq->days_count;
            $balance->remaining = max(0, (int)$balance->quota - (int)$balance->used);
            $balance->save();
        } elseif ($reqType === 'izin_absen') {
            $policy = HrisRequestPolicy::where('tenant_id', $tenantId)->where('policy_type', 'absence')->first();
            $defaultDays = $policy ? $policy->max_days_per_year : 3;

            $balance = HrisEmployeeLeaveBalance::firstOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'employee_id' => $hrisReq->employee_id,
                    'category' => 'absence',
                    'year' => $year,
                ],
                [
                    'quota' => $defaultDays,
                    'used' => 0,
                    'remaining' => $defaultDays,
                ]
            );

            $balance->used = (int)$balance->used + (int)$hrisReq->days_count;
            $balance->remaining = max(0, (int)$balance->quota - (int)$balance->used);
            $balance->save();
        }
    }

    /**
     * Helper: Restore quota to leave / sick / absence balance when an approved request is rejected or deleted
     */
    protected function restoreLeaveQuota(HrisRequest $hrisReq, int $tenantId)
    {
        $year = (int)date('Y', strtotime($hrisReq->start_date));
        $reqType = $hrisReq->request_type;

        if ($reqType === 'izin_cuti') {
            $leaveTypeId = $hrisReq->leave_type_id;
            if ($leaveTypeId) {
                $balance = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)
                    ->where('employee_id', $hrisReq->employee_id)
                    ->where('leave_type_id', $leaveTypeId)
                    ->where('category', 'leave')
                    ->where('year', $year)
                    ->first();

                if ($balance) {
                    $balance->used = max(0, (int)$balance->used - (int)$hrisReq->days_count);
                    $balance->remaining = max(0, (int)$balance->quota - (int)$balance->used);
                    $balance->save();
                }
            }
        } elseif ($reqType === 'izin_sakit') {
            $balance = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)
                ->where('employee_id', $hrisReq->employee_id)
                ->where('category', 'sick')
                ->where('year', $year)
                ->first();

            if ($balance) {
                $balance->used = max(0, (int)$balance->used - (int)$hrisReq->days_count);
                $balance->remaining = max(0, (int)$balance->quota - (int)$balance->used);
                $balance->save();
            }
        } elseif ($reqType === 'izin_absen') {
            $balance = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)
                ->where('employee_id', $hrisReq->employee_id)
                ->where('category', 'absence')
                ->where('year', $year)
                ->first();

            if ($balance) {
                $balance->used = max(0, (int)$balance->used - (int)$hrisReq->days_count);
                $balance->remaining = max(0, (int)$balance->quota - (int)$balance->used);
                $balance->save();
            }
        }
    }`;

// Replace deductLeaveQuota and restoreLeaveQuota functions
reqCtrl = reqCtrl.replace(
    /    \/\*\*\n     \* Helper: Deduct quota from leave balance[\s\S]*?protected function restoreLeaveQuota\(HrisRequest \$hrisReq, int \$tenantId\)[\s\S]*?\n    \}/,
    updatedDeductRestoreFunctions.trim()
);

fs.writeFileSync(reqCtrlPath, reqCtrl, 'utf8');
console.log('Updated HrisRequestController.php with categorized deduct & restore logic!');
