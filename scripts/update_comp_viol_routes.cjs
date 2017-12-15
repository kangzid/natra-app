const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const apiRoutesPath = path.join(backendDir, 'routes/api.php');
let apiRoutes = fs.readFileSync(apiRoutesPath, 'utf8');

// Ensure all compliance & violation routes are registered with /hris/ and without /hris/
const compViolRoutesBlock = `
        // HRIS Compliance & Alerts (Legalitas SIM, STNK, KIR, Sertifikasi)
        Route::get('/hris/compliance/summary', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'summary']);
        Route::get('/hris/compliance', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'index']);
        Route::post('/hris/compliance', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'store']);
        Route::get('/hris/compliance/{id}', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'show']);
        Route::put('/hris/compliance/{id}', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'update']);
        Route::post('/hris/compliance/{id}/renew', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'renew']);
        Route::delete('/hris/compliance/{id}', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'destroy']);
        Route::get('/hris/compliance/{id}/preview', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'previewDoc']);
        Route::get('/hris/compliance/{id}/download', [\\App\\Http\\Controllers\\Api\\HrisComplianceController::class, 'downloadDoc']);

        // HRIS Compliance Doc Types
        Route::get('/hris/compliance-doc-types', [\\App\\Http\\Controllers\\Api\\HrisMasterSettingController::class, 'getComplianceDocTypes']);
        Route::post('/hris/compliance-doc-types', [\\App\\Http\\Controllers\\Api\\HrisMasterSettingController::class, 'storeComplianceDocType']);
        Route::put('/hris/compliance-doc-types/{id}', [\\App\\Http\\Controllers\\Api\\HrisMasterSettingController::class, 'updateComplianceDocType']);
        Route::delete('/hris/compliance-doc-types/{id}', [\\App\\Http\\Controllers\\Api\\HrisMasterSettingController::class, 'deleteComplianceDocType']);

        // HRIS Violations & Sanctions (Kedisiplinan, Sanksi & Surat Peringatan)
        Route::get('/hris/violations/summary', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'summary']);
        Route::get('/hris/violations/types', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'getViolationTypes']);
        Route::post('/hris/violations/types', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'storeViolationType']);
        Route::put('/hris/violations/types/{id}', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'storeViolationType']);
        Route::delete('/hris/violations/types/{id}', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'deleteViolationType']);
        Route::get('/hris/violations', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'index']);
        Route::post('/hris/violations', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'store']);
        Route::get('/hris/violations/{id}', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'show']);
        Route::put('/hris/violations/{id}', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'update']);
        Route::post('/hris/violations/{id}/revoke', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'revoke']);
        Route::delete('/hris/violations/{id}', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'destroy']);
        Route::get('/hris/violations/{id}/preview', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'previewEvidence']);
        Route::get('/hris/violations/{id}/download', [\\App\\Http\\Controllers\\Api\\HrisViolationController::class, 'downloadEvidence']);
`;

if (!apiRoutes.includes('/hris/compliance/summary')) {
    apiRoutes = apiRoutes.replace("// 17. Compliance & Alerts", compViolRoutesBlock + "\n        // 17. Compliance & Alerts");
    fs.writeFileSync(apiRoutesPath, apiRoutes, 'utf8');
    console.log('Successfully registered all /hris/ compliance and violations routes in api.php!');
} else {
    console.log('Compliance & violations routes already present in api.php.');
}
