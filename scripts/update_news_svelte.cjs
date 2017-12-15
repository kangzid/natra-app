const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const pageFile = path.join(svelteDir, 'src/routes/admin/hris/news/+page.svelte');

const pageContent = `<script lang="ts">
    import { PUBLIC_API_URL } from '$env/static/public';
    import { fade } from 'svelte/transition';
    import { 
        Megaphone, 
        Newspaper, 
        Plus, 
        Trash2, 
        Search, 
        Filter, 
        RefreshCw, 
        Eye, 
        Edit, 
        CheckCircle2, 
        Clock, 
        Truck, 
        Briefcase, 
        Flame, 
        Globe,
        Image as ImageIcon,
        UploadCloud,
        X,
        Settings2,
        Pencil,
        Building2,
        Users
    } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    let { data } = $props();

    let newsList = $state(data.news || []);
    let summary = $state(data.summary || {
        total_news: 0,
        urgent_count: 0,
        published_count: 0,
        draft_count: 0
    });
    let departments = $state(data.departments || []);

    $effect(() => {
        newsList = data.news || [];
        if (data.summary) summary = data.summary;
        departments = data.departments || [];
    });

    // Filters
    let search = $state($page.url.searchParams.get('search') || '');
    let priority = $state($page.url.searchParams.get('priority') || '');
    let targetAudience = $state($page.url.searchParams.get('target_audience') || '');
    let category = $state($page.url.searchParams.get('category') || '');

    // Modals
    let isCreateModalOpen = $state(false);
    let isDetailModalOpen = $state(false);
    let isCategoryModalOpen = $state(false);
    let isSubmitting = $state(false);
    let errorMessage = $state('');

    // Active item for view/edit
    let selectedNews = $state<any>(null);

    // Form fields for Create/Edit
    let editingId = $state<number | null>(null);
    let formTitle = $state('');
    let formCategory = $state('Announcement');
    let formPriority = $state('normal');
    let formTargetAudience = $state('all');
    let formContent = $state('');
    let formIsPublished = $state(true);
    let formBannerBase64 = $state<string | null>(null);

    // Dynamic Categories State
    let defaultCategories = [
        'Announcement',
        'Kebijakan Perusahaan',
        'Hari Libur Bersama',
        'Event Internal',
        'Keamanan & K3',
        'Operasional Fleet'
    ];
    let customCategories = $state<string[]>([]);
    
    // Load custom categories from local storage if available
    $effect(() => {
        try {
            const saved = localStorage.getItem('natra_news_categories');
            if (saved) {
                customCategories = JSON.parse(saved);
            } else {
                customCategories = defaultCategories;
            }
        } catch {
            customCategories = defaultCategories;
        }
    });

    let newCatInput = $state('');
    let editingCatIndex = $state<number | null>(null);
    let editCatInput = $state('');

    function saveCustomCategories(cats: string[]) {
        customCategories = cats;
        try {
            localStorage.setItem('natra_news_categories', JSON.stringify(cats));
        } catch (e) {
            console.error(e);
        }
    }

    function handleAddCategory() {
        if (!newCatInput.trim()) return;
        if (customCategories.includes(newCatInput.trim())) {
            alert('Kategori sudah ada.');
            return;
        }
        const updated = [...customCategories, newCatInput.trim()];
        saveCustomCategories(updated);
        newCatInput = '';
    }

    function handleUpdateCategory(index: number) {
        if (!editCatInput.trim()) return;
        const updated = [...customCategories];
        updated[index] = editCatInput.trim();
        saveCustomCategories(updated);
        editingCatIndex = null;
        editCatInput = '';
    }

    function handleDeleteCategory(index: number) {
        if (customCategories.length <= 1) {
            alert('Minimal harus ada 1 kategori.');
            return;
        }
        if (!confirm('Hapus kategori ini?')) return;
        const updated = customCategories.filter((_, i) => i !== index);
        saveCustomCategories(updated);
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    }

    function formatAudienceLabel(aud: string) {
        if (aud === 'all') return 'Semua Karyawan';
        if (aud === 'drivers_only') return 'Khusus Driver';
        if (aud === 'staff_only') return 'Khusus Staf';
        return \`Dept: \${aud}\`;
    }

    function applyFilter() {
        const p = new URLSearchParams();
        if (search) p.set('search', search);
        if (priority) p.set('priority', priority);
        if (targetAudience) p.set('target_audience', targetAudience);
        if (category) p.set('category', category);
        goto(\`?\${p.toString()}\`, { keepFocus: true, noScroll: true });
    }

    function resetFilter() {
        search = '';
        priority = '';
        targetAudience = '';
        category = '';
        goto('?', { noScroll: true });
    }

    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran gambar maksimal 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                formBannerBase64 = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function openCreateModal() {
        editingId = null;
        formTitle = '';
        formCategory = customCategories[0] || 'Announcement';
        formPriority = 'normal';
        formTargetAudience = 'all';
        formContent = '';
        formIsPublished = true;
        formBannerBase64 = null;
        errorMessage = '';
        isCreateModalOpen = true;
    }

    function openEditModal(n: any) {
        editingId = n.id;
        formTitle = n.title || '';
        formCategory = n.category || customCategories[0] || 'Announcement';
        formPriority = n.priority || 'normal';
        formTargetAudience = n.target_audience || 'all';
        formContent = n.content || '';
        formIsPublished = !!n.is_published;
        formBannerBase64 = n.banner_base64 || null;
        errorMessage = '';
        isCreateModalOpen = true;
    }

    async function handleSaveNews(e: Event) {
        e.preventDefault();
        isSubmitting = true;
        errorMessage = '';

        try {
            const url = editingId 
                ? \`\${PUBLIC_API_URL}/hris/news/\${editingId}\` 
                : \`\${PUBLIC_API_URL}/hris/news\`;
            const method = editingId ? 'PUT' : 'POST';

            const payload: any = {
                title: formTitle,
                content: formContent,
                category: formCategory,
                priority: formPriority,
                target_audience: formTargetAudience,
                is_published: formIsPublished
            };

            if (formBannerBase64) {
                payload.banner_base64 = formBannerBase64;
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': \`Bearer \${data.token}\`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                const updatedItem = saved.data || saved;
                
                if (editingId) {
                    newsList = newsList.map((n: any) => n.id === editingId ? updatedItem : n);
                } else {
                    newsList = [updatedItem, ...newsList];
                    summary.total_news++;
                    if (updatedItem.priority === 'urgent') summary.urgent_count++;
                    if (updatedItem.is_published) summary.published_count++;
                    else summary.draft_count++;
                }

                isCreateModalOpen = false;
            } else {
                const err = await res.json();
                errorMessage = err.message || 'Gagal menyimpan pengumuman.';
            }
        } catch (e: any) {
            errorMessage = e.message || 'Terjadi kesalahan sistem.';
        } finally {
            isSubmitting = false;
        }
    }

    async function handleTogglePublish(id: number) {
        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/news/\${id}/toggle-publish\`, {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const updated = await res.json();
                const item = updated.data || updated;
                newsList = newsList.map((n: any) => n.id === id ? item : n);
                
                // Recalculate published summary
                const pubCount = newsList.filter((n: any) => n.is_published).length;
                summary.published_count = pubCount;
                summary.draft_count = newsList.length - pubCount;
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;

        try {
            const res = await fetch(\`\${PUBLIC_API_URL}/hris/news/\${id}\`, {
                method: 'DELETE',
                headers: {
                    'Authorization': \`Bearer \${data.token}\`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const deleted = newsList.find((n: any) => n.id === id);
                newsList = newsList.filter((n: any) => n.id !== id);
                summary.total_news = Math.max(0, summary.total_news - 1);
                if (deleted?.priority === 'urgent') summary.urgent_count = Math.max(0, summary.urgent_count - 1);
                if (deleted?.is_published) summary.published_count = Math.max(0, summary.published_count - 1);
                else summary.draft_count = Math.max(0, summary.draft_count - 1);
            } else {
                alert('Gagal menghapus pengumuman.');
            }
        } catch (e) {
            console.error(e);
        }
    }

    function openDetail(news: any) {
        selectedNews = news;
        isDetailModalOpen = true;
    }
</script>

<div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <Megaphone class="w-4 h-4" />
                <span>HRIS &bull; Komunikasi & Publikasi Internal</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-foreground">Pengumuman & Berita Perusahaan</h1>
            <p class="text-xs text-muted-foreground mt-1">
                Siarkan instruksi darurat, kebijakan operasional baru, dan info penting ke seluruh divisi & karyawan.
            </p>
        </div>

        <div class="flex items-center gap-2">
            <button
                onclick={() => isCategoryModalOpen = true}
                class="inline-flex items-center gap-2 px-3 py-2 border border-input bg-background hover:bg-muted text-foreground rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
                <Settings2 class="w-4 h-4 text-primary" />
                <span>Kelola Kategori</span>
            </button>
            <button 
                onclick={openCreateModal}
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs active:scale-95"
            >
                <Plus class="w-4 h-4" />
                <span>Buat Pengumuman Baru</span>
            </button>
        </div>
    </div>

    <!-- Summary Statistics Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">Total Pengumuman</span>
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Newspaper class="w-4 h-4" />
                </div>
            </div>
            <div class="text-2xl font-black text-foreground">{summary.total_news || 0}</div>
            <p class="text-[11px] text-muted-foreground">Seluruh arsip berita internal</p>
        </div>

        <div class="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">Pengumuman Urgent</span>
                <div class="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                    <Flame class="w-4 h-4" />
                </div>
            </div>
            <div class="text-2xl font-black text-rose-600">{summary.urgent_count || 0}</div>
            <p class="text-[11px] text-muted-foreground">Prioritas tinggi / Realtime push</p>
        </div>

        <div class="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">Publikasi Aktif</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 class="w-4 h-4" />
                </div>
            </div>
            <div class="text-2xl font-black text-emerald-600">{summary.published_count || 0}</div>
            <p class="text-[11px] text-muted-foreground">Dapat dibaca karyawan</p>
        </div>

        <div class="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">Draft Belum Rilis</span>
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Clock class="w-4 h-4" />
                </div>
            </div>
            <div class="text-2xl font-black text-amber-600">{summary.draft_count || 0}</div>
            <p class="text-[11px] text-muted-foreground">Menunggu finalisasi</p>
        </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="bg-card border border-border p-4 rounded-xl space-y-3 shadow-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div class="space-y-1">
                <label for="filter-search" class="text-xs font-medium text-muted-foreground">Cari Judul / Konten</label>
                <div class="relative">
                    <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                        id="filter-search"
                        type="text" 
                        bind:value={search}
                        placeholder="Kata kunci pengumuman..."
                        class="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>

            <div class="space-y-1">
                <label for="filter-category" class="text-xs font-medium text-muted-foreground">Kategori</label>
                <select 
                    id="filter-category"
                    bind:value={category}
                    class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="">Semua Kategori</option>
                    {#each customCategories as cat}
                        <option value={cat}>{cat}</option>
                    {/each}
                </select>
            </div>

            <div class="space-y-1">
                <label for="filter-priority" class="text-xs font-medium text-muted-foreground">Prioritas</label>
                <select 
                    id="filter-priority"
                    bind:value={priority}
                    class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="">Semua Prioritas</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            <div class="space-y-1">
                <label for="filter-audience" class="text-xs font-medium text-muted-foreground">Target Audiens</label>
                <select 
                    id="filter-audience"
                    bind:value={targetAudience}
                    class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="">Semua Audiens</option>
                    <option value="all">Semua Karyawan</option>
                    <option value="drivers_only">Khusus Driver</option>
                    <option value="staff_only">Khusus Staf</option>
                    {#if departments.length > 0}
                        <optgroup label="--- Divisi / Departemen ---">
                            {#each departments as dept}
                                <option value={dept.name}>{dept.name}</option>
                            {/each}
                        </optgroup>
                    {/if}
                </select>
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-1 border-t border-border">
            <button 
                onclick={resetFilter}
                class="px-3 py-1.5 border border-input rounded-md text-xs font-medium hover:bg-muted transition-colors"
            >
                Reset
            </button>
            <button 
                onclick={applyFilter}
                class="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs"
            >
                Terapkan Filter
            </button>
        </div>
    </div>

    <!-- News List Grid -->
    {#if newsList.length === 0}
        <div class="bg-card border border-border rounded-xl p-12 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Newspaper class="w-6 h-6" />
            </div>
            <h3 class="text-base font-bold text-foreground">Tidak Ada Pengumuman Ditemukan</h3>
            <p class="text-xs text-muted-foreground max-w-sm mx-auto">
                Belum ada pengumuman yang sesuai dengan filter pencarian Anda. Klik tombol "Buat Pengumuman Baru" untuk membagikan informasi.
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each newsList as item (item.id)}
                <div class="bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-primary/50 transition-all group">
                    <!-- Banner or Placeholder Header -->
                    {#if item.banner_base64}
                        <div class="w-full h-40 bg-muted relative overflow-hidden">
                            <img src={item.banner_base64} alt={item.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {#if item.priority === 'urgent'}
                                <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                    <Flame class="w-3 h-3" /> Urgent
                                </span>
                            {/if}
                        </div>
                    {:else}
                        <div class="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                            <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
                                {item.category || 'Announcement'}
                            </span>
                            {#if item.priority === 'urgent'}
                                <span class="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Flame class="w-3 h-3" /> Urgent
                                </span>
                            {/if}
                        </div>
                    {/if}

                    <!-- Body Content -->
                    <div class="p-4 space-y-2.5 flex-1">
                        <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span>{formatAudienceLabel(item.target_audience)}</span>
                            <span>&bull;</span>
                            <span>{formatDate(item.published_at || item.created_at)}</span>
                        </div>

                        <h3 class="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                        </h3>

                        <p class="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {item.content}
                        </p>
                    </div>

                    <!-- Footer Action Bar -->
                    <div class="px-4 py-3 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                        <div>
                            {#if item.is_published}
                                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Tayang
                                </span>
                            {:else}
                                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                    <span class="w-2 h-2 rounded-full bg-amber-500"></span> Draft
                                </span>
                            {/if}
                        </div>

                        <div class="flex items-center gap-1">
                            <button
                                onclick={() => openDetail(item)}
                                class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                title="Lihat Pengumuman"
                            >
                                <Eye class="w-4 h-4" />
                            </button>
                            <button
                                onclick={() => openEditModal(item)}
                                class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                title="Edit Pengumuman"
                            >
                                <Pencil class="w-4 h-4" />
                            </button>
                            <button
                                onclick={() => handleTogglePublish(item.id)}
                                class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                title={item.is_published ? "Tarik ke Draft" : "Publikasikan"}
                            >
                                <RefreshCw class="w-4 h-4" />
                            </button>
                            <button
                                onclick={() => handleDelete(item.id)}
                                class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                                title="Hapus Pengumuman"
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

<!-- Modal Kelola Kategori Berita -->
{#if isCategoryModalOpen}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div class="flex items-center justify-between border-b border-border pb-3 shrink-0">
                <h3 class="font-bold text-base text-foreground flex items-center gap-2">
                    <Settings2 class="w-4 h-4 text-primary" /> Pengaturan Kategori Berita
                </h3>
                <button onclick={() => isCategoryModalOpen = false} class="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <!-- Form Tambah Kategori -->
            <div class="space-y-2 shrink-0">
                <label class="block text-xs font-medium text-muted-foreground">Tambah Kategori Baru</label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        bind:value={newCatInput}
                        placeholder="Nama kategori baru..."
                        class="flex-1 h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <button
                        onclick={handleAddCategory}
                        class="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90"
                    >
                        Tambah
                    </button>
                </div>
            </div>

            <!-- Daftar Kategori Aktif -->
            <div class="space-y-2 overflow-y-auto flex-1 pr-1">
                <div class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategori Tersedia ({customCategories.length})</div>
                <div class="divide-y divide-border border border-border rounded-xl overflow-hidden">
                    {#each customCategories as cat, idx}
                        <div class="p-2.5 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
                            {#if editingCatIndex === idx}
                                <div class="flex items-center gap-2 flex-1 mr-2">
                                    <input
                                        type="text"
                                        bind:value={editCatInput}
                                        class="flex-1 h-7 rounded border border-input bg-background px-2 text-xs"
                                    />
                                    <button
                                        onclick={() => handleUpdateCategory(idx)}
                                        class="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        onclick={() => editingCatIndex = null}
                                        class="px-2 py-1 border border-input rounded text-[10px]"
                                    >
                                        Batal
                                    </button>
                                </div>
                            {:else}
                                <span class="text-xs font-medium text-foreground">{cat}</span>
                                <div class="flex items-center gap-1">
                                    <button
                                        onclick={() => { editingCatIndex = idx; editCatInput = cat; }}
                                        class="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                                        title="Edit Kategori"
                                    >
                                        <Pencil class="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onclick={() => handleDeleteCategory(idx)}
                                        class="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                                        title="Hapus Kategori"
                                    >
                                        <Trash2 class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <div class="pt-3 border-t border-border flex justify-end shrink-0">
                <button
                    onclick={() => isCategoryModalOpen = false}
                    class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted"
                >
                    Selesai
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Modal Buat / Edit Pengumuman -->
{#if isCreateModalOpen}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div class="flex items-center justify-between border-b border-border pb-3 shrink-0">
                <h3 class="font-bold text-base text-foreground flex items-center gap-2">
                    <Megaphone class="w-4 h-4 text-primary" />
                    {editingId ? 'Edit Pengumuman Berita' : 'Buat Pengumuman Baru'}
                </h3>
                <button onclick={() => isCreateModalOpen = false} class="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {#if errorMessage}
                <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-md text-xs">
                    {errorMessage}
                </div>
            {/if}

            <form onsubmit={handleSaveNews} class="space-y-4 overflow-y-auto pr-1 flex-1">
                <div>
                    <label for="news-title" class="block text-xs font-medium text-muted-foreground mb-1">Judul Pengumuman *</label>
                    <input 
                        id="news-title"
                        type="text" 
                        bind:value={formTitle} 
                        placeholder="Contoh: Pembaruan Standar Keselamatan Operasional 2026"
                        class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                    />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label for="news-category" class="block text-xs font-medium text-muted-foreground mb-1">Kategori</label>
                        <select 
                            id="news-category"
                            bind:value={formCategory} 
                            class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            {#each customCategories as cat}
                                <option value={cat}>{cat}</option>
                            {/each}
                        </select>
                    </div>
                    <div>
                        <label for="news-priority" class="block text-xs font-medium text-muted-foreground mb-1">Prioritas</label>
                        <select 
                            id="news-priority"
                            bind:value={formPriority} 
                            class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent (Tinggi)</option>
                        </select>
                    </div>
                    <div>
                        <label for="news-audience" class="block text-xs font-medium text-muted-foreground mb-1">Target Audiens</label>
                        <select 
                            id="news-audience"
                            bind:value={formTargetAudience} 
                            class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="all">Semua Karyawan</option>
                            <option value="drivers_only">Khusus Driver</option>
                            <option value="staff_only">Khusus Staf</option>
                            {#if departments.length > 0}
                                <optgroup label="--- Divisi / Departemen ---">
                                    {#each departments as dept}
                                        <option value={dept.name}>Dept: {dept.name}</option>
                                    {/each}
                                </optgroup>
                            {/if}
                        </select>
                    </div>
                </div>

                <!-- Banner Image (Base64) with Dropzone Style -->
                <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-muted-foreground">Poster / Banner Gambar</label>
                    
                    {#if formBannerBase64}
                        <div class="relative w-full h-44 rounded-xl overflow-hidden border border-border group">
                            <img src={formBannerBase64} alt="Banner Preview" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label class="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-md cursor-pointer hover:bg-gray-100">
                                    Ganti Gambar
                                    <input type="file" accept="image/*" onchange={handleFileSelect} class="hidden" />
                                </label>
                                <button 
                                    type="button" 
                                    onclick={() => formBannerBase64 = null}
                                    class="px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-md hover:bg-rose-700"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    {:else}
                        <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                <UploadCloud class="w-8 h-8 mb-2 text-primary" />
                                <p class="text-xs font-medium"><span class="text-primary font-bold">Klik untuk upload</span> atau drag and drop</p>
                                <p class="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP</p>
                            </div>
                            <input type="file" accept="image/*" onchange={handleFileSelect} class="hidden" />
                        </label>
                    {/if}
                </div>

                <div>
                    <label for="news-content" class="block text-xs font-medium text-muted-foreground mb-1">Isi Pesan / Pengumuman *</label>
                    <textarea 
                        id="news-content"
                        bind:value={formContent} 
                        rows="5"
                        placeholder="Tuliskan detail pengumuman atau instruksi operasional di sini..." 
                        class="w-full rounded-md border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                    ></textarea>
                </div>

                <div class="flex items-center gap-2">
                    <input 
                        id="news-publish-check" 
                        type="checkbox" 
                        bind:checked={formIsPublished} 
                        class="rounded border-input text-primary"
                    />
                    <label for="news-publish-check" class="text-xs text-foreground font-medium cursor-pointer">
                        Publikasikan langsung agar dapat dibaca karyawan sekarang
                    </label>
                </div>

                <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <button 
                        type="button" 
                        onclick={() => isCreateModalOpen = false} 
                        class="px-4 py-2 border border-input rounded-md text-xs font-medium hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan & Publikasikan')}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal Baca Berita Lengkap -->
{#if isDetailModalOpen && selectedNews}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            {#if selectedNews.banner_base64}
                <div class="w-full h-52 bg-muted relative shrink-0">
                    <img src={selectedNews.banner_base64} alt={selectedNews.title} class="w-full h-full object-cover" />
                </div>
            {/if}

            <div class="p-6 overflow-y-auto space-y-4 flex-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="px-2 py-0.5 rounded bg-muted text-[10px] font-bold uppercase border border-border">
                        {selectedNews.category || 'Announcement'}
                    </span>
                    <span class="text-xs text-muted-foreground">{formatDate(selectedNews.published_at)}</span>
                </div>

                <h2 class="text-xl font-bold text-foreground leading-tight">
                    {selectedNews.title}
                </h2>

                <div class="flex items-center gap-2 text-xs text-muted-foreground pb-3 border-b border-border">
                    <span>Oleh: <strong class="text-foreground">{selectedNews.author?.name || 'HR Admin'}</strong></span>
                    &bull;
                    <span>Target: <strong class="text-foreground">{formatAudienceLabel(selectedNews.target_audience)}</strong></span>
                </div>

                <div class="text-xs leading-relaxed text-foreground whitespace-pre-line">
                    {selectedNews.content}
                </div>
            </div>

            <div class="p-4 border-t border-border bg-muted/20 flex justify-end shrink-0">
                <button 
                    onclick={() => isDetailModalOpen = false} 
                    class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
{/if}
`;

fs.writeFileSync(pageFile, pageContent, 'utf8');
console.log('Successfully updated +page.svelte for news management!');
