const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

function traceFile(fileName) {
    const filePath = path.join(svelteDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let stack = [];
    let inScript = true;
    let errors = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('</script>')) {
            inScript = false;
            continue;
        }
        if (inScript) continue;
        
        const tagMatches = line.matchAll(/<\/?div\b[^>]*>/g);
        for (const match of tagMatches) {
            const tag = match[0];
            if (tag.startsWith('</')) {
                if (stack.length === 0) {
                    errors.push(`Line ${i+1}: Extra closing </div>`);
                } else {
                    stack.pop();
                }
            } else if (!tag.endsWith('/>')) {
                stack.push({ line: i + 1, tag: tag.trim() });
            }
        }
    }
    console.log(`=== ${fileName} ===`);
    console.log(`Errors: ${errors.length ? errors.join(', ') : 'None'}`);
    console.log(`Unclosed: ${stack.length}`);
}

traceFile('izin-absen/+page.svelte');
traceFile('izin-sakit/+page.svelte');
traceFile('izin-cuti/+page.svelte');
traceFile('izin-dinas/+page.svelte');
traceFile('pengaturan-cuti/+page.svelte');
