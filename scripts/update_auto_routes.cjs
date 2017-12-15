const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const routesPath = path.join(backendDir, 'routes/api.php');
let content = fs.readFileSync(routesPath, 'utf8');

if (!content.includes('/shift-assignments/auto-generate')) {
  const target = `Route::post('/shift-assignments', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'assignShifts']);`;
  const replacement = `Route::post('/shift-assignments', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'assignShifts']);
        Route::post('/shift-assignments/auto-generate', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'autoGenerate']);
        Route::post('/shift-assignments/swap', [\\App\\Http\\Controllers\\Api\\HrisShiftController::class, 'swapShifts']);`;

  content = content.replace(target, replacement);
  fs.writeFileSync(routesPath, content, 'utf8');
  console.log('Successfully added auto-generate & swap routes to api.php!');
} else {
  console.log('auto-generate route already exists in api.php');
}
