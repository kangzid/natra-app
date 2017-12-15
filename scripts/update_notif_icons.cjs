const fs = require('fs');
const path = require('path');

const notifCtrlPath = path.resolve('src/features/notification/notification.controller.js');
let notifContent = fs.readFileSync(notifCtrlPath, 'utf8');

// Update icon mapping logic
const oldIconLogic = `    if (titleLower.includes('absen')) {
      iconName = 'fingerprint';
      iconColor = 'text-emerald-500';
      iconBg = 'bg-emerald-50';
    } else if (titleLower.includes('tugas')) {
      iconName = 'clipboard-list';
      iconColor = 'text-amber-500';
      iconBg = 'bg-amber-50';
    }`;

const newIconLogic = `    if (titleLower.includes('absen')) {
      iconName = 'fingerprint';
      iconColor = 'text-emerald-500';
      iconBg = 'bg-emerald-50';
    } else if (titleLower.includes('dispatch') || titleLower.includes('pengiriman') || titleLower.includes('armada')) {
      iconName = 'truck';
      iconColor = 'text-blue-500';
      iconBg = 'bg-blue-50';
    } else if (titleLower.includes('tugas')) {
      iconName = 'clipboard-list';
      iconColor = 'text-amber-500';
      iconBg = 'bg-amber-50';
    }`;

if (notifContent.includes(oldIconLogic)) {
    notifContent = notifContent.replace(oldIconLogic, newIconLogic);
    fs.writeFileSync(notifCtrlPath, notifContent, 'utf8');
    console.log('Updated notification icon mapping for dispatch/tasks!');
} else {
    console.log('notification.controller.js already updated or icon mapping differs.');
}
