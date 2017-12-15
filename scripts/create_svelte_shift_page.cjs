const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const shiftsPagePath = path.join(svelteDir, 'src/routes/admin/hris/shifts/+page.svelte');

const pageContent = `<script lang="ts">
    import { PUBLIC_API_URL } from '$env/static/public';
    import { fade } from 'svelte/transition';
    import { 
        Clock, 
        Plus, 
        Trash2, 
        Edit, 
        CheckCircle2, 
        AlertTriangle, 
        Sliders, 
        CalendarRange, 
        Users, 
        Building2, 
        Save, 
        ShieldCheck, 
        X, 
        Calendar,
        ChevronLeft,
        ChevronRight,
        Lock,
        Unlock,
        HelpCircle,
        AlertCircle
    } from 'lucide-svelte';
    import { invalidateAll } from '$app/navigation';

    let { data } = $props();

    let settings = $state(data.settings || {
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
    });

    let shifts = $state(data.shifts || []);
    let assignments = $state(data.assignments || []);
    let employees = $state(data.employees || []);
    let currentMonth = $state(data.currentMonth || new Date().getMonth() + 1);
    let currentYear = $state(data.currentYear || new Date().getFullYear());

    $effect(() => {
        if (data.settings) settings = data.settings;
        shifts = data.shifts || [];
        assignments = data.assignments || [];
        employees = data.employees || [];
        currentMonth = data.currentMonth || new Date().getMonth() + 1;
        currentYear = data.currentYear || new Date().getFullYear();
    });

    // Active Tab
    let activeTab = $state<'rules' | 'shifts' | 'roster'>('rules');

    // UI Loading & Toast States
    let isSavingSettings = $state(false);
    let toastMessage = $state<string | null>(null);
    let toastType = $state<'success' | 'error'>('success');

    function showToast(msg: string, type: 'success' | 'error' = 'success') {
        toastMessage = msg;
        toastType = type;
        setTimeout(() => {
            toastMessage = null;
        }, 3500);
    }

    // --- Tab 1: Save Attendance & Shift Settings ---
    async function handleSaveSettings() {
        isSavingSettings = true;
        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/attendance-settings\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.message || 'Gagal menyimpan pengaturan');

            showToast('Pengaturan jam kerja dan kehadiran berhasil disimpan!', 'success');
            await invalidateAll();
        } catch (err: any) {
            showToast(err.message || 'Gagal menyimpan pengaturan', 'error');
        } finally {
            isSavingSettings = false;
        }
    }

    // --- Tab 2: Shift Modal & CRUD ---
    let isShiftModalOpen = $state(false);
    let isEditingShift = $state(false);
    let isSubmittingShift = $state(false);
    let shiftForm = $state({
        id: null as number | null,
        name: '',
        code: '',
        check_in_start: '06:00',
        work_start_time: '07:00',
        late_tolerance_time: '07:15',
        check_in_end: '08:00',
        work_end_time: '15:00',
        is_night_shift: false,
        color: '#3b82f6',
        is_active: true
    });

    function openCreateShiftModal() {
        isEditingShift = false;
        shiftForm = {
            id: null,
            name: '',
            code: 'SHF-' + Math.floor(100 + Math.random() * 900),
            check_in_start: '06:00',
            work_start_time: '07:00',
            late_tolerance_time: '07:15',
            check_in_end: '08:00',
            work_end_time: '15:00',
            is_night_shift: false,
            color: '#3b82f6',
            is_active: true
        };
        isShiftModalOpen = true;
    }

    function openEditShiftModal(shift: any) {
        isEditingShift = true;
        shiftForm = {
            id: shift.id,
            name: shift.name,
            code: shift.code || '',
            check_in_start: shift.check_in_start?.substring(0, 5) || '06:00',
            work_start_time: shift.work_start_time?.substring(0, 5) || '07:00',
            late_tolerance_time: shift.late_tolerance_time?.substring(0, 5) || '07:15',
            check_in_end: shift.check_in_end?.substring(0, 5) || '08:00',
            work_end_time: shift.work_end_time?.substring(0, 5) || '15:00',
            is_night_shift: !!shift.is_night_shift,
            color: shift.color || '#3b82f6',
            is_active: shift.is_active !== undefined ? !!shift.is_active : true
        };
        isShiftModalOpen = true;
    }

    async function handleSaveShift() {
        if (!shiftForm.name) {
            showToast('Nama shift wajib diisi', 'error');
            return;
        }

        isSubmittingShift = true;
        try {
            const url = isEditingShift
                ? \`\${PUBLIC_API_URL}/hris/shifts/\${shiftForm.id}\`
                : \`\${PUBLIC_API_URL}/hris/shifts\`;
            const method = isEditingShift ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(shiftForm)
            });

            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.message || 'Gagal memproses shift');

            showToast(isEditingShift ? 'Master shift berhasil diperbarui' : 'Master shift baru berhasil dibuat', 'success');
            isShiftModalOpen = false;
            await invalidateAll();
        } catch (err: any) {
            showToast(err.message || 'Gagal menyimpan shift', 'error');
        } finally {
            isSubmittingShift = false;
        }
    }

    async function handleDeleteShift(id: number) {
        if (!confirm('Apakah Anda yakin ingin menghapus/menonaktifkan shift ini?')) return;

        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/shifts/\${id}\`, {
                method: 'DELETE',
                headers: {
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                }
            });

            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.message || 'Gagal menghapus shift');

            showToast(resJson.message || 'Shift berhasil dihapus', 'success');
            await invalidateAll();
        } catch (err: any) {
            showToast(err.message || 'Gagal menghapus shift', 'error');
        }
    }

    // --- Tab 3: Roster Assign Modal ---
    let isRosterModalOpen = $state(false);
    let isSubmittingRoster = $state(false);
    let rosterForm = $state({
        employee_ids: [] as number[],
        shift_id: shifts.length > 0 ? shifts[0].id : '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    function openRosterModal() {
        rosterForm = {
            employee_ids: employees.map((e: any) => e.id),
            shift_id: shifts.length > 0 ? shifts[0].id : '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            notes: ''
        };
        isRosterModalOpen = true;
    }

    async function handleSaveRoster() {
        if (rosterForm.employee_ids.length === 0) {
            showToast('Pilih minimal 1 karyawan', 'error');
            return;
        }
        if (!rosterForm.shift_id) {
            showToast('Pilih shift yang akan ditetapkan', 'error');
            return;
        }

        isSubmittingRoster = true;
        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/shift-assignments\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(rosterForm)
            });

            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.message || 'Gagal menetapkan roster shift');

            showToast(resJson.message || 'Jadwal shift berhasil ditetapkan!', 'success');
            isRosterModalOpen = false;
            await invalidateAll();
        } catch (err: any) {
            showToast(err.message || 'Gagal menetapkan jadwal shift', 'error');
        } finally {
            isSubmittingRoster = false;
        }
    }

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
</script>

<svelte:head>
    <title>Shift & Pengaturan Jam Kerja - HRIS</title>
</svelte:head>

<div class="space-y-6">
    <!-- Toast Notification -->
    {#if toastMessage}
        <div transition:fade class="fixed top-6 right-6 z-[300] max-w-md p-4 rounded-2xl shadow-xl flex items-center gap-3 border {toastType === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'}">
            {#if toastType === 'success'}
                <CheckCircle2 class="w-5 h-5 flex-shrink-0" />
            {:else}
                <AlertCircle class="w-5 h-5 flex-shrink-0" />
            {/if}
            <p class="text-sm font-semibold">{toastMessage}</p>
        </div>
    {/if}

    <!-- Header Banner -->
    <div class="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div class="space-y-2 relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase {settings.is_shift_enabled ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}">
                <Clock class="w-3.5 h-3.5" />
                {settings.is_shift_enabled ? 'Sistem Shift: AKTIF' : 'Sistem Shift: NONAKTIF (Jadwal Reguler)'}
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Shift & Pengaturan Jam Kerja</h1>
            <p class="text-sm text-muted-foreground max-w-2xl">
                Atur sistem kerja fleksibel, jam buka absen, batas toleransi keterlambatan (cut-off), jam pulang, dan master shift operasional karyawan.
            </p>
        </div>

        <!-- Quick Summary Box -->
        <div class="flex items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border/60">
            <div class="text-center px-2">
                <p class="text-xs text-muted-foreground font-semibold">Total Shift</p>
                <p class="text-xl font-black text-foreground mt-0.5">{shifts.length} Shift</p>
            </div>
            <div class="w-px h-8 bg-border"></div>
            <div class="text-center px-2">
                <p class="text-xs text-muted-foreground font-semibold">Status Kunci</p>
                <p class="text-xs font-bold {settings.lock_after_late_cutoff ? 'text-rose-500' : 'text-emerald-500'} mt-1">
                    {settings.lock_after_late_cutoff ? 'Kunci Otomatis' : 'Bebas Absen'}
                </p>
            </div>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar">
        <button
            onclick={() => activeTab = 'rules'}
            class="px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all {activeTab === 'rules' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}"
        >
            <Sliders class="w-4 h-4" />
            <span>Aturan Kehadiran & Jam Kerja</span>
        </button>

        <button
            onclick={() => activeTab = 'shifts'}
            class="px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all {activeTab === 'shifts' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}"
        >
            <CalendarRange class="w-4 h-4" />
            <span>Master Data Shift ({shifts.length})</span>
        </button>

        <button
            onclick={() => activeTab = 'roster'}
            class="px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all {activeTab === 'roster' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}"
        >
            <Users class="w-4 h-4" />
            <span>Jadwal & Roster Karyawan</span>
        </button>
    </div>

    <!-- Tab 1: Aturan Kehadiran & Jam Kerja -->
    {#if activeTab === 'rules'}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Main Settings Form -->
            <div class="lg:col-span-2 space-y-6">
                
                <!-- Shift Toggle Card -->
                <div class="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div class="flex items-start justify-between gap-4">
                        <div class="space-y-1">
                            <h3 class="text-base font-extrabold text-foreground">Gunakan Sistem Shift (Multi-Shift / Roster)</h3>
                            <p class="text-xs text-muted-foreground leading-relaxed">
                                Aktifkan jika perusahaan Anda menerapkan banyak jam shift kerja (misal Shift Pagi, Siang, Malam). Jika dinonaktifkan, seluruh karyawan akan mengikuti 1 jadwal kerja standar di bawah.
                            </p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" bind:checked={settings.is_shift_enabled} class="sr-only peer">
                            <div class="w-12 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <!-- Check-in Time Rules Card -->
                <div class="bg-card border border-border rounded-2xl p-6 space-y-5">
                    <div class="border-b border-border pb-3">
                        <h3 class="text-base font-extrabold text-foreground flex items-center gap-2">
                            <Clock class="w-4 h-4 text-primary" />
                            Aturan Jam Masuk & Batas Keterlambatan {settings.is_shift_enabled ? '(Fallback/Standar)' : ''}
                        </h3>
                        <p class="text-xs text-muted-foreground mt-0.5">Konfigurasi batas waktu absensi masuk bagi karyawan.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-foreground mb-1.5">
                                Jam Buka Absen Masuk
                            </label>
                            <input
                                type="time"
                                bind:value={settings.check_in_start}
                                class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Waktu paling awal tombol absen di mobile aktif.</p>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-foreground mb-1.5">
                                Jam Masuk Resmi (Target)
                            </label>
                            <input
                                type="time"
                                bind:value={settings.work_start_time}
                                class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Jam masuk kerja standar operasional.</p>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-foreground mb-1.5">
                                Toleransi Terlambat
                            </label>
                            <input
                                type="time"
                                bind:value={settings.late_tolerance_time}
                                class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Absen setelah jam ini berstatus "Terlambat".</p>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-foreground mb-1.5">
                                Batas Akhir Absen Masuk (Cut-off)
                            </label>
                            <input
                                type="time"
                                bind:value={settings.check_in_end}
                                class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Batas waktu maksimal tombol absen masuk.</p>
                        </div>
                    </div>

                    <!-- Cutoff Lock Toggle -->
                    <div class="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between gap-4">
                        <div class="space-y-0.5">
                            <p class="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                                <Lock class="w-3.5 h-3.5 text-rose-500" />
                                Kunci Tombol Absen Lewat Jam Cut-off
                            </p>
                            <p class="text-[11px] text-muted-foreground">
                                Jika aktif, karyawan yang lewat dari jam {settings.check_in_end || '08:30'} tidak bisa absen mandiri (status kosong/alpha) dan wajib konfirmasi ke HRD.
                            </p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" bind:checked={settings.lock_after_late_cutoff} class="sr-only peer">
                            <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <!-- Check-out Time Rules Card -->
                <div class="bg-card border border-border rounded-2xl p-6 space-y-5">
                    <div class="border-b border-border pb-3">
                        <h3 class="text-base font-extrabold text-foreground flex items-center gap-2">
                            <Clock class="w-4 h-4 text-emerald-500" />
                            Aturan Jam Pulang & Absen Keluar
                        </h3>
                        <p class="text-xs text-muted-foreground mt-0.5">Ketentuan jam pulang dan kepatuhan radius lokasi.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-foreground mb-1.5">
                                Jam Pulang Kerja Standar
                            </label>
                            <input
                                type="time"
                                bind:value={settings.work_end_time}
                                class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Waktu berakhirnya jam kerja resmi.</p>
                        </div>

                        <div class="flex flex-col justify-end">
                            <div class="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                                <div>
                                    <p class="text-xs font-extrabold text-foreground">Wajib Minimal Jam Pulang</p>
                                    <p class="text-[10px] text-muted-foreground">Mencegah check-out sebelum jam pulang.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input type="checkbox" bind:checked={settings.min_checkout_at_work_end} class="sr-only peer">
                                    <div class="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Geofence Checkout Toggle -->
                    <div class="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between gap-4">
                        <div class="space-y-0.5">
                            <p class="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                                <ShieldCheck class="w-3.5 h-3.5 text-blue-500" />
                                Wajib Berada di Area Geofence Saat Pulang
                            </p>
                            <p class="text-[11px] text-muted-foreground">
                                Karyawan harus berada di dalam radius kantor saat tap keluar (meski pulang lembur).
                            </p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" bind:checked={settings.require_geofence_checkout} class="sr-only peer">
                            <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <!-- Save Action Button -->
                <div class="flex justify-end">
                    <button
                        onclick={handleSaveSettings}
                        disabled={isSavingSettings}
                        class="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                    >
                        <Save class="w-4 h-4" />
                        <span>{isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Kehadiran'}</span>
                    </button>
                </div>

            </div>

            <!-- Right 1 Col: Explanatory Card -->
            <div class="space-y-6">
                <div class="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h4 class="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <HelpCircle class="w-4 h-4 text-primary" />
                        Panduan Aturan Kehadiran
                    </h4>
                    <div class="space-y-3 text-xs text-muted-foreground leading-relaxed">
                        <div class="p-3 bg-muted/40 rounded-xl space-y-1">
                            <p class="font-bold text-foreground">1. Karyawan Terlambat</p>
                            <p>Karyawan yang tap masuk di antara <b>Jam Masuk ({settings.work_start_time})</b> s/d <b>Toleransi ({settings.late_tolerance_time})</b> tetap berstatus Ontime/Terlambat sesuai aturan.</p>
                        </div>
                        <div class="p-3 bg-muted/40 rounded-xl space-y-1">
                            <p class="font-bold text-foreground">2. Lewat Batas Cut-off ({settings.check_in_end})</p>
                            <p>Jika fitur kunci aktif, tombol absensi di mobile terkunci otomatis. Karyawan harus menghubungi HRD dan HRD dapat menginput/menyesuaikan kehadiran secara manual di halaman <a href="/admin/attendances" class="text-primary font-bold hover:underline">Kehadiran (Attendances)</a>.</p>
                        </div>
                        <div class="p-3 bg-muted/40 rounded-xl space-y-1">
                            <p class="font-bold text-foreground">3. Shift vs Reguler</p>
                            <p>Bila Sistem Shift diaktifkan, jam masuk dan pulang akan mengikuti master shift yang ditetapkan pada masing-masing karyawan.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    {/if}

    <!-- Tab 2: Master Data Shift -->
    {#if activeTab === 'shifts'}
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 class="text-lg font-extrabold text-foreground">Daftar Master Shift</h3>
                    <p class="text-xs text-muted-foreground">Kelola shift kerja operasional dengan jam masuk dan jam pulang yang berbeda.</p>
                </div>
                <button
                    onclick={openCreateShiftModal}
                    class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                    <Plus class="w-4 h-4" />
                    <span>Tambah Shift Baru</span>
                </button>
            </div>

            <!-- Shifts Grid -->
            {#if shifts.length === 0}
                <div class="p-12 text-center bg-card border border-border rounded-2xl space-y-3">
                    <Clock class="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <h4 class="text-base font-extrabold text-foreground">Belum Ada Master Shift</h4>
                    <p class="text-xs text-muted-foreground max-w-sm mx-auto">
                        Klik tombol di atas untuk membuat shift kerja pertama Anda (misal: Shift Pagi, Shift Siang, Shift Malam).
                    </p>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {#each shifts as shift}
                        <div class="bg-card border border-border rounded-2xl p-5 space-y-4 hover:border-primary/50 transition-colors">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm" style="background-color: {shift.color || '#3b82f6'}">
                                        {shift.code ? shift.code.substring(0, 3) : 'SHF'}
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-black text-foreground">{shift.name}</h4>
                                        <span class="text-[10px] font-mono font-bold text-muted-foreground">{shift.code || 'NO-CODE'}</span>
                                    </div>
                                </div>
                                <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase {shift.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}">
                                    {shift.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            <div class="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Jam Buka Masuk:</span>
                                    <span class="font-bold text-foreground">{shift.check_in_start || '06:00'} WIB</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Jam Masuk Resmi:</span>
                                    <span class="font-extrabold text-foreground">{shift.work_start_time || '07:00'} WIB</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Toleransi Telat:</span>
                                    <span class="font-bold text-amber-500">{shift.late_tolerance_time || '07:15'} WIB</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Batas Cut-off:</span>
                                    <span class="font-bold text-rose-500">{shift.check_in_end || '08:00'} WIB</span>
                                </div>
                                <div class="w-full h-px bg-border my-1"></div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Jam Pulang:</span>
                                    <span class="font-extrabold text-emerald-600 dark:text-emerald-400">{shift.work_end_time || '15:00'} WIB</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between pt-1 border-t border-border">
                                <span class="text-[11px] text-muted-foreground">
                                    {shift.assignments_count || 0} Penugasan Roster
                                </span>
                                <div class="flex items-center gap-1.5">
                                    <button
                                        onclick={() => openEditShiftModal(shift)}
                                        class="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                        title="Edit Shift"
                                    >
                                        <Edit class="w-4 h-4" />
                                    </button>
                                    <button
                                        onclick={() => handleDeleteShift(shift.id)}
                                        class="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                                        title="Hapus Shift"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}

    <!-- Tab 3: Jadwal & Roster Karyawan -->
    {#if activeTab === 'roster'}
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 class="text-lg font-extrabold text-foreground">Penjadwalan Roster Karyawan</h3>
                    <p class="text-xs text-muted-foreground">Tetapkan jadwal shift per karyawan per tanggal untuk penugasan operasional.</p>
                </div>
                <button
                    onclick={openRosterModal}
                    class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                    <Calendar class="w-4 h-4" />
                    <span>Tetapkan Shift Karyawan (Bulk)</span>
                </button>
            </div>

            <!-- Assignments Table -->
            <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div class="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                    <span class="text-xs font-extrabold text-foreground uppercase tracking-wider">
                        Bulan {monthNames[currentMonth - 1]} {currentYear} • {assignments.length} Jadwal Ditetapkan
                    </span>
                </div>

                {#if assignments.length === 0}
                    <div class="p-10 text-center text-xs text-muted-foreground space-y-2">
                        <Users class="w-8 h-8 mx-auto text-muted-foreground/40" />
                        <p>Belum ada jadwal shift yang ditetapkan untuk bulan ini.</p>
                        <p>Karyawan akan menggunakan jadwal default/reguler kantor.</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-muted/40 text-muted-foreground font-bold border-b border-border">
                                <tr>
                                    <th class="p-3.5">Tanggal</th>
                                    <th class="p-3.5">Karyawan</th>
                                    <th class="p-3.5">Shift Kerja</th>
                                    <th class="p-3.5">Jam Masuk - Pulang</th>
                                    <th class="p-3.5">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border">
                                {#each assignments as item}
                                    <tr class="hover:bg-muted/30 transition-colors">
                                        <td class="p-3.5 font-bold text-foreground whitespace-nowrap">
                                            {item.date}
                                        </td>
                                        <td class="p-3.5">
                                            <p class="font-extrabold text-foreground">{item.employee?.user?.name || '-'}</p>
                                            <p class="text-[10px] text-muted-foreground font-mono">{item.employee?.employee_id || ''} • {item.employee?.department || ''}</p>
                                        </td>
                                        <td class="p-3.5">
                                            <span class="px-2.5 py-1 rounded-lg text-white font-extrabold text-[10px]" style="background-color: {item.shift?.color || '#3b82f6'}">
                                                {item.shift?.name || 'Shift'}
                                            </span>
                                        </td>
                                        <td class="p-3.5 font-bold text-foreground">
                                            {item.shift?.work_start_time?.substring(0, 5) || '07:00'} - {item.shift?.work_end_time?.substring(0, 5) || '15:00'} WIB
                                        </td>
                                        <td class="p-3.5 text-muted-foreground">
                                            {item.notes || '-'}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<!-- Modal: Tambah/Edit Master Shift -->
{#if isShiftModalOpen}
    <div class="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div class="flex items-center justify-between pb-3 border-b border-border">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Clock class="w-5 h-5" />
                    </div>
                    <div>
                        <h3 class="text-sm font-extrabold text-foreground">{isEditingShift ? 'Edit Master Shift' : 'Tambah Shift Baru'}</h3>
                        <p class="text-[10px] text-muted-foreground">Aturan jam kerja operasional shift</p>
                    </div>
                </div>
                <button onclick={() => isShiftModalOpen = false} class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X class="w-4 h-4" />
                </button>
            </div>

            <div class="space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-foreground mb-1">Nama Shift</label>
                    <input type="text" bind:value={shiftForm.name} placeholder="Misal: Shift Pagi, Shift Malam" class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-foreground mb-1">Kode Shift</label>
                        <input type="text" bind:value={shiftForm.code} placeholder="SHF-01" class="w-full h-11 px-3 bg-background border border-border rounded-xl font-mono font-medium outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-bold text-foreground mb-1">Warna Label</label>
                        <input type="color" bind:value={shiftForm.color} class="w-full h-11 px-2 bg-background border border-border rounded-xl cursor-pointer" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-foreground mb-1">Jam Buka Masuk</label>
                        <input type="time" bind:value={shiftForm.check_in_start} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-bold text-foreground mb-1">Jam Masuk Target</label>
                        <input type="time" bind:value={shiftForm.work_start_time} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-foreground mb-1">Toleransi Telat</label>
                        <input type="time" bind:value={shiftForm.late_tolerance_time} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-bold text-foreground mb-1">Batas Cut-off</label>
                        <input type="time" bind:value={shiftForm.check_in_end} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-foreground mb-1">Jam Pulang Kerja</label>
                    <input type="time" bind:value={shiftForm.work_end_time} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button onclick={() => isShiftModalOpen = false} class="px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted">
                    Batal
                </button>
                <button onclick={handleSaveShift} disabled={isSubmittingShift} class="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black hover:bg-primary/90">
                    {isSubmittingShift ? 'Menyimpan...' : 'Simpan Shift'}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Modal: Tetapkan Shift Karyawan (Roster) -->
{#if isRosterModalOpen}
    <div class="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div class="flex items-center justify-between pb-3 border-b border-border">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Users class="w-5 h-5" />
                    </div>
                    <div>
                        <h3 class="text-sm font-extrabold text-foreground">Tetapkan Jadwal Shift</h3>
                        <p class="text-[10px] text-muted-foreground">Penugasan shift karyawan operasional</p>
                    </div>
                </div>
                <button onclick={() => isRosterModalOpen = false} class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X class="w-4 h-4" />
                </button>
            </div>

            <div class="space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-foreground mb-1">Pilih Shift</label>
                    <select bind:value={rosterForm.shift_id} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary">
                        {#each shifts as s}
                            <option value={s.id}>{s.name} ({s.work_start_time?.substring(0, 5)} - {s.work_end_time?.substring(0, 5)} WIB)</option>
                        {/each}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-foreground mb-1">Dari Tanggal</label>
                        <input type="date" bind:value={rosterForm.start_date} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-bold text-foreground mb-1">Sampai Tanggal</label>
                        <input type="date" bind:value={rosterForm.end_date} class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-foreground mb-1">Karyawan ({rosterForm.employee_ids.length} Dipilih)</label>
                    <div class="max-h-36 overflow-y-auto border border-border rounded-xl p-2 space-y-1.5 bg-muted/20">
                        {#each employees as emp}
                            <label class="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg cursor-pointer">
                                <input type="checkbox" value={emp.id} bind:group={rosterForm.employee_ids} class="rounded border-border text-primary focus:ring-0">
                                <div>
                                    <p class="font-extrabold text-foreground">{emp.user?.name || '-'}</p>
                                    <p class="text-[9px] text-muted-foreground">{emp.employee_id} • {emp.department || '-'}</p>
                                </div>
                            </label>
                        {/each}
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-foreground mb-1">Catatan (Opsional)</label>
                    <input type="text" bind:value={rosterForm.notes} placeholder="Misal: Penugasan proyek gudang timur" class="w-full h-11 px-3 bg-background border border-border rounded-xl font-medium outline-none focus:border-primary" />
                </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button onclick={() => isRosterModalOpen = false} class="px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted">
                    Batal
                </button>
                <button onclick={handleSaveRoster} disabled={isSubmittingRoster} class="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black hover:bg-primary/90">
                    {isSubmittingRoster ? 'Menetapkan...' : 'Tetapkan Roster'}
                </button>
            </div>
        </div>
    </div>
{/if}
`;

fs.writeFileSync(shiftsPagePath, pageContent, 'utf8');
console.log('Created Svelte shifts page successfully at:', shiftsPagePath);
