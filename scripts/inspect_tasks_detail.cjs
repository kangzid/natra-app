const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mobileDir = path.resolve('.');

const adminTaskPage = path.join(svelteDir, 'src/routes/admin/tasks/+page.svelte');
console.log('=== admin tasks/+page.svelte (search for Leaflet and maps) ===');
if (fs.existsSync(adminTaskPage)) {
    const lines = fs.readFileSync(adminTaskPage, 'utf8').split('\n');
    lines.forEach((l, idx) => {
        if (l.includes('map') || l.includes('Leaflet') || l.includes('origin') || l.includes('destination') || l.includes('L.') || l.includes('openCreateModal') || l.includes('isCreateModalOpen')) {
            console.log(`L${idx+1}: ${l}`);
        }
    });
}

const taskDetailHtml = path.join(mobileDir, 'pages/task-detail.html');
console.log('=== mobile task-detail.html (first 100 lines) ===');
if (fs.existsSync(taskDetailHtml)) {
    console.log(fs.readFileSync(taskDetailHtml, 'utf8').split('\n').slice(0, 100).join('\n'));
}

const taskDetailCtrl = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');
console.log('=== mobile task-detail.controller.js ===');
if (fs.existsSync(taskDetailCtrl)) {
    console.log(fs.readFileSync(taskDetailCtrl, 'utf8'));
}
