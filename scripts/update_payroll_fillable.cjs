const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const modelPath = path.join(backendDir, 'app/Models/HrisPayroll.php');
let content = fs.readFileSync(modelPath, 'utf8');

content = content.replace(
    "'status',\n        'processed_by'",
    "'status',\n        'report_file_path',\n        'processed_by'"
);

fs.writeFileSync(modelPath, content, 'utf8');
console.log('Added report_file_path to HrisPayroll $fillable!');
