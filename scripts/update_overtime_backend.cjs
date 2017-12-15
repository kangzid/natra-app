const fs = require('fs');

const overtimeFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisOvertimeController.php';
let code = fs.readFileSync(overtimeFile, 'utf8');

// 1. Update getTenantId to reliably support employees
code = code.replace(
  `    private function getTenantId(Request $request)
    {
        $user = $request->user();
        return $user->isAdmin() ? $user->id : ($user->admin_id ?? $user->id);
    }`,
  `    private function getTenantId(Request $request)
    {
        $user = $request->user();
        return $user->role === 'employee' ? ($user->employee ? $user->employee->admin_id : ($user->admin_id ?? $user->id)) : $user->id;
    }`
);

// 2. Add 1 overtime per date constraint
const checkConstraint = `        // 1 Overtime per employee per day constraint
        $existing = HrisOvertime::where('tenant_id', $tenantId)
            ->where('employee_id', $request->employee_id)
            ->whereDate('date', $request->date)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            $dateFormatted = date('d/m/Y', strtotime($request->date));
            return response()->json([
                'message' => "Pengajuan lembur pada tanggal {$dateFormatted} sudah ada. Setiap karyawan hanya dapat memiliki 1 pengajuan lembur per hari."
            ], 422);
        }
`;

if (!code.includes('1 Overtime per employee per day constraint')) {
  code = code.replace(
    'if ($validator->fails()) {\n            return response()->json([\'errors\' => $validator->errors()], 422);\n        }',
    'if ($validator->fails()) {\n            return response()->json([\'errors\' => $validator->errors()], 422);\n        }\n\n' + checkConstraint
  );
}

fs.writeFileSync(overtimeFile, code, 'utf8');
console.log('Successfully updated HrisOvertimeController.php with 1-overtime-per-day constraint!');
