const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';
const filePath = path.join(svelteDir, 'izin-absen/+page.svelte');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let stack = [];
let inScript = true;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('</script>')) {
        inScript = false;
        continue;
    }
    if (inScript) continue;
    
    // Find tags
    const tagMatches = line.matchAll(/<\/?div\b[^>]*>/g);
    for (const match of tagMatches) {
        const tag = match[0];
        if (tag.startsWith('</')) {
            if (stack.length === 0) {
                console.log(`ERROR: Extra closing </div> at line ${i+1}: "${line.trim()}"`);
            } else {
                stack.pop();
            }
        } else if (!tag.endsWith('/>')) {
            stack.push({ line: i + 1, tag: tag.trim() });
        }
    }
}

console.log(`Remaining unclosed divs in izin-absen: ${stack.length}`);
stack.forEach(s => console.log(`  Unclosed opened at line ${s.line}: ${s.tag}`));
