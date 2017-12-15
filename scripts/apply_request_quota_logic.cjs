const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const reqCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisRequestController.php');

let reqCtrl = fs.readFileSync(reqCtrlPath, 'utf8');

// Helper function to insert into HrisRequestController
const helperFunctions = `    /**
     * Helper: Deduct quota from leave balance based on request type
     */
    protected function deductLeaveQuota(HrisRequest $hrisReq, int $tenantId)
    {
        $year = (int)date('Y', strtotime($hrisReq->start_date));
        $leaveTypeId = $hrisReq->leave_type_id;

        if (!$leaveTypeId) {
            if ($hrisReq->request_type === 'izin_sakit') {
                $lt = HrisLeaveType::where('tenant_id', $tenantId)->where('code', 'CS01')->first();
                $leaveTypeId = $lt ? $lt->id : null;
            } elseif ($hrisReq->request_type === 'izin_absen') {
                $lt = HrisLeaveType::where('tenant_id', $tenantId)->where('code', 'IP01')->first();
                $leaveTypeId = $lt ? $lt->id : null;
            } elseif ($hrisReq->request_type === 'izin_cuti') {
                $lt = HrisLeaveType::where('tenant_id', $tenantId)->where('code', 'CT01')->first();
                $leaveTypeId = $lt ? $lt->id : null;
            }
        }

        if ($leaveTypeId) {
            $defaultDays = 12;
            $typeObj = HrisLeaveType::find($leaveTypeId);
            if ($typeObj) $defaultDays = $typeObj->default_days;

            $balance = HrisEmployeeLeaveBalance::firstOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'employee_id' => $hrisReq->employee_id,
                    'leave_type_id' => $leaveTypeId,
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

            // Link leave_type_id to request if not yet set
            if (!$hrisReq->leave_type_id) {
                $hrisReq->leave_type_id = $leaveTypeId;
                $hrisReq->saveQuietly();
            }
        }
    }

    /**
     * Helper: Restore quota to leave balance when an approved request is rejected or deleted
     */
    protected function restoreLeaveQuota(HrisRequest $hrisReq, int $tenantId)
    {
        $year = (int)date('Y', strtotime($hrisReq->start_date));
        $leaveTypeId = $hrisReq->leave_type_id;

        if (!$leaveTypeId) {
            if ($hrisReq->request_type === 'izin_sakit') {
                $lt = HrisLeaveType::where('tenant_id', $tenantId)->where('code', 'CS01')->first();
                $leaveTypeId = $lt ? $lt->id : null;
            } elseif ($hrisReq->request_type === 'izin_absen') {
                $lt = HrisLeaveType::where('tenant_id', $tenantId)->where('code', 'IP01')->first();
                $leaveTypeId = $lt ? $lt->id : null;
            } elseif ($hrisReq->request_type === 'izin_cuti') {
                $lt = HrisLeaveType::where('tenant_id', $tenantId)->where('code', 'CT01')->first();
                $leaveTypeId = $lt ? $lt->id : null;
            }
        }

        if ($leaveTypeId) {
            $balance = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)
                ->where('employee_id', $hrisReq->employee_id)
                ->where('leave_type_id', $leaveTypeId)
                ->where('year', $year)
                ->first();

            if ($balance) {
                $balance->used = max(0, (int)$balance->used - (int)$hrisReq->days_count);
                $balance->remaining = max(0, (int)$balance->quota - (int)$balance->used);
                $balance->save();
            }
        }
    }
`;

// Replace the store sync section
reqCtrl = reqCtrl.replace(
    /if \(\$status === 'approved'\) \{[\s\S]*?if \(\$normalizedType === 'izin_cuti'\) \{[\s\S]*?\}\n        \}/,
    `if ($status === 'approved') {
            $this->syncApprovedRequestToAttendance($hrisReq, $tenantId);
            $this->deductLeaveQuota($hrisReq, $tenantId);
        }`
);

// Replace approve method sync
reqCtrl = reqCtrl.replace(
    /\/\/ 1\. If cuti, update leave balance used[\s\S]*?\/\/ 2\. Synchronize to attendances calendar & records\n        \$this->syncApprovedRequestToAttendance\(\$hrisReq, \$tenantId\);/,
    `// 1. Deduct quota for leave / sick / absence requests
        $this->deductLeaveQuota($hrisReq, $tenantId);

        // 2. Synchronize to attendances calendar & records
        $this->syncApprovedRequestToAttendance($hrisReq, $tenantId);`
);

// Replace reject method rollback
reqCtrl = reqCtrl.replace(
    /\/\/ If previously approved, rollback attendance records\n        if \(\$wasApproved\) \{\n            \$this->removeRequestFromAttendance\(\$hrisReq\);\n        \}/,
    `// If previously approved, rollback attendance records and restore leave balance quota
        if ($wasApproved) {
            $this->removeRequestFromAttendance($hrisReq);
            $this->restoreLeaveQuota($hrisReq, $tenantId);
        }`
);

// Replace destroy method rollback
reqCtrl = reqCtrl.replace(
    /if \(\$hrisReq->status === 'approved'\) \{\n            \$this->removeRequestFromAttendance\(\$hrisReq\);\n        \}/,
    `if ($hrisReq->status === 'approved') {
            $this->removeRequestFromAttendance($hrisReq);
            $this->restoreLeaveQuota($hrisReq, $tenantId);
        }`
);

// Append helper functions before last closing brace
const lastBrace = reqCtrl.lastIndexOf('}');
reqCtrl = reqCtrl.substring(0, lastBrace) + helperFunctions + '\n}\n';

fs.writeFileSync(reqCtrlPath, reqCtrl, 'utf8');
console.log('Successfully updated HrisRequestController.php with unified quota deduction & restoration!');
