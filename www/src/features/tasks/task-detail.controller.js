/**
 * NATRA Mobile - Task Detail Controller
 * Handles accept / start / complete task flows
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

    await this._loadTask();
    this._bindEvents();
  },

  async _loadTask() {
    const loadingEl = document.getElementById('task-loading');
    const contentEl = document.getElementById('task-content');
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');

    try {
      const res = await TasksService.getTaskById(this._taskId);
      this._task = res?.data ? res.data : (res?.id ? res : null);
      this._renderTask(this._task);
      if (contentEl) contentEl.classList.remove('hidden');
    } catch (err) {
      showToast(err.message || 'Gagal memuat detail tugas', 'error');
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  },

  _renderTask(task) {
    if (!task) return;
    setText('task-title', task.title);
    setText('task-description', task.description || 'Tidak ada deskripsi');
    setText('task-due', formatDate(task.due_date));
    setHTML('task-priority', priorityBadge(task.priority));
    setHTML('task-status', statusBadge(task.status));

    if (task.completion_notes) {
      setText('completion-notes', task.completion_notes);
      const notesEl = document.getElementById('completion-section');
      if (notesEl) notesEl.classList.remove('hidden');
    }

    this._renderActionButton(task.status);
  },

  _renderActionButton(status) {
    const actionEl = document.getElementById('task-action');
    if (!actionEl) return;

    const actions = {
      pending: { label: 'Terima Tugas', id: 'btn-accept', cls: 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/30 shadow-lg', icon: '<i data-lucide="check" class="w-5 h-5"></i>' },
      accepted: { label: 'Mulai Tugas', id: 'btn-start', cls: 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30 shadow-lg', icon: '<i data-lucide="play" class="w-5 h-5"></i>' },
      in_progress: { label: 'Selesaikan Tugas', id: 'btn-complete', cls: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30 shadow-lg', icon: '<i data-lucide="check-circle-2" class="w-5 h-5"></i>' },
      completed: null,
    };

    const action = actions[status];
    if (!action) {
      actionEl.innerHTML = '<div class="py-4 px-6 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex justify-center items-center gap-2 font-bold"><i data-lucide="check-circle-2" class="w-5 h-5"></i> Tugas Selesai</div>';
      window.lucide?.createIcons({ root: actionEl });
      return;
    }

    actionEl.innerHTML = `
      ${status === 'in_progress' ? `
        <div class="mb-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
          <label class="block text-sm font-bold text-slate-700 mb-2">Catatan Penyelesaian <span class="text-xs font-normal text-slate-400">opsional</span></label>
          <textarea id="completion-notes-input" class="form-input text-sm" rows="3" placeholder="Tulis catatan penyelesaian..."></textarea>
        </div>
      ` : ''}
      <button id="${action.id}" class="btn w-full text-lg ${action.cls} flex justify-center gap-2">
        ${action.icon} ${action.label}
      </button>
    `;

    window.lucide?.createIcons({ root: actionEl });

    document.getElementById(action.id)?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      this._handleAction(status, btn);
    });
  },

  _bindEvents() {
    document.getElementById('back-btn')?.addEventListener('click', () => history.back());
  },

  async _handleAction(status, btn) {
    setLoading(btn, true, 'Memproses...');
    try {
      let res;
      if (status === 'pending') {
        res = await TasksService.acceptTask(this._taskId);
        showToast('Tugas berhasil diterima!', 'success');
      } else if (status === 'accepted') {
        res = await TasksService.startTask(this._taskId);
        showToast('Tugas dimulai!', 'success');
      } else if (status === 'in_progress') {
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
      }

      // Redirect to tasks list
      setTimeout(() => {
        window.location.href = 'tasks.html';
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui tugas', 'error');
      setLoading(btn, false);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => TaskDetailController.init());

export { TaskDetailController };
