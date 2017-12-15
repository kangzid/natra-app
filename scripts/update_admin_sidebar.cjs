const fs = require('fs');

const layoutPath = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/+layout.svelte';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

// Add Clock to lucide-svelte import if not present
if (!layoutCode.includes('Clock,')) {
  layoutCode = layoutCode.replace('CalendarOff,', 'CalendarOff,\n        Clock,');
}

// Add Shift menu item under Kehadiran & Operasional
if (!layoutCode.includes('/admin/hris/shifts')) {
  const target = `{ href: "/admin/hris/pengajuan", label: "Pengajuan Cuti & Izin", icon: CalendarOff },`;
  const replacement = `{ href: "/admin/hris/pengajuan", label: "Pengajuan Cuti & Izin", icon: CalendarOff },\n                        { href: "/admin/hris/shifts", label: "Shift & Jam Kerja", icon: Clock },`;
  
  if (layoutCode.includes(target)) {
    layoutCode = layoutCode.replace(target, replacement);
    fs.writeFileSync(layoutPath, layoutCode, 'utf8');
    console.log('Successfully added Shift & Jam Kerja to admin layout sidebar!');
  } else {
    console.log('Target string not found in layout');
  }
} else {
  console.log('Shift menu already exists in admin layout sidebar');
}
