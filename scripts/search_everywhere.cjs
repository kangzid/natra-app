const fs = require('fs');
const path = require('path');

const root1 = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const root2 = path.resolve('.');
const root3 = path.resolve('../backup/tracker-loc-backend');

function searchEverywhere(dir, text) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === '.svelte-kit' || e.name === 'vendor' || e.name === 'storage') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            searchEverywhere(full, text);
        } else if (e.isFile() && (e.name.endsWith('.svelte') || e.name.endsWith('.ts') || e.name.endsWith('.js') || e.name.endsWith('.html') || e.name.endsWith('.php'))) {
            try {
                const content = fs.readFileSync(full, 'utf8');
                if (content.toLowerCase().includes(text.toLowerCase())) {
                    console.log(`Found "${text}" in: ${full}`);
                    const lines = content.split('\n');
                    lines.forEach((l, i) => {
                        if (l.toLowerCase().includes(text.toLowerCase())) {
                            console.log(`  L${i+1}: ${l.trim()}`);
                        }
                    });
                }
            } catch (err) {}
        }
    }
}

console.log('Searching for "Hanya Baca"...');
searchEverywhere(root1, 'Hanya Baca');
searchEverywhere(root2, 'Hanya Baca');
searchEverywhere(root3, 'Hanya Baca');

console.log('\nSearching for "Read-Only"...');
searchEverywhere(root1, 'Read-Only');
searchEverywhere(root2, 'Read-Only');
searchEverywhere(root3, 'Read-Only');

console.log('\nSearching for "Mode"...');
searchEverywhere(root1, 'Mode');
