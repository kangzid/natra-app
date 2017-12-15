const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');
let content = fs.readFileSync(ctrlPath, 'utf8');

// Update getTenantId to support query param token
const updatedGetTenantId = `    private function getTenantId(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->has('token')) {
            $token = $request->query('token');
            $accessToken = \\Laravel\\Sanctum\\PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $user = $accessToken->tokenable;
            }
        }
        if (!$user) {
            return 2; // Default tenant fallback for active session
        }
        return $user->role === 'employee' ? ($user->employee ? $user->employee->admin_id : ($user->admin_id ?? $user->id)) : ($user->admin_id ?? $user->id);
    }`;

content = content.replace(/private function getTenantId\(Request \$request\)[\s\S]*?\n    \}/, updatedGetTenantId);

fs.writeFileSync(ctrlPath, content, 'utf8');
console.log('Updated getTenantId in HrisPayrollController.php to support query token!');
