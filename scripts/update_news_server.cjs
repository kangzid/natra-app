const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const serverFile = path.join(svelteDir, 'src/routes/admin/hris/news/+page.server.ts');

const newServerContent = `import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
    const token = cookies.get('token');

    const search = url.searchParams.get('search') || '';
    const priority = url.searchParams.get('priority') || '';
    const target_audience = url.searchParams.get('target_audience') || '';
    const category = url.searchParams.get('category') || '';

    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (priority) queryParams.set('priority', priority);
    if (target_audience) queryParams.set('target_audience', target_audience);
    if (category) queryParams.set('category', category);

    try {
        const [newsRes, summaryRes, deptsRes] = await Promise.all([
            fetch(\`\${PUBLIC_API_URL}/hris/news?\${queryParams.toString()}\`, {
                headers: { 
                    'Authorization': \`Bearer \${token}\`,
                    'Accept': 'application/json'
                }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/news/summary\`, {
                headers: { 
                    'Authorization': \`Bearer \${token}\`,
                    'Accept': 'application/json'
                }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/departments\`, {
                headers: { 
                    'Authorization': \`Bearer \${token}\`,
                    'Accept': 'application/json'
                }
            })
        ]);

        const news = newsRes.ok ? await newsRes.json() : [];
        const summary = summaryRes.ok ? await summaryRes.json() : {
            total_news: 0,
            urgent_count: 0,
            published_count: 0,
            draft_count: 0
        };
        const departments = deptsRes.ok ? await deptsRes.json() : [];

        return {
            news: Array.isArray(news) ? news : (news.data || []),
            summary: summary.data || summary || { total_news: 0, urgent_count: 0, published_count: 0, draft_count: 0 },
            departments: Array.isArray(departments) ? departments : (departments.data || []),
            token
        };
    } catch (e) {
        console.error('Failed to load news:', e);
        return {
            news: [],
            summary: { total_news: 0, urgent_count: 0, published_count: 0, draft_count: 0 },
            departments: [],
            token
        };
    }
};
`;

fs.writeFileSync(serverFile, newServerContent, 'utf8');
console.log('Updated +page.server.ts for news!');
