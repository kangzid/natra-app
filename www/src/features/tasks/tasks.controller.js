/**
 * NATRA Mobile - Tasks Controller
 */

import { TasksService } from './tasks.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, priorityBadge, statusBadge, formatDate, showSkeleton, emptyState, initPullToRefresh, showConfirm } from '../../utils/ui-helpers.js';
import { Cache } from '../../utils/cache.js';

const TasksController = {
  _currentFilter: { status: '', priority: '' },

  async init() {
    if (!Auth.requireAuth()) return;
    this._bindFilterEvents();

    // SWR Pattern: Load from cache
    const cachedTasks = Cache.get('tasks_list');
    if (cachedTasks) {
      this._renderTasks(cachedTasks);
      // Hide skeleton if we have cache
      const container = document.getElementById('tasks-list');
      if (container) container.classList.remove('hidden');
    }

    await this._loadTasks();
    
    // Pull to Refresh
    initPullToRefresh('tasks-list', () => this._loadTasks());
  },

  _bindFilterEvents() {
    document.querySelectorAll('[data-filter-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-status]').forEach((b) => b.classList.remove('filter-active'));
        btn.classList.add('filter-active');
        this._currentFilter.status = btn.dataset.filterStatus;
        this._loadTasks(true);
      });
    });

    document.querySelectorAll('[data-filter-priority]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-priority]').forEach((b) => b.classList.remove('filter-active'));
        btn.classList.add('filter-active');
        this._currentFilter.priority = btn.dataset.filterPriority;
        this._loadTasks(true);
      });
    });
  },

  async _loadTasks(forceSkeleton = false) {
    const container = document.getElementById('tasks-list');
    if (!container) return;
    
    // Show skeleton if explicitly requested (e.g. filter change) or NO cache exists
    if (forceSkeleton || !Cache.get('tasks_list')) {
      showSkeleton('tasks-list', 4);
    }

    try {
      const res = await TasksService.getTasks(this._currentFilter);
      const tasks = res?.data || [];
      const total = res?.total ?? (res?.meta?.total ?? tasks.length);

      const countEl = document.getElementById('tasks-count');
      if (countEl) countEl.textContent = `${total} tugas`;

      // Save to cache (3-min TTL as requested)
      if (!this._currentFilter.status && !this._currentFilter.priority) {
        Cache.set('tasks_list', tasks, 3);
      }

      this._renderTasks(tasks);
    } catch (err) {
      if (!Cache.get('tasks_list')) {
        container.innerHTML = emptyState('Gagal memuat tugas');
        showToast(err.message || 'Gagal memuat tugas', 'error');
      }
    }
  },

  _renderTasks(tasks) {
    const container = document.getElementById('tasks-list');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = emptyState('Tidak ada tugas ditemukan', `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`);
      return;
    }

    container.innerHTML = tasks.map((task) => this._taskCardHTML(task)).join('');

    // Bind card clicks (excluding the reveal area)
    container.querySelectorAll('.task-card-ios').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Prevent click if clicking the delete button or if card is swiped
        if (e.target.closest('.notif-swipe-reveal')) return;
        
        const id = card.dataset.taskId;
        window.location.href = `task-detail.html?id=${id}`;
      });
    });

    // Initialize swipe for tasks that can be hidden
    this._initSwipe();
  },

  _taskCardHTML(task) {
    const isUrgent = this._isDueUrgent(task.due_date);
    const canHide = ['completed', 'cancelled'].includes(task.status);
    
    const cardContent = `
      <div class="task-card-ios" data-task-id="${task.id}">
        <div class="flex justify-between items-start mb-3">
          <div class="flex flex-wrap gap-2">
            ${priorityBadge(task.priority)}
            ${statusBadge(task.status)}
          </div>
        </div>
        
        <h3 class="ios-task-title">${task.title}</h3>
        
        ${task.description ? `<p class="text-[13px] text-slate-500 line-clamp-2 mb-4 leading-snug font-medium">${task.description}</p>` : '<div class="mb-4"></div>'}
        
        <div class="flex items-center justify-between pt-3 border-t border-slate-50">
          <div class="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest ${isUrgent ? 'text-red-500' : 'text-primary-500'}">
            <div class="w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-primary-500'} animate-pulse"></div>
            <span>${isUrgent ? 'Segera Berakhir' : 'Tenggat'}</span>
          </div>
          <span class="text-[11px] font-extrabold text-slate-400">
            ${formatDate(task.due_date)}
          </span>
        </div>
      </div>
    `;

    if (canHide) {
      return `
        <div class="notif-swipe-item mb-4 rounded-2xl" data-task-id="${task.id}">
          ${cardContent}
        </div>
      `;
    }

    return `<div class="mb-4">${cardContent}</div>`;
  },

  _initSwipe() {
    const items = document.querySelectorAll('.notif-swipe-item');
    let activeItem = null;

    items.forEach(item => {
      const card = item.querySelector('.task-card-ios');
      const hideBtn = item.querySelector('.task-hide-btn');
      let startX = 0;
      let currentX = 0;
      let isSwiping = false;
      const revealWidth = 100;

      item.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        card.style.transition = 'none';
        
        // Close other active items
        if (activeItem && activeItem !== item) {
          this._closeItem(activeItem);
        }
      }, { passive: true });

      item.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].pageX;
        const diff = currentX - startX;

        // Visual feedback only (limit move)
        if (diff < 0) {
          isSwiping = true;
          const translate = Math.max(diff, -50);
          card.style.transform = `translateX(${translate}px)`;
        }
      }, { passive: true });

      item.addEventListener('touchend', async () => {
        if (!isSwiping) return;
        isSwiping = false;
        
        card.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        const diff = currentX - startX;

        // If swiped significantly, trigger confirmation
        if (diff < -50) {
          const confirmed = await showConfirm('Hapus Tugas', 'Sembunyikan tugas ini dari daftar Anda? Admin tetap dapat melihat tugas ini.', {
            okText: 'Hapus',
            cancelText: 'Batal',
            isDestructive: true
          });

          if (confirmed) {
            this._hideTask(item.dataset.taskId, item);
          } else {
            this._closeItem(item);
          }
        } else {
          this._closeItem(item);
        }
      });
    });

    // Re-init icons for dynamic buttons
    if (window.lucide) window.lucide.createIcons();
  },

  _closeItem(item) {
    const card = item.querySelector('.task-card-ios');
    if (card) {
      card.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'translateX(0)';
    }
  },

  async _hideTask(id, container) {
    try {
      // Optimistic UI
      container.style.transition = 'all 0.5s ease';
      container.style.opacity = '0';
      container.style.transform = 'scale(0.95)';
      
      await TasksService.hideTask(id);
      
      // Clear cache to ensure refresh gets new list
      Cache.remove('tasks_list');
      
      setTimeout(() => {
        container.remove();
        // If list empty, reload to show empty state
        const list = document.getElementById('tasks-list');
        if (list && list.children.length === 0) {
          this._loadTasks(true);
        }
      }, 500);
      
      showToast('Tugas disembunyikan', 'success');
    } catch (err) {
      container.style.opacity = '1';
      container.style.transform = 'scale(1)';
      showToast(err.message || 'Gagal menyembunyikan tugas', 'error');
    }
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
