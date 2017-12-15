const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src';

function searchInFiles(dir, text) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            searchInFiles(full, text);
        } else if (e.isFile() && (e.name.endsWith('.svelte') || e.name.endsWith('.ts') || e.name.endsWith('.js'))) {
            const content = fs.readFileSync(full, 'utf8');
            if (content.toLowerCase().includes(text.toLowerCase())) {
                console.log(`Found in: ${full}`);
                const lines = content.split('\n');
                lines.forEach((l, i) => {
                    if (l.toLowerCase().includes(text.toLowerCase())) {
                        console.log(`  L${i+1}: ${l.trim()}`);
                    }
                });
            }
        }
    }
}

console.log('=== Searching for "Mode Hanya Baca" or "Hanya Baca" ===');
searchInFiles(svelteDir, 'Hanya Baca');

console.log('\n=== Searching for "Read-Only" ===');
searchInFiles(svelteDir, 'Read-Only');
