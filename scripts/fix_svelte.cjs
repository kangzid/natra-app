const fs = require('fs');

// Fix Svelte claims page missing Download icon
const sveltePath = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/claims/+page.svelte';
if (fs.existsSync(sveltePath)) {
  let content = fs.readFileSync(sveltePath, 'utf8');
  if (content.includes('Download') && !content.includes('Download,') && !content.includes('Download }') && !content.includes('Download\n')) {
    content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-svelte['"]/, (match, icons) => {
      if (!icons.includes('Download')) {
        return `import { Download, ${icons.trim()} } from 'lucide-svelte'`;
      }
      return match;
    });
    fs.writeFileSync(sveltePath, content, 'utf8');
    console.log('Fixed missing Download import in Svelte frontend!');
  } else {
    console.log('Svelte Download icon already checked.');
  }
}
