const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const apiRoutesPath = path.join(backendDir, 'routes/api.php');
let apiRoutes = fs.readFileSync(apiRoutesPath, 'utf8');

// Ensure routes for /hris/contracts/summary, /hris/allowances, etc. are registered
const hrisRoutesBlock = `
        // HRIS Contracts with and without /hris/ prefix
        Route::get('/hris/contracts/summary', [\\App\\Http\\Controllers\\Api\\HrisContractController::class, 'summary']);
        Route::get('/hris/contracts/{id}/download', [\\App\\Http\\Controllers\\Api\\HrisContractController::class, 'downloadPdf']);
        Route::get('/hris/contracts', [\\App\\Http\\Controllers\\Api\\HrisContractController::class, 'index']);
        Route::post('/hris/contracts', [\\App\\Http\\Controllers\\Api\\HrisContractController::class, 'store']);
        Route::get('/hris/contracts/{id}', [\\App\\Http\\Controllers\\Api\\HrisContractController::class, 'show']);
        Route::put('/hris/contracts/{id}', [\\App\\Http\\Controllers\\Api\\HrisContractController::class, 'update']);
        Route::delete('/hris/contracts/{id}', [\\App\\Http\\Controllers\\Api\\HrisContractController::class, 'destroy']);

        // HRIS Allowances with /hris/ prefix
        Route::get('/hris/allowance-types', [\\App\\Http\\Controllers\\Api\\HrisPayrollMasterController::class, 'getAllowanceTypes']);
        Route::post('/hris/allowance-types', [\\App\\Http\\Controllers\\Api\\HrisPayrollMasterController::class, 'storeAllowanceType']);
        Route::delete('/hris/allowance-types/{id}', [\\App\\Http\\Controllers\\Api\\HrisPayrollMasterController::class, 'deleteAllowanceType']);
        Route::get('/hris/allowances', [\\App\\Http\\Controllers\\Api\\HrisPayrollMasterController::class, 'getEmployeeAllowances']);
        Route::post('/hris/allowances', [\\App\\Http\\Controllers\\Api\\HrisPayrollMasterController::class, 'storeEmployeeAllowance']);
        Route::delete('/hris/allowances/{id}', [\\App\\Http\\Controllers\\Api\\HrisPayrollMasterController::class, 'deleteEmployeeAllowance']);

        // HRIS Payroll Reports (Encrypted Batch Report & On-the-fly Individual Payslip)
        Route::get('/hris/payrolls/{id}/batch-report', [\\App\\Http\\Controllers\\Api\\HrisPayrollController::class, 'downloadBatchReport']);
        Route::get('/hris/payrolls/payslips/{id}/download-pdf', [\\App\\Http\\Controllers\\Api\\HrisPayrollController::class, 'downloadIndividualPayslipPdf']);
`;

if (!apiRoutes.includes('/hris/contracts/summary')) {
    apiRoutes = apiRoutes.replace("Route::get('/contracts/summary'", hrisRoutesBlock + "\n        Route::get('/contracts/summary'");
    fs.writeFileSync(apiRoutesPath, apiRoutes, 'utf8');
    console.log('Successfully registered all /hris/ route aliases in routes/api.php!');
} else {
    console.log('Routes already present.');
}
