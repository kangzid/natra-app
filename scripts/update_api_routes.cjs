const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const apiRoutesPath = path.join(backendDir, 'routes/api.php');
let routesCode = fs.readFileSync(apiRoutesPath, 'utf8');

// Check if HrisShiftController is imported or used
if (!routesCode.includes('HrisShiftController')) {
  // Add shift routes inside Route::middleware('auth:sanctum')
  const shiftRoutesCode = `
    // HRIS Shift & Attendance Settings Routes
    Route::prefix('hris')->group(function () {
        Route::get('/attendance-settings', [App\\Http\\Controllers\\Api\\AttendanceController::class, 'getSettings']);
        Route::post('/attendance-settings', [App\\Http\\Controllers\\Api\\AttendanceController::class, 'saveSettings']);

        Route::get('/shifts', [App\\Http\\Controllers\\Api\\HrisShiftController::class, 'index']);
        Route::post('/shifts', [App\\Http\\Controllers\\Api\\HrisShiftController::class, 'store']);
        Route::put('/shifts/{id}', [App\\Http\\Controllers\\Api\\HrisShiftController::class, 'update']);
        Route::delete('/shifts/{id}', [App\\Http\\Controllers\\Api\\HrisShiftController::class, 'destroy']);

        Route::get('/shift-assignments', [App\\Http\\Controllers\\Api\\HrisShiftController::class, 'getAssignments']);
        Route::post('/shift-assignments', [App\\Http\\Controllers\\Api\\HrisShiftController::class, 'assignShifts']);
        Route::delete('/shift-assignments/{id}', [App\\Http\\Controllers\\Api\\HrisShiftController::class, 'deleteAssignment']);
    });
`;

  // Insert before the end of the sanctum auth group or near other hris routes
  if (routesCode.includes("Route::prefix('hris')->group(function () {")) {
    // Replace the first hris prefix or add inside
    routesCode = routesCode.replace("Route::prefix('hris')->group(function () {", "Route::prefix('hris')->group(function () {\n" + shiftRoutesCode);
  } else {
    // Insert before closing bracket of sanctum group
    const lastBrace = routesCode.lastIndexOf('});');
    if (lastBrace !== -1) {
      routesCode = routesCode.substring(0, lastBrace) + shiftRoutesCode + '\n});\n';
    }
  }

  fs.writeFileSync(apiRoutesPath, routesCode, 'utf8');
  console.log('Successfully added Shift & Attendance Settings routes to api.php!');
} else {
  console.log('Shift routes already present in api.php');
}
