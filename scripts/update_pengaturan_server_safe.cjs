const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const serverPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.server.ts');

const safeServerContent = `import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
    const token = cookies.get('token');
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();
    const initialTab = url.searchParams.get('tab') || 'leave';

    const defaultPolicies = {
        sick: {
            policy_type: 'sick',
            max_days_per_year: 14,
            requires_attachment: true,
            is_paid: true,
            description: 'Izin sakit dengan Surat Izin Dokter (SID) resmi'
        },
        absence: {
            policy_type: 'absence',
            max_days_per_year: 3,
            requires_attachment: false,
            is_paid: false,
            description: 'Izin keperluan pribadi mendesak / absen harian'
        },
        duty: {
            policy_type: 'duty',
            max_days_per_year: 0,
            requires_attachment: true,
            is_paid: true,
            description: 'Perjalanan dinas luar kota / penugasan kantor'
        }
    };

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
            }).catch(() => null),
            fetch(\`\${PUBLIC_API_URL}/hris/leave-balances?category=leave&year=\${year}\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }).catch(() => null),
            fetch(\`\${PUBLIC_API_URL}/hris/leave-balances?category=sick&year=\${year}\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }).catch(() => null),
            fetch(\`\${PUBLIC_API_URL}/hris/leave-balances?category=absence&year=\${year}\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }).catch(() => null),
            fetch(\`\${PUBLIC_API_URL}/hris/request-policies\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }).catch(() => null),
            fetch(\`\${PUBLIC_API_URL}/employees\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }).catch(() => null)
        ]);

        const leaveTypes = leaveTypesRes && leaveTypesRes.ok ? await leaveTypesRes.json() : [];
        const leaveBalances = leaveBalancesRes && leaveBalancesRes.ok ? await leaveBalancesRes.json() : [];
        const sickBalances = sickBalancesRes && sickBalancesRes.ok ? await sickBalancesRes.json() : [];
        const absenceBalances = absenceBalancesRes && absenceBalancesRes.ok ? await absenceBalancesRes.json() : [];
        const policies = policiesRes && policiesRes.ok ? await policiesRes.json() : {};
        const employees = employeesRes && employeesRes.ok ? await employeesRes.json() : [];

        return {
            leaveTypes: Array.isArray(leaveTypes) ? leaveTypes : (leaveTypes.data || []),
            leaveBalances: Array.isArray(leaveBalances) ? leaveBalances : (leaveBalances.data || []),
            sickBalances: Array.isArray(sickBalances) ? sickBalances : (sickBalances.data || []),
            absenceBalances: Array.isArray(absenceBalances) ? absenceBalances : (absenceBalances.data || []),
            policies: {
                sick: policies?.sick || defaultPolicies.sick,
                absence: policies?.absence || defaultPolicies.absence,
                duty: policies?.duty || defaultPolicies.duty,
            },
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
            policies: defaultPolicies,
            employees: [],
            year,
            initialTab,
            token
        };
    }
};
`;

fs.writeFileSync(serverPath, safeServerContent, 'utf8');
console.log('Updated pengaturan-cuti/+page.server.ts with robust fallbacks!');
