const fs = require('fs');

const path = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisClaimController.php';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\\\\Exception/g, '\\Exception');
code = code.replace(/\\\\Log/g, '\\Log');
code = code.replace(/\\\\d\+/g, '\\d+');

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed backslashes in HrisClaimController.php');
