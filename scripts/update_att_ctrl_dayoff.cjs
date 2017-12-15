const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const controllerPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
let content = fs.readFileSync(controllerPath, 'utf8');

// Replace getEffectiveSchedule
const oldScheduleHelper = `    /**
     * Helper to resolve the effective schedule for an employee for today
     */
    private function getEffectiveSchedule(Employee $employee, $dateStr = null)
    {
        $date = $dateStr ?: Carbon::today()->format('Y-m-d');
        $adminId = $employee->admin_id;

        $setting = HrisAttendanceSetting::firstOrCreate(
            ['tenant_id' => $adminId],
            [
                'is_shift_enabled' => false,
                'check_in_start' => '06:00',
                'work_start_time' => '08:00',
                'late_tolerance_time' => '08:15',
                'check_in_end' => '09:00',
                'lock_after_late_cutoff' => true,
                'late_cutoff_policy' => 'empty',
                'work_end_time' => '17:00',
                'min_checkout_at_work_end' => true,
                'require_geofence_checkout' => true,
            ]
        );

        // If Shift is enabled, check employee assignment
        if ($setting->is_shift_enabled) {
            $assignment = HrisShiftAssignment::where('employee_id', $employee->id)
                ->where('date', $date)
                ->with('shift')
                ->first();

            $shift = $assignment ? $assignment->shift : null;

            // Fallback to default active shift if not specifically assigned
            if (!$shift) {
                $shift = HrisShift::where('tenant_id', $adminId)->where('is_active', true)->first();
            }

            if ($shift) {
                return [
                    'is_shift' => true,
                    'shift_id' => $shift->id,
                    'shift_name' => $shift->name,
                    'shift_code' => $shift->code,
                    'color' => $shift->color,
                    'check_in_start' => $shift->check_in_start,
                    'work_start_time' => $shift->work_start_time,
                    'late_tolerance_time' => $shift->late_tolerance_time,
                    'check_in_end' => $shift->check_in_end,
                    'work_end_time' => $shift->work_end_time,
                    'is_night_shift' => $shift->is_night_shift,
                    'lock_after_late_cutoff' => $setting->lock_after_late_cutoff,
                    'min_checkout_at_work_end' => $setting->min_checkout_at_work_end,
                    'require_geofence_checkout' => $setting->require_geofence_checkout,
                ];
            }
        }

        // Regular (Non-shift) Schedule
        return [
            'is_shift' => false,
            'shift_id' => null,
            'shift_name' => 'Reguler (Non-Shift)',
            'shift_code' => 'REG',
            'color' => '#3b82f6',
            'check_in_start' => $setting->check_in_start ?: '06:00',
            'work_start_time' => $setting->work_start_time ?: '08:00',
            'late_tolerance_time' => $setting->late_tolerance_time ?: '08:15',
            'check_in_end' => $setting->check_in_end ?: '09:00',
            'work_end_time' => $setting->work_end_time ?: '17:00',
            'is_night_shift' => false,
            'lock_after_late_cutoff' => $setting->lock_after_late_cutoff ?? true,
            'min_checkout_at_work_end' => $setting->min_checkout_at_work_end ?? true,
            'require_geofence_checkout' => $setting->require_geofence_checkout ?? true,
        ];
    }`;

const newScheduleHelper = `    /**
     * Helper to resolve the effective schedule for an employee for today
     */
    private function getEffectiveSchedule(Employee $employee, $dateStr = null)
    {
        $date = $dateStr ?: Carbon::today()->format('Y-m-d');
        $adminId = $employee->admin_id;

        $setting = HrisAttendanceSetting::firstOrCreate(
            ['tenant_id' => $adminId],
            [
                'is_shift_enabled' => false,
                'check_in_start' => '06:00',
                'work_start_time' => '08:00',
                'late_tolerance_time' => '08:15',
                'check_in_end' => '09:00',
                'lock_after_late_cutoff' => true,
                'late_cutoff_policy' => 'empty',
                'work_end_time' => '17:00',
                'min_checkout_at_work_end' => true,
                'require_geofence_checkout' => true,
            ]
        );

        // If Shift is enabled, check employee assignment
        if ($setting->is_shift_enabled) {
            $assignment = HrisShiftAssignment::where('employee_id', $employee->id)
                ->where('date', $date)
                ->with('shift')
                ->first();

            if ($assignment && $assignment->shift) {
                $shift = $assignment->shift;
                return [
                    'is_shift' => true,
                    'is_day_off' => false,
                    'shift_id' => $shift->id,
                    'shift_name' => $shift->name,
                    'shift_code' => $shift->code,
                    'color' => $shift->color ?: '#3b82f6',
                    'check_in_start' => $shift->check_in_start,
                    'work_start_time' => $shift->work_start_time,
                    'late_tolerance_time' => $shift->late_tolerance_time,
                    'check_in_end' => $shift->check_in_end,
                    'work_end_time' => $shift->work_end_time,
                    'is_night_shift' => $shift->is_night_shift,
                    'lock_after_late_cutoff' => $setting->lock_after_late_cutoff,
                    'min_checkout_at_work_end' => $setting->min_checkout_at_work_end,
                    'require_geofence_checkout' => $setting->require_geofence_checkout,
                ];
            }

            // When shift is enabled but NO shift is assigned for this date -> It is DAY OFF (Libur Kerja)
            return [
                'is_shift' => true,
                'is_day_off' => true,
                'shift_id' => null,
                'shift_name' => 'Libur Kerja',
                'shift_code' => 'OFF',
                'color' => '#94a3b8',
                'check_in_start' => null,
                'work_start_time' => null,
                'late_tolerance_time' => null,
                'check_in_end' => null,
                'work_end_time' => null,
                'is_night_shift' => false,
                'lock_after_late_cutoff' => false,
                'min_checkout_at_work_end' => false,
                'require_geofence_checkout' => $setting->require_geofence_checkout ?? true,
            ];
        }

        // Regular (Non-shift) Schedule
        return [
            'is_shift' => false,
            'is_day_off' => false,
            'shift_id' => null,
            'shift_name' => 'Reguler (Non-Shift)',
            'shift_code' => 'REG',
            'color' => '#3b82f6',
            'check_in_start' => $setting->check_in_start ?: '06:00',
            'work_start_time' => $setting->work_start_time ?: '08:00',
            'late_tolerance_time' => $setting->late_tolerance_time ?: '08:15',
            'check_in_end' => $setting->check_in_end ?: '09:00',
            'work_end_time' => $setting->work_end_time ?: '17:00',
            'is_night_shift' => false,
            'lock_after_late_cutoff' => $setting->lock_after_late_cutoff ?? true,
            'min_checkout_at_work_end' => $setting->min_checkout_at_work_end ?? true,
            'require_geofence_checkout' => $setting->require_geofence_checkout ?? true,
        ];
    }`;

content = content.replace(oldScheduleHelper, newScheduleHelper);

// Also in todayAttendance: pass is_day_off in weeklyRoster
const oldWeeklyRosterPush = `            $weeklyRoster[] = [
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
            ];`;

const newWeeklyRosterPush = `            $weeklyRoster[] = [
                'day_index' => $i,
                'day_name' => $dayNamesShort[$i],
                'day_full' => $dayNamesFull[$i],
                'date' => $dateStr,
                'date_day' => $currentDate->format('d'),
                'is_today' => $dateStr === $todayStr,
                'is_past' => $dateStr < $todayStr,
                'is_shift' => $daySchedule['is_shift'],
                'is_day_off' => $daySchedule['is_day_off'] ?? false,
                'shift_id' => $daySchedule['shift_id'],
                'shift_name' => $daySchedule['shift_name'],
                'shift_code' => $daySchedule['shift_code'],
                'color' => $daySchedule['color'],
                'work_start_time' => $daySchedule['work_start_time'],
                'work_end_time' => $daySchedule['work_end_time'],
            ];`;

content = content.replace(oldWeeklyRosterPush, newWeeklyRosterPush);

// Also in todayAttendance checkIn/checkOut permissions if is_day_off:
const oldWindowCheck = `        if (!$attendance || !$attendance->check_in) {
            // Not checked in yet
            if ($schedule['check_in_start'] && $currentTimeStr < $schedule['check_in_start']) {
                $canCheckIn = false;
                $windowStatus = 'too_early';
                $windowMessage = "Absen masuk dibuka pukul {$schedule['check_in_start']} WIB.";
            } elseif ($schedule['lock_after_late_cutoff'] && $schedule['check_in_end'] && $currentTimeStr > $schedule['check_in_end']) {
                $canCheckIn = false;
                $windowStatus = 'locked_late';
                $windowMessage = "Batas waktu absensi masuk berakhir pukul {$schedule['check_in_end']} WIB. Hubungi HRD.";
            } else {
                $canCheckIn = true;
                $threshold = $schedule['late_tolerance_time'] ?: $schedule['work_start_time'];
                if ($threshold && $currentTimeStr > $threshold) {
                    $windowStatus = 'late';
                    $windowMessage = "Anda terlambat. Batas toleransi adalah {$threshold} WIB.";
                } else {
                    $windowStatus = 'ontime';
                    $windowMessage = "Waktu absensi masuk normal.";
                }
            }
        }`;

const newWindowCheck = `        if (!$attendance || !$attendance->check_in) {
            // Not checked in yet
            if (!empty($schedule['is_day_off'])) {
                $canCheckIn = true; // allow voluntary check-in / overtime
                $windowStatus = 'day_off';
                $windowMessage = "Hari ini adalah hari libur kerja Anda (Day Off).";
            } elseif ($schedule['check_in_start'] && $currentTimeStr < $schedule['check_in_start']) {
                $canCheckIn = false;
                $windowStatus = 'too_early';
                $windowMessage = "Absen masuk dibuka pukul {$schedule['check_in_start']} WIB.";
            } elseif ($schedule['lock_after_late_cutoff'] && $schedule['check_in_end'] && $currentTimeStr > $schedule['check_in_end']) {
                $canCheckIn = false;
                $windowStatus = 'locked_late';
                $windowMessage = "Batas waktu absensi masuk berakhir pukul {$schedule['check_in_end']} WIB. Hubungi HRD.";
            } else {
                $canCheckIn = true;
                $threshold = $schedule['late_tolerance_time'] ?: $schedule['work_start_time'];
                if ($threshold && $currentTimeStr > $threshold) {
                    $windowStatus = 'late';
                    $windowMessage = "Anda terlambat. Batas toleransi adalah {$threshold} WIB.";
                } else {
                    $windowStatus = 'ontime';
                    $windowMessage = "Waktu absensi masuk normal.";
                }
            }
        }`;

content = content.replace(oldWindowCheck, newWindowCheck);

fs.writeFileSync(controllerPath, content, 'utf8');
console.log('Successfully updated AttendanceController.php with proper is_day_off resolution!');
