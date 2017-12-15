/**
 * NATRA Mobile - Task Detail Controller
 * Handles iOS-style route navigation using exact pin coordinates,
 * clean concise status labels, and in-place state progression.
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
      ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Driver Dispatch</span>'
      : '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"><i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i> Tugas Umum</span>';

    setHTML('task-type-badge-wrap', typeBadge);
    setHTML('task-priority', priorityBadge(task.priority));
    setText('task-title', task.title);
    setText('task-description', task.description || 'Tidak ada instruksi khusus.');
    setText('task-due', formatDate(task.due_date));
    setHTML('task-status', statusBadge(task.status));

    // 2. Concise iOS Stepper Progression
    this._renderRoadmap(task.status);

    // 3. Dispatch Information & Coordinate-Based Google Maps
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
    const statusBadgeEl = document.getElementById('roadmap-status-badge');
    const progressBar = document.getElementById('roadmap-progress-bar');
    const node1 = document.getElementById('step-node-1');
    const node2 = document.getElementById('step-node-2');
    const node3 = document.getElementById('step-node-3');

    const resetNode = (node) => {
      if (!node) return;
      const iconWrap = node.querySelector('.step-icon-wrap');
      if (iconWrap) {
        iconWrap.className = 'step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all bg-slate-100 dark:bg-slate-800 text-slate-400';
      }
    };

    const setNodeActive = (node, isCurrent = false) => {
      if (!node) return;
      const iconWrap = node.querySelector('.step-icon-wrap');
      if (iconWrap) {
        if (isCurrent) {
          iconWrap.className = 'step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-950 animate-pulse';
        } else {
          iconWrap.className = 'step-icon-wrap w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all bg-emerald-500 text-white';
        }
      }
    };

    resetNode(node1);
    resetNode(node2);
    resetNode(node3);

    if (status === 'pending') {
      if (statusBadgeEl) {
        statusBadgeEl.textContent = 'Menunggu Konfirmasi';
        statusBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
      }
      if (progressBar) progressBar.style.width = '0%';
      setNodeActive(node1, true);
    } else if (status === 'accepted' || status === 'assigned') {
      if (statusBadgeEl) {
        statusBadgeEl.textContent = 'Siap Berangkat';
        statusBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900';
      }
      if (progressBar) progressBar.style.width = '50%';
      setNodeActive(node1, false);
      setNodeActive(node2, true);
    } else if (status === 'in_progress') {
      if (statusBadgeEl) {
        statusBadgeEl.textContent = 'Dalam Perjalanan';
        statusBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-900';
      }
      if (progressBar) progressBar.style.width = '50%';
      setNodeActive(node1, false);
      setNodeActive(node2, true);
    } else if (status === 'completed') {
      if (statusBadgeEl) {
        statusBadgeEl.textContent = 'Selesai';
        statusBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900';
      }
      if (progressBar) progressBar.style.width = '100%';
      setNodeActive(node1, false);
      setNodeActive(node2, false);
      setNodeActive(node3, true);
    } else if (status === 'cancelled') {
      if (statusBadgeEl) {
        statusBadgeEl.textContent = 'Dibatalkan';
        statusBadgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
      }
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

    const plateNo = task.vehicle?.vehicle_number || task.vehicle?.license_plate || task.vehicle?.plate_number;
    const modelName = task.vehicle?.model || task.vehicle?.name || 'Armada Operasional';
    const vehicleName = task.vehicle 
      ? (plateNo ? `${plateNo} • ${modelName}` : modelName) 
      : (task.vehicle_id ? 'Armada Ditugaskan' : null);

    // Build Exact Coordinate-First Google Maps URLs
    const buildMapUrl = (lat, lng, address) => {
      if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        return `https://www.google.com/maps/search/?api=1&query=${parseFloat(lat)},${parseFloat(lng)}`;
      }
      if (address) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      }
      return null;
    };

    const originUrl = buildMapUrl(task.origin_lat, task.origin_lng, task.origin_address);
    const destUrl = buildMapUrl(task.destination_lat, task.destination_lng, task.destination_address);

    // Build Turn-by-Turn Navigation URL (Prioritize exact lat/lng)
    let navUrl = null;
    if (task.destination_lat && task.destination_lng) {
      if (task.origin_lat && task.origin_lng) {
        navUrl = `https://www.google.com/maps/dir/?api=1&origin=${parseFloat(task.origin_lat)},${parseFloat(task.origin_lng)}&destination=${parseFloat(task.destination_lat)},${parseFloat(task.destination_lng)}`;
      } else {
        navUrl = `https://www.google.com/maps/dir/?api=1&destination=${parseFloat(task.destination_lat)},${parseFloat(task.destination_lng)}`;
      }
    } else if (task.destination_address) {
      navUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.destination_address)}`;
    }

    const hasOriginCoords = task.origin_lat && task.origin_lng;
    const hasDestCoords = task.destination_lat && task.destination_lng;

    container.innerHTML = `
      <div class="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 space-y-3">
        <h3 class="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="truck" class="w-4 h-4"></i> Rute Pengiriman & Armada
        </h3>

        ${vehicleName ? `
          <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-50 dark:border-blue-900/30 text-xs shadow-xs">
            <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
                <i data-lucide="car" class="w-4 h-4"></i>
              </div>
              <div>
                <p class="text-[9px] font-bold text-slate-400 uppercase">Armada Operasional</p>
                <p class="font-extrabold text-slate-800 dark:text-slate-100">${vehicleName}</p>
              </div>
            </div>
            ${task.start_odometer ? `
              <div class="text-right">
                <p class="text-[9px] font-bold text-slate-400 uppercase">Odo Awal</p>
                <p class="text-xs font-bold text-slate-700 dark:text-slate-300">${Number(task.start_odometer).toLocaleString()} km</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Interactive Origin Coordinate / Location -->
        ${task.origin_address ? `
          <a href="${originUrl || '#'}" target="_blank" class="block p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 active:scale-[0.99] transition-all shadow-xs group">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-50 dark:ring-emerald-950"></div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <p class="text-[9px] font-extrabold text-slate-400 uppercase">Titik Asal / Penjemputan</p>
                    ${hasOriginCoords ? '<span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 py-0.2 rounded font-mono">Pin GPS</span>' : ''}
                  </div>
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors line-clamp-1 mt-0.5">
                    ${task.origin_address}
                  </p>
                  ${hasOriginCoords ? `<p class="text-[10px] font-mono text-slate-400 mt-0.5">${Number(task.origin_lat).toFixed(6)}, ${Number(task.origin_lng).toFixed(6)}</p>` : ''}
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary-600 flex items-center justify-center shrink-0">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </div>
            </div>
          </a>
        ` : ''}

        <!-- Interactive Destination Coordinate / Location -->
        ${task.destination_address ? `
          <a href="${destUrl || '#'}" target="_blank" class="block p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 active:scale-[0.99] transition-all shadow-xs group">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0 ring-4 ring-rose-50 dark:ring-rose-950"></div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <p class="text-[9px] font-extrabold text-slate-400 uppercase">Titik Tujuan / Pengantaran</p>
                    ${hasDestCoords ? '<span class="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1 py-0.2 rounded font-mono">Pin GPS</span>' : ''}
                  </div>
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors line-clamp-1 mt-0.5">
                    ${task.destination_address}
                  </p>
                  ${hasDestCoords ? `<p class="text-[10px] font-mono text-slate-400 mt-0.5">${Number(task.destination_lat).toFixed(6)}, ${Number(task.destination_lng).toFixed(6)}</p>` : ''}
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary-600 flex items-center justify-center shrink-0">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </div>
            </div>
          </a>
        ` : ''}

        <!-- Direct Turn-by-Turn GPS Navigation Button -->
        ${navUrl ? `
          <a href="${navUrl}" target="_blank" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-transform">
            <i data-lucide="navigation" class="w-4 h-4"></i>
            <span>Buka Navigasi Rute (Google Maps)</span>
          </a>
        ` : ''}
      </div>
    `;
  },

  _renderActionButton(status) {
    const actionEl = document.getElementById('task-action');
    if (!actionEl) return;

    if (status === 'pending') {
      actionEl.innerHTML = `
        <div class="space-y-2">
          <button id="btn-accept" class="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] transition-transform">
            <i data-lucide="check" class="w-5 h-5"></i>
            <span>Terima Tugas</span>
          </button>
        </div>
      `;
    } else if (status === 'accepted' || status === 'assigned') {
      actionEl.innerHTML = `
        <div class="space-y-2">
          <button id="btn-start" class="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-transform">
            <i data-lucide="play" class="w-5 h-5"></i>
            <span>Mulai Perjalanan</span>
          </button>
        </div>
      `;
    } else if (status === 'in_progress') {
      actionEl.innerHTML = `
        <div class="space-y-3">
          <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1.5">
            <label for="completion-notes-input" class="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Catatan Penyelesaian <span class="text-[10px] font-normal text-slate-400">(Opsional)</span>
            </label>
            <textarea id="completion-notes-input" class="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows="2" placeholder="Catatan bukti serah terima atau kondisi pengiriman..."></textarea>
          </div>

          <button id="btn-complete" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-transform">
            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
            <span>Selesaikan Tugas</span>
          </button>
        </div>
      `;
    } else if (status === 'completed') {
      actionEl.innerHTML = `
        <div class="py-4 px-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex justify-center items-center gap-2 font-bold text-sm">
          <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600"></i>
          <span>Tugas Telah Selesai Dikerjakan</span>
        </div>
      `;
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
        showToast('Tugas diterima!', 'success');
        
        this._task = res?.data ? res.data : (res?.id ? res : { ...this._task, status: 'accepted' });
        this._renderTask(this._task);
        setLoading(btn, false);
        return;
      } 
      
      if (status === 'accepted') {
        res = await TasksService.startTask(this._taskId);
        showToast('Perjalanan dimulai!', 'success');
        
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

        this._task = res?.data ? res.data : (res?.id ? res : { ...this._task, status: 'completed', completion_notes: notes });
        this._renderTask(this._task);
        setLoading(btn, false);

        setTimeout(() => {
          window.location.href = 'tasks.html';
        }, 1200);
      }
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui tugas', 'error');
      setLoading(btn, false);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => TaskDetailController.init());

export { TaskDetailController };
