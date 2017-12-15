const fs = require('fs');

const claimControllerFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisClaimController.php';
let code = fs.readFileSync(claimControllerFile, 'utf8');

// 1. Update summary method with exact field names for Svelte and Mobile
const updatedSummary = `    public function summary(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $month = $request->query('month');
        $year = $request->query('year', date('Y'));

        $query = HrisClaim::where('tenant_id', $tenantId);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($month && $month !== 'all') {
            $query->where(function($q) use ($month) {
                $q->whereMonth('claim_date', $month)->orWhereMonth('created_at', $month);
            });
        }
        if ($year && $year !== 'all') {
            $query->where(function($q) use ($year) {
                $q->whereYear('claim_date', $year)->orWhereYear('created_at', $year);
            });
        }

        // Calculations
        $totalApprovedAmount = (float) (clone $query)->whereIn('status', ['approved', 'paid'])->sum('amount');
        $approvedCount = (int) (clone $query)->where('status', 'approved')->count();

        $totalPaidAmount = (float) (clone $query)->where('status', 'paid')->sum('amount');
        $paidCount = (int) (clone $query)->where('status', 'paid')->count();

        $totalPendingAmount = (float) (clone $query)->where('status', 'pending')->sum('amount');
        $pendingCount = (int) (clone $query)->where('status', 'pending')->count();

        $totalRejectedAmount = (float) (clone $query)->where('status', 'rejected')->sum('amount');
        $rejectedCount = (int) (clone $query)->where('status', 'rejected')->count();

        return response()->json([
            // Svelte Frontend field names
            'total_approved_amount' => $totalApprovedAmount,
            'total_paid_amount' => $totalPaidAmount,
            'total_pending_amount' => $totalPendingAmount,
            'total_rejected_amount' => $totalRejectedAmount,
            'approved_count' => $approvedCount,
            'paid_count' => $paidCount,
            'pending_count' => $pendingCount,
            'rejected_count' => $rejectedCount,

            // Flat aliases for mobile & API
            'total_approved' => $totalApprovedAmount,
            'total_paid' => $totalPaidAmount,
            'total_pending' => $totalPendingAmount,
            'total_rejected' => $totalRejectedAmount,
            'status' => 'success',
            'data' => [
                'total_approved' => $totalApprovedAmount,
                'total_approved_amount' => $totalApprovedAmount,
                'approved_count' => $approvedCount,
                'total_paid' => $totalPaidAmount,
                'total_paid_amount' => $totalPaidAmount,
                'paid_count' => $paidCount,
                'total_pending' => $totalPendingAmount,
                'total_pending_amount' => $totalPendingAmount,
                'pending_count' => $pendingCount,
                'total_rejected' => $totalRejectedAmount,
                'total_rejected_amount' => $totalRejectedAmount,
                'rejected_count' => $rejectedCount,
            ]
        ]);
    }`;

// Replace summary method
code = code.replace(/public function summary\([\s\S]*?return response\(\)->json\([\s\S]*?\}\);[\s\S]*?\}/, updatedSummary);

// 2. Enforce requires_receipt in store method
const receiptCheck = `
        // Check if receipt is required by claim type
        $type = HrisClaimType::where('tenant_id', $tenantId)->find($request->claim_type_id);
        if ($type) {
            if ($type->requires_receipt) {
                $hasReceipt = $request->hasFile('receipt_file') || $request->filled('receipt_base64');
                if (!$hasReceipt) {
                    return response()->json([
                        'message' => 'Jenis klaim ' . $type->name . ' mewajibkan lampiran foto bukti nota atau struk pembayaran.'
                    ], 422);
                }
            }
`;

if (!code.includes('mewajibkan lampiran foto bukti nota atau struk pembayaran.')) {
  code = code.replace(
    '// Check Plafon Rules',
    receiptCheck + '\n        // Check Plafon Rules'
  );
}

fs.writeFileSync(claimControllerFile, code, 'utf8');
console.log('Successfully updated HrisClaimController with Svelte summary field names and requires_receipt enforcement!');
