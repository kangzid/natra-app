const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');

// 1. Update src/features/tasks/task-detail.controller.js
const detailCtrlPath = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');
let detailCtrl = fs.readFileSync(detailCtrlPath, 'utf8');

detailCtrl = detailCtrl.replace(
    /const vehicleName = task\.vehicle \?[\s\S]*?\(task\.vehicle_id \? 'Armada Ditugaskan' : null\);/,
    `const plateNo = task.vehicle?.vehicle_number || task.vehicle?.license_plate || task.vehicle?.plate_number;
    const modelName = task.vehicle?.model || task.vehicle?.name || 'Armada Operasional';
    const vehicleName = task.vehicle 
      ? (plateNo ? \`\${plateNo} • \${modelName}\` : modelName) 
      : (task.vehicle_id ? 'Armada Ditugaskan' : null);`
);

fs.writeFileSync(detailCtrlPath, detailCtrl, 'utf8');
console.log('Updated task-detail.controller.js with correct vehicle_number resolution!');

// 2. Update src/features/tasks/tasks.controller.js
const tasksCtrlPath = path.join(mobileDir, 'src/features/tasks/tasks.controller.js');
let tasksCtrl = fs.readFileSync(tasksCtrlPath, 'utf8');

tasksCtrl = tasksCtrl.replace(
    'const vehicleInfo = task.vehicle?.license_plate || task.vehicle?.plate_number || (task.vehicle_id ? \'Armada Ditugaskan\' : null);',
    'const vehicleInfo = task.vehicle?.vehicle_number || task.vehicle?.license_plate || task.vehicle?.plate_number || (task.vehicle_id ? \'Armada Ditugaskan\' : null);'
);

fs.writeFileSync(tasksCtrlPath, tasksCtrl, 'utf8');
console.log('Updated tasks.controller.js with correct vehicle_number resolution!');
