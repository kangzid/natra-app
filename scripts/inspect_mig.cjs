const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migPath = path.join(backendDir, 'database/migrations/2026_08_23_000001_create_hris_shifts_and_attendance_rules_table.php');
console.log('Migration content:');
console.log(fs.readFileSync(migPath, 'utf8'));
