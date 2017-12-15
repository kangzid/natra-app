const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const apiRoutes = path.join(backendDir, 'routes/api.php');
let content = fs.readFileSync(apiRoutes, 'utf8');

// Ensure download routes are accessible with ?token= query parameter as well
const tokenRouteBlock = `
// Direct Token & Auth Download for HRIS Payrolls (Admin & Employee)
Route::get('/hris/payrolls/{id}/batch-report', [\\App\\Http\\Controllers\\Api\\HrisPayrollController::class, 'downloadBatchReport']);
Route::get('/hris/payrolls/payslips/{id}/download-pdf', [\\App\\Http\\Controllers\\Api\\HrisPayrollController::class, 'downloadIndividualPayslipPdf']);
`;

if (!content.includes('// Direct Token & Auth Download for HRIS Payrolls')) {
    content += tokenRouteBlock;
    fs.writeFileSync(apiRoutes, content, 'utf8');
    console.log('Added direct token download routes in routes/api.php!');
} else {
    console.log('Direct token download routes already present in routes/api.php.');
}
