const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

function fixController(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace(/namespace AppHttpControllersApi;/g, 'namespace App\\Http\\Controllers\\Api;')
    .replace(/use AppHttpControllersController;/g, 'use App\\Http\\Controllers\\Controller;')
    .replace(/use AppModelsEmployee;/g, 'use App\\Models\\Employee;')
    .replace(/use AppModelsAttendance;/g, 'use App\\Models\\Attendance;')
    .replace(/use AppModelsGeofence;/g, 'use App\\Models\\Geofence;')
    .replace(/use AppModelsHrisShift;/g, 'use App\\Models\\HrisShift;')
    .replace(/use AppModelsHrisShiftAssignment;/g, 'use App\\Models\\HrisShiftAssignment;')
    .replace(/use AppModelsHrisAttendanceSetting;/g, 'use App\\Models\\HrisAttendanceSetting;')
    .replace(/use AppServicesGeofenceService;/g, 'use App\\Services\\GeofenceService;')
    .replace(/use IlluminateHttpRequest;/g, 'use Illuminate\\Http\\Request;')
    .replace(/use IlluminateSupportFacadesValidator;/g, 'use Illuminate\\Support\\Facades\\Validator;')
    .replace(/use IlluminateSupportFacadesDB;/g, 'use Illuminate\\Support\\Facades\\DB;')
    .replace(/use IlluminateSupportFacadesCache;/g, 'use Illuminate\\Support\\Facades\\Cache;')
    .replace(/use CarbonCarbon;/g, 'use Carbon\\Carbon;')
    .replace(/use CarbonCarbonPeriod;/g, 'use Carbon\\CarbonPeriod;')
    .replace(/AppHttpControllersApi/g, 'App\\Http\\Controllers\\Api');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed backslashes in:', filePath);
}

fixController(path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php'));
fixController(path.join(backendDir, 'app/Http/Controllers/Api/HrisShiftController.php'));
fixController(path.join(backendDir, 'routes/api.php'));
