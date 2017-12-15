const fs = require('fs');

// 1. Update HrisClaimController.php
const claimControllerFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisClaimController.php';
let code = fs.readFileSync(claimControllerFile, 'utf8');

// Add summary() method
const summaryMethod = `
    public function summary(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $month = $request->query('month');
        $year = $request->query('year', date('Y'));

        $query = HrisClaim::where('tenant_id', $tenantId);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($month && $month !== 'all') {
            $query->whereMonth('claim_date', $month);
        }
        if ($year && $year !== 'all') {
            $query->whereYear('claim_date', $year);
        }

        $totalApproved = (float) (clone $query)->whereIn('status', ['approved', 'paid'])->sum('amount');
        $approvedCount = (int) (clone $query)->where('status', 'approved')->count();
        $totalPaid = (float) (clone $query)->where('status', 'paid')->sum('amount');
        $paidCount = (int) (clone $query)->where('status', 'paid')->count();
        $totalPending = (float) (clone $query)->where('status', 'pending')->sum('amount');
        $pendingCount = (int) (clone $query)->where('status', 'pending')->count();
        $totalRejected = (float) (clone $query)->where('status', 'rejected')->sum('amount');
        $rejectedCount = (int) (clone $query)->where('status', 'rejected')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_approved' => $totalApproved,
                'approved_count' => $approvedCount,
                'total_paid' => $totalPaid,
                'paid_count' => $paidCount,
                'total_pending' => $totalPending,
                'pending_count' => $pendingCount,
                'total_rejected' => $totalRejected,
                'rejected_count' => $rejectedCount,
            ],
            // flat structure for mobile compatibility
            'total_approved' => $totalApproved,
            'approved_count' => $approvedCount,
            'total_paid' => $totalPaid,
            'paid_count' => $paidCount,
            'total_pending' => $totalPending,
            'pending_count' => $pendingCount,
            'total_rejected' => $totalRejected,
            'rejected_count' => $rejectedCount,
        ]);
    }
`;

if (!code.includes('public function summary')) {
  code = code.replace(
    'public function index(Request $request)',
    summaryMethod + '\n    public function index(Request $request)'
  );
}

// Update destroy() to delete encrypted file
const oldDestroy = `    public function destroy(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $claim = HrisClaim::where('tenant_id', $tenantId)->findOrFail($id);
        $claim->delete();

        return response()->json(['message' => 'Data klaim berhasil dihapus.']);
    }`;

const newDestroy = `    public function destroy(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $claim = HrisClaim::where('tenant_id', $tenantId)->findOrFail($id);

        if ($claim->receipt_path) {
            try {
                EncryptedStorageService::deleteEncrypted($claim->receipt_path);
            } catch (\\Exception $e) {
                \\Log::warning('Failed deleting claim receipt file: ' . $e->getMessage());
            }
        }

        $claim->delete();

        return response()->json(['message' => 'Data klaim dan berkas bukti berhasil dihapus.']);
    }`;

if (code.includes(oldDestroy)) {
  code = code.replace(oldDestroy, newDestroy);
}

fs.writeFileSync(claimControllerFile, code, 'utf8');
console.log('Successfully updated HrisClaimController.php with summary and encrypted file deletion!');

// 2. Update routes/api.php to ensure /hris/claims/summary and /hris/claims aliases exist
const routeFile = '../backup/tracker-loc-backend/routes/api.php';
let routeCode = fs.readFileSync(routeFile, 'utf8');

if (!routeCode.includes("Route::get('/hris/claims/summary'")) {
  const hrisClaimsBlock = `
        // HRIS Claims Aliases
        Route::get('/hris/claims/summary', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'summary']);
        Route::get('/hris/claims/types', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'getClaimTypes']);
        Route::get('/hris/claims', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'index']);
        Route::post('/hris/claims', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'store']);
        Route::post('/hris/claims/{id}/approve', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'approve']);
        Route::post('/hris/claims/{id}/reject', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'reject']);
        Route::post('/hris/claims/{id}/mark-paid', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'markPaid']);
        Route::delete('/hris/claims/{id}', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'destroy']);
`;
  routeCode = routeCode.replace(
    "Route::get('/claims/summary', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'summary']);",
    hrisClaimsBlock + "\n        Route::get('/claims/summary', [\\App\Http\\Controllers\\Api\\HrisClaimController::class, 'summary']);"
  );
  fs.writeFileSync(routeFile, routeCode, 'utf8');
  console.log('Successfully added /hris/claims routes to api.php!');
}
