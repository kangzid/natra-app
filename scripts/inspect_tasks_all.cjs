const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mobileDir = path.resolve('.');
const backendDir = path.resolve('../backup/tracker-loc-backend');

const adminTaskPage = path.join(svelteDir, 'src/routes/admin/tasks/+page.svelte');
console.log('=== admin tasks/+page.svelte (first 100 lines) ===');
if (fs.existsSync(adminTaskPage)) {
    console.log(fs.readFileSync(adminTaskPage, 'utf8').split('\n').slice(0, 100).join('\n'));
} else {
    console.log('admin tasks +page.svelte not found');
}

const mobileTasksHtml = path.join(mobileDir, 'pages/tasks.html');
console.log('=== mobile tasks.html ===');
if (fs.existsSync(mobileTasksHtml)) {
    console.log(fs.readFileSync(mobileTasksHtml, 'utf8'));
}

const mobileTasksCtrl = path.join(mobileDir, 'src/features/tasks/tasks.controller.js');
console.log('=== mobile tasks.controller.js ===');
if (fs.existsSync(mobileTasksCtrl)) {
    console.log(fs.readFileSync(mobileTasksCtrl, 'utf8'));
}
