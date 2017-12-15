const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const attCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
let content = fs.readFileSync(attCtrlPath, 'utf8');

// Update todayAttendance method to include weekly_roster
const targetTodayMethod = `        return response()->json([
            'attendance' => $attendance,
            'schedule' => $schedule,
            'can_check_in' => $canCheckIn,
            'can_check_out' => $canCheckOut,
            'window_status' => $windowStatus,
            'window_message' => $windowMessage,
            'server_time' => $now->toIso8601String(),
        ]);`;

const replacementTodayMethod = `        // Compute Weekly Shift Roster for this Employee
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $weeklyRoster = [];
        $dayNamesShort = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        $dayNamesFull = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        for ($i = 0; $i < 7; $i++) {
            $currentDate = $startOfWeek->copy()->addDays($i);
            $dateStr = $currentDate->format('Y-m-d');
            $daySchedule = $this->getEffectiveSchedule($employee, $dateStr);

            $weeklyRoster[] = [
                'day_index' => $i,
                'day_name' => $dayNamesShort[$i],
                'day_full' => $dayNamesFull[$i],
                'date' => $dateStr,
                'date_day' => $currentDate->format('d'),
                'is_today' => $dateStr === $todayStr,
                'is_past' => $dateStr < $todayStr,
                'is_shift' => $daySchedule['is_shift'],
                'shift_id' => $daySchedule['shift_id'],
                'shift_name' => $daySchedule['shift_name'],
                'shift_code' => $daySchedule['shift_code'],
                'color' => $daySchedule['color'],
                'work_start_time' => $daySchedule['work_start_time'],
                'work_end_time' => $daySchedule['work_end_time'],
            ];
        }

        $monthNamesId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $currentMonthLabel = $monthNamesId[$now->month - 1] . ' ' . $now->year;

        return response()->json([
            'attendance' => $attendance,
            'schedule' => $schedule,
            'weekly_roster' => $weeklyRoster,
            'current_month_label' => $currentMonthLabel,
            'can_check_in' => $canCheckIn,
            'can_check_out' => $canCheckOut,
            'window_status' => $windowStatus,
            'window_message' => $windowMessage,
            'server_time' => $now->toIso8601String(),
        ]);`;

if (content.includes(targetTodayMethod)) {
  content = content.replace(targetTodayMethod, replacementTodayMethod);
  fs.writeFileSync(attCtrlPath, content, 'utf8');
  console.log('Successfully updated todayAttendance in AttendanceController.php with weekly_roster!');
} else {
  console.log('Target string in todayAttendance not found.');
}
