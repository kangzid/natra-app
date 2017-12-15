const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

// 1. Update izin-sakit/+page.svelte
const sakitPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-sakit/+page.svelte');
let sakitContent = fs.readFileSync(sakitPath, 'utf8');
const sakitBadge = `    <PengajuanNav />

    <!-- Quota info banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs">
        <div class="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <HeartPulse class="w-4 h-4 text-blue-500 shrink-0" />
            <span><strong>Master Kuota Izin Sakit (CS01):</strong> Default 14 Hari/Tahun &bull; Pemotongan saldo otomatis terakumulasi pada kuota tahunan karyawan saat disetujui.</span>
        </div>
        <a href="/admin/hris/pengajuan/pengaturan-cuti" class="text-primary font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-1">
            Atur Kuota & Saldo &rarr;
        </a>
    </div>`;

if (!sakitContent.includes('Master Kuota Izin Sakit')) {
    sakitContent = sakitContent.replace('    <PengajuanNav />', sakitBadge);
    fs.writeFileSync(sakitPath, sakitContent, 'utf8');
    console.log('Added quota banner to izin-sakit/+page.svelte!');
}

// 2. Update izin-absen/+page.svelte
const absenPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-absen/+page.svelte');
let absenContent = fs.readFileSync(absenPath, 'utf8');
const absenBadge = `    <PengajuanNav />

    <!-- Quota info banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs">
        <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CalendarX2 class="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>Master Kuota Izin Tidak Masuk (IP01):</strong> Izin keperluan mendesak harian &bull; Saldo terhubung otomatis ke pengaturan cuti karyawan saat disetujui.</span>
        </div>
        <a href="/admin/hris/pengajuan/pengaturan-cuti" class="text-primary font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-1">
            Atur Kuota & Saldo &rarr;
        </a>
    </div>`;

if (!absenContent.includes('Master Kuota Izin Tidak Masuk')) {
    absenContent = absenContent.replace('    <PengajuanNav />', absenBadge);
    fs.writeFileSync(absenPath, absenContent, 'utf8');
    console.log('Added quota banner to izin-absen/+page.svelte!');
}

// 3. Update izin-cuti/+page.svelte
const cutiPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-cuti/+page.svelte');
let cutiContent = fs.readFileSync(cutiPath, 'utf8');
const cutiBadge = `    <PengajuanNav />

    <!-- Quota info banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs">
        <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CalendarRange class="w-4 h-4 text-emerald-500 shrink-0" />
            <span><strong>Master Kuota Cuti (CT01 / CM01 / CK01):</strong> Hak cuti karyawan &bull; Saldo cuti terpotong otomatis saat permohonan disetujui.</span>
        </div>
        <a href="/admin/hris/pengajuan/pengaturan-cuti" class="text-primary font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-1">
            Lihat & Edit Saldo Karyawan &rarr;
        </a>
    </div>`;

if (!cutiContent.includes('Master Kuota Cuti')) {
    cutiContent = cutiContent.replace('    <PengajuanNav />', cutiBadge);
    fs.writeFileSync(cutiPath, cutiContent, 'utf8');
    console.log('Added quota banner to izin-cuti/+page.svelte!');
}
