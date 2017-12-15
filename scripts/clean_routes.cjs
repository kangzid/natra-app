const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const routesPath = path.join(backendDir, 'routes/api.php');
let code = fs.readFileSync(routesPath, 'utf8');

// Clean up duplicate or misplaced shift routes and place cleanly under Route::prefix('hris')
if (!code.includes("Route::get('/shifts'")) {
  const hrisInsertPoint = "Route::prefix('hris')->group(function () {";
  const shiftRoutesBlock = `Route::prefix('hris')->group(function () {
        // Attendance Settings & Master Shifts
        Route::get('/attendance-settings', [\\App\\Http\\Controllers\\Api\\AttendanceController::class, 'getSettings']);
        Route::post('/attendance-settings', [\\App\\Http\\Controllers\\Api\\AttendanceController::class, 'saveSettings']);

        Route::get('/shifts', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'index']);
        Route::post('/shifts', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'store']);
        Route::put('/shifts/{id}', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'update']);
        Route::delete('/shifts/{id}', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'destroy']);

        Route::get('/shift-assignments', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'getAssignments']);
        Route::post('/shift-assignments', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'assignShifts']);
        Route::delete('/shift-assignments/{id}', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'deleteAssignment']);
`;
  code = code.replace(hrisInsertPoint, shiftRoutesBlock);
  fs.writeFileSync(routesPath, code, 'utf8');
  console.log('Placed shift routes inside Route::prefix(hris)!');
} else {
  console.log('Shift routes already inside api.php');
}
