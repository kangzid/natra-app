const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

// 1. Update izin-sakit/+page.svelte
const sakitPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-sakit/+page.svelte');
let sakitContent = fs.readFileSync(sakitPath, 'utf8');

const newSakitBanner = `    <PengajuanNav />

    <!-- Quota & Policy Info Banner (Clean Lucide Icons, NO Emojis) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs">
        <div class="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <HeartPulse class="w-4 h-4 text-blue-500 shrink-0" />
            <span><strong>Kebijakan Izin Sakit:</strong> Default 14 Hari/Tahun &bull; Pemotongan saldo otomatis terakumulasi pada kuota tahunan karyawan saat disetujui.</span>
        </div>
        <a href="/admin/hris/pengajuan/pengaturan-cuti?tab=sick" class="text-blue-600 dark:text-blue-400 font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-1">
            Pengaturan Izin Sakit &rarr;
        </a>
    </div>`;

sakitContent = sakitContent.replace(/<PengajuanNav \/>[\s\S]*?<!-- Quota info banner -->[\s\S]*?<\/div>/, newSakitBanner);
fs.writeFileSync(sakitPath, sakitContent, 'utf8');
console.log('Updated izin-sakit/+page.svelte banner!');

// 2. Update izin-absen/+page.svelte
const absenPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-absen/+page.svelte');
let absenContent = fs.readFileSync(absenPath, 'utf8');

const newAbsenBanner = `    <PengajuanNav />

    <!-- Quota & Policy Info Banner (Clean Lucide Icons, NO Emojis) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl text-xs">
        <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <CalendarX2 class="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>Kebijakan Izin Tidak Masuk:</strong> Izin keperluan mendesak &bull; Saldo terhubung otomatis ke pengaturan izin absen karyawan saat disetujui.</span>
        </div>
        <a href="/admin/hris/pengajuan/pengaturan-cuti?tab=absence" class="text-amber-600 dark:text-amber-400 font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-1">
            Pengaturan Izin Absen &rarr;
        </a>
    </div>`;

absenContent = absenContent.replace(/<PengajuanNav \/>[\s\S]*?<!-- Quota info banner -->[\s\S]*?<\/div>/, newAbsenBanner);
fs.writeFileSync(absenPath, absenContent, 'utf8');
console.log('Updated izin-absen/+page.svelte banner!');

// 3. Update izin-cuti/+page.svelte
const cutiPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-cuti/+page.svelte');
let cutiContent = fs.readFileSync(cutiPath, 'utf8');

const newCutiBanner = `    <PengajuanNav />

    <!-- Quota & Policy Info Banner (Clean Lucide Icons, NO Emojis) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs">
        <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CalendarRange class="w-4 h-4 text-emerald-500 shrink-0" />
            <span><strong>Master Jenis Cuti:</strong> Cuti Tahunan, Cuti Melahirkan, Cuti Khusus &bull; Saldo cuti terpotong otomatis saat permohonan disetujui.</span>
        </div>
        <a href="/admin/hris/pengajuan/pengaturan-cuti?tab=leave" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-1">
            Pengaturan Master Cuti &rarr;
        </a>
    </div>`;

cutiContent = cutiContent.replace(/<PengajuanNav \/>[\s\S]*?<!-- Quota info banner -->[\s\S]*?<\/div>/, newCutiBanner);
fs.writeFileSync(cutiPath, cutiContent, 'utf8');
console.log('Updated izin-cuti/+page.svelte banner!');

// 4. Update izin-dinas/+page.svelte
const dinasPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-dinas/+page.svelte');
if (fs.existsSync(dinasPath)) {
    let dinasContent = fs.readFileSync(dinasPath, 'utf8');
    const newDinasBanner = `    <PengajuanNav />

    <!-- Policy Info Banner (Clean Lucide Icons, NO Emojis) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs">
        <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Briefcase class="w-4 h-4 text-primary shrink-0" />
            <span><strong>Kebijakan Izin Dinas:</strong> Penugasan operasional & dinas luar kota &bull; Kehadiran otomatis tercatat berstatus Dinas Luar pada absensi.</span>
        </div>
        <a href="/admin/hris/pengajuan/pengaturan-cuti?tab=duty" class="text-primary font-bold hover:underline whitespace-nowrap text-xs flex items-center gap-1">
            Pengaturan Izin Dinas &rarr;
        </a>
    </div>`;

    if (!dinasContent.includes('Briefcase')) {
        dinasContent = dinasContent.replace("import { \n        Plus,", "import { \n        Briefcase,\n        Plus,");
    }
    if (!dinasContent.includes('Kebijakan Izin Dinas')) {
        dinasContent = dinasContent.replace('    <PengajuanNav />', newDinasBanner);
        fs.writeFileSync(dinasPath, dinasContent, 'utf8');
        console.log('Updated izin-dinas/+page.svelte banner!');
    }
}
