const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. HrisShift.php
const shiftModelPath = path.join(backendDir, 'app/Models/HrisShift.php');
const shiftModelContent = `<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrisShift extends Model
{
    use HasFactory;

    protected $table = 'hris_shifts';

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'check_in_start',
        'work_start_time',
        'late_tolerance_time',
        'check_in_end',
        'work_end_time',
        'is_night_shift',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_night_shift' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function assignments()
    {
        return $this->hasMany(HrisShiftAssignment::class, 'shift_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'shift_id');
    }
}
`;
fs.writeFileSync(shiftModelPath, shiftModelContent, 'utf8');
console.log('Created HrisShift.php');

// 2. HrisShiftAssignment.php
const assignmentModelPath = path.join(backendDir, 'app/Models/HrisShiftAssignment.php');
const assignmentModelContent = `<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrisShiftAssignment extends Model
{
    use HasFactory;

    protected $table = 'hris_shift_assignments';

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'shift_id',
        'date',
        'notes',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function shift()
    {
        return $this->belongsTo(HrisShift::class, 'shift_id');
    }
}
`;
fs.writeFileSync(assignmentModelPath, assignmentModelContent, 'utf8');
console.log('Created HrisShiftAssignment.php');

// 3. Update HrisAttendanceSetting.php
const settingModelPath = path.join(backendDir, 'app/Models/HrisAttendanceSetting.php');
const settingModelContent = `<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrisAttendanceSetting extends Model
{
    use HasFactory;

    protected $table = 'hris_attendance_settings';

    protected $fillable = [
        'tenant_id',
        'is_shift_enabled',
        'check_in_start',
        'work_start_time',
        'late_tolerance_time',
        'check_in_end',
        'lock_after_late_cutoff',
        'late_cutoff_policy',
        'work_end_time',
        'min_checkout_at_work_end',
        'require_geofence_checkout',
        'edit_delete_limit_days',
        'allow_admin_bypass',
    ];

    protected $casts = [
        'is_shift_enabled' => 'boolean',
        'lock_after_late_cutoff' => 'boolean',
        'min_checkout_at_work_end' => 'boolean',
        'require_geofence_checkout' => 'boolean',
        'edit_delete_limit_days' => 'integer',
        'allow_admin_bypass' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }
}
`;
fs.writeFileSync(settingModelPath, settingModelContent, 'utf8');
console.log('Updated HrisAttendanceSetting.php');

// 4. Update Attendance.php to add shift relationship
const attModelPath = path.join(backendDir, 'app/Models/Attendance.php');
if (fs.existsSync(attModelPath)) {
  let attCode = fs.readFileSync(attModelPath, 'utf8');
  if (!attCode.includes('public function shift()')) {
    const methodToAdd = `
    public function shift()
    {
        return $this->belongsTo(HrisShift::class, 'shift_id');
    }
`;
    // Insert before closing bracket
    const lastBraceIndex = attCode.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      attCode = attCode.substring(0, lastBraceIndex) + methodToAdd + '\n}\n';
      // Also add shift_id to fillable if fillable exists
      if (attCode.includes("'employee_id',") && !attCode.includes("'shift_id',")) {
        attCode = attCode.replace("'employee_id',", "'employee_id',\n        'shift_id',");
      }
      fs.writeFileSync(attModelPath, attCode, 'utf8');
      console.log('Updated Attendance.php with shift relation');
    }
  }
}

// 5. Update Employee.php to add shiftAssignments relationship
const empModelPath = path.join(backendDir, 'app/Models/Employee.php');
if (fs.existsSync(empModelPath)) {
  let empCode = fs.readFileSync(empModelPath, 'utf8');
  if (!empCode.includes('public function shiftAssignments()')) {
    const empMethodToAdd = `
    public function shiftAssignments()
    {
        return $this->hasMany(HrisShiftAssignment::class, 'employee_id');
    }

    public function todayShift($date = null)
    {
        $targetDate = $date ?: \\Carbon\\Carbon::today()->format('Y-m-d');
        $assignment = $this->shiftAssignments()->where('date', $targetDate)->with('shift')->first();
        return $assignment ? $assignment->shift : null;
    }
`;
    const lastBrace = empCode.lastIndexOf('}');
    if (lastBrace !== -1) {
      empCode = empCode.substring(0, lastBrace) + empMethodToAdd + '\n}\n';
      fs.writeFileSync(empModelPath, empCode, 'utf8');
      console.log('Updated Employee.php with shiftAssignments');
    }
  }
}
