const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const routesPath = path.join(backendDir, 'routes/api.php');
let content = fs.readFileSync(routesPath, 'utf8');

// Replace the nested Route::prefix('hris') inside Route::prefix('hris')
const badNested = `        Route::prefix('hris')->group(function () {

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
    });`;

const goodClean = `        Route::prefix('hris')->group(function () {
        // HRIS Shift & Attendance Settings Routes
        Route::get('/attendance-settings', [\\App\\Http\\Controllers\\Api\\AttendanceController::class, 'getSettings']);
        Route::post('/attendance-settings', [\\App\\Http\\Controllers\\Api\\AttendanceController::class, 'saveSettings']);

        Route::get('/shifts', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'index']);
        Route::post('/shifts', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'store']);
        Route::put('/shifts/{id}', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'update']);
        Route::delete('/shifts/{id}', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'destroy']);

        Route::get('/shift-assignments', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'getAssignments']);
        Route::post('/shift-assignments', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'assignShifts']);
        Route::delete('/shift-assignments/{id}', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'deleteAssignment']);`;

if (content.includes(badNested)) {
  content = content.replace(badNested, goodClean);
  fs.writeFileSync(routesPath, content, 'utf8');
  console.log('Successfully fixed nested hris prefix in api.php!');
} else {
  console.log('Exact string match not found, checking regex replacement...');
  content = content.replace(/Route::prefix\('hris'\)->group\(function \(\) \{\s+Route::prefix\('hris'\)->group\(function \(\) \{/g, "Route::prefix('hris')->group(function () {");
  fs.writeFileSync(routesPath, content, 'utf8');
  console.log('Regex fix applied.');
}
