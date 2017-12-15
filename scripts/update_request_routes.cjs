const fs = require('fs');

const routeFile = '../backup/tracker-loc-backend/routes/api.php';
let code = fs.readFileSync(routeFile, 'utf8');

// Add /requests/summary inside hris group
code = code.replace(
  "// 7. Pengajuan (HRIS Requests)\n        Route::get('/requests',",
  "// 7. Pengajuan (HRIS Requests)\n        Route::get('/requests/summary', [\\App\\Http\\Controllers\\Api\\HrisRequestController::class, 'summary']);\n        Route::get('/requests', [\\App\\Http\\Controllers\\Api\\HrisRequestController::class, 'index']);\n        // Route::get('/requests',"
);

// Also add top-level alias if not present
if (!code.includes("Route::get('/requests/summary',")) {
  code = code.replace(
    "Route::middleware('auth:sanctum')->group(function () {",
    "Route::middleware('auth:sanctum')->group(function () {\n        Route::get('/requests/summary', [\\App\\Http\\Controllers\\Api\\HrisRequestController::class, 'summary']);\n        Route::get('/requests', [\\App\\Http\\Controllers\\Api\\HrisRequestController::class, 'index']);\n        Route::post('/requests', [\\App\\Http\\Controllers\\Api\\HrisRequestController::class, 'store']);"
  );
}

fs.writeFileSync(routeFile, code, 'utf8');
console.log('Updated routes in api.php!');
