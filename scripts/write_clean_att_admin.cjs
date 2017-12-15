const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const pageFile = path.join(svelteDir, 'src/routes/admin/attendances/+page.svelte');

const pageContent = `<script lang="ts">
    import {
        ChevronLeft,
        ChevronRight,
        Calendar as CalendarIcon,
        Search,
        User as UserIcon,
        Clock,
        FileText,
        AlertCircle,
        RefreshCw,
        AlertTriangle,
        Settings as SettingsIcon,
        MapPin,
    } from "lucide-svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import Label from "$lib/components/ui/label/label.svelte";
    import { cn } from "$lib/utils/cn";
    import type { Employee } from "$lib/types/auth";
    import type {
        Attendance,
        AttendanceResponse,
        AttendanceDay,
    } from "$lib/types/attendance";
    import { attendanceService } from "$lib/services/attendance.service";

    let { data } = $props();
    let token = $derived(data.token as string);

    // State
    let selectedEmployee = $state<Employee | null>(null);
    let attendanceData = $state<AttendanceResponse | null>(null);
    let isLoading = $state(false);
    let searchTerm = $state("");

    // Date Navigation
    let currentDate = new Date();
    let currentMonth = $state(currentDate.getMonth() + 1); // 1-12
    let currentYear = $state(currentDate.getFullYear());

    // Edit Dialog State
    let isDialogOpen = $state(false);
    let selectedDay = $state<AttendanceDay | null>(null);
    let editForm = $state({
        status: "present",
        notes: "",
        check_in: "",
        check_out: "",
    });
    let isSaving = $state(false);
    
    // Settings State
    let isSettingsDialogOpen = $state(false);
    let limitDays = $state(0);
    let isSavingSettings = $state(false);

    async function openSettingsDialog() {
        try {
            const setting = await attendanceService.getSettings(token);
            limitDays = setting.edit_delete_limit_days ?? 0;
            isSettingsDialogOpen = true;
        } catch (e) {
            console.error(e);
            isSettingsDialogOpen = true;
        }
    }

    async function handleSaveSettings() {
        isSavingSettings = true;
        try {
            await attendanceService.saveSettings(token, Number(limitDays));
            alert("Pengaturan batas edit & hapus absensi berhasil disimpan!");
            isSettingsDialogOpen = false;
        } catch (e: any) {
            alert(e.message || "Gagal menyimpan pengaturan.");
        } finally {
            isSavingSettings = false;
        }
    }

    // Cleanup State
    let isCleanupDialogOpen = $state(false);
    let cleanupDate = $state(new Date().toISOString().split('T')[0]);
    let isCleaning = $state(false);
    let confirmCleanup = $state(false);

    // Derived filtered employees (clean search)
    let filteredEmployees = $derived(
        (data.employees || []).filter((emp: Employee) => {
            const name = emp.user?.name || "";
            const empId = emp.employee_id || "";
            return (
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                empId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        })
    );

    // Pagination State
    let currentPage = $state(1);
    const itemsPerPage = 10;
    
    let totalPages = $derived(Math.ceil(filteredEmployees.length / itemsPerPage));
    let paginatedEmployees = $derived(
        filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Reset pagination to page 1 on search change
    $effect(() => {
        searchTerm;
        currentPage = 1;
    });

    let monthName = $derived(
        new Date(currentYear, currentMonth - 1).toLocaleString("default", {
            month: "long",
        })
    );

    $effect(() => {
        if (!selectedEmployee && data.employees && data.employees.length > 0) {
            selectEmployee(data.employees[0]);
        }
    });

    async function selectEmployee(employee: Employee) {
        selectedEmployee = employee;
        await fetchAttendance();
    }

    async function fetchAttendance() {
        if (!selectedEmployee) return;
        isLoading = true;
        try {
            attendanceData = await attendanceService.getEmployeeAttendance(
                token,
                selectedEmployee.id,
                currentMonth,
                currentYear
            );
        } catch (error) {
            console.error(error);
            attendanceData = {
                month: currentMonth,
                year: currentYear,
                days_in_month: 0,
                attendances: []
            };
        } finally {
            isLoading = false;
        }
    }

    async function changeMonth(delta: number) {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        currentMonth = newMonth;
        currentYear = newYear;

        if (selectedEmployee) {
            await fetchAttendance();
        }
    }

    function handleDayClick(day: AttendanceDay) {
        selectedDay = day;
        const record = day.attendance;

        editForm = {
            status: record?.status || "present",
            notes: record?.notes || "",
            check_in: record?.check_in || "08:00",
            check_out: record?.check_out || "17:00",
        };
        isDialogOpen = true;
    }

    async function handleSave() {
        if (!selectedDay || !selectedEmployee) return;
        isSaving = true;
        try {
            const isUpdate = !!selectedDay.attendance?.id;
            
            const payload: any = {
                status: editForm.status as any,
                notes: editForm.notes,
                check_in: editForm.check_in ? editForm.check_in.substring(0, 5) : null,
                check_out: editForm.check_out ? editForm.check_out.substring(0, 5) : null
            };

            if (!isUpdate) {
                payload.date = selectedDay.date;
                payload.employee_id = selectedEmployee.id;
            }

            await attendanceService.updateAttendance(
                token,
                selectedDay.attendance?.id || null,
                payload
            );

            isDialogOpen = false;
            await fetchAttendance();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to save attendance");
        } finally {
            isSaving = false;
        }
    }

    async function handleDelete() {
        if (!selectedDay?.attendance?.id) return;
        if (!confirm("Are you sure you want to delete this attendance record?")) return;

        isSaving = true;
        try {
            await attendanceService.deleteAttendance(token, selectedDay.attendance.id);
            isDialogOpen = false;
            await fetchAttendance();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to delete attendance");
        } finally {
            isSaving = false;
        }
    }

    async function handleCleanup() {
        if (!confirmCleanup) {
            alert("Please check the confirmation box first.");
            return;
        }
        
        isCleaning = true;
        try {
            const result = await attendanceService.cleanupAttendances(token, cleanupDate);
            alert(\`Success: \${result.message}\`);
            isCleanupDialogOpen = false;
            confirmCleanup = false;
            if (selectedEmployee) await fetchAttendance();
        } catch (error) {
            console.error(error);
            alert("Failed to cleanup attendance data");
        } finally {
            isCleaning = false;
        }
    }

    function getStatusClass(day: AttendanceDay) {
        if (!day.attendance) return "hover:bg-muted/50 border-transparent";

        switch (day.attendance.status) {
            case "present":
                return "bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200";
            case "late":
                return "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200";
            case "absent":
                return "bg-red-100 border-red-300 text-red-800 hover:bg-red-200";
            case "early_leave":
                return "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200";
            case "sakit":
                return "bg-rose-100 border-rose-300 text-rose-800 hover:bg-rose-200";
            case "cuti":
                return "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200";
            case "izin":
                return "bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200";
            case "dinas":
                return "bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200";
            default:
                return "bg-gray-100 border-gray-200 text-gray-700";
        }
    }

    function getStatusLabel(status: string) {
        switch (status) {
            case "present": return "Hadir";
            case "late": return "Terlambat";
            case "absent": return "Alpha";
            case "early_leave": return "Pulang Awal";
            case "sakit": return "Izin Sakit";
            case "cuti": return "Cuti";
            case "izin": return "Izin Absen";
            case "dinas": return "Dinas Luar";
            default: return status ? status.toUpperCase() : "-";
        }
    }

    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    function getStartOffset(firstDayName: string) {
        return dayNames.indexOf(firstDayName);
    }
</script>

<div class="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4 md:gap-6">
    <!-- Sidebar: Employee List -->
    <div class="w-full md:w-1/3 md:min-w-[300px] flex flex-col gap-4 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6 flex-[0.8] md:flex-none min-h-0">
        <div class="relative">
            <Search
                class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
                type="search"
                placeholder="Cari nama karyawan..."
                class="pl-9"
                bind:value={searchTerm}
            />
        </div>

        <div class="mt-auto border-t pt-4 space-y-2 order-last">
             <Button 
                variant="outline" 
                class="w-full justify-start gap-2 text-foreground border-border hover:bg-muted"
                onclick={openSettingsDialog}
            >
                <SettingsIcon class="h-4 w-4 text-primary" />
                Batas Edit & Hapus
            </Button>
             <Button 
                variant="outline" 
                class="w-full justify-start gap-2 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                onclick={() => isCleanupDialogOpen = true}
            >
                <RefreshCw class="h-4 w-4" />
                Cleanup Records
            </Button>
            <p class="text-[10px] text-muted-foreground px-1 italic">
                *Atur batas waktu modifikasi atau bersihkan riwayat lama.
            </p>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 pr-2">
            {#each paginatedEmployees as employee}
                <button
                    onclick={() => selectEmployee(employee)}
                    class={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:bg-muted",
                        selectedEmployee?.id === employee.id
                            ? "bg-primary/10 border-primary/20 border"
                            : "border border-transparent",
                    )}
                >
                    <div
                        class="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0"
                    >
                        <UserIcon class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div class="overflow-hidden">
                        <p class="font-medium truncate">
                            {employee.user?.name || "Unknown"}
                        </p>
                        <p class="text-xs text-muted-foreground truncate">
                            {employee.position}
                        </p>
                    </div>
                </button>
            {/each}
        </div>

        {#if totalPages > 1}
            <div class="py-2 border-t flex items-center justify-between bg-muted/10 px-2 rounded-lg mt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onclick={() => currentPage = Math.max(1, currentPage - 1)}
                    disabled={currentPage === 1}
                    class="h-8 px-2"
                >
                    <ChevronLeft class="h-4 w-4 mr-1" /> Prev
                </Button>
                <span class="text-xs text-muted-foreground font-medium">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
                    disabled={currentPage === totalPages}
                    class="h-8 px-2"
                >
                    Next <ChevronRight class="h-4 w-4 ml-1" />
                </Button>
            </div>
        {/if}
    </div>

    <!-- Main: Calendar View -->
    <div class="flex-[1.2] md:flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
        {#if selectedEmployee}
            <div class="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 class="text-xl font-bold">
                        {selectedEmployee.user?.name}
                    </h2>
                    <p class="text-muted-foreground text-sm">
                        #{selectedEmployee.employee_id}
                    </p>
                </div>

                <div
                    class="flex items-center gap-4 bg-muted/30 p-1 rounded-lg border"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => changeMonth(-1)}
                    >
                        <ChevronLeft class="h-4 w-4" />
                    </Button>
                    <div class="font-semibold w-32 text-center select-none">
                        {monthName}
                        {currentYear}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => changeMonth(1)}
                    >
                        <ChevronRight class="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {#if isLoading}
                <div class="flex-1 flex items-center justify-center">
                    <div
                        class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
                    ></div>
                </div>
            {:else if attendanceData && attendanceData.attendances.length > 0}
                <div class="flex-1 overflow-y-auto">
                    <!-- Calendar Grid -->
                    <div
                        class="grid grid-cols-7 gap-px bg-muted/20 border rounded-lg overflow-hidden"
                    >
                        <!-- Header -->
                        {#each dayNames as day}
                            <div
                                class="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                            >
                                {day.substring(0, 3)}
                            </div>
                        {/each}

                        <!-- Empty cells for start padding -->
                        {#each Array(getStartOffset(attendanceData.attendances[0].day_name)) as _}
                            <div class="bg-background min-h-[120px]"></div>
                        {/each}

                        <!-- Days -->
                        {#each attendanceData.attendances as day}
                            <button
                                onclick={() => handleDayClick(day)}
                                class={cn(
                                    "bg-background min-h-[120px] p-3 text-left transition-colors border group relative flex flex-col focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary",
                                    getStatusClass(day),
                                )}
                            >
                                <span
                                    class="text-sm font-semibold mb-2 block w-6 h-6 rounded-full flex items-center justify-center {day.attendance
                                        ? 'bg-black/10'
                                        : 'text-muted-foreground group-hover:bg-muted'}"
                                >
                                    {new Date(day.date).getDate()}
                                </span>

                                {#if day.attendance}
                                    <div class="flex-1 flex flex-col justify-between">
                                        <div class="flex items-center gap-1.5 flex-wrap">
                                            <span class="font-bold text-xs uppercase">
                                                {getStatusLabel(day.attendance.status)}
                                            </span>
                                            {#if day.attendance.shift}
                                                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-xs truncate max-w-[100px]" style="background-color: {day.attendance.shift.color || '#3b82f6'}">
                                                    {day.attendance.shift.name}
                                                </span>
                                            {/if}
                                        </div>

                                        <div class="text-[11px] space-y-0.5 mt-2">
                                            {#if day.attendance.check_in}
                                                <div class="flex items-center gap-1">
                                                    <Clock class="h-3 w-3 opacity-70" />
                                                    <span>{day.attendance.check_in.substring(0, 5)}</span>
                                                </div>
                                            {/if}
                                            {#if day.attendance.check_out}
                                                <div class="flex items-center gap-1">
                                                    <Clock class="h-3 w-3 opacity-70" />
                                                    <span>{day.attendance.check_out.substring(0, 5)}</span>
                                                </div>
                                            {/if}
                                        </div>

                                        {#if day.attendance.notes}
                                            <div class="flex items-center gap-1 text-[10px] opacity-75 mt-1 truncate">
                                                <FileText class="h-3 w-3 shrink-0" />
                                                <span class="truncate">{day.attendance.notes}</span>
                                            </div>
                                        {/if}
                                    </div>
                                {:else}
                                    <div class="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span class="text-xs text-muted-foreground font-medium">+ Add</span>
                                    </div>
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle class="h-8 w-8 mb-2 opacity-50" />
                    <p>No attendance data found for this month.</p>
                </div>
            {/if}
        {:else}
            <div class="flex-1 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg p-8">
                <CalendarIcon class="h-12 w-12 mb-4 opacity-50" />
                <h3 class="font-semibold text-lg mb-1">Pilih Karyawan</h3>
                <p class="text-sm text-center max-w-sm">
                    Pilih karyawan dari daftar di sebelah kiri untuk melihat dan mengelola kalender absensi.
                </p>
            </div>
        {/if}
    </div>
</div>

<!-- Edit/Create Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>
                {selectedDay?.attendance ? "Edit" : "Add"} Attendance
            </Dialog.Title>
            <Dialog.Description>
                {new Date(selectedDay?.date!).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="grid gap-2">
                <Label for="status">Status</Label>
                <select
                    id="status"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    bind:value={editForm.status}
                >
                    <option value="present">Present (Hadir)</option>
                    <option value="absent">Absent (Alpha)</option>
                    <option value="late">Late (Terlambat)</option>
                    <option value="early_leave">Early Leave (Pulang Mendahului)</option>
                    <option value="sakit">Sakit (Izin Sakit)</option>
                    <option value="cuti">Cuti</option>
                    <option value="izin">Izin</option>
                    <option value="dinas">Dinas Luar</option>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="grid gap-2">
                    <Label for="check_in">Check In</Label>
                    <Input
                        id="check_in"
                        type="time"
                        bind:value={editForm.check_in}
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="check_out">Check Out</Label>
                    <Input
                        id="check_out"
                        type="time"
                        bind:value={editForm.check_out}
                    />
                </div>
            </div>

            <div class="grid gap-2">
                <Label for="notes">Notes</Label>
                <textarea
                    id="notes"
                    class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    bind:value={editForm.notes}
                    placeholder="Notes..."
                ></textarea>
            </div>
        </div>

        <Dialog.Footer class="flex flex-col-reverse sm:flex-row sm:justify-between items-center w-full gap-4 sm:gap-0 mt-4 sm:mt-0">
            {#if selectedDay?.attendance}
                <Button variant="ghost" class="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 px-2" onclick={handleDelete} disabled={isSaving}>
                    Delete
                </Button>
            {:else}
                <div class="hidden sm:block"></div>
            {/if}
            <div class="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
                <Button variant="outline" class="w-full sm:w-auto" onclick={() => (isDialogOpen = false)}>Cancel</Button>
                <Button class="w-full sm:w-auto" onclick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Bulk Cleanup Dialog -->
<Dialog.Root bind:open={isCleanupDialogOpen}>
    <Dialog.Content class="sm:max-w-[450px]">
        <Dialog.Header>
            <Dialog.Title class="text-red-600 flex items-center gap-2">
                <AlertTriangle class="h-5 w-5" />
                Cleanup Attendance Data
            </Dialog.Title>
            <Dialog.Description>
                This operation will PERMANENTLY DELETE all records before the selected date across ALL employees.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-6 py-4">
            <div class="bg-red-50 border border-red-100 p-3 rounded-lg text-xs text-red-800 leading-relaxed shadow-sm">
                <strong>💡 Recommendation:</strong> Only perform cleanup after results have been recorded in your monthly reports. This action cannot be undone.
            </div>

            <div class="grid gap-2">
                <Label for="cleanup_date">Delete records created BEFORE:</Label>
                <Input
                    id="cleanup_date"
                    type="date"
                    bind:value={cleanupDate}
                />
            </div>

            <div class="flex items-center space-x-2 bg-muted/50 p-3 rounded-md border">
                <input 
                    type="checkbox" 
                    id="confirm_cleanup" 
                    class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    bind:checked={confirmCleanup}
                />
                <Label for="confirm_cleanup" class="text-xs font-medium cursor-pointer">
                    I understand that this data will be permanently removed.
                </Label>
            </div>
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => (isCleanupDialogOpen = false)}>Cancel</Button>
            <Button 
                variant="destructive" 
                onclick={handleCleanup} 
                disabled={isCleaning || !confirmCleanup}
            >
                {isCleaning ? "Cleaning..." : "Start Bulk Cleanup"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Attendance Settings Dialog -->
<Dialog.Root bind:open={isSettingsDialogOpen}>
    <Dialog.Content class="sm:max-w-[450px]">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
                <SettingsIcon class="h-5 w-5 text-primary" />
                Pengaturan Batas Edit & Hapus Absensi
            </Dialog.Title>
            <Dialog.Description>
                Tentukan batas waktu (hari ke belakang) admin diperbolehkan mengubah atau menghapus data absensi per karyawan.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="space-y-2">
                <Label for="limit_days">Batas Waktu Modifikasi / Hapus</Label>
                <select 
                    id="limit_days"
                    bind:value={limitDays}
                    class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <option value={0}>Tanpa Batas Waktu (Bebas Kapan Saja)</option>
                    <option value={7}>Maksimal 7 Hari ke Belakang</option>
                    <option value={14}>Maksimal 14 Hari ke Belakang</option>
                    <option value={30}>Maksimal 30 Hari (1 Bulan)</option>
                    <option value={90}>Maksimal 90 Hari (3 Bulan)</option>
                    <option value={365}>Maksimal 365 Hari (1 Tahun)</option>
                </select>
            </div>

            <div class="p-3 bg-muted/50 border rounded-lg text-xs text-muted-foreground space-y-1">
                <p><strong>Informasi:</strong></p>
                <p>&bull; <strong>Tanpa Batas:</strong> Anda dapat mengoreksi atau menghapus data absensi tanggal kapanpun tanpa batasan hari.</p>
                <p>&bull; <strong>Batas X Hari:</strong> Hanya absensi dalam rentang X hari terakhir yang dapat diedit atau dihapus.</p>
            </div>
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => (isSettingsDialogOpen = false)}>Batal</Button>
            <Button onclick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
`;

fs.writeFileSync(pageFile, pageContent, 'utf8');
console.log('Successfully written clean +page.svelte for attendances admin page!');
