const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const shiftControllerPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisShiftController.php');

const shiftControllerContent = `<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\HrisShift;
use App\Models\HrisShiftAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class HrisShiftController extends Controller
{
    /**
     * Get all master shifts for current tenant
     */
    public function index(Request $request)
    {
        $adminId = $request->user()->isAdmin() ? $request->user()->id : ($request->user()->employee ? $request->user()->employee->admin_id : null);
        if (!$adminId) {
            return response()->json(['message' => 'Unauthorized or tenant not found'], 403);
        }

        $shifts = HrisShift::where('tenant_id', $adminId)
            ->withCount('assignments')
            ->orderBy('work_start_time', 'asc')
            ->get();

        return response()->json([
            'shifts' => $shifts,
            'total' => $shifts->count(),
        ]);
    }

    /**
     * Create a new master shift
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50',
            'check_in_start' => 'required|string',
            'work_start_time' => 'required|string',
            'late_tolerance_time' => 'required|string',
            'check_in_end' => 'required|string',
            'work_end_time' => 'required|string',
            'is_night_shift' => 'nullable|boolean',
            'color' => 'nullable|string|max:20',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $shift = HrisShift::create([
            'tenant_id' => $request->user()->id,
            'name' => $request->name,
            'code' => $request->code ?: 'SHF-' . strtoupper(substr(uniqid(), -4)),
            'check_in_start' => substr($request->check_in_start, 0, 5),
            'work_start_time' => substr($request->work_start_time, 0, 5),
            'late_tolerance_time' => substr($request->late_tolerance_time, 0, 5),
            'check_in_end' => substr($request->check_in_end, 0, 5),
            'work_end_time' => substr($request->work_end_time, 0, 5),
            'is_night_shift' => $request->is_night_shift ?? false,
            'color' => $request->color ?: '#3b82f6',
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'Master shift berhasil dibuat',
            'shift' => $shift,
        ], 201);
    }

    /**
     * Update existing master shift
     */
    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shift = HrisShift::where('id', $id)
            ->where('tenant_id', $request->user()->id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:50',
            'check_in_start' => 'required|string',
            'work_start_time' => 'required|string',
            'late_tolerance_time' => 'required|string',
            'check_in_end' => 'required|string',
            'work_end_time' => 'required|string',
            'is_night_shift' => 'nullable|boolean',
            'color' => 'nullable|string|max:20',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $shift->update([
            'name' => $request->name,
            'code' => $request->code ?: $shift->code,
            'check_in_start' => substr($request->check_in_start, 0, 5),
            'work_start_time' => substr($request->work_start_time, 0, 5),
            'late_tolerance_time' => substr($request->late_tolerance_time, 0, 5),
            'check_in_end' => substr($request->check_in_end, 0, 5),
            'work_end_time' => substr($request->work_end_time, 0, 5),
            'is_night_shift' => $request->is_night_shift ?? $shift->is_night_shift,
            'color' => $request->color ?: $shift->color,
            'is_active' => $request->is_active ?? $shift->is_active,
        ]);

        return response()->json([
            'message' => 'Master shift berhasil diperbarui',
            'shift' => $shift,
        ]);
    }

    /**
     * Delete master shift
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $shift = HrisShift::where('id', $id)
            ->where('tenant_id', $request->user()->id)
            ->firstOrFail();

        // If shift has attendances recorded, deactivate instead of hard delete
        if ($shift->attendances()->exists()) {
            $shift->update(['is_active' => false]);
            return response()->json(['message' => 'Shift dinonaktifkan karena telah memiliki riwayat absensi']);
        }

        $shift->delete();
        return response()->json(['message' => 'Master shift berhasil dihapus']);
    }

    /**
     * Get shift assignments / roster
     */
    public function getAssignments(Request $request)
    {
        $adminId = $request->user()->isAdmin() ? $request->user()->id : ($request->user()->employee ? $request->user()->employee->admin_id : null);
        if (!$adminId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $month = $request->month ?: Carbon::now()->month;
        $year = $request->year ?: Carbon::now()->year;

        $startDate = $request->start_date ?: Carbon::createFromDate($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $endDate = $request->end_date ?: Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');

        $query = HrisShiftAssignment::where('tenant_id', $adminId)
            ->whereBetween('date', [$startDate, $endDate])
            ->with(['employee.user', 'shift']);

        if ($request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }

        $assignments = $query->orderBy('date', 'asc')->get();

        // Also fetch all employees for this tenant for the roster matrix
        $employees = Employee::where('admin_id', $adminId)
            ->with('user:id,name,email')
            ->get(['id', 'user_id', 'employee_id', 'department', 'position']);

        $shifts = HrisShift::where('tenant_id', $adminId)->where('is_active', true)->get();

        return response()->json([
            'assignments' => $assignments,
            'employees' => $employees,
            'shifts' => $shifts,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }

    /**
     * Bulk assign or assign shift to employees
     */
    public function assignShifts(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'integer|exists:employees,id',
            'shift_id' => 'required|integer|exists:hris_shifts,id',
            'dates' => 'nullable|array',
            'dates.*' => 'date_format:Y-m-d',
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $adminId = $request->user()->id;

        // Resolve dates list
        $datesList = [];
        if (!empty($request->dates)) {
            $datesList = $request->dates;
        } elseif ($request->start_date && $request->end_date) {
            $period = CarbonPeriod::create($request->start_date, $request->end_date);
            foreach ($period as $date) {
                $datesList[] = $date->format('Y-m-d');
            }
        } else {
            return response()->json(['message' => 'Silakan tentukan tanggal atau rentang tanggal jadwal'], 422);
        }

        $assignedCount = 0;
        DB::transaction(function () use ($adminId, $request, $datesList, &$assignedCount) {
            foreach ($request->employee_ids as $empId) {
                // Verify employee belongs to this tenant
                $emp = Employee::where('id', $empId)->where('admin_id', $adminId)->first();
                if (!$emp) continue;

                foreach ($datesList as $dateStr) {
                    HrisShiftAssignment::updateOrCreate(
                        [
                            'tenant_id' => $adminId,
                            'employee_id' => $empId,
                            'date' => $dateStr,
                        ],
                        [
                            'shift_id' => $request->shift_id,
                            'notes' => $request->notes,
                        ]
                    );
                    $assignedCount++;
                }
            }
        });

        return response()->json([
            'message' => "Berhasil menetapkan jadwal shift untuk {$assignedCount} jadwal penugasan.",
            'assigned_count' => $assignedCount,
        ]);
    }

    /**
     * Delete a shift assignment
     */
    public function deleteAssignment(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignment = HrisShiftAssignment::where('id', $id)
            ->where('tenant_id', $request->user()->id)
            ->firstOrFail();

        $assignment->delete();

        return response()->json(['message' => 'Jadwal shift berhasil dihapus']);
    }
}
`;

fs.writeFileSync(shiftControllerPath, shiftControllerContent, 'utf8');
console.log('Created HrisShiftController.php successfully!');
