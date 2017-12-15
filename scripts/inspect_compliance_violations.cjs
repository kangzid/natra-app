const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

const apiRoutes = fs.readFileSync(path.join(backendDir, 'routes/api.php'), 'utf8');

console.log('=== Checking compliance & violation routes in api.php ===');
apiRoutes.split('\n').forEach((l, i) => {
    if (l.includes('compliance') || l.includes('violation') || l.includes('sanction') || l.includes('Compliance') || l.includes('Violation')) {
        console.log(`L${i+1}: ${l}`);
    }
});

console.log('\n=== Checking compliance frontend server file ===');
const compServer = path.join(svelteDir, 'src/routes/admin/hris/compliance/+page.server.ts');
if (fs.existsSync(compServer)) console.log(fs.readFileSync(compServer, 'utf8'));

console.log('\n=== Checking violations frontend server file ===');
const violServer = path.join(svelteDir, 'src/routes/admin/hris/violations/+page.server.ts');
if (fs.existsSync(violServer)) console.log(fs.readFileSync(violServer, 'utf8'));
