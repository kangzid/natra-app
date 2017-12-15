const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

// Update pengaturan-cuti/+page.svelte
const cutiPath = path.join(svelteDir, 'pengaturan-cuti/+page.svelte');
let cutiContent = fs.readFileSync(cutiPath, 'utf8');

// Replace labels in policies and modals with proper 'for' and 'id'
cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Batas Maksimal Sakit Berbayar (Hari / Tahun)</label>\n                        <input\n                            type="number"',
    '<label for="policy-sick-days" class="block font-semibold text-foreground mb-1">Batas Maksimal Sakit Berbayar (Hari / Tahun)</label>\n                        <input\n                            id="policy-sick-days"\n                            type="number"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Wajib Lampirkan Surat Dokter (SID)</label>\n                        <select',
    '<label for="policy-sick-attach" class="block font-semibold text-foreground mb-1">Wajib Lampirkan Surat Dokter (SID)</label>\n                        <select\n                            id="policy-sick-attach"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Status Upah Izin Sakit</label>\n                        <select',
    '<label for="policy-sick-paid" class="block font-semibold text-foreground mb-1">Status Upah Izin Sakit</label>\n                        <select\n                            id="policy-sick-paid"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-xs text-foreground mb-1">Keterangan / SOP Izin Sakit</label>\n                    <textarea',
    '<label for="policy-sick-desc" class="block font-semibold text-xs text-foreground mb-1">Keterangan / SOP Izin Sakit</label>\n                    <textarea\n                        id="policy-sick-desc"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Batas Maksimal Izin Tidak Masuk (Hari / Tahun)</label>\n                        <input\n                            type="number"',
    '<label for="policy-abs-days" class="block font-semibold text-foreground mb-1">Batas Maksimal Izin Tidak Masuk (Hari / Tahun)</label>\n                        <input\n                            id="policy-abs-days"\n                            type="number"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Tipe Pemotongan Upah</label>\n                        <select',
    '<label for="policy-abs-paid" class="block font-semibold text-foreground mb-1">Tipe Pemotongan Upah</label>\n                        <select\n                            id="policy-abs-paid"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-xs text-foreground mb-1">Keterangan & Kebijakan Absen</label>\n                    <textarea',
    '<label for="policy-abs-desc" class="block font-semibold text-xs text-foreground mb-1">Keterangan & Kebijakan Absen</label>\n                    <textarea\n                        id="policy-abs-desc"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Wajib Lampirkan Surat Perintah Tugas (SPPD)</label>\n                        <select',
    '<label for="policy-duty-attach" class="block font-semibold text-foreground mb-1">Wajib Lampirkan Surat Perintah Tugas (SPPD)</label>\n                        <select\n                            id="policy-duty-attach"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-xs text-foreground mb-1">Keterangan / SOP Dinas Luar</label>\n                    <textarea',
    '<label for="policy-duty-desc" class="block font-semibold text-xs text-foreground mb-1">Keterangan / SOP Dinas Luar</label>\n                    <textarea\n                        id="policy-duty-desc"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Kode Cuti</label>\n                    <input',
    '<label for="modal-type-code" class="block font-semibold text-foreground mb-1">Kode Cuti</label>\n                    <input\n                        id="modal-type-code"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Nama Jenis Cuti</label>\n                    <input',
    '<label for="modal-type-name" class="block font-semibold text-foreground mb-1">Nama Jenis Cuti</label>\n                    <input\n                        id="modal-type-name"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Default Jatah (Hari)</label>\n                        <input',
    '<label for="modal-type-days" class="block font-semibold text-foreground mb-1">Default Jatah (Hari)</label>\n                        <input\n                            id="modal-type-days"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Tipe Upah</label>\n                        <select',
    '<label for="modal-type-paid" class="block font-semibold text-foreground mb-1">Tipe Upah</label>\n                        <select\n                            id="modal-type-paid"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Keterangan / Ketentuan</label>\n                    <textarea',
    '<label for="modal-type-desc" class="block font-semibold text-foreground mb-1">Keterangan / Ketentuan</label>\n                    <textarea\n                        id="modal-type-desc"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Total Kuota (Hari)</label>\n                    <input',
    '<label for="modal-edit-quota" class="block font-semibold text-foreground mb-1">Total Kuota (Hari)</label>\n                    <input\n                        id="modal-edit-quota"'
);

cutiContent = cutiContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Hari Terpakai</label>\n                    <input',
    '<label for="modal-edit-used" class="block font-semibold text-foreground mb-1">Hari Terpakai</label>\n                    <input\n                        id="modal-edit-used"'
);

fs.writeFileSync(cutiPath, cutiContent, 'utf8');
console.log('Fixed all labels in pengaturan-cuti/+page.svelte!');

// Check for unassociated in izin-absen, izin-sakit, izin-cuti, izin-dinas (e.g. employee searchable select)
const checkOther = (fileName) => {
    const fPath = path.join(svelteDir, fileName);
    let c = fs.readFileSync(fPath, 'utf8');
    c = c.replace('<label class="block text-xs font-medium text-muted-foreground mb-1">Pilih Karyawan *</label>', '<label for="form-employee-id" class="block text-xs font-medium text-muted-foreground mb-1">Pilih Karyawan *</label>');
    fs.writeFileSync(fPath, c, 'utf8');
};

checkOther('izin-absen/+page.svelte');
checkOther('izin-sakit/+page.svelte');
checkOther('izin-cuti/+page.svelte');
checkOther('izin-dinas/+page.svelte');
console.log('Fixed labels in other pengajuan pages!');
