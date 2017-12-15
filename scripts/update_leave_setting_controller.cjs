const fs = require('fs');

const leaveSettingControllerFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisLeaveSettingController.php';

const cleanPhp = `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\HrisLeaveType;
use App\\Models\\HrisEmployeeLeaveBalance;
use App\\Models\\Employee;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Validator;

class HrisLeaveSettingController extends Controller
{
    private function getTenantId(Request $request)
    {
        $user = $request->user();
        return $user->role === 'employee' ? ($user->employee ? $user->employee->admin_id : ($user->admin_id ?? $user->id)) : $user->id;
    }

    public function getLeaveTypes(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $types = HrisLeaveType::where('tenant_id', $tenantId)->orderBy('id', 'asc')->get();

        if ($types->isEmpty()) {
            // Seed default types
            $defaults = [
                ['code' => 'CT01', 'name' => 'Cuti Tahunan', 'default_days' => 12, 'is_paid' => true, 'requires_attachment' => false, 'description' => 'Hak cuti tahunan reguler karyawan'],
                ['code' => 'CS01', 'name' => 'Izin Sakit', 'default_days' => 14, 'is_paid' => true, 'requires_attachment' => true, 'description' => 'Izin sakit dengan surat keterangan dokter'],
                ['code' => 'CM01', 'name' => 'Cuti Melahirkan', 'default_days' => 90, 'is_paid' => true, 'requires_attachment' => true, 'description' => 'Cuti melahirkan bagi karyawan wanita'],
                ['code' => 'CK01', 'name' => 'Cuti Khusus (Menikah / Duka)', 'default_days' => 3, 'is_paid' => true, 'requires_attachment' => false, 'description' => 'Cuti pernikahan, khitanan, atau keluarga berduka'],
                ['code' => 'IP01', 'name' => 'Izin Tidak Masuk Kerja', 'default_days' => 1, 'is_paid' => true, 'requires_attachment' => false, 'description' => 'Izin keperluan mendesak / absen harian'],
            ];
            foreach ($defaults as $d) {
                HrisLeaveType::create(array_merge($d, ['tenant_id' => $tenantId]));
            }
            $types = HrisLeaveType::where('tenant_id', $tenantId)->orderBy('id', 'asc')->get();
        }

        return response()->json($types);
    }

    public function storeLeaveType(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:100',
            'default_days' => 'required|integer|min:1',
            'is_paid' => 'boolean',
            'requires_attachment' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $type = HrisLeaveType::updateOrCreate(
            ['tenant_id' => $tenantId, 'code' => $request->code],
            [
                'name' => $request->name,
                'default_days' => $request->default_days,
                'is_paid' => $request->is_paid ?? true,
                'requires_attachment' => $request->requires_attachment ?? false,
                'description' => $request->description,
            ]
        );

        return response()->json($type, 201);
    }

    public function deleteLeaveType(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $type = HrisLeaveType::where('tenant_id', $tenantId)->findOrFail($id);
        $type->delete();

        return response()->json(['message' => 'Jenis cuti berhasil dihapus.']);
    }

    public function getLeaveBalances(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $year = $request->year ?? date('Y');

        $balances = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)
            ->where('year', $year)
            ->with(['employee.user', 'leaveType'])
            ->get();

        return response()->json($balances);
    }

    public function updateLeaveBalance(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $balance = HrisEmployeeLeaveBalance::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'quota' => 'required|integer|min:0',
            'used' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $balance->update([
            'quota' => $request->quota,
            'used' => $request->used,
        ]);

        return response()->json($balance);
    }
}
`;

fs.writeFileSync(leaveSettingControllerFile, cleanPhp, 'utf8');
console.log('Successfully updated HrisLeaveSettingController.php!');
