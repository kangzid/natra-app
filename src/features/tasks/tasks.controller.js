/**
 * NATRA Mobile - Tasks Controller
 */

import { TasksService } from './tasks.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, priorityBadge, statusBadge, formatDate, showSkeleton, emptyState } from '../../utils/ui-helpers.js';

const TasksController = {
  _currentFilter: { status: '', priority: '' },

  async init() {
    if (!Auth.requireAuth()) return;
    this._bindFilterEvents();
    await this._loadTasks();
  },

  _bindFilterEvents() {
    document.querySelectorAll('[data-filter-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-status]').forEach((b) => b.classList.remove('filter-active'));
        btn.classList.add('filter-active');
        this._currentFilter.status = btn.dataset.filterStatus;
        this._loadTasks();
      });
    });

    document.querySelectorAll('[data-filter-priority]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-priority]').forEach((b) => b.classList.remove('filter-active'));
        btn.classList.add('filter-active');
        this._currentFilter.priority = btn.dataset.filterPriority;
        this._loadTasks();
      });
    });
  },

  async _loadTasks() {
    const container = document.getElementById('tasks-list');
    if (!container) return;
    showSkeleton('tasks-list', 4);

    try {
      const res = await TasksService.getTasks(this._currentFilter);
      const tasks = res?.data || [];
      const total = res?.total ?? (res?.meta?.total ?? tasks.length);

      const countEl = document.getElementById('tasks-count');
      if (countEl) countEl.textContent = `${total} tugas`;

      if (tasks.length === 0) {
        container.innerHTML = emptyState('Tidak ada tugas ditemukan', `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`);
        return;
      }

      container.innerHTML = tasks.map((task) => this._taskCardHTML(task)).join('');

      // Bind card clicks
      container.querySelectorAll('[data-task-id]').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.dataset.taskId;
          window.location.href = `task-detail.html?id=${id}`;
        });
      });
    } catch (err) {
      container.innerHTML = emptyState('Gagal memuat tugas');
      showToast(err.message || 'Gagal memuat tugas', 'error');
    }
  },

  _taskCardHTML(task) {
    const isUrgent = this._isDueUrgent(task.due_date);
    const borderCls = isUrgent ? 'border-red-200' : 'border-slate-100';
    
    // Convert priority string color block
    const priorityColors = {
      urgent: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-blue-500', low: 'bg-slate-400'
    };
    const pColor = priorityColors[task.priority] || priorityColors.low;

    return `
      <div class="bg-white rounded-2xl mb-4 border ${borderCls} shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] overflow-hidden transition-all active:scale-[0.98] cursor-pointer" data-task-id="${task.id}">
        <div class="h-1 ${pColor} w-full"></div>
        <div class="p-4 relative">
          <!-- Header Meta -->
          <div class="flex justify-between items-start mb-3">
             <div class="flex flex-wrap gap-2">
               ${priorityBadge(task.priority)}
               ${statusBadge(task.status)}
             </div>
          </div>
          
          <h3 class="text-base font-bold text-slate-800 leading-tight mb-2 pr-6">${task.title}</h3>
          ${task.description ? `<p class="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">${task.description}</p>` : '<div class="mb-4"></div>'}
          
          <!-- Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
            <span class="flex items-center gap-1.5 text-xs font-semibold ${isUrgent ? 'text-red-500' : 'text-slate-400'}">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i>
              ${formatDate(task.due_date)}
            </span>
            <div class="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _isDueUrgent(dueDateStr) {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr + 'T23:59:59');
    const diff = due - Date.now();
    return diff < 86400000 && diff >= 0; // less than 24h
  },
};

document.addEventListener('DOMContentLoaded', () => TasksController.init());

export { TasksController };
