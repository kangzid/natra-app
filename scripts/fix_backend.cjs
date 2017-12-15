const fs = require('fs');

// 1. Fix HrisNewsController.php
const newsFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisNewsController.php';
if (fs.existsSync(newsFile)) {
  let newsCode = fs.readFileSync(newsFile, 'utf8');
  newsCode = newsCode.replace("->orderBy('is_pinned', 'desc')", "// ->orderBy('is_pinned', 'desc')");
  fs.writeFileSync(newsFile, newsCode, 'utf8');
  console.log('Fixed HrisNewsController.php');
}

// 2. Fix HrisPayrollController.php
const payrollFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisPayrollController.php';
if (fs.existsSync(payrollFile)) {
  let payrollCode = fs.readFileSync(payrollFile, 'utf8');
  
  if (!payrollCode.includes('private function getTenantId')) {
    payrollCode = payrollCode.replace(
      'class HrisPayrollController extends Controller\n{',
      `class HrisPayrollController extends Controller\n{\n    private function getTenantId(Request $request)\n    {\n        $user = $request->user();\n        return $user->role === 'employee' ? ($user->employee ? $user->employee->admin_id : ($user->admin_id ?? $user->id)) : $user->id;\n    }\n`
    );
  }

  payrollCode = payrollCode.split("where('tenant_id', $request->user()->id)").join("where('tenant_id', $this->getTenantId($request))");
  
  fs.writeFileSync(payrollFile, payrollCode, 'utf8');
  console.log('Fixed HrisPayrollController.php');
}
