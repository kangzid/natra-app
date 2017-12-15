const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const serverPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.server.ts');

const newServerContent = `import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
    const token = cookies.get('token');
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();
    const initialTab = url.searchParams.get('tab') || 'leave';

    try {
        const [
            leaveTypesRes,
            leaveBalancesRes,
            sickBalancesRes,
            absenceBalancesRes,
            policiesRes,
            employeesRes
        ] = await Promise.all([
            fetch(\`\${PUBLIC_API_URL}/hris/leave-types\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/leave-balances?category=leave&year=\${year}\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/leave-balances?category=sick&year=\${year}\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/leave-balances?category=absence&year=\${year}\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/request-policies\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/employees\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            })
        ]);

        const leaveTypes = leaveTypesRes.ok ? await leaveTypesRes.json() : [];
        const leaveBalances = leaveBalancesRes.ok ? await leaveBalancesRes.json() : [];
        const sickBalances = sickBalancesRes.ok ? await sickBalancesRes.json() : [];
        const absenceBalances = absenceBalancesRes.ok ? await absenceBalancesRes.json() : [];
        const policies = policiesRes.ok ? await policiesRes.json() : {};
        const employees = employeesRes.ok ? await employeesRes.json() : [];

        return {
            leaveTypes: Array.isArray(leaveTypes) ? leaveTypes : (leaveTypes.data || []),
            leaveBalances: Array.isArray(leaveBalances) ? leaveBalances : (leaveBalances.data || []),
            sickBalances: Array.isArray(sickBalances) ? sickBalances : (sickBalances.data || []),
            absenceBalances: Array.isArray(absenceBalances) ? absenceBalances : (absenceBalances.data || []),
            policies: policies || {},
            employees: Array.isArray(employees) ? employees : (employees.data || []),
            year,
            initialTab,
            token
        };
    } catch (e) {
        console.error('Failed to load leave and policy settings:', e);
        return {
            leaveTypes: [],
            leaveBalances: [],
            sickBalances: [],
            absenceBalances: [],
            policies: {},
            employees: [],
            year,
            initialTab,
            token
        };
    }
};
`;

fs.writeFileSync(serverPath, newServerContent, 'utf8');
console.log('Updated pengaturan-cuti/+page.server.ts with separated policies and balances fetchers!');
