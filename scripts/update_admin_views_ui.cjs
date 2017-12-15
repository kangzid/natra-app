const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const pageFile = path.join(svelteDir, 'src/routes/admin/hris/news/+page.svelte');
let pageContent = fs.readFileSync(pageFile, 'utf8');

// Add Eye icon to view count on cards and summary if needed
if (!pageContent.includes('item.views')) {
    pageContent = pageContent.replace(
        '<span>{formatAudienceLabel(item.target_audience)}</span>\n                            <span>&bull;</span>\n                            <span>{formatDate(item.published_at || item.created_at)}</span>',
        '<span>{formatAudienceLabel(item.target_audience)}</span>\n                            <span>&bull;</span>\n                            <span>{formatDate(item.published_at || item.created_at)}</span>\n                            <span>&bull;</span>\n                            <span class="inline-flex items-center gap-1 font-semibold text-primary"><Eye class="w-3 h-3" /> {(item.views || 0)} views</span>'
    );
    fs.writeFileSync(pageFile, pageContent, 'utf8');
    console.log('Added view count to Web Admin +page.svelte!');
} else {
    console.log('Web Admin +page.svelte already has item.views.');
}
