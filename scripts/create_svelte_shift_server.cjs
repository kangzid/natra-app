const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const shiftsDir = path.join(svelteDir, 'src/routes/admin/hris/shifts');

if (!fs.existsSync(shiftsDir)) {
  fs.mkdirSync(shiftsDir, { recursive: true });
}

// 1. +page.server.ts
const serverContent = `import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
    const token = cookies.get('token');

    const month = url.searchParams.get('month') || (new Date().getMonth() + 1).toString();
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();

    try {
        const [settingsRes, shiftsRes, assignmentsRes, employeesRes] = await Promise.all([
            fetch(\`\${PUBLIC_API_URL}/hris/attendance-settings\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/shifts\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/hris/shift-assignments?month=\${month}&year=\${year}\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            }),
            fetch(\`\${PUBLIC_API_URL}/employees\`, {
                headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
            })
        ]);

        const settings = settingsRes.ok ? await settingsRes.json() : {};
        const shiftsData = shiftsRes.ok ? await shiftsRes.json() : { shifts: [] };
        const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : { assignments: [] };
        const employeesData = employeesRes.ok ? await employeesRes.json() : [];

        return {
            settings: settings.id ? settings : {
                is_shift_enabled: false,
                check_in_start: '07:00',
                work_start_time: '08:00',
                late_tolerance_time: '08:15',
                check_in_end: '08:30',
                lock_after_late_cutoff: true,
                late_cutoff_policy: 'empty',
                work_end_time: '17:00',
                min_checkout_at_work_end: true,
                require_geofence_checkout: true
            },
            shifts: shiftsData.shifts || [],
            assignments: assignmentsData.assignments || [],
            employees: Array.isArray(employeesData) ? employeesData : (employeesData.data || []),
            currentMonth: parseInt(month),
            currentYear: parseInt(year),
            token
        };
    } catch (e) {
        console.error('Failed to load shift and attendance settings:', e);
        return {
            settings: {
                is_shift_enabled: false,
                check_in_start: '07:00',
                work_start_time: '08:00',
                late_tolerance_time: '08:15',
                check_in_end: '08:30',
                lock_after_late_cutoff: true,
                work_end_time: '17:00',
                min_checkout_at_work_end: true,
                require_geofence_checkout: true
            },
            shifts: [],
            assignments: [],
            employees: [],
            currentMonth: new Date().getMonth() + 1,
            currentYear: new Date().getFullYear(),
            token: '',
            error: 'Gagal memuat data pengaturan'
        };
    }
};
`;
fs.writeFileSync(path.join(shiftsDir, '+page.server.ts'), serverContent, 'utf8');
console.log('Created +page.server.ts for shifts');
