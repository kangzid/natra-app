const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

function fixModel(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace(/namespace AppModels;/g, 'namespace App\\Models;')
    .replace(/use IlluminateDatabaseEloquentFactoriesHasFactory;/g, 'use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;')
    .replace(/use IlluminateDatabaseEloquentModel;/g, 'use Illuminate\\Database\\Eloquent\\Model;');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed model:', filePath);
}

fixModel(path.join(backendDir, 'app/Models/HrisAttendanceSetting.php'));
fixModel(path.join(backendDir, 'app/Models/HrisShift.php'));
fixModel(path.join(backendDir, 'app/Models/HrisShiftAssignment.php'));
