const fs = require('fs');

const layoutPath = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/+layout.svelte';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

// Ensure Clock is imported
if (!layoutCode.includes('Clock,')) {
  layoutCode = layoutCode.replace('ClipboardCheck,', 'ClipboardCheck,\n        Clock,');
}

const target = `{ href: "/admin/hris/pengajuan", label: "Pengajuan Cuti & Izin", icon: ClipboardCheck },`;
const replacement = `{ href: "/admin/hris/pengajuan", label: "Pengajuan Cuti & Izin", icon: ClipboardCheck },\n                        { href: "/admin/hris/shifts", label: "Shift & Jam Kerja", icon: Clock },`;

if (layoutCode.includes(target)) {
  layoutCode = layoutCode.replace(target, replacement);
  fs.writeFileSync(layoutPath, layoutCode, 'utf8');
  console.log('Successfully updated +layout.svelte with Shift & Jam Kerja menu!');
} else {
  console.log('Target not found in layout');
}
