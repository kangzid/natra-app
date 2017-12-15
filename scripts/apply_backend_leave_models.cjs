const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Update app/Models/Employee.php
const empModelPath = path.join(backendDir, 'app/Models/Employee.php');
let empModel = fs.readFileSync(empModelPath, 'utf8');

if (!empModel.includes('function loans(')) {
    const insertAfter = 'public function attendances()\n    {\n        return $this->hasMany(Attendance::class);\n    }';
    const loanRelation = `\n\n    public function loans()\n    {\n        return $this->hasMany(HrisLoan::class, 'employee_id');\n    }`;
    if (empModel.includes(insertAfter)) {
        empModel = empModel.replace(insertAfter, insertAfter + loanRelation);
    } else {
        // Insert before last closing brace
        const lastBrace = empModel.lastIndexOf('}');
        empModel = empModel.substring(0, lastBrace) + loanRelation + '\n}\n';
    }
    fs.writeFileSync(empModelPath, empModel, 'utf8');
    console.log('Added loans() relationship to Employee.php!');
} else {
    console.log('Employee.php already has loans() relationship.');
}

// 2. Update app/Models/HrisEmployeeLeaveBalance.php
const leaveBalancePath = path.join(backendDir, 'app/Models/HrisEmployeeLeaveBalance.php');
let leaveBalance = fs.readFileSync(leaveBalancePath, 'utf8');

const newLeaveBalanceModel = `<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrisEmployeeLeaveBalance extends Model
{
    use HasFactory;

    protected $table = 'hris_employee_leave_balances';

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'leave_type_id',
        'year',
        'quota',
        'used',
        'remaining',
    ];

    protected $casts = [
        'year' => 'integer',
        'quota' => 'integer',
        'used' => 'integer',
        'remaining' => 'integer',
    ];

    protected $appends = ['remaining_days'];

    protected static function booted()
    {
        static::saving(function ($balance) {
            $quota = (int)($balance->quota ?? 0);
            $used = (int)($balance->used ?? 0);
            $balance->remaining = max(0, $quota - $used);
        });
    }

    public function getRemainingDaysAttribute()
    {
        return max(0, (int)($this->quota ?? 0) - (int)($this->used ?? 0));
    }

    public function getRemainingAttribute($value)
    {
        return max(0, (int)($this->quota ?? 0) - (int)($this->used ?? 0));
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function leaveType()
    {
        return $this->belongsTo(HrisLeaveType::class, 'leave_type_id');
    }
}
`;

fs.writeFileSync(leaveBalancePath, newLeaveBalanceModel, 'utf8');
console.log('Updated HrisEmployeeLeaveBalance.php with automatic remaining days calculation and booted saving listener!');

// 3. Update app/Http/Controllers/Api/HrisLeaveSettingController.php
const leaveSettingCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisLeaveSettingController.php');
let leaveSettingCtrl = fs.readFileSync(leaveSettingCtrlPath, 'utf8');

const updatedUpdateLeaveBalance = `    public function updateLeaveBalance(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $balance = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'quota' => 'required|integer|min:0',
            'used' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quota = (int)$request->quota;
        $used = (int)$request->used;
        $remaining = max(0, $quota - $used);

        $balance->update([
            'quota' => $quota,
            'used' => $used,
            'remaining' => $remaining,
        ]);

        return response()->json($balance->fresh(['employee.user', 'leaveType']));
    }`;

leaveSettingCtrl = leaveSettingCtrl.replace(/public function updateLeaveBalance\([\s\S]*?return response\(\)->json\(\$balance\);\n    \}/, updatedUpdateLeaveBalance);

// In getLeaveBalances, ensure default leave balances exist for active employees
const updatedGetLeaveBalances = `    public function getLeaveBalances(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $year = (int)($request->year ?? date('Y'));

        // Check active leave types for this tenant
        $leaveTypes = HrisLeaveType::where('tenant_id', $tenantId)->get();
        if ($leaveTypes->isEmpty()) {
            $this->getLeaveTypes($request); // Seed defaults if empty
            $leaveTypes = HrisLeaveType::where('tenant_id', $tenantId)->get();
        }

        // Auto-seed missing balance records for active employees
        $employees = Employee::where('admin_id', $tenantId)->where('is_active', true)->get();
        foreach ($employees as $emp) {
            foreach ($leaveTypes as $lt) {
                HrisEmployeeLeaveBalance::firstOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'employee_id' => $emp->id,
                        'leave_type_id' => $lt->id,
                        'year' => $year,
                    ],
                    [
                        'quota' => $lt->default_days ?? 12,
                        'used' => 0,
                        'remaining' => $lt->default_days ?? 12,
                    ]
                );
            }
        }

        $balances = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)
            ->where('year', $year)
            ->with(['employee.user', 'leaveType'])
            ->orderBy('employee_id', 'asc')
            ->orderBy('leave_type_id', 'asc')
            ->get();

        return response()->json($balances);
    }`;

leaveSettingCtrl = leaveSettingCtrl.replace(/public function getLeaveBalances\([\s\S]*?return response\(\)->json\(\$balances\);\n    \}/, updatedGetLeaveBalances);

fs.writeFileSync(leaveSettingCtrlPath, leaveSettingCtrl, 'utf8');
console.log('Updated HrisLeaveSettingController.php with auto-seeding and accurate remaining calculation!');
