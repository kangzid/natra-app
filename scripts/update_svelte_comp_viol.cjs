const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

// 1. Update compliance/+page.svelte
const compFile = path.join(svelteDir, 'src/routes/admin/hris/compliance/+page.svelte');
let compContent = fs.readFileSync(compFile, 'utf8');

// Update header
compContent = compContent.replace(
    '<h1 class="text-2xl font-bold tracking-tight">Kepatuhan & Notifikasi Deadline (Compliance)</h1>',
    '<h1 class="text-2xl font-bold tracking-tight">Legalitas, Izin & Masa Berlaku Dokumen</h1>'
);
compContent = compContent.replace(
    '<p class="text-sm text-muted-foreground">Monitoring masa berlaku legalitas SIM Driver, Sertifikasi K3, STNK Pajak, dan Uji Kelayakan KIR Armada.</p>',
    '<p class="text-sm text-muted-foreground">Pemantauan terpadu masa berlaku SIM Driver, Uji KIR Armada, STNK Pajak, Sertifikasi K3, dan notifikasi jatuh tempo otomatis.</p>'
);
compContent = compContent.replace('Tambah Item Kepatuhan', 'Tambah Dokumen Legalitas');
compContent = compContent.replace('Gagal menyimpan item kepatuhan.', 'Gagal menyimpan dokumen legalitas.');
compContent = compContent.replace('{summary.employee_docs_count || 0} Personel', '{summary.employee_count || summary.employee_docs_count || 0} Personel');
compContent = compContent.replace('{summary.vehicle_docs_count || 0} Armada Kendaraan', '{summary.vehicle_count || summary.vehicle_docs_count || 0} Armada Kendaraan');

fs.writeFileSync(compFile, compContent, 'utf8');
console.log('Updated compliance/+page.svelte wording and summary bindings!');

// 2. Update violations/+page.svelte
const violFile = path.join(svelteDir, 'src/routes/admin/hris/violations/+page.svelte');
let violContent = fs.readFileSync(violFile, 'utf8');

violContent = violContent.replace(
    '<h1 class="text-2xl font-bold tracking-tight">Pelanggaran & Surat Peringatan (SP)</h1>',
    '<h1 class="text-2xl font-bold tracking-tight">Pelanggaran & Surat Peringatan Karyawan</h1>'
);
violContent = violContent.replace(
    '<p class="text-sm text-muted-foreground">Pencatatan resmi pelanggaran SOP, penerbitan Surat Peringatan (SP 1, SP 2, SP 3), dan arsip dasar hukum perundang-undangan.</p>',
    '<p class="text-sm text-muted-foreground">Pencatatan resmi pelanggaran tata tertib kerja, penerbitan Surat Peringatan resmi (Teguran, Surat Peringatan I, II, III), dan arsip dasar hukum.</p>'
);
violContent = violContent.replace('Pengaturan Master SP', 'Pengaturan Master Jenis Surat Peringatan');
violContent = violContent.replace('Tambah Pelanggaran Baru', 'Terbitkan Surat Peringatan Baru');
violContent = violContent.replace('Total Sanksi / SP Terbit', 'Total Surat Peringatan & Sanksi');
violContent = violContent.replace('Masih dalam masa berlaku SP', 'Masih dalam masa berlaku sanksi');
violContent = violContent.replace(
    '<span class="text-xs font-semibold uppercase text-muted-foreground">Surat Peringatan (SP)</span>',
    '<span class="text-xs font-semibold uppercase text-muted-foreground">Kategori Surat Peringatan</span>'
);
violContent = violContent.replace('{summary.sp_count || 0} <span class="text-xs font-normal text-muted-foreground">SP 1 / 2 / 3</span>', '{summary.sp_count || 0} <span class="text-xs font-normal text-muted-foreground">Surat Peringatan</span>');
violContent = violContent.replace('placeholder="Nama, ID, atau No SP..."', 'placeholder="Nama, ID, atau No Dokumen..."');
violContent = violContent.replace('Jenis Sanksi / SP', 'Jenis Surat Peringatan / Sanksi');

// Also update master types modal title and fields if present
violContent = violContent.replace('Master Tipe Sanksi & Surat Peringatan (SP)', 'Master Jenis Sanksi & Surat Peringatan');

fs.writeFileSync(violFile, violContent, 'utf8');
console.log('Updated violations/+page.svelte without "SP" acronym and with clear natural terms!');
