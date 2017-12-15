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
        AlertCircle,
        Search,
        CheckSquare,
        Square,
        RefreshCw,
        ArrowRightLeft,
        Filter
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

    // --- Tab 3: Roster Assign & Switch Shift Modal ---
    let isRosterModalOpen = $state(false);
    let isSubmittingRoster = $state(false);
    let employeeSearchQuery = $state('');
    let selectedDepartment = $state('all');
    let rosterForm = $state({
        employee_ids: [] as number[],
        shift_id: shifts.length > 0 ? shifts[0].id : '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Unique departments
    let departments = $derived(
        Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean)))
    );

    // Filtered employees in modal
    let filteredEmployees = $derived(
        employees.filter((emp: any) => {
            const matchesSearch = 
                !employeeSearchQuery ||
                (emp.user?.name || '').toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                (emp.employee_id || '').toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                (emp.department || '').toLowerCase().includes(employeeSearchQuery.toLowerCase());
            
            const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
            return matchesSearch && matchesDept;
        })
    );

    function openRosterModal() {
        employeeSearchQuery = '';
        selectedDepartment = 'all';
        rosterForm = {
            employee_ids: [],
            shift_id: shifts.length > 0 ? shifts[0].id : '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            notes: ''
        };
        isRosterModalOpen = true;
    }

    function selectAllFiltered() {
        const visibleIds = filteredEmployees.map((e: any) => e.id);
        const newSet = new Set([...rosterForm.employee_ids, ...visibleIds]);
        rosterForm.employee_ids = Array.from(newSet);
    }

    function deselectAllFiltered() {
        const visibleIds = new Set(filteredEmployees.map((e: any) => e.id));
        rosterForm.employee_ids = rosterForm.employee_ids.filter(id => !visibleIds.has(id));
    }

    function toggleEmployeeSelection(empId: number) {
        if (rosterForm.employee_ids.includes(empId)) {
            rosterForm.employee_ids = rosterForm.employee_ids.filter(id => id !== empId);
        } else {
            rosterForm.employee_ids = [...rosterForm.employee_ids, empId];
        }
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

    // Delete single assignment
    async function handleDeleteAssignment(id: number) {
        if (!confirm('Hapus jadwal penugasan shift ini?')) return;

        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/shift-assignments/\${id}\`, {
                method: 'DELETE',
                headers: {
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                }
            });

            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.message || 'Gagal menghapus jadwal');

            showToast('Jadwal shift berhasil dihapus', 'success');
            await invalidateAll();
        } catch (err: any) {
            showToast(err.message || 'Gagal menghapus jadwal', 'error');
        }
    }

    // Quick Switch Shift Modal for a single row
    let isQuickSwitchOpen = $state(false);
    let switchItem = $state<any>(null);
    let switchShiftId = $state<number | string>('');
    let isSubmittingSwitch = $state(false);

    function openQuickSwitchModal(item: any) {
        switchItem = item;
        switchShiftId = item.shift_id || (shifts.length > 0 ? shifts[0].id : '');
        isQuickSwitchOpen = true;
    }

    async function handleSaveQuickSwitch() {
        if (!switchItem || !switchShiftId) return;

        isSubmittingSwitch = true;
        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/shift-assignments\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    employee_ids: [switchItem.employee_id],
                    shift_id: switchShiftId,
                    start_date: switchItem.date,
                    end_date: switchItem.date,
                    notes: switchItem.notes || 'Tukar/Ubah shift kerja'
                })
            });

            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.message || 'Gagal mengubah shift');

            showToast('Shift berhasil diubah untuk tanggal terpilih!', 'success');
            isQuickSwitchOpen = false;
            await invalidateAll();
        } catch (err: any) {
            showToast(err.message || 'Gagal mengubah shift', 'error');
        } finally {
            isSubmittingSwitch = false;
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
        <div transition:fade class="fixed top-6 right-6 z-[300] max-w-md p-4 rounded-xl shadow-lg flex items-center gap-3 border {toastType === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'}">
            {#if toastType === 'success'}
                <CheckCircle2 class="w-5 h-5 flex-shrink-0" />
            {:else}
                <AlertCircle class="w-5 h-5 flex-shrink-0" />
            {/if}
            <p class="text-sm font-medium">{toastMessage}</p>
        </div>
    {/if}

    <!-- Header Section (Consistent with HRIS Assets & Compliance) -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="text-xs text-muted-foreground mb-1">HRIS &bull; Kehadiran & Operasional</div>
            <h1 class="text-2xl font-bold tracking-tight text-foreground">Shift & Pengaturan Jam Kerja</h1>
            <p class="text-sm text-muted-foreground">Konfigurasi jadwal kerja fleksibel, aturan keterlambatan, batas toleransi absensi, dan master shift kerja karyawan.</p>
        </div>
        <div class="flex items-center gap-2">
            {#if activeTab === 'shifts'}
                <button 
                    onclick={openCreateShiftModal}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                >
                    <Plus class="w-4 h-4" /> Tambah Shift Baru
                </button>
            {:else if activeTab === 'roster'}
                <button 
                    onclick={openRosterModal}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                >
                    <Calendar class="w-4 h-4" /> Tetapkan Jadwal Shift
                </button>
            {/if}
        </div>
    </div>

    <!-- Summary Cards Section -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-card border border-border rounded-xl p-5 space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase text-muted-foreground">Status Sistem Shift</span>
                <div class="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <Clock class="w-4 h-4" />
                </div>
            </div>
            <div class="text-lg font-bold text-foreground">
                {settings.is_shift_enabled ? 'Sistem Shift Aktif' : 'Jadwal Reguler (Non-Shift)'}
            </div>
            <p class="text-[11px] text-muted-foreground">{settings.is_shift_enabled ? 'Multi-shift roster aktif' : '1 jadwal jam kerja standar'}</p>
        </div>

        <div class="bg-card border border-border rounded-xl p-5 space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase text-muted-foreground">Total Master Shift</span>
                <div class="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <CalendarRange class="w-4 h-4" />
                </div>
            </div>
            <div class="text-2xl font-bold text-foreground">
                {shifts.length} <span class="text-xs font-normal text-muted-foreground">Shift</span>
            </div>
            <p class="text-[11px] text-muted-foreground">Shift aktif operasional</p>
        </div>

        <div class="bg-card border border-border rounded-xl p-5 space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase text-muted-foreground">Batas Cut-off Masuk</span>
                <div class="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <Lock class="w-4 h-4" />
                </div>
            </div>
            <div class="text-2xl font-bold text-foreground">
                {settings.check_in_end || '08:30'} <span class="text-xs font-normal text-muted-foreground">WIB</span>
            </div>
            <p class="text-[11px] {settings.lock_after_late_cutoff ? 'text-rose-500 font-medium' : 'text-muted-foreground'}">
                {settings.lock_after_late_cutoff ? 'Terkunci otomatis lewat batas' : 'Bebas absen lewat batas'}
            </p>
        </div>

        <div class="bg-card border border-border rounded-xl p-5 space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase text-muted-foreground">Jam Pulang Standar</span>
                <div class="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                    <Building2 class="w-4 h-4" />
                </div>
            </div>
            <div class="text-2xl font-bold text-foreground">
                {settings.work_end_time || '17:00'} <span class="text-xs font-normal text-muted-foreground">WIB</span>
            </div>
            <p class="text-[11px] text-muted-foreground">Minimal jam checkout</p>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar">
        <button
            onclick={() => activeTab = 'rules'}
            class="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors {activeTab === 'rules' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
        >
            <Sliders class="w-4 h-4" />
            <span>Aturan Kehadiran & Jam Kerja</span>
        </button>

        <button
            onclick={() => activeTab = 'shifts'}
            class="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors {activeTab === 'shifts' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
        >
            <CalendarRange class="w-4 h-4" />
            <span>Master Data Shift ({shifts.length})</span>
        </button>

        <button
            onclick={() => activeTab = 'roster'}
            class="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors {activeTab === 'roster' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
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
                <div class="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div class="flex items-start justify-between gap-4">
                        <div class="space-y-1">
                            <h3 class="text-sm font-semibold text-foreground">Gunakan Sistem Shift (Multi-Shift / Roster)</h3>
                            <p class="text-xs text-muted-foreground leading-relaxed">
                                Aktifkan jika perusahaan Anda menerapkan banyak jam shift kerja (misal Shift Pagi, Siang, Malam). Jika dinonaktifkan, seluruh karyawan akan mengikuti 1 jadwal kerja standar di bawah.
                            </p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" bind:checked={settings.is_shift_enabled} class="sr-only peer">
                            <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <!-- Check-in Time Rules Card -->
                <div class="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div class="border-b border-border pb-3">
                        <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Clock class="w-4 h-4 text-primary" />
                            Aturan Jam Masuk & Batas Keterlambatan {settings.is_shift_enabled ? '(Fallback/Standar)' : ''}
                        </h3>
                        <p class="text-xs text-muted-foreground mt-0.5">Konfigurasi batas waktu absensi masuk bagi karyawan.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-foreground mb-1">
                                Jam Buka Absen Masuk
                            </label>
                            <input
                                type="time"
                                bind:value={settings.check_in_start}
                                class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Waktu paling awal tombol absen di mobile aktif.</p>
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-foreground mb-1">
                                Jam Masuk Resmi (Target)
                            </label>
                            <input
                                type="time"
                                bind:value={settings.work_start_time}
                                class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Jam masuk kerja standar operasional.</p>
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-foreground mb-1">
                                Toleransi Terlambat
                            </label>
                            <input
                                type="time"
                                bind:value={settings.late_tolerance_time}
                                class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Absen setelah jam ini berstatus "Terlambat".</p>
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-foreground mb-1">
                                Batas Akhir Absen Masuk (Cut-off)
                            </label>
                            <input
                                type="time"
                                bind:value={settings.check_in_end}
                                class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Batas waktu maksimal tombol absen masuk.</p>
                        </div>
                    </div>

                    <!-- Cutoff Lock Toggle -->
                    <div class="p-3.5 bg-muted/40 rounded-lg border border-border flex items-center justify-between gap-4">
                        <div class="space-y-0.5">
                            <p class="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Lock class="w-3.5 h-3.5 text-rose-500" />
                                Kunci Tombol Absen Lewat Jam Cut-off
                            </p>
                            <p class="text-[11px] text-muted-foreground">
                                Jika aktif, karyawan yang lewat dari jam {settings.check_in_end || '08:30'} tidak bisa absen mandiri dan wajib konfirmasi ke HRD.
                            </p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" bind:checked={settings.lock_after_late_cutoff} class="sr-only peer">
                            <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <!-- Check-out Time Rules Card -->
                <div class="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div class="border-b border-border pb-3">
                        <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Clock class="w-4 h-4 text-emerald-500" />
                            Aturan Jam Pulang & Absen Keluar
                        </h3>
                        <p class="text-xs text-muted-foreground mt-0.5">Ketentuan jam pulang dan kepatuhan radius lokasi.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-foreground mb-1">
                                Jam Pulang Kerja Standar
                            </label>
                            <input
                                type="time"
                                bind:value={settings.work_end_time}
                                class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:border-primary outline-none"
                            />
                            <p class="text-[11px] text-muted-foreground mt-1">Waktu berakhirnya jam kerja resmi.</p>
                        </div>

                        <div class="flex flex-col justify-end">
                            <div class="p-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between">
                                <div>
                                    <p class="text-xs font-semibold text-foreground">Wajib Minimal Jam Pulang</p>
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
                    <div class="p-3.5 bg-muted/40 rounded-lg border border-border flex items-center justify-between gap-4">
                        <div class="space-y-0.5">
                            <p class="text-xs font-semibold text-foreground flex items-center gap-1.5">
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
                        class="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
                    >
                        <Save class="w-4 h-4" />
                        <span>{isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Kehadiran'}</span>
                    </button>
                </div>

            </div>

            <!-- Right 1 Col: Explanatory Guide Card -->
            <div class="space-y-6">
                <div class="bg-card border border-border rounded-xl p-5 space-y-3">
                    <h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
                        <HelpCircle class="w-4 h-4 text-primary" />
                        Panduan Aturan Kehadiran
                    </h4>
                    <div class="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                        <div class="p-3 bg-muted/40 rounded-lg space-y-1">
                            <p class="font-semibold text-foreground">1. Karyawan Terlambat</p>
                            <p>Karyawan yang tap masuk di antara <b>Jam Masuk ({settings.work_start_time})</b> s/d <b>Toleransi ({settings.late_tolerance_time})</b> tercatat Ontime/Terlambat sesuai ketentuan.</p>
                        </div>
                        <div class="p-3 bg-muted/40 rounded-lg space-y-1">
                            <p class="font-semibold text-foreground">2. Lewat Batas Cut-off ({settings.check_in_end})</p>
                            <p>Jika fitur kunci aktif, tombol absensi di mobile terkunci otomatis. Karyawan harus menghubungi HRD dan HRD dapat menginput/menyesuaikan kehadiran secara manual di halaman <a href="/admin/attendances" class="text-primary font-semibold hover:underline">Kehadiran</a>.</p>
                        </div>
                        <div class="p-3 bg-muted/40 rounded-lg space-y-1">
                            <p class="font-semibold text-foreground">3. Sistem Shift vs Reguler</p>
                            <p>Bila Sistem Shift diaktifkan, jadwal karyawan mengikuti jadwal pada master shift dan roster bulanan.</p>
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
                    <h3 class="text-base font-semibold text-foreground">Daftar Master Shift Kerja</h3>
                    <p class="text-xs text-muted-foreground">Kelola jam kerja operasional dengan berbagai pilihan shift.</p>
                </div>
                <button
                    onclick={openCreateShiftModal}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                >
                    <Plus class="w-4 h-4" />
                    <span>Tambah Shift Baru</span>
                </button>
            </div>

            <!-- Shifts Grid -->
            {#if shifts.length === 0}
                <div class="p-12 text-center bg-card border border-border rounded-xl space-y-3">
                    <Clock class="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <h4 class="text-sm font-semibold text-foreground">Belum Ada Master Shift</h4>
                    <p class="text-xs text-muted-foreground max-w-sm mx-auto">
                        Klik tombol di atas untuk membuat shift kerja pertama Anda (misal: Shift Pagi, Shift Siang, Shift Malam).
                    </p>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {#each shifts as shift}
                        <div class="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/50 transition-colors">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm" style="background-color: {shift.color || '#3b82f6'}">
                                        {shift.code ? shift.code.substring(0, 3) : 'SHF'}
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-semibold text-foreground">{shift.name}</h4>
                                        <span class="text-[10px] font-mono text-muted-foreground">{shift.code || 'NO-CODE'}</span>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase {shift.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}">
                                    {shift.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            <div class="p-3 bg-muted/40 rounded-lg space-y-1.5 text-xs">
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Jam Buka Masuk:</span>
                                    <span class="font-medium text-foreground">{shift.check_in_start || '06:00'} WIB</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Jam Masuk Target:</span>
                                    <span class="font-semibold text-foreground">{shift.work_start_time || '07:00'} WIB</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Toleransi Telat:</span>
                                    <span class="font-medium text-amber-500">{shift.late_tolerance_time || '07:15'} WIB</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Batas Cut-off:</span>
                                    <span class="font-medium text-rose-500">{shift.check_in_end || '08:00'} WIB</span>
                                </div>
                                <div class="w-full h-px bg-border my-1"></div>
                                <div class="flex items-center justify-between">
                                    <span class="text-muted-foreground">Jam Pulang:</span>
                                    <span class="font-semibold text-emerald-600 dark:text-emerald-400">{shift.work_end_time || '15:00'} WIB</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between pt-1 border-t border-border">
                                <span class="text-[11px] text-muted-foreground">
                                    {shift.assignments_count || 0} Jadwal Terdaftar
                                </span>
                                <div class="flex items-center gap-1">
                                    <button
                                        onclick={() => openEditShiftModal(shift)}
                                        class="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                        title="Edit Shift"
                                    >
                                        <Edit class="w-4 h-4" />
                                    </button>
                                    <button
                                        onclick={() => handleDeleteShift(shift.id)}
                                        class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md text-muted-foreground hover:text-rose-500 transition-colors"
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
        <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 class="text-base font-semibold text-foreground">Penjadwalan Roster Karyawan</h3>
                    <p class="text-xs text-muted-foreground">Tetapkan jadwal shift dan lakukan pergantian/tukar shift karyawan per tanggal.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        onclick={openRosterModal}
                        class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        <Calendar class="w-4 h-4" />
                        <span>Tetapkan Jadwal Shift</span>
                    </button>
                </div>
            </div>

            <!-- Assignments Table -->
            <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div class="p-3.5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span class="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Bulan {monthNames[currentMonth - 1]} {currentYear} &bull; {assignments.length} Jadwal Shift Ditetapkan
                    </span>
                </div>

                {#if assignments.length === 0}
                    <div class="p-10 text-center text-xs text-muted-foreground space-y-2">
                        <Users class="w-8 h-8 mx-auto text-muted-foreground/40" />
                        <p>Belum ada penugasan shift khusus yang ditetapkan untuk bulan ini.</p>
                        <p>Seluruh karyawan akan menggunakan jadwal standar/reguler.</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th class="p-3.5">Tanggal</th>
                                    <th class="p-3.5">Karyawan</th>
                                    <th class="p-3.5">Shift Kerja</th>
                                    <th class="p-3.5">Jam Masuk - Pulang</th>
                                    <th class="p-3.5">Catatan</th>
                                    <th class="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border">
                                {#each assignments as item}
                                    <tr class="hover:bg-muted/30 transition-colors">
                                        <td class="p-3.5 font-semibold text-foreground whitespace-nowrap">
                                            {item.date}
                                        </td>
                                        <td class="p-3.5">
                                            <p class="font-semibold text-foreground">{item.employee?.user?.name || '-'}</p>
                                            <p class="text-[10px] text-muted-foreground font-mono">{item.employee?.employee_id || ''} &bull; {item.employee?.department || ''}</p>
                                        </td>
                                        <td class="p-3.5">
                                            <span class="px-2.5 py-1 rounded-md text-white font-semibold text-[10px]" style="background-color: {item.shift?.color || '#3b82f6'}">
                                                {item.shift?.name || 'Shift'}
                                            </span>
                                        </td>
                                        <td class="p-3.5 font-medium text-foreground">
                                            {item.shift?.work_start_time?.substring(0, 5) || '07:00'} - {item.shift?.work_end_time?.substring(0, 5) || '15:00'} WIB
                                        </td>
                                        <td class="p-3.5 text-muted-foreground">
                                            {item.notes || '-'}
                                        </td>
                                        <td class="p-3.5 text-right">
                                            <div class="inline-flex items-center gap-1.5">
                                                <button
                                                    onclick={() => openQuickSwitchModal(item)}
                                                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground text-[11px] font-medium transition-colors"
                                                    title="Tukar / Ganti Shift"
                                                >
                                                    <ArrowRightLeft class="w-3 h-3 text-blue-500" />
                                                    <span>Ganti Shift</span>
                                                </button>
                                                <button
                                                    onclick={() => handleDeleteAssignment(item.id)}
                                                    class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md text-muted-foreground hover:text-rose-500 transition-colors"
                                                    title="Hapus Jadwal"
                                                >
                                                    <Trash2 class="w-3.5 h-3.5" />
                                                </button>
                                            </div>
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
    <div class="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl relative">
            <div class="flex items-center justify-between pb-3 border-b border-border">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Clock class="w-4 h-4" />
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-foreground">{isEditingShift ? 'Edit Master Shift' : 'Tambah Shift Baru'}</h3>
                        <p class="text-[11px] text-muted-foreground">Aturan jam operasional shift</p>
                    </div>
                </div>
                <button onclick={() => isShiftModalOpen = false} class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X class="w-4 h-4" />
                </button>
            </div>

            <div class="space-y-3.5 text-xs">
                <div>
                    <label class="block font-medium text-foreground mb-1">Nama Shift</label>
                    <input type="text" bind:value={shiftForm.name} placeholder="Misal: Shift Pagi, Shift Malam" class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm font-normal outline-none focus:border-primary" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-foreground mb-1">Kode Shift</label>
                        <input type="text" bind:value={shiftForm.code} placeholder="SHF-01" class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm font-mono font-normal outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-medium text-foreground mb-1">Warna Label</label>
                        <input type="color" bind:value={shiftForm.color} class="w-full h-9 px-2 bg-background border border-border rounded-lg cursor-pointer" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-foreground mb-1">Jam Buka Masuk</label>
                        <input type="time" bind:value={shiftForm.check_in_start} class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-medium text-foreground mb-1">Jam Masuk Target</label>
                        <input type="time" bind:value={shiftForm.work_start_time} class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-foreground mb-1">Toleransi Telat</label>
                        <input type="time" bind:value={shiftForm.late_tolerance_time} class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-medium text-foreground mb-1">Batas Cut-off</label>
                        <input type="time" bind:value={shiftForm.check_in_end} class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                </div>

                <div>
                    <label class="block font-medium text-foreground mb-1">Jam Pulang Kerja</label>
                    <input type="time" bind:value={shiftForm.work_end_time} class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button onclick={() => isShiftModalOpen = false} class="px-3.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted">
                    Batal
                </button>
                <button onclick={handleSaveShift} disabled={isSubmittingShift} class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
                    {isSubmittingShift ? 'Menyimpan...' : 'Simpan Shift'}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Modal: Tetapkan Jadwal Shift (Bulk Assign with Select All & Search Filter) -->
{#if isRosterModalOpen}
    <div class="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl relative max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-border flex-shrink-0">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Users class="w-4 h-4" />
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-foreground">Tetapkan Jadwal Shift</h3>
                        <p class="text-[11px] text-muted-foreground">Penugasan shift karyawan operasional</p>
                    </div>
                </div>
                <button onclick={() => isRosterModalOpen = false} class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X class="w-4 h-4" />
                </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="space-y-4 text-xs overflow-y-auto pr-1">
                <div>
                    <label class="block font-medium text-foreground mb-1">Pilih Shift Kerja</label>
                    <select bind:value={rosterForm.shift_id} class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-normal outline-none focus:border-primary">
                        {#each shifts as s}
                            <option value={s.id}>{s.name} ({s.work_start_time?.substring(0, 5)} - {s.work_end_time?.substring(0, 5)} WIB)</option>
                        {/each}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-foreground mb-1">Dari Tanggal</label>
                        <input type="date" bind:value={rosterForm.start_date} class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label class="block font-medium text-foreground mb-1">Sampai Tanggal</label>
                        <input type="date" bind:value={rosterForm.end_date} class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                    </div>
                </div>

                <!-- Employee Selection Header with Select All / Deselect All -->
                <div class="space-y-2 pt-1 border-t border-border">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <label class="font-semibold text-foreground">Daftar Karyawan</label>
                            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                                {rosterForm.employee_ids.length} dari {employees.length} Dipilih
                            </span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <button
                                type="button"
                                onclick={selectAllFiltered}
                                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-medium text-foreground transition-colors"
                            >
                                <CheckSquare class="w-3 h-3 text-primary" />
                                <span>Pilih Semua</span>
                            </button>
                            <button
                                type="button"
                                onclick={deselectAllFiltered}
                                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Square class="w-3 h-3" />
                                <span>Batal Pilih</span>
                            </button>
                        </div>
                    </div>

                    <!-- Search & Dept Filter -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div class="relative">
                            <Search class="w-3.5 h-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                            <input
                                type="text"
                                bind:value={employeeSearchQuery}
                                placeholder="Cari nama / NIK..."
                                class="w-full h-9 pl-8 pr-3 bg-background border border-border rounded-lg text-xs outline-none focus:border-primary"
                            />
                        </div>
                        <select
                            bind:value={selectedDepartment}
                            class="w-full h-9 px-2.5 bg-background border border-border rounded-lg text-xs outline-none focus:border-primary"
                        >
                            <option value="all">Semua Departemen</option>
                            {#each departments as d}
                                <option value={d}>{d}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Employee List Box -->
                    <div class="max-h-48 overflow-y-auto border border-border rounded-lg p-2 space-y-1 bg-muted/10 divide-y divide-border/40">
                        {#if filteredEmployees.length === 0}
                            <p class="text-center py-4 text-muted-foreground text-xs">Tidak ada karyawan yang sesuai filter.</p>
                        {:else}
                            {#each filteredEmployees as emp}
                                <label class="flex items-center gap-2.5 p-1.5 hover:bg-muted/60 rounded cursor-pointer transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={rosterForm.employee_ids.includes(emp.id)}
                                        onchange={() => toggleEmployeeSelection(emp.id)}
                                        class="rounded border-border text-primary focus:ring-0"
                                    >
                                    <div class="flex-1 min-w-0">
                                        <p class="font-medium text-foreground truncate">{emp.user?.name || '-'}</p>
                                        <p class="text-[10px] text-muted-foreground truncate">{emp.employee_id} &bull; {emp.department || '-'}</p>
                                    </div>
                                </label>
                            {/each}
                        {/if}
                    </div>
                </div>

                <div>
                    <label class="block font-medium text-foreground mb-1">Catatan Jadwal (Opsional)</label>
                    <input type="text" bind:value={rosterForm.notes} placeholder="Misal: Penugasan driver rute timur" class="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-border flex-shrink-0">
                <button onclick={() => isRosterModalOpen = false} class="px-3.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted">
                    Batal
                </button>
                <button onclick={handleSaveRoster} disabled={isSubmittingRoster} class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
                    {isSubmittingRoster ? 'Menetapkan...' : 'Tetapkan Jadwal Shift'}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Modal: Tukar / Ganti Shift Individu (Quick Switch) -->
{#if isQuickSwitchOpen && switchItem}
    <div class="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl relative">
            <div class="flex items-center justify-between pb-3 border-b border-border">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <ArrowRightLeft class="w-4 h-4" />
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-foreground">Ganti / Tukar Shift</h3>
                        <p class="text-[11px] text-muted-foreground">{switchItem.employee?.user?.name} &bull; {switchItem.date}</p>
                    </div>
                </div>
                <button onclick={() => isQuickSwitchOpen = false} class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X class="w-4 h-4" />
                </button>
            </div>

            <div class="space-y-3 text-xs">
                <div>
                    <label class="block font-medium text-foreground mb-1">Pilih Shift Baru</label>
                    <select bind:value={switchShiftId} class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-normal outline-none focus:border-primary">
                        {#each shifts as s}
                            <option value={s.id}>{s.name} ({s.work_start_time?.substring(0, 5)} - {s.work_end_time?.substring(0, 5)} WIB)</option>
                        {/each}
                    </select>
                </div>

                <div class="p-3 bg-muted/40 rounded-lg text-muted-foreground space-y-1">
                    <p>Shift Saat Ini: <span class="font-semibold text-foreground">{switchItem.shift?.name}</span></p>
                    <p>Tanggal Penugasan: <span class="font-semibold text-foreground">{switchItem.date}</span></p>
                </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button onclick={() => isQuickSwitchOpen = false} class="px-3.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted">
                    Batal
                </button>
                <button onclick={handleSaveQuickSwitch} disabled={isSubmittingSwitch} class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
                    {isSubmittingSwitch ? 'Mengubah...' : 'Ubah Shift'}
                </button>
            </div>
        </div>
    </div>
{/if}
`;

fs.writeFileSync(shiftsPagePath, pageContent, 'utf8');
console.log('Updated +page.svelte with consistent typography, select-all, and quick-switch modal!');
