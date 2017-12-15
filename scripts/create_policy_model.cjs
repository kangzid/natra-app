const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Create app/Models/HrisRequestPolicy.php
const policyModelPath = path.join(backendDir, 'app/Models/HrisRequestPolicy.php');
const policyModelContent = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class HrisRequestPolicy extends Model
{
    use HasFactory;

    protected $table = 'hris_request_policies';

    protected $fillable = [
        'tenant_id',
        'policy_type',
        'max_days_per_year',
        'requires_attachment',
        'is_paid',
        'description',
    ];

    protected $casts = [
        'max_days_per_year' => 'integer',
        'requires_attachment' => 'boolean',
        'is_paid' => 'boolean',
    ];
}
`;

fs.writeFileSync(policyModelPath, policyModelContent, 'utf8');
console.log('Created HrisRequestPolicy.php model!');

// 2. Update app/Models/HrisEmployeeLeaveBalance.php fillable to include category
const leaveBalancePath = path.join(backendDir, 'app/Models/HrisEmployeeLeaveBalance.php');
let leaveBalance = fs.readFileSync(leaveBalancePath, 'utf8');

const updatedLeaveBalance = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class HrisEmployeeLeaveBalance extends Model
{
    use HasFactory;

    protected $table = 'hris_employee_leave_balances';

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'leave_type_id',
        'category',
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
            if (empty($balance->category)) {
                $balance->category = 'leave';
            }
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

fs.writeFileSync(leaveBalancePath, updatedLeaveBalance, 'utf8');
console.log('Updated HrisEmployeeLeaveBalance.php with category support!');
