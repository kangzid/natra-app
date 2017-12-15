const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const ctrlPath = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');
let content = fs.readFileSync(ctrlPath, 'utf8');

const targetStr = `    const vehicleName = task.vehicle 
      ? \`\${task.vehicle.license_plate || task.vehicle.plate_number} • \${task.vehicle.model || task.vehicle.name || 'Armada'}\` 
      : (task.vehicle_id ? 'Armada Ditugaskan' : null);`;

const replacementStr = `    const plateNo = task.vehicle?.vehicle_number || task.vehicle?.license_plate || task.vehicle?.plate_number;
    const modelName = task.vehicle?.model || task.vehicle?.name || 'Armada Operasional';
    const vehicleName = task.vehicle 
      ? (plateNo ? \`\${plateNo} • \${modelName}\` : modelName) 
      : (task.vehicle_id ? 'Armada Ditugaskan' : null);`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(ctrlPath, content, 'utf8');
    console.log('Successfully replaced vehicleName in task-detail.controller.js!');
} else {
    console.log('Target string not found! Performing regex replace...');
    content = content.replace(
        /const vehicleName = task\.vehicle[\s\S]*?\(task\.vehicle_id \? 'Armada Ditugaskan' : null\);/,
        replacementStr.trim()
    );
    fs.writeFileSync(ctrlPath, content, 'utf8');
    console.log('Regex replace done!');
}

console.log('Verifying content...');
const verifyContent = fs.readFileSync(ctrlPath, 'utf8');
console.log(verifyContent.includes('vehicle_number') ? 'Verified: vehicle_number is present!' : 'ERROR: vehicle_number not present');
