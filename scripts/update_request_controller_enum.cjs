const fs = require('fs');

const requestControllerFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisRequestController.php';

const cleanPhp = `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\HrisRequest;
use App\\Models\\HrisLeaveType;
use App\\Models\\HrisEmployeeLeaveBalance;
use App\\Services\\EncryptedStorageService;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Validator;

class HrisRequestController extends Controller
{
    private function getTenantId(Request $request)
    {
        $user = $request->user();
        return $user->role === 'employee' ? ($user->employee ? $user->employee->admin_id : ($user->admin_id ?? $user->id)) : ($user->tenant_id ?? $user->id);
    }

    private function normalizeRequestType($type)
    {
        switch ($type) {
            case 'cuti':
            case 'izin_khusus':
                return 'izin_cuti';
            case 'dinas_luar':
                return 'izin_dinas';
            default:
                return $type;
        }
    }

    public function summary(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $user = $request->user();
        $employeeId = $request->query('employee_id') ?? ($user->role === 'employee' ? ($user->employee ? $user->employee->id : null) : null);
        $year = $request->query('year', date('Y'));

        $query = HrisRequest::where('tenant_id', $tenantId);
        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $pendingCount = (int) (clone $query)->where('status', 'pending')->count();
        $approvedCount = (int) (clone $query)->where('status', 'approved')->count();
        $rejectedCount = (int) (clone $query)->where('status', 'rejected')->count();
        $totalDaysApproved = (int) (clone $query)->where('status', 'approved')->sum('days_count');

        // Leave Balance
        $remainingLeave = 12;
        $usedLeave = 0;
        if ($employeeId) {
            $balance = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)
                ->where('employee_id', $employeeId)
                ->where('year', $year)
                ->first();
            if ($balance) {
                $remainingLeave = max(0, $balance->quota - $balance->used);
                $usedLeave = $balance->used;
            } else {
                $usedLeave = (int) HrisRequest::where('tenant_id', $tenantId)
                    ->where('employee_id', $employeeId)
                    ->whereIn('request_type', ['izin_cuti', 'cuti'])
                    ->where('status', 'approved')
                    ->whereYear('start_date', $year)
                    ->sum('days_count');
                $remainingLeave = max(0, 12 - $usedLeave);
            }
        }

        return response()->json([
            'status' => 'success',
            'pending_count' => $pendingCount,
            'approved_count' => $approvedCount,
            'rejected_count' => $rejectedCount,
            'total_days_approved' => $totalDaysApproved,
            'remaining_leave' => $remainingLeave,
            'used_leave' => $usedLeave,
            'quota_leave' => 12
        ]);
    }

    public function index(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $user = $request->user();

        $query = HrisRequest::where('tenant_id', $tenantId)
            ->with(['employee.user', 'leaveType', 'approver'])
            ->orderBy('id', 'desc');

        if ($request->has('request_type') && $request->request_type !== 'all') {
            $normalized = $this->normalizeRequestType($request->request_type);
            $query->where('request_type', $normalized);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $employeeId = $request->query('employee_id') ?? ($user->role === 'employee' ? ($user->employee ? $user->employee->id : null) : null);
        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'request_type' => 'required|string',
            'leave_type_id' => 'nullable',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days_count' => 'nullable|numeric',
            'total_days' => 'nullable|numeric',
            'reason' => 'required|string',
            'attachment_file' => 'nullable|file|max:10240',
            'attachment_base64' => 'nullable|string',
            'attachment_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $normalizedType = $this->normalizeRequestType($request->request_type);

        // Generate Code: REQ[YY][MM][0001]
        $prefix = 'REQ' . date('ym', strtotime($request->start_date));
        $last = HrisRequest::where('tenant_id', $tenantId)
            ->where('code', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        $nextNum = 1;
        if ($last && preg_match('/' . $prefix . '([0-9]+)/', $last->code, $matches)) {
            $nextNum = (int)$matches[1] + 1;
        }
        $code = $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        // Calculate days if not provided
        $start = strtotime($request->start_date);
        $end = strtotime($request->end_date);
        $diffDays = (int) round(abs($end - $start) / 86400) + 1;
        $daysCount = $request->days_count ?: ($request->total_days ?: $diffDays);

        $attachPath = null;
        $attachName = $request->attachment_name;
        if ($request->hasFile('attachment_file')) {
            $stored = EncryptedStorageService::storeEncrypted($request->file('attachment_file'), $tenantId, 'requests', 'req_' . $code);
            $attachPath = $stored['path'];
            $attachName = $stored['name'];
        } elseif ($request->filled('attachment_base64')) {
            $stored = EncryptedStorageService::storeEncrypted($request->attachment_base64, $tenantId, 'requests', 'req_' . $code, $attachName);
            $attachPath = $stored['path'];
            $attachName = $stored['name'];
        }

        $hrisReq = HrisRequest::create([
            'tenant_id' => $tenantId,
            'employee_id' => $request->employee_id,
            'code' => $code,
            'request_type' => $normalizedType,
            'leave_type_id' => $request->leave_type_id ?: null,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'days_count' => $daysCount,
            'reason' => $request->reason,
            'attachment_path' => $attachPath,
            'attachment_name' => $attachName,
            'status' => 'pending',
        ]);

        return response()->json($hrisReq->load(['employee.user', 'leaveType', 'approver']), 201);
    }

    public function previewAttachment(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $hrisReq = HrisRequest::where('tenant_id', $tenantId)->findOrFail($id);
        if (!$hrisReq->attachment_path) {
            return response()->json(['message' => 'Berkas lampiran tidak ditemukan.'], 404);
        }
        return EncryptedStorageService::streamResponse($hrisReq->attachment_path, $hrisReq->attachment_name, false);
    }

    public function downloadAttachment(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $hrisReq = HrisRequest::where('tenant_id', $tenantId)->findOrFail($id);
        if (!$hrisReq->attachment_path) {
            return response()->json(['message' => 'Berkas lampiran tidak ditemukan.'], 404);
        }
        return EncryptedStorageService::streamResponse($hrisReq->attachment_path, $hrisReq->attachment_name, true);
    }

    public function approve(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $hrisReq = HrisRequest::where('tenant_id', $tenantId)->findOrFail($id);

        $hrisReq->status = 'approved';
        $hrisReq->approved_by = $request->user()->id;
        $hrisReq->approved_at = now();
        $hrisReq->approver_note = $request->note ?? 'Disetujui oleh admin';
        $hrisReq->save();

        // If cuti, update leave balance used
        if ($hrisReq->request_type === 'izin_cuti') {
            $year = date('Y', strtotime($hrisReq->start_date));
            $balance = HrisEmployeeLeaveBalance::firstOrCreate(
                ['tenant_id' => $tenantId, 'employee_id' => $hrisReq->employee_id, 'year' => $year],
                ['quota' => 12, 'used' => 0]
            );
            $balance->used += (int)$hrisReq->days_count;
            $balance->save();
        }

        return response()->json([
            'message' => 'Permohonan berhasil disetujui.',
            'data' => $hrisReq->load(['employee.user', 'leaveType', 'approver'])
        ]);
    }

    public function reject(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $hrisReq = HrisRequest::where('tenant_id', $tenantId)->findOrFail($id);

        $hrisReq->status = 'rejected';
        $hrisReq->approved_by = $request->user()->id;
        $hrisReq->approved_at = now();
        $hrisReq->approver_note = $request->note ?? 'Ditolak';
        $hrisReq->save();

        return response()->json([
            'message' => 'Permohonan ditolak.',
            'data' => $hrisReq->load(['employee.user', 'leaveType', 'approver'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $hrisReq = HrisRequest::where('tenant_id', $tenantId)->findOrFail($id);

        if ($hrisReq->attachment_path) {
            try {
                EncryptedStorageService::deleteFile($hrisReq->attachment_path);
            } catch (\\Exception $e) {
                \\Log::warning('Failed deleting request attachment file: ' . $e->getMessage());
            }
        }

        $hrisReq->delete();

        return response()->json(['message' => 'Data permohonan berhasil dihapus.']);
    }
}
`;

fs.writeFileSync(requestControllerFile, cleanPhp, 'utf8');
console.log('Successfully updated HrisRequestController.php with enum normalization!');
