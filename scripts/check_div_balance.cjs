const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

const files = ['izin-absen/+page.svelte', 'izin-sakit/+page.svelte', 'izin-cuti/+page.svelte', 'izin-dinas/+page.svelte'];

for (const f of files) {
    const full = path.join(svelteDir, f);
    if (fs.existsSync(full)) {
        console.log(`=== ${f} ===`);
        const content = fs.readFileSync(full, 'utf8');
        console.log(`Total lines: ${content.split('\n').length}`);
        
        // Print lines 1 to 80 (where banner was replaced)
        console.log('--- Lines 1 to 80 ---');
        console.log(content.split('\n').slice(0, 80).join('\n'));
        
        // Check div tags balance in template (after </script>)
        const scriptEnd = content.indexOf('</script>');
        if (scriptEnd !== -1) {
            const template = content.substring(scriptEnd);
            const opens = (template.match(/<div(\s|>)/g) || []).length;
            const closes = (template.match(/<\/div>/g) || []).length;
            console.log(`Div tag count: opens=${opens}, closes=${closes}`);
        }
    }
}
