const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
const content = fs.readFileSync(migUnified, 'utf8');

// Parse opening and closing curly braces in up() method
const upIdx = content.indexOf('public function up()');
const downIdx = content.indexOf('public function down()');
const upContent = content.slice(upIdx, downIdx);

let opens = (upContent.match(/\{/g) || []).length;
let closes = (upContent.match(/\}/g) || []).length;

console.log(`up() method: ${opens} opens '{', ${closes} closes '}'`);

const lines = upContent.split('\n');
let balance = 0;
lines.forEach((l, i) => {
    const o = (l.match(/\{/g) || []).length;
    const c = (l.match(/\}/g) || []).length;
    balance += o - c;
    if (i > lines.length - 20) {
        console.log(`L${i+1} [bal: ${balance}]: ${l}`);
    }
});
