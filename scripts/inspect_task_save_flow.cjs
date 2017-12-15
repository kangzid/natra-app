const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

const taskModel = path.join(backendDir, 'app/Models/Task.php');
console.log('=== Task.php Model ===');
if (fs.existsSync(taskModel)) {
    console.log(fs.readFileSync(taskModel, 'utf8'));
}

const taskCtrl = path.join(backendDir, 'app/Http/Controllers/Api/TaskController.php');
console.log('=== TaskController.php (store & update methods) ===');
if (fs.existsSync(taskCtrl)) {
    console.log(fs.readFileSync(taskCtrl, 'utf8'));
}

const adminTaskServer = path.join(svelteDir, 'src/routes/admin/tasks/+page.server.ts');
console.log('=== admin tasks/+page.server.ts ===');
if (fs.existsSync(adminTaskServer)) {
    console.log(fs.readFileSync(adminTaskServer, 'utf8'));
}
