const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const payrollCtrlPath = path.join(mobileDir, 'src/features/payroll/payroll.controller.js');
let content = fs.readFileSync(payrollCtrlPath, 'utf8');

// Ensure token is passed in query param
const oldMobileUrl = `        const apiUrl = window.ENV?.API_URL || 'http://127.0.0.1:8000/api';
        const downloadUrl = \`\${apiUrl}/hris/payrolls/payslips/\${slip.id}/download-pdf\`;`;

const newMobileUrl = `        const apiUrl = window.ENV?.API_URL || 'http://127.0.0.1:8000/api';
        const token = localStorage.getItem('token') || '';
        const downloadUrl = \`\${apiUrl}/hris/payrolls/payslips/\${slip.id}/download-pdf?token=\${token}\`;`;

if (content.includes(oldMobileUrl)) {
    content = content.replace(oldMobileUrl, newMobileUrl);
    fs.writeFileSync(payrollCtrlPath, content, 'utf8');
    console.log('Appended auth token to mobile download URL in payroll.controller.js!');
    
    // Copy to www if exists
    const wwwPath = path.join(mobileDir, 'www/src/features/payroll/payroll.controller.js');
    if (fs.existsSync(wwwPath)) {
        fs.writeFileSync(wwwPath, content, 'utf8');
    }
} else {
    console.log('Mobile URL already has token or format differs.');
}
