const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const htmlPath = path.join(mobileDir, 'pages/task-detail.html');
const ctrlPath = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');

const newHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>NATRA - Detail Tugas</title>
  <link rel="stylesheet" href="../src/styles/tailwind.css">
  <script src="../src/core/theme/theme-init.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-50 dark:bg-slate-900 pb-20 select-none">
  <div class="app-wrap max-w-md mx-auto min-h-screen">
    
    <!-- Top Header -->
    <header class="module-header bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700/70 sticky top-0 z-[100]">
      <div class="module-header-row flex items-center gap-4 px-5 h-16">
        <button id="back-btn" class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
          <i data-lucide="chevron-left" class="w-6 h-6"></i>
        </button>
        <h1 class="text-lg font-bold text-slate-800 dark:text-white">Detail Penugasan</h1>
        <div class="ml-auto flex items-center gap-2">
          <button id="task-refresh-btn" class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
            <i data-lucide="rotate-cw" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    </header>

    <main class="px-5 py-5 space-y-5">
      
      <!-- Skeleton Loading -->
      <div id="task-loading" class="space-y-4">
        <div class="card p-5 animate-pulse space-y-4">
          <div class="flex gap-2">
             <div class="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
             <div class="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
          <div class="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div class="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
          <div class="h-24 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
        </div>
      </div>

      <!-- Main Task Detail Content -->
      <div id="task-content" class="hidden fade-in space-y-5">
        
        <!-- Delivery / Task Stepper Roadmap (ShopeeFood Style Timeline) -->
        <div id="task-roadmap-card" class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/70 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <i data-lucide="route" class="w-4 h-4 text-primary-500"></i> Alur Progres Tugas
            </h3>
            <span id="roadmap-status-text" class="text-[11px] font-extrabold text-primary-600 dark:text-primary-400">
              Menunggu Penerimaan
            </span>
          </div>

          <!-- 3-Step Horizontal Timeline Stepper -->
          <div class="relative pt-2 pb-1">
            <!-- Connecting Progress Line -->
            <div class="absolute top-[22px] left-[15%] right-[15%] h-1 bg-slate-100 dark:bg-slate-700 -z-0">
              <div id="roadmap-progress-bar" class="h-full bg-primary-500 rounded-full transition-all duration-500 w-0"></div>
            </div>

            <!-- Stepper Nodes -->
            <div class="grid grid-cols-3 gap-2 relative z-10 text-center">
              
              <!-- Step 1: Terima -->
              <div class="flex flex-col items-center gap-1.5" id="step-node-1">
                <div class="step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs bg-slate-100 dark:bg-slate-700 text-slate-400">
                  <i data-lucide="clipboard-check" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">1. Terima</p>
                  <p class="text-[9px] text-slate-400 font-medium">Konfirmasi</p>
                </div>
              </div>

              <!-- Step 2: Mulai / Jalan -->
              <div class="flex flex-col items-center gap-1.5" id="step-node-2">
                <div class="step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs bg-slate-100 dark:bg-slate-700 text-slate-400">
                  <i data-lucide="truck" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">2. Berjalan</p>
                  <p class="text-[9px] text-slate-400 font-medium">Perjalanan</p>
                </div>
              </div>

              <!-- Step 3: Selesai -->
              <div class="flex flex-col items-center gap-1.5" id="step-node-3">
                <div class="step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs bg-slate-100 dark:bg-slate-700 text-slate-400">
                  <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">3. Selesai</p>
                  <p class="text-[9px] text-slate-400 font-medium">Penyelesaian</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Task Core Information Card -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/70 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div id="task-type-badge-wrap" class="flex items-center gap-2"></div>
            <div id="task-priority"></div>
          </div>

          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug" id="task-title">
            Memuat judul tugas...
          </h2>
          
          <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <i data-lucide="align-left" class="w-3.5 h-3.5 text-primary-500"></i> Deskripsi & Instruksi
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line" id="task-description">
              Memuat deskripsi...
            </p>
          </div>

          <!-- Dynamic Dispatch Box (Vehicle & Interactive Clickable Maps) -->
          <div id="task-dispatch-container"></div>

          <!-- Due Date Box -->
          <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
             <div class="flex items-center gap-2.5">
               <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                 <i data-lucide="clock" class="w-4 h-4"></i>
               </div>
               <div>
                 <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tenggat Waktu</p>
                 <p class="text-xs font-bold text-slate-800 dark:text-slate-200" id="task-due">--/--/----</p>
               </div>
             </div>
             <div id="task-status"></div>
          </div>
        </div>

        <!-- Completion Section (If finished) -->
        <div id="completion-section" class="hidden bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5">
          <h3 class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <i data-lucide="check-circle" class="w-4 h-4"></i> Catatan Penyelesaian
          </h3>
          <p class="text-xs text-slate-700 dark:text-slate-300 italic" id="completion-notes"></p>
        </div>

        <!-- Action Button Area (Updates In-Place without page kickout) -->
        <div id="task-action" class="pt-2">
           <!-- Dynamic Action Buttons injected here -->
        </div>

      </div>
    </main>
  </div>

  <script type="module" src="../src/features/tasks/task-detail.controller.js"></script>
</body>
</html>
`;

const newCtrlContent = `/**
 * NATRA Mobile - Task Detail Controller
 * Handles interactive Google Maps navigation links, ShopeeFood-style timeline roadmap,
 * and smooth in-place state progression without kicking user out.
 */

import { TasksService } from './tasks.service.js';
import { GpsService } from '../gps/gps.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, setLoading, setText, setHTML, formatDate, priorityBadge, statusBadge } from '../../utils/ui-helpers.js';

const TaskDetailController = {
  _taskId: null,
  _task: null,

  async init() {
    if (!Auth.requireAuth()) return;

    const params = new URLSearchParams(window.location.search);
    this._taskId = params.get('id');

    if (!this._taskId) {
      showToast('ID tugas tidak ditemukan', 'error');
      setTimeout(() => history.back(), 1000);
      return;
    }

    this._bindEvents();
    await this._loadTask();
  },

  _bindEvents() {
    document.getElementById('back-btn')?.addEventListener('click', () => history.back());
    
    document.getElementById('task-refresh-btn')?.addEventListener('click', async () => {
      showToast('Memperbarui detail tugas...', 'info');
      await this._loadTask();
    });
  },

  async _loadTask() {
    const loadingEl = document.getElementById('task-loading');
    const contentEl = document.getElementById('task-content');
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');

    try {
      const res = await TasksService.getTaskById(this._taskId);
      this._task = res?.data ? res.data : (res?.id ? res : null);
      if (this._task) {
        this._renderTask(this._task);
        if (contentEl) contentEl.classList.remove('hidden');
      } else {
        showToast('Tugas tidak ditemukan', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Gagal memuat detail tugas', 'error');
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  },

  _renderTask(task) {
    if (!task) return;
    const isDispatch = task.task_type === 'dispatch' || task.type === 'dispatch' || !!task.vehicle_id;
    
    // 1. Task Type & Priority Badges
    const typeBadge = isDispatch 
      ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Driver Dispatch</span>'
      : '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"><i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i> Tugas Umum</span>';

    setHTML('task-type-badge-wrap', typeBadge);
    setHTML('task-priority', priorityBadge(task.priority));
    setText('task-title', task.title);
    setText('task-description', task.description || 'Tidak ada instruksi khusus.');
    setText('task-due', formatDate(task.due_date));
    setHTML('task-status', statusBadge(task.status));

    // 2. ShopeeFood / Grab Style Timeline Roadmap Stepper
    this._renderRoadmap(task.status);

    // 3. Dispatch & Interactive Google Maps Route Box
    this._renderDispatchRoutes(task, isDispatch);

    // 4. Completion Notes Section
    if (task.completion_notes) {
      setText('completion-notes', task.completion_notes);
      const notesEl = document.getElementById('completion-section');
      if (notesEl) notesEl.classList.remove('hidden');
    } else {
      const notesEl = document.getElementById('completion-section');
      if (notesEl) notesEl.classList.add('hidden');
    }

    // 5. Action Buttons (In-Place Progression)
    this._renderActionButton(task.status);

    if (window.lucide) window.lucide.createIcons();
  },

  _renderRoadmap(status) {
    const statusTextEl = document.getElementById('roadmap-status-text');
    const progressBar = document.getElementById('roadmap-progress-bar');
    const node1 = document.getElementById('step-node-1');
    const node2 = document.getElementById('step-node-2');
    const node3 = document.getElementById('step-node-3');

    const resetNode = (node) => {
      if (!node) return;
      const iconWrap = node.querySelector('.step-icon-wrap');
      if (iconWrap) {
        iconWrap.className = 'step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs bg-slate-100 dark:bg-slate-700 text-slate-400';
      }
    };

    const setNodeActive = (node, isCurrent = false) => {
      if (!node) return;
      const iconWrap = node.querySelector('.step-icon-wrap');
      if (iconWrap) {
        if (isCurrent) {
          iconWrap.className = 'step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-950 animate-pulse';
        } else {
          iconWrap.className = 'step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs bg-emerald-500 text-white';
        }
      }
    };

    resetNode(node1);
    resetNode(node2);
    resetNode(node3);

    if (status === 'pending') {
      if (statusTextEl) statusTextEl.textContent = 'Tahap 1: Menunggu Penerimaan Tugas';
      if (progressBar) progressBar.style.width = '0%';
      setNodeActive(node1, true);
    } else if (status === 'accepted' || status === 'assigned') {
      if (statusTextEl) statusTextEl.textContent = 'Tahap 2: Tugas Diterima (Siap Mulai)';
      if (progressBar) progressBar.style.width = '50%';
      setNodeActive(node1, false);
      setNodeActive(node2, true);
    } else if (status === 'in_progress') {
      if (statusTextEl) statusTextEl.textContent = 'Tahap 2: Sedang Dalam Perjalanan / Dikerjakan';
      if (progressBar) progressBar.style.width = '50%';
      setNodeActive(node1, false);
      setNodeActive(node2, true);
    } else if (status === 'completed') {
      if (statusTextEl) statusTextEl.textContent = 'Tahap 3: Tugas Selesai Dikerjakan 🎉';
      if (progressBar) progressBar.style.width = '100%';
      setNodeActive(node1, false);
      setNodeActive(node2, false);
      setNodeActive(node3, true);
    } else if (status === 'cancelled') {
      if (statusTextEl) statusTextEl.textContent = 'Tugas Dibatalkan';
      if (progressBar) progressBar.style.width = '0%';
    }
  },

  _renderDispatchRoutes(task, isDispatch) {
    const container = document.getElementById('task-dispatch-container');
    if (!container) return;

    if (!isDispatch && !task.origin_address && !task.destination_address) {
      container.innerHTML = '';
      return;
    }

    const vehicleName = task.vehicle 
      ? \`\${task.vehicle.license_plate || task.vehicle.plate_number} • \${task.vehicle.model || task.vehicle.name || 'Armada'}\` 
      : (task.vehicle_id ? 'Armada Ditugaskan' : null);

    // Google Maps Search & Navigation URLs
    const getMapUrl = (lat, lng, address) => {
      if (lat && lng) {
        return \`https://www.google.com/maps/search/?api=1&query=\${lat},\${lng}\`;
      }
      if (address) {
        return \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(address)}\`;
      }
      return null;
    };

    const originUrl = getMapUrl(task.origin_lat, task.origin_lng, task.origin_address);
    const destUrl = getMapUrl(task.destination_lat, task.destination_lng, task.destination_address);

    const fullRouteNavUrl = (task.destination_lat && task.destination_lng)
      ? \`https://www.google.com/maps/dir/?api=1&destination=\${task.destination_lat},\${task.destination_lng}\`
      : (task.destination_address ? \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(task.destination_address)}\` : null);

    container.innerHTML = \`
      <div class="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="truck" class="w-4 h-4"></i> Rute Pengiriman & Armada
          </h3>
          <span class="text-[10px] text-blue-500 font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
            Klik lokasi untuk buka Maps
          </span>
        </div>

        \${vehicleName ? \`
          <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-50 dark:border-blue-900/30 text-xs shadow-xs">
            <div class="flex items-center gap-2 font-black text-slate-800 dark:text-slate-100">
              <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                <i data-lucide="car" class="w-4 h-4"></i>
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase">Armada Operasional</p>
                <p class="font-black text-slate-800 dark:text-slate-100">\${vehicleName}</p>
              </div>
            </div>
            \${task.start_odometer ? \`
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase">Odo Awal</p>
                <p class="text-xs font-black text-slate-700 dark:text-slate-300">\${Number(task.start_odometer).toLocaleString()} km</p>
              </div>
            \` : ''}
          </div>
        \` : ''}

        <!-- Interactive Origin Location Link -->
        \${task.origin_address ? \`
          <a href="\${originUrl || '#'}" target="_blank" class="block p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700/70 active:scale-[0.98] transition-transform shadow-xs group">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2.5 flex-1 min-w-0">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-50 dark:ring-emerald-950"></div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <p class="text-[10px] font-black text-slate-400 uppercase">Titik Asal / Penjemputan</p>
                    <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">Buka Maps</span>
                  </div>
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors line-clamp-2 mt-0.5">
                    \${task.origin_address}
                  </p>
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 group-hover:text-primary-600 flex items-center justify-center shrink-0">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </div>
            </div>
          </a>
        \` : ''}

        <!-- Interactive Destination Location Link -->
        \${task.destination_address ? \`
          <a href="\${destUrl || '#'}" target="_blank" class="block p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700/70 active:scale-[0.98] transition-transform shadow-xs group">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2.5 flex-1 min-w-0">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0 ring-4 ring-rose-50 dark:ring-rose-950"></div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <p class="text-[10px] font-black text-slate-400 uppercase">Titik Tujuan / Pengantaran</p>
                    <span class="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded">Buka Maps</span>
                  </div>
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors line-clamp-2 mt-0.5">
                    \${task.destination_address}
                  </p>
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 group-hover:text-primary-600 flex items-center justify-center shrink-0">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </div>
            </div>
          </a>
        \` : ''}

        <!-- Direct Turn-by-Turn Google Maps Navigation Button -->
        \${fullRouteNavUrl ? \`
          <a href="\${fullRouteNavUrl}" target="_blank" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform">
            <i data-lucide="navigation" class="w-4 h-4"></i>
            <span>Mulai Navigasi Langsung (Google Maps)</span>
          </a>
        \` : ''}
      </div>
    \`;
  },

  _renderActionButton(status) {
    const actionEl = document.getElementById('task-action');
    if (!actionEl) return;

    if (status === 'pending') {
      actionEl.innerHTML = \`
        <div class="space-y-2">
          <button id="btn-accept" class="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-transform">
            <i data-lucide="check" class="w-5 h-5"></i>
            <span>Terima Tugas Sekarang</span>
          </button>
          <p class="text-[11px] text-center text-slate-400">Klik terima untuk mengonfirmasi Anda siap menjalankan tugas</p>
        </div>
      \`;
    } else if (status === 'accepted' || status === 'assigned') {
      actionEl.innerHTML = \`
        <div class="space-y-2">
          <button id="btn-start" class="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-transform">
            <i data-lucide="play" class="w-5 h-5"></i>
            <span>Mulai Perjalanan / Tugas</span>
          </button>
          <p class="text-[11px] text-center text-slate-400">Klik saat Anda mulai bergerak menuju titik penjemputan/tujuan</p>
        </div>
      \`;
    } else if (status === 'in_progress') {
      actionEl.innerHTML = \`
        <div class="space-y-3">
          <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs space-y-1.5">
            <label for="completion-notes-input" class="block text-xs font-black text-slate-700 dark:text-slate-200">
              Catatan Penyelesaian <span class="text-[10px] font-normal text-slate-400">(Opsional)</span>
            </label>
            <textarea id="completion-notes-input" class="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" placeholder="Contoh: Paket telah diterima Ibu Linda dalam kondisi baik..."></textarea>
          </div>

          <button id="btn-complete" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-transform">
            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
            <span>Selesaikan Tugas & Pengiriman</span>
          </button>
        </div>
      \`;
    } else if (status === 'completed') {
      actionEl.innerHTML = \`
        <div class="py-4 px-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex justify-center items-center gap-2 font-black text-sm">
          <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600"></i>
          <span>Tugas Telah Selesai Dikerjakan</span>
        </div>
      \`;
    } else {
      actionEl.innerHTML = '';
    }

    window.lucide?.createIcons({ root: actionEl });

    // Bind action button clicks
    const btnAccept = document.getElementById('btn-accept');
    const btnStart = document.getElementById('btn-start');
    const btnComplete = document.getElementById('btn-complete');

    if (btnAccept) {
      btnAccept.addEventListener('click', (e) => this._handleAction('pending', e.currentTarget));
    }
    if (btnStart) {
      btnStart.addEventListener('click', (e) => this._handleAction('accepted', e.currentTarget));
    }
    if (btnComplete) {
      btnComplete.addEventListener('click', (e) => this._handleAction('in_progress', e.currentTarget));
    }
  },

  async _handleAction(status, btn) {
    setLoading(btn, true, 'Memproses...');
    try {
      let res;
      if (status === 'pending') {
        res = await TasksService.acceptTask(this._taskId);
        showToast('Tugas berhasil diterima! Siap mulai perjalanan.', 'success');
        
        // Update local object & re-render in place without redirecting out!
        this._task = res?.data ? res.data : (res?.id ? res : { ...this._task, status: 'accepted' });
        this._renderTask(this._task);
        setLoading(btn, false);
        return;
      } 
      
      if (status === 'accepted') {
        res = await TasksService.startTask(this._taskId);
        showToast('Tugas dimulai! Tetap utamakan keselamatan berkendara.', 'success');
        
        // Update local object & re-render in place without redirecting out!
        this._task = res?.data ? res.data : (res?.id ? res : { ...this._task, status: 'in_progress' });
        this._renderTask(this._task);
        setLoading(btn, false);
        return;
      } 
      
      if (status === 'in_progress') {
        const notes = document.getElementById('completion-notes-input')?.value || '';
        let lat = null, lng = null;
        try {
          const coords = await GpsService.getCurrentPosition();
          lat = coords.latitude;
          lng = coords.longitude;
        } catch { /* location optional */ }

        res = await TasksService.completeTask(this._taskId, {
          completion_notes: notes,
          latitude: lat,
          longitude: lng,
        });

        showToast('Tugas berhasil diselesaikan! 🎉', 'success');

        // Re-render completed status
        this._task = res?.data ? res.data : (res?.id ? res : { ...this._task, status: 'completed', completion_notes: notes });
        this._renderTask(this._task);
        setLoading(btn, false);

        // Friendly redirect after 1.5s
        setTimeout(() => {
          window.location.href = 'tasks.html';
        }, 1500);
      }
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui tugas', 'error');
      setLoading(btn, false);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => TaskDetailController.init());

export { TaskDetailController };
`;

fs.writeFileSync(htmlPath, newHtmlContent, 'utf8');
fs.writeFileSync(ctrlPath, newCtrlContent, 'utf8');
console.log('Successfully updated task-detail.html and task-detail.controller.js with roadmap and clickable maps!');
