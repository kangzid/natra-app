const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const leaveBalancePath = path.join(backendDir, 'app/Models/HrisEmployeeLeaveBalance.php');

const cleanModel = `<?php

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

fs.writeFileSync(leaveBalancePath, cleanModel, 'utf8');
console.log('Fixed HrisEmployeeLeaveBalance.php namespaces!');
