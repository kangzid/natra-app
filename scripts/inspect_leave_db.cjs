const { execSync } = require('child_process');

try {
  const types = execSync('php -r "require \'vendor/autoload.php\'; $app = require_once \'bootstrap/app.php\'; $app->make(\'Illuminate\\\\Contracts\\\\Console\\\\Kernel\')->bootstrap(); echo json_encode(App\\\\Models\\\\HrisLeaveType::all());"', { cwd: '../backup/tracker-loc-backend' }).toString();
  console.log('ALL LEAVE TYPES IN DB:', types);

  const balances = execSync('php -r "require \'vendor/autoload.php\'; $app = require_once \'bootstrap/app.php\'; $app->make(\'Illuminate\\\\Contracts\\\\Console\\\\Kernel\')->bootstrap(); echo json_encode(App\\\\Models\\\\HrisEmployeeLeaveBalance::where(\'employee_id\', 7)->get());"', { cwd: '../backup/tracker-loc-backend' }).toString();
  console.log('AGUS LEAVE BALANCES:', balances);
} catch (e) {
  console.error(e.message);
}
