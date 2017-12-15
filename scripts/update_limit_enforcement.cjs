const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const controllerPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
let content = fs.readFileSync(controllerPath, 'utf8');

const oldMethods = `    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendance = Attendance::findOrFail($id);

        if ($attendance->employee->admin_id != $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:present,absent,late,early_leave,sakit,cuti,izin,dinas',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string|max:255',
            'shift_id' => 'nullable|integer|exists:hris_shifts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = [];
        if ($request->status) $updateData['status'] = $request->status;
        if ($request->has('notes')) $updateData['notes'] = $request->notes;
        if ($request->has('shift_id')) $updateData['shift_id'] = $request->shift_id;

        if ($request->check_in) {
            $updateData['check_in'] = Carbon::parse(Carbon::parse($attendance->date)->format('Y-m-d') . ' ' . $request->check_in);
        }
        if ($request->check_out) {
            $updateData['check_out'] = Carbon::parse(Carbon::parse($attendance->date)->format('Y-m-d') . ' ' . $request->check_out);
        }

        $attendance->update($updateData);

        return response()->json($attendance->load(['employee.user', 'shift']));
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendance = Attendance::findOrFail($id);
        if ($attendance->employee->admin_id != $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $setting = HrisAttendanceSetting::where('tenant_id', $request->user()->id)->first();
        $limitDays = $setting ? $setting->edit_delete_limit_days : 0;
        if ($limitDays > 0 && Carbon::parse($attendance->date)->diffInDays(Carbon::now()) > $limitDays) {
            return response()->json(['message' => "Hanya dapat menghapus absensi dalam {$limitDays} hari terakhir"], 403);
        }

        $attendance->delete();

        return response()->json(['message' => 'Absensi berhasil dihapus']);
    }

    public function storeAdmin(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employees,id',
            'date' => 'required|date_format:Y-m-d',
            'status' => 'required|in:present,absent,late,early_leave,sakit,cuti,izin,dinas',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string|max:255',
            'shift_id' => 'nullable|integer|exists:hris_shifts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $adminId = $request->user()->id;
        $employee = Employee::where('id', $request->employee_id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found or does not belong to your tenant'], 404);
        }

        $existingAttendance = Attendance::where('employee_id', $request->employee_id)
            ->where('date', $request->date)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'message' => 'Data absensi untuk tanggal ini sudah ada',
                'date' => $request->date,
                'existing_id' => $existingAttendance->id,
            ], 409);
        }

        $attendanceData = [
            'admin_id' => $adminId,
            'employee_id' => $request->employee_id,
            'date' => $request->date,
            'status' => $request->status,
            'notes' => $request->notes,
            'shift_id' => $request->shift_id,
        ];

        if ($request->check_in) {
            $attendanceData['check_in'] = Carbon::parse($request->date . ' ' . $request->check_in);
        }
        if ($request->check_out) {
            $attendanceData['check_out'] = Carbon::parse($request->date . ' ' . $request->check_out);
        }

        $attendance = Attendance::create($attendanceData);

        return response()->json($attendance->load(['employee.user', 'shift']), 201);
    }`;

const newMethods = `    /**
     * Helper to verify if an attendance date is within the tenant's modification limit window
     */
    private function checkDateModificationLimit($adminId, $targetDate, $actionName = 'memodifikasi')
    {
        $setting = HrisAttendanceSetting::where('tenant_id', $adminId)->first();
        $limitDays = $setting ? (int) $setting->edit_delete_limit_days : 0;

        if ($limitDays > 0) {
            $parsedTarget = Carbon::parse($targetDate)->startOfDay();
            $cutoffDate = Carbon::now()->startOfDay()->subDays($limitDays);

            if ($parsedTarget->lt($cutoffDate)) {
                return "Batas waktu telah terlewati. Anda hanya dapat {$actionName} absensi dalam rentang {$limitDays} hari terakhir.";
            }
        }

        return null;
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendance = Attendance::findOrFail($id);

        if ($attendance->employee->admin_id != $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $limitError = $this->checkDateModificationLimit($request->user()->id, $attendance->date, 'mengedit');
        if ($limitError) {
            return response()->json(['message' => $limitError], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:present,absent,late,early_leave,sakit,cuti,izin,dinas',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string|max:255',
            'shift_id' => 'nullable|integer|exists:hris_shifts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = [];
        if ($request->status) $updateData['status'] = $request->status;
        if ($request->has('notes')) $updateData['notes'] = $request->notes;
        if ($request->has('shift_id')) $updateData['shift_id'] = $request->shift_id;

        if ($request->check_in) {
            $updateData['check_in'] = Carbon::parse(Carbon::parse($attendance->date)->format('Y-m-d') . ' ' . $request->check_in);
        }
        if ($request->check_out) {
            $updateData['check_out'] = Carbon::parse(Carbon::parse($attendance->date)->format('Y-m-d') . ' ' . $request->check_out);
        }

        $attendance->update($updateData);

        return response()->json($attendance->load(['employee.user', 'shift']));
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendance = Attendance::findOrFail($id);
        if ($attendance->employee->admin_id != $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $limitError = $this->checkDateModificationLimit($request->user()->id, $attendance->date, 'menghapus');
        if ($limitError) {
            return response()->json(['message' => $limitError], 403);
        }

        $attendance->delete();

        return response()->json(['message' => 'Absensi berhasil dihapus']);
    }

    public function storeAdmin(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employees,id',
            'date' => 'required|date_format:Y-m-d',
            'status' => 'required|in:present,absent,late,early_leave,sakit,cuti,izin,dinas',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string|max:255',
            'shift_id' => 'nullable|integer|exists:hris_shifts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $adminId = $request->user()->id;
        $employee = Employee::where('id', $request->employee_id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found or does not belong to your tenant'], 404);
        }

        $limitError = $this->checkDateModificationLimit($adminId, $request->date, 'menambah');
        if ($limitError) {
            return response()->json(['message' => $limitError], 403);
        }

        $existingAttendance = Attendance::where('employee_id', $request->employee_id)
            ->where('date', $request->date)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'message' => 'Data absensi untuk tanggal ini sudah ada',
                'date' => $request->date,
                'existing_id' => $existingAttendance->id,
            ], 409);
        }

        $attendanceData = [
            'admin_id' => $adminId,
            'employee_id' => $request->employee_id,
            'date' => $request->date,
            'status' => $request->status,
            'notes' => $request->notes,
            'shift_id' => $request->shift_id,
        ];

        if ($request->check_in) {
            $attendanceData['check_in'] = Carbon::parse($request->date . ' ' . $request->check_in);
        }
        if ($request->check_out) {
            $attendanceData['check_out'] = Carbon::parse($request->date . ' ' . $request->check_out);
        }

        $attendance = Attendance::create($attendanceData);

        return response()->json($attendance->load(['employee.user', 'shift']), 201);
    }`;

content = content.replace(oldMethods, newMethods);
fs.writeFileSync(controllerPath, content, 'utf8');
console.log('Successfully enforced modification limits in AttendanceController for Create, Update, and Delete!');
