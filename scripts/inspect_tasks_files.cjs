const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mobileDir = path.resolve('.');

// 1. Admin tasks
const adminTasksDir = path.join(svelteDir, 'src/routes/admin/tasks');
if (fs.existsSync(adminTasksDir)) {
    console.log('Files in admin/tasks:', fs.readdirSync(adminTasksDir));
}

// 2. Mobile tasks
const mobileTasksHtml = path.join(mobileDir, 'pages/tasks.html');
const mobileTasksCtrl = path.join(mobileDir, 'src/features/tasks/tasks.controller.js');
const mobileTasksSvc = path.join(mobileDir, 'src/features/tasks/tasks.service.js');
console.log('Mobile tasks html exists:', fs.existsSync(mobileTasksHtml));
console.log('Mobile tasks ctrl exists:', fs.existsSync(mobileTasksCtrl));
console.log('Mobile tasks svc exists:', fs.existsSync(mobileTasksSvc));

// 3. Mobile notifications
const mobileNotifHtml = path.join(mobileDir, 'pages/notifications.html');
const mobileNotifCtrl = path.join(mobileDir, 'src/features/notifications/notifications.controller.js');
const mobileNotifSvc = path.join(mobileDir, 'src/features/notifications/notifications.service.js');
console.log('Mobile notif html exists:', fs.existsSync(mobileNotifHtml));
console.log('Mobile notif ctrl exists:', fs.existsSync(mobileNotifCtrl));
console.log('Mobile notif svc exists:', fs.existsSync(mobileNotifSvc));
