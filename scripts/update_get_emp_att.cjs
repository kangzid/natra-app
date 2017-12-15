const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const controllerPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
let content = fs.readFileSync(controllerPath, 'utf8');

const oldGetMethod = `    public function getEmployeeAttendances(Request $request, $employeeId)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $adminId = $request->user()->id;
        $employee = Employee::where('id', $employeeId)
            ->where('admin_id', $adminId)
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found or does not belong to your tenant'], 404);
        }

        $validator = Validator::make($request->all(), [
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $month = $request->month ?? Carbon::now()->month;
        $year = $request->year ?? Carbon::now()->year;

        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $startDate = Carbon::create($year, $month, 1);
        $endDate = Carbon::create($year, $month, $daysInMonth);

        $attendances = Attendance::with(['employee.user', 'shift'])
            ->where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('date', 'asc')
            ->get();

        $result = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day)->format('Y-m-d');
            $att = $attendances->firstWhere('date', $date);
            $result[] = [
                'date' => $date,
                'attendance' => $att,
            ];
        }

        return response()->json([
            'employee' => $employee->load('user'),
            'month' => $month,
            'year' => $year,
            'days' => $result,
        ]);
    }`;

const newGetMethod = `    public function getEmployeeAttendances(Request $request, $employeeId)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $adminId = $request->user()->id;
        $employee = Employee::where('id', $employeeId)
            ->where('admin_id', $adminId)
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found or does not belong to your tenant'], 404);
        }

        $validator = Validator::make($request->all(), [
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $month = (int) ($request->month ?? Carbon::now()->month);
        $year = (int) ($request->year ?? Carbon::now()->year);

        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = Carbon::create($year, $month, $daysInMonth)->endOfDay();

        $attendances = Attendance::with(['employee.user', 'shift'])
            ->where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate->format('Y-m-d 00:00:00'), $endDate->format('Y-m-d 23:59:59')])
            ->orderBy('date', 'asc')
            ->get();

        $result = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $carbonDate = Carbon::create($year, $month, $day);
            $dateStr = $carbonDate->format('Y-m-d');
            
            $att = $attendances->first(function ($item) use ($dateStr) {
                $itemDate = is_string($item->date) ? substr($item->date, 0, 10) : (is_object($item->date) ? $item->date->format('Y-m-d') : '');
                return $itemDate === $dateStr;
            });

            $result[] = [
                'date' => $dateStr,
                'day_name' => $carbonDate->format('l'), // e.g. "Sunday", "Monday"
                'attendance' => $att,
            ];
        }

        return response()->json([
            'employee' => $employee->load('user'),
            'month' => $month,
            'year' => $year,
            'days_in_month' => $daysInMonth,
            'attendances' => $result,
            'days' => $result,
        ]);
    }`;

content = content.replace(oldGetMethod, newGetMethod);
fs.writeFileSync(controllerPath, content, 'utf8');
console.log('Successfully updated AttendanceController::getEmployeeAttendances!');
