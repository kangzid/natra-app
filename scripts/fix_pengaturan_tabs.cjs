const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const cutiPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.svelte');

const newSvelteContent = `<script lang="ts">
    import { PUBLIC_API_URL } from '$env/static/public';
    import { 
        Plus, 
        Trash2, 
        Pencil, 
        Check, 
        X, 
        Settings2, 
        Search,
        CalendarRange,
        HeartPulse,
        CalendarX2,
        Briefcase,
        CheckCircle2,
        Layers
    } from 'lucide-svelte';
    import PengajuanNav from '../PengajuanNav.svelte';
    import { page } from '$app/stores';

    let { data } = $props();

    // Default policy objects to prevent any undefined property access
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

    let activeTab = $state<'leave' | 'sick' | 'absence' | 'duty'>((data.initialTab as any) || 'leave');

    // Data states with guaranteed safe fallbacks
    let leaveTypes = $state(data.leaveTypes || []);
    let leaveBalances = $state(data.leaveBalances || []);
    let sickBalances = $state(data.sickBalances || []);
    let absenceBalances = $state(data.absenceBalances || []);
    
    let policies = $state({
        sick: { ...defaultPolicies.sick, ...(data.policies?.sick || {}) },
        absence: { ...defaultPolicies.absence, ...(data.policies?.absence || {}) },
        duty: { ...defaultPolicies.duty, ...(data.policies?.duty || {}) }
    });

    // Sync tab from URL search parameters on mount/navigation
    $effect(() => {
        const tabParam = $page.url.searchParams.get('tab');
        if (tabParam && ['leave', 'sick', 'absence', 'duty'].includes(tabParam)) {
            activeTab = tabParam as any;
        }
    });

    function setTab(tab: 'leave' | 'sick' | 'absence' | 'duty') {
        activeTab = tab;
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    }

    // Search filter for balance tables
    let search = $state('');

    // Modal state for Leave Type (Master Cuti)
    let isTypeModalOpen = $state(false);
    let editingType = $state<any>(null);
    let typeCode = $state('');
    let typeName = $state('');
    let typeDays = $state(12);
    let typePaid = $state(true);
    let typeAttach = $state(false);
    let typeDesc = $state('');

    // Modal state for Balance Editing
    let isEditBalanceModalOpen = $state(false);
    let activeBalance = $state<any>(null);
    let editQuota = $state(12);
    let editUsed = $state(0);
    let balanceCategory = $state<'leave' | 'sick' | 'absence'>('leave');

    let isSubmitting = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');

    function showToast(msg: string, type: 'success' | 'error' = 'success') {
        toastMessage = msg;
        toastType = type;
        setTimeout(() => { toastMessage = ''; }, 3500);
    }

    // Filtered balances
    let filteredLeaveBalances = $derived(
        leaveBalances.filter((b: any) => {
            const name = b.employee?.user?.name || '';
            const code = b.employee?.employee_id || '';
            const typeName = b.leave_type?.name || '';
            return name.toLowerCase().includes(search.toLowerCase()) || 
                   code.toLowerCase().includes(search.toLowerCase()) ||
                   typeName.toLowerCase().includes(search.toLowerCase());
        })
    );

    let filteredSickBalances = $derived(
        sickBalances.filter((b: any) => {
            const name = b.employee?.user?.name || '';
            const code = b.employee?.employee_id || '';
            return name.toLowerCase().includes(search.toLowerCase()) || 
                   code.toLowerCase().includes(search.toLowerCase());
        })
    );

    let filteredAbsenceBalances = $derived(
        absenceBalances.filter((b: any) => {
            const name = b.employee?.user?.name || '';
            const code = b.employee?.employee_id || '';
            return name.toLowerCase().includes(search.toLowerCase()) || 
                   code.toLowerCase().includes(search.toLowerCase());
        })
    );

    // ==========================================
    // LEAVE TYPE ACTIONS (MASTER CUTI)
    // ==========================================

    function openCreateType() {
        editingType = null;
        typeCode = 'CT' + String(leaveTypes.length + 1).padStart(2, '0');
        typeName = '';
        typeDays = 12;
        typePaid = true;
        typeAttach = false;
        typeDesc = '';
        isTypeModalOpen = true;
    }

    function openEditType(type: any) {
        editingType = type;
        typeCode = type.code;
        typeName = type.name;
        typeDays = type.default_days;
        typePaid = Boolean(type.is_paid);
        typeAttach = Boolean(type.requires_attachment);
        typeDesc = type.description || '';
        isTypeModalOpen = true;
    }

    async function handleSaveType() {
        if (!typeCode || !typeName || typeDays <= 0) {
            showToast('Lengkapi kode, nama, dan jumlah hari kuota!', 'error');
            return;
        }

        isSubmitting = true;
        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/leave-types\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    code: typeCode,
                    name: typeName,
                    default_days: typeDays,
                    is_paid: typePaid,
                    requires_attachment: typeAttach,
                    description: typeDesc
                })
            });

            if (res.ok) {
                const saved = await res.json();
                if (editingType) {
                    leaveTypes = leaveTypes.map((t: any) => t.id === saved.id ? saved : t);
                } else {
                    leaveTypes = [...leaveTypes, saved];
                }
                isTypeModalOpen = false;
                showToast('Jenis cuti berhasil disimpan!', 'success');
            } else {
                const err = await res.json();
                showToast(err.message || 'Gagal menyimpan jenis cuti', 'error');
            }
        } catch (e: any) {
            showToast(e.message || 'Terjadi kesalahan sistem', 'error');
        } finally {
            isSubmitting = false;
        }
    }

    async function handleDeleteType(id: number, name: string) {
        if (!confirm(\`Hapus jenis cuti "\${name}"? Data saldo cuti terkait akan dinonaktifkan.\`)) return;

        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/leave-types/\${id}\`, {
                method: 'DELETE',
                headers: { 'Authorization': \`Bearer \${data.token}\`, 'Accept': 'application/json' }
            });

            if (res.ok) {
                leaveTypes = leaveTypes.filter((t: any) => t.id !== id);
                showToast('Jenis cuti berhasil dihapus.', 'success');
            }
        } catch (e: any) {
            showToast('Gagal menghapus jenis cuti.', 'error');
        }
    }

    // ==========================================
    // BALANCE EDITING ACTIONS
    // ==========================================

    function openEditBalance(bal: any, category: 'leave' | 'sick' | 'absence') {
        activeBalance = bal;
        balanceCategory = category;
        editQuota = bal.quota || (category === 'sick' ? 14 : category === 'absence' ? 3 : 12);
        editUsed = bal.used || 0;
        isEditBalanceModalOpen = true;
    }

    async function handleSaveBalance() {
        if (!activeBalance) return;
        isSubmitting = true;

        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/leave-balances/\${activeBalance.id}\`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    quota: editQuota,
                    used: editUsed
                })
            });

            if (res.ok) {
                const updated = await res.json();
                const remaining = Math.max(0, editQuota - editUsed);

                if (balanceCategory === 'leave') {
                    leaveBalances = leaveBalances.map((b: any) => b.id === activeBalance.id ? { ...b, quota: editQuota, used: editUsed, remaining } : b);
                } else if (balanceCategory === 'sick') {
                    sickBalances = sickBalances.map((b: any) => b.id === activeBalance.id ? { ...b, quota: editQuota, used: editUsed, remaining } : b);
                } else if (balanceCategory === 'absence') {
                    absenceBalances = absenceBalances.map((b: any) => b.id === activeBalance.id ? { ...b, quota: editQuota, used: editUsed, remaining } : b);
                }

                isEditBalanceModalOpen = false;
                showToast('Saldo kuota karyawan berhasil diperbarui!', 'success');
            } else {
                const err = await res.json();
                showToast(err.message || 'Gagal memperbarui saldo.', 'error');
            }
        } catch (e: any) {
            showToast('Terjadi kesalahan sistem.', 'error');
        } finally {
            isSubmitting = false;
        }
    }

    // ==========================================
    // POLICY ACTIONS (SICK, ABSENCE, DUTY)
    // ==========================================

    async function handleSavePolicy(policyType: 'sick' | 'absence' | 'duty') {
        const p = policies[policyType] || defaultPolicies[policyType];
        isSubmitting = true;

        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/request-policies\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    policy_type: policyType,
                    max_days_per_year: p.max_days_per_year !== undefined ? p.max_days_per_year : (policyType === 'sick' ? 14 : policyType === 'absence' ? 3 : 0),
                    requires_attachment: Boolean(p.requires_attachment),
                    is_paid: Boolean(p.is_paid),
                    description: p.description || ''
                })
            });

            if (res.ok) {
                const saved = await res.json();
                policies[policyType] = saved;
                showToast(\`Kebijakan \${policyType === 'sick' ? 'Izin Sakit' : policyType === 'absence' ? 'Izin Absen' : 'Izin Dinas'} berhasil disimpan!\`, 'success');
            } else {
                showToast('Gagal menyimpan kebijakan.', 'error');
            }
        } catch (e: any) {
            showToast('Terjadi kesalahan sistem.', 'error');
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="text-xs text-muted-foreground mb-1">HRIS &bull; Pengaturan & Kebijakan</div>
            <h1 class="text-2xl font-bold tracking-tight">Pengaturan Kuota & Pengajuan</h1>
            <p class="text-sm text-muted-foreground">Kelola master jenis cuti dan kebijakan kuota independen untuk Cuti, Izin Sakit, Izin Absen, dan Izin Dinas.</p>
        </div>
    </div>

    <!-- Main Navigation Tabs -->
    <PengajuanNav />

    <!-- Toast Notification -->
    {#if toastMessage}
        <div class="p-3 rounded-xl text-xs font-semibold shadow-md flex items-center justify-between {toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'}">
            <span>{toastMessage}</span>
            <button onclick={() => toastMessage = ''} class="text-xs ml-3 font-bold">&times;</button>
        </div>
    {/if}

    <!-- 4 Sub-Module Tabs (Clean typography, Lucide icons, NO emojis) -->
    <div class="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar">
        <button
            type="button"
            onclick={() => setTab('leave')}
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap {activeTab === 'leave' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
        >
            <CalendarRange class="w-4 h-4" />
            <span>Pengaturan Izin Cuti</span>
        </button>

        <button
            type="button"
            onclick={() => setTab('sick')}
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap {activeTab === 'sick' ? 'bg-blue-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
        >
            <HeartPulse class="w-4 h-4" />
            <span>Pengaturan Izin Sakit</span>
        </button>

        <button
            type="button"
            onclick={() => setTab('absence')}
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap {activeTab === 'absence' ? 'bg-amber-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
        >
            <CalendarX2 class="w-4 h-4" />
            <span>Pengaturan Izin Absen</span>
        </button>

        <button
            type="button"
            onclick={() => setTab('duty')}
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap {activeTab === 'duty' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
        >
            <Briefcase class="w-4 h-4" />
            <span>Pengaturan Izin Dinas</span>
        </button>
    </div>

    <!-- ========================================================================= -->
    <!-- 1. TAB PENGATURAN IZIN CUTI (MURNI UNTUK IZIN-CUTI) -->
    <!-- ========================================================================= -->
    {#if activeTab === 'leave'}
        <div class="space-y-6">
            <!-- Master Jenis Cuti Card -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                        <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                            <Layers class="w-4 h-4 text-primary" /> Master Jenis Cuti Perusahaan
                        </h2>
                        <p class="text-xs text-muted-foreground">Khusus menentukan jenis cuti yang dapat diajukan karyawan pada formulir Izin Cuti.</p>
                    </div>
                    <button
                        type="button"
                        onclick={openCreateType}
                        class="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                        <Plus class="w-3.5 h-3.5" /> Tambah Jenis Cuti
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
                                <th class="p-3">KODE</th>
                                <th class="p-3">NAMA JENIS CUTI</th>
                                <th class="p-3 text-center">DEFAULT JATAH</th>
                                <th class="p-3 text-center">TIPE UPAH</th>
                                <th class="p-3">KETERANGAN & KETENTUAN</th>
                                <th class="p-3 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            {#each leaveTypes as type}
                                <tr class="hover:bg-muted/20 transition-colors">
                                    <td class="p-3 font-mono font-bold text-primary">{type.code}</td>
                                    <td class="p-3 font-bold text-foreground">{type.name}</td>
                                    <td class="p-3 text-center font-mono font-semibold">{type.default_days} Hari / Thn</td>
                                    <td class="p-3 text-center">
                                        <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold {type.is_paid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                                            {type.is_paid ? 'Cuti Berbayar' : 'Unpaid (Potong Gaji)'}
                                        </span>
                                    </td>
                                    <td class="p-3 text-muted-foreground max-w-xs truncate">{type.description || '-'}</td>
                                    <td class="p-3 text-right">
                                        <div class="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onclick={() => openEditType(type)}
                                                class="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                                                title="Edit Jenis Cuti"
                                            >
                                                <Pencil class="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onclick={() => handleDeleteType(type.id, type.name)}
                                                class="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500"
                                                title="Hapus Jenis Cuti"
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
            </div>

            <!-- Saldo Cuti Karyawan Card -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                        <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                            <CalendarRange class="w-4 h-4 text-emerald-600" /> Saldo & Kuota Cuti Karyawan ({data.year})
                        </h2>
                        <p class="text-xs text-muted-foreground">Alokasi kuota cuti tahunan dan riwayat pemakaian per karyawan.</p>
                    </div>
                    <div class="relative w-full sm:w-64">
                        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            bind:value={search}
                            placeholder="Cari karyawan / jenis cuti..."
                            class="w-full h-8 pl-8 pr-3 rounded-lg border border-input bg-background text-xs"
                        />
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
                                <th class="p-3">ID & NAMA KARYAWAN</th>
                                <th class="p-3">DEPARTEMEN</th>
                                <th class="p-3">JENIS CUTI</th>
                                <th class="p-3 text-center">TOTAL KUOTA</th>
                                <th class="p-3 text-center">TERPAKAI</th>
                                <th class="p-3 text-center">SISA HARI</th>
                                <th class="p-3 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            {#each filteredLeaveBalances as bal}
                                <tr class="hover:bg-muted/20 transition-colors">
                                    <td class="p-3">
                                        <div class="font-bold text-foreground">{bal.employee?.user?.name || '-'}</div>
                                        <div class="text-[10px] font-mono text-muted-foreground">{bal.employee?.employee_id || ''}</div>
                                    </td>
                                    <td class="p-3 text-muted-foreground">{bal.employee?.department || '-'}</td>
                                    <td class="p-3 font-semibold text-foreground">{bal.leave_type?.name || 'Cuti Tahunan'}</td>
                                    <td class="p-3 text-center font-mono font-semibold text-blue-600 dark:text-blue-400">{bal.quota || 0} Hari</td>
                                    <td class="p-3 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">{bal.used || 0} Hari</td>
                                    <td class="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {Math.max(0, (bal.quota || 0) - (bal.used || 0))} Hari
                                    </td>
                                    <td class="p-3 text-right">
                                        <button
                                            type="button"
                                            onclick={() => openEditBalance(bal, 'leave')}
                                            class="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-md text-[11px] font-semibold"
                                        >
                                            Edit Kuota
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {/if}

    <!-- ========================================================================= -->
    <!-- 2. TAB PENGATURAN IZIN SAKIT (KHUSUS UNTUK IZIN-SAKIT) -->
    <!-- ========================================================================= -->
    {#if activeTab === 'sick'}
        <div class="space-y-6">
            <!-- Kebijakan Izin Sakit Card -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="pb-3 border-b border-border">
                    <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                        <HeartPulse class="w-4 h-4 text-blue-600" /> Kebijakan Izin Sakit Perusahaan
                    </h2>
                    <p class="text-xs text-muted-foreground">Ketentuan kuota jatah sakit berbayar per tahun dan validasi Surat Izin Dokter (SID).</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label for="policy-sick-days" class="block font-semibold text-foreground mb-1">Batas Maksimal Sakit Berbayar (Hari / Tahun)</label>
                        <input
                            id="policy-sick-days"
                            type="number"
                            bind:value={policies.sick.max_days_per_year}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                        />
                        <p class="text-[10px] text-muted-foreground mt-1">Standar perusahaan umumnya 14 hari/tahun.</p>
                    </div>

                    <div>
                        <label for="policy-sick-attach" class="block font-semibold text-foreground mb-1">Wajib Lampirkan Surat Dokter (SID)</label>
                        <select
                            id="policy-sick-attach"
                            bind:value={policies.sick.requires_attachment}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                        >
                            <option value={true}>Wajib Lampirkan Surat Dokter</option>
                            <option value={false}>Opsional / Tidak Wajib</option>
                        </select>
                    </div>

                    <div>
                        <label for="policy-sick-paid" class="block font-semibold text-foreground mb-1">Status Upah Izin Sakit</label>
                        <select
                            id="policy-sick-paid"
                            bind:value={policies.sick.is_paid}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                        >
                            <option value={true}>Berbayar Penuh (Paid Sick Leave)</option>
                            <option value={false}>Tidak Berbayar (Unpaid)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="policy-sick-desc" class="block font-semibold text-xs text-foreground mb-1">Keterangan / SOP Izin Sakit</label>
                    <textarea
                        id="policy-sick-desc"
                        bind:value={policies.sick.description}
                        rows="2"
                        placeholder="Contoh: Karyawan wajib mengunggah Surat Izin Dokter resmi dari faskes..."
                        class="w-full rounded-md border border-input bg-background p-3 text-xs"
                    ></textarea>
                </div>

                <div class="flex justify-end pt-2">
                    <button
                        type="button"
                        onclick={() => handleSavePolicy('sick')}
                        disabled={isSubmitting}
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                        Simpan Kebijakan Izin Sakit
                    </button>
                </div>
            </div>

            <!-- Rekap Izin Sakit Karyawan Card -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                        <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                            <HeartPulse class="w-4 h-4 text-blue-600" /> Rekap & Saldo Izin Sakit Karyawan ({data.year})
                        </h2>
                        <p class="text-xs text-muted-foreground">Pemantauan hari sakit yang telah terpakai oleh karyawan tahun ini.</p>
                    </div>
                    <div class="relative w-full sm:w-64">
                        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            bind:value={search}
                            placeholder="Cari nama karyawan..."
                            class="w-full h-8 pl-8 pr-3 rounded-lg border border-input bg-background text-xs"
                        />
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
                                <th class="p-3">KARYAWAN</th>
                                <th class="p-3">DEPARTEMEN</th>
                                <th class="p-3 text-center">BATAS JATAH SAKIT</th>
                                <th class="p-3 text-center">HARI SAKIT TERPAKAI</th>
                                <th class="p-3 text-center">SISA HARI SAKIT</th>
                                <th class="p-3 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            {#each filteredSickBalances as bal}
                                <tr class="hover:bg-muted/20 transition-colors">
                                    <td class="p-3">
                                        <div class="font-bold text-foreground">{bal.employee?.user?.name || '-'}</div>
                                        <div class="text-[10px] font-mono text-muted-foreground">{bal.employee?.employee_id || ''}</div>
                                    </td>
                                    <td class="p-3 text-muted-foreground">{bal.employee?.department || '-'}</td>
                                    <td class="p-3 text-center font-mono font-semibold text-blue-600 dark:text-blue-400">{bal.quota || 14} Hari</td>
                                    <td class="p-3 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">{bal.used || 0} Hari</td>
                                    <td class="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {Math.max(0, (bal.quota || 14) - (bal.used || 0))} Hari
                                    </td>
                                    <td class="p-3 text-right">
                                        <button
                                            type="button"
                                            onclick={() => openEditBalance(bal, 'sick')}
                                            class="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-md text-[11px] font-semibold"
                                        >
                                            Sesuaikan
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {/if}

    <!-- ========================================================================= -->
    <!-- 3. TAB PENGATURAN IZIN ABSEN (KHUSUS UNTUK IZIN-ABSEN) -->
    <!-- ========================================================================= -->
    {#if activeTab === 'absence'}
        <div class="space-y-6">
            <!-- Kebijakan Izin Absen Card -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="pb-3 border-b border-border">
                    <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                        <CalendarX2 class="w-4 h-4 text-amber-600" /> Kebijakan Izin Tidak Masuk Kerja (Absen)
                    </h2>
                    <p class="text-xs text-muted-foreground">Ketentuan izin keperluan mendesak atau keperluan pribadi harian.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                        <label for="policy-abs-days" class="block font-semibold text-foreground mb-1">Batas Maksimal Izin Tidak Masuk (Hari / Tahun)</label>
                        <input
                            id="policy-abs-days"
                            type="number"
                            bind:value={policies.absence.max_days_per_year}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                        />
                    </div>

                    <div>
                        <label for="policy-abs-paid" class="block font-semibold text-foreground mb-1">Tipe Pemotongan Upah</label>
                        <select
                            id="policy-abs-paid"
                            bind:value={policies.absence.is_paid}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                        >
                            <option value={false}>Potong Gaji / Tidak Berbayar (Unpaid)</option>
                            <option value={true}>Berbayar (Paid)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="policy-abs-desc" class="block font-semibold text-xs text-foreground mb-1">Keterangan & Kebijakan Absen</label>
                    <textarea
                        id="policy-abs-desc"
                        bind:value={policies.absence.description}
                        rows="2"
                        placeholder="Contoh: Izin mendesak dapat diajukan maksimal 1 hari sebelum ketidakhadiran..."
                        class="w-full rounded-md border border-input bg-background p-3 text-xs"
                    ></textarea>
                </div>

                <div class="flex justify-end pt-2">
                    <button
                        type="button"
                        onclick={() => handleSavePolicy('absence')}
                        disabled={isSubmitting}
                        class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                        Simpan Kebijakan Izin Absen
                    </button>
                </div>
            </div>

            <!-- Rekap Izin Absen Karyawan Card -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                        <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                            <CalendarX2 class="w-4 h-4 text-amber-600" /> Rekap Izin Absen Karyawan ({data.year})
                        </h2>
                        <p class="text-xs text-muted-foreground">Pemantauan hari izin tidak masuk kerja karyawan.</p>
                    </div>
                    <div class="relative w-full sm:w-64">
                        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            bind:value={search}
                            placeholder="Cari nama karyawan..."
                            class="w-full h-8 pl-8 pr-3 rounded-lg border border-input bg-background text-xs"
                        />
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
                                <th class="p-3">KARYAWAN</th>
                                <th class="p-3">DEPARTEMEN</th>
                                <th class="p-3 text-center">BATAS JATAH IZIN</th>
                                <th class="p-3 text-center">HARI TERPAKAI</th>
                                <th class="p-3 text-center">SISA KUOTA</th>
                                <th class="p-3 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            {#each filteredAbsenceBalances as bal}
                                <tr class="hover:bg-muted/20 transition-colors">
                                    <td class="p-3">
                                        <div class="font-bold text-foreground">{bal.employee?.user?.name || '-'}</div>
                                        <div class="text-[10px] font-mono text-muted-foreground">{bal.employee?.employee_id || ''}</div>
                                    </td>
                                    <td class="p-3 text-muted-foreground">{bal.employee?.department || '-'}</td>
                                    <td class="p-3 text-center font-mono font-semibold text-blue-600 dark:text-blue-400">{bal.quota || 3} Hari</td>
                                    <td class="p-3 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">{bal.used || 0} Hari</td>
                                    <td class="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {Math.max(0, (bal.quota || 3) - (bal.used || 0))} Hari
                                    </td>
                                    <td class="p-3 text-right">
                                        <button
                                            type="button"
                                            onclick={() => openEditBalance(bal, 'absence')}
                                            class="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-md text-[11px] font-semibold"
                                        >
                                            Sesuaikan
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {/if}

    <!-- ========================================================================= -->
    <!-- 4. TAB PENGATURAN IZIN DINAS (KHUSUS UNTUK IZIN-DINAS) -->
    <!-- ========================================================================= -->
    {#if activeTab === 'duty'}
        <div class="space-y-6">
            <!-- Kebijakan Dinas Luar Card -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="pb-3 border-b border-border">
                    <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                        <Briefcase class="w-4 h-4 text-emerald-600" /> Kebijakan Penugasan & Izin Dinas Luar
                    </h2>
                    <p class="text-xs text-muted-foreground">Ketentuan permohonan dinas luar kota, penugasan proyek, dan sinkronisasi kehadiran.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                        <label for="policy-duty-attach" class="block font-semibold text-foreground mb-1">Wajib Lampirkan Surat Perintah Tugas (SPPD)</label>
                        <select
                            id="policy-duty-attach"
                            bind:value={policies.duty.requires_attachment}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                        >
                            <option value={true}>Wajib Unggah Dokumen Tugas / SPPD</option>
                            <option value={false}>Opsional (Cukup Catatan/Alasan)</option>
                        </select>
                    </div>

                    <div>
                        <span class="block font-semibold text-foreground mb-1">Otomatisasi Kehadiran Absensi</span>
                        <div class="p-2.5 bg-muted/40 rounded-md border border-border text-muted-foreground text-xs flex items-center gap-2">
                            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Tercatat otomatis berstatus <strong>Dinas Luar</strong> saat disetujui admin.</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label for="policy-duty-desc" class="block font-semibold text-xs text-foreground mb-1">Keterangan / SOP Dinas Luar</label>
                    <textarea
                        id="policy-duty-desc"
                        bind:value={policies.duty.description}
                        rows="2"
                        placeholder="Contoh: Perjalanan dinas mencakup transportasi dan akomodasi sesuai SOP perusahaan..."
                        class="w-full rounded-md border border-input bg-background p-3 text-xs"
                    ></textarea>
                </div>

                <div class="flex justify-end pt-2">
                    <button
                        type="button"
                        onclick={() => handleSavePolicy('duty')}
                        disabled={isSubmitting}
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                        Simpan Kebijakan Izin Dinas
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- ========================================== -->
<!-- MODAL TAMBAH / EDIT MASTER JENIS CUTI -->
<!-- ========================================== -->
{#if isTypeModalOpen}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div class="flex items-center justify-between border-b border-border pb-3">
                <h3 class="font-bold text-base flex items-center gap-2 text-foreground">
                    <CalendarRange class="w-4 h-4 text-primary" /> {editingType ? 'Edit Jenis Cuti' : 'Tambah Jenis Cuti Baru'}
                </h3>
                <button type="button" onclick={() => isTypeModalOpen = false} class="text-muted-foreground hover:text-foreground text-xs font-bold">✕</button>
            </div>

            <form onsubmit={(e) => { e.preventDefault(); handleSaveType(); }} class="space-y-3 text-xs">
                <div>
                    <label for="modal-type-code" class="block font-semibold text-foreground mb-1">Kode Cuti</label>
                    <input
                        id="modal-type-code"
                        type="text"
                        bind:value={typeCode}
                        placeholder="Cth: CT01, CM01, CK01"
                        class="w-full h-9 rounded-md border border-input bg-background px-3 font-mono font-bold"
                        required
                    />
                </div>

                <div>
                    <label for="modal-type-name" class="block font-semibold text-foreground mb-1">Nama Jenis Cuti</label>
                    <input
                        id="modal-type-name"
                        type="text"
                        bind:value={typeName}
                        placeholder="Cth: Cuti Tahunan, Cuti Melahirkan"
                        class="w-full h-9 rounded-md border border-input bg-background px-3 font-semibold"
                        required
                    />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="modal-type-days" class="block font-semibold text-foreground mb-1">Default Jatah (Hari)</label>
                        <input
                            id="modal-type-days"
                            type="number"
                            bind:value={typeDays}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                            required
                        />
                    </div>

                    <div>
                        <label for="modal-type-paid" class="block font-semibold text-foreground mb-1">Tipe Upah</label>
                        <select
                            id="modal-type-paid"
                            bind:value={typePaid}
                            class="w-full h-9 rounded-md border border-input bg-background px-3"
                        >
                            <option value={true}>Cuti Berbayar</option>
                            <option value={false}>Potong Gaji</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="modal-type-desc" class="block font-semibold text-foreground mb-1">Keterangan / Ketentuan</label>
                    <textarea
                        id="modal-type-desc"
                        bind:value={typeDesc}
                        rows="2"
                        placeholder="Ketentuan pengajuan cuti..."
                        class="w-full rounded-md border border-input bg-background p-3"
                    ></textarea>
                </div>

                <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <button
                        type="button"
                        onclick={() => isTypeModalOpen = false}
                        class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Jenis Cuti'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- ========================================== -->
<!-- MODAL EDIT SALDO KUOTA KARYAWAN -->
<!-- ========================================== -->
{#if isEditBalanceModalOpen && activeBalance}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div class="flex items-center justify-between border-b border-border pb-3">
                <h3 class="font-bold text-base flex items-center gap-2 text-foreground">
                    <Settings2 class="w-4 h-4 text-primary" /> Edit Saldo Kuota
                </h3>
                <button type="button" onclick={() => isEditBalanceModalOpen = false} class="text-muted-foreground hover:text-foreground text-xs font-bold">✕</button>
            </div>

            <div class="space-y-1 bg-muted/40 p-3 rounded-lg text-xs">
                <p class="font-bold text-foreground">{activeBalance.employee?.user?.name || 'Karyawan'}</p>
                <p class="text-muted-foreground">
                    {balanceCategory === 'leave' ? (activeBalance.leave_type?.name || 'Cuti Tahunan') : balanceCategory === 'sick' ? 'Izin Sakit' : 'Izin Absen'} &bull; Tahun {activeBalance.year}
                </p>
            </div>

            <form onsubmit={(e) => { e.preventDefault(); handleSaveBalance(); }} class="space-y-3 text-xs">
                <div>
                    <label for="modal-edit-quota" class="block font-semibold text-foreground mb-1">Total Kuota (Hari)</label>
                    <input
                        id="modal-edit-quota"
                        type="number"
                        bind:value={editQuota}
                        class="w-full h-9 rounded-md border border-input bg-background px-3 font-mono font-bold"
                        required
                    />
                </div>

                <div>
                    <label for="modal-edit-used" class="block font-semibold text-foreground mb-1">Hari Terpakai</label>
                    <input
                        id="modal-edit-used"
                        type="number"
                        bind:value={editUsed}
                        class="w-full h-9 rounded-md border border-input bg-background px-3 font-mono font-bold"
                        required
                    />
                </div>

                <div class="flex items-center justify-between pt-2 text-xs font-semibold">
                    <span class="text-muted-foreground">Sisa Kuota:</span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">
                        {Math.max(0, editQuota - editUsed)} Hari
                    </span>
                </div>

                <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <button
                        type="button"
                        onclick={() => isEditBalanceModalOpen = false}
                        class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Kuota'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
`;

fs.writeFileSync(cutiPath, newSvelteContent, 'utf8');
console.log('Successfully updated pengaturan-cuti/+page.svelte with explicit type="button" on all tab switchers, safe policy state initialization, and URL sync!');
