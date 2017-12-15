const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const userModel = path.join(backendDir, 'app/Models/User.php');
console.log(fs.readFileSync(userModel, 'utf8'));
