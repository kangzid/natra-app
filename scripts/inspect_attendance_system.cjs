const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

console.log('=== Checking Migrations ===');
const migrationsDir = path.join(backendDir, 'database/migrations');
if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir);
  const attFiles = files.filter(f => f.includes('attendance') || f.includes('shift') || f.includes('schedule'));
  console.log('Attendance/Shift migration files:', attFiles);
}

console.log('=== Checking Models ===');
const modelsDir = path.join(backendDir, 'app/Models');
if (fs.existsSync(modelsDir)) {
  const models = fs.readdirSync(modelsDir);
  const attModels = models.filter(m => m.includes('Attendance') || m.includes('Shift') || m.includes('Schedule') || m.includes('Setting'));
  console.log('Relevant Models:', attModels);
}

console.log('=== Checking Attendance Controller ===');
const attControllerPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
if (fs.existsSync(attControllerPath)) {
  console.log('AttendanceController exists! Size:', fs.statSync(attControllerPath).size);
}

console.log('=== Checking Svelte Routes for HRIS ===');
const svelteRoutesDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris';
if (fs.existsSync(svelteRoutesDir)) {
  console.log('HRIS routes:', fs.readdirSync(svelteRoutesDir));
}
