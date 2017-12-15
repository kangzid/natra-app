const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const taskFormPath = path.join(svelteDir, 'src/lib/components/features/tasks/task-form.svelte');
console.log(fs.readFileSync(taskFormPath, 'utf8'));
