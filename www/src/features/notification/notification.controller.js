/**
 * NATRA Mobile - Notification Controller
 */

import { NotificationService } from './notification.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, setLoading, timeAgo, showSkeleton, emptyState, setText } from '../../utils/ui-helpers.js';

const NotificationController = {
  _page: 1,
  _hasMore: true,

  async init() {
    if (!Auth.requireAuth()) return;
    await this._loadNotifications();
    this._bindEvents();
  },

  async _loadNotifications(reset = true) {
    const container = document.getElementById('notif-list');
    if (!container) return;

    if (reset) {
      this._page = 1;
      showSkeleton('notif-list', 5);
    }

    try {
      const res = await NotificationService.getAll(this._page);
      const items = res?.data || [];
      const meta = res?.meta;

      this._hasMore = meta ? this._page < meta.last_page : false;

      const loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) loadMoreBtn.classList.toggle('hidden', !this._hasMore);

      if (reset && items.length === 0) {
        container.innerHTML = emptyState('Tidak ada notifikasi', `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`);
        return;
      }

      const html = items.map((n) => this._notifCardHTML(n)).join('');
      if (reset) {
        container.innerHTML = html;
      } else {
        container.insertAdjacentHTML('beforeend', html);
      }

      // Bind read events
      container.querySelectorAll('[data-notif-id]:not([data-bound])').forEach((card) => {
        card.dataset.bound = '1';
        card.addEventListener('click', () => this._markRead(card, card.dataset.notifId));
      });

      // Update unread count
      this._updateUnreadBadge();
    } catch (err) {
      if (reset) container.innerHTML = emptyState('Gagal memuat notifikasi');
      showToast(err.message || 'Gagal memuat notifikasi', 'error');
    }
  },

  _notifCardHTML(notif) {
    const isUnread = !notif.is_read;
    const cardCls = isUnread ? 'notif-card-ios unread' : 'notif-card-ios';
    
    // Icon mapping logic optimized
    const titleLower = notif.title.toLowerCase();
    let iconName = 'bell';
    let iconColor = 'text-primary-500';
    let iconBg = 'bg-primary-50';

    if (titleLower.includes('absen')) {
      iconName = 'fingerprint';
      iconColor = 'text-emerald-500';
      iconBg = 'bg-emerald-50';
    } else if (titleLower.includes('tugas')) {
      iconName = 'clipboard-list';
      iconColor = 'text-amber-500';
      iconBg = 'bg-amber-50';
    }

    return `
      <div class="${cardCls} cursor-pointer" 
           data-notif-id="${notif.id}" 
           data-is-read="${notif.is_read}">
        
        <div class="flex flex-col items-center gap-1">
          <div class="notif-icon-ios ${iconBg} ${iconColor}">
            <i data-lucide="${iconName}" class="w-5 h-5"></i>
          </div>
          ${isUnread ? '<div class="notif-dot-ios"></div>' : '<div class="w-2 h-2"></div>'}
        </div>

        <div class="flex-1 min-w-0 pr-2">
          <div class="flex justify-between items-start mb-0.5">
            <h3 class="text-[15px] font-extrabold text-slate-900 truncate leading-tight">${notif.title}</h3>
            <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
              ${timeAgo(notif.created_at)}
            </span>
          </div>
          <p class="text-[13px] text-slate-500 leading-snug font-medium line-clamp-2">${notif.message}</p>
        </div>
      </div>
    `;
  },

  async _markRead(card, id) {
    if (card.classList.contains('is-read')) return;
    try {
      await NotificationService.markRead(id);
      card.classList.remove('notif-unread');
      card.classList.add('is-read');
      const dot = card.querySelector('.notif-dot');
      if (dot) dot.remove();
      this._updateUnreadBadge();
    } catch { /* fail silently */ }
  },

  async _markAllRead() {
    const btn = document.getElementById('mark-all-btn');
    setLoading(btn, true, 'Menandai...');
    try {
      await NotificationService.markAllRead();
      showToast('Semua notifikasi ditandai dibaca', 'success');
      await this._loadNotifications();
    } catch (err) {
      showToast(err.message || 'Gagal menandai notifikasi', 'error');
    } finally {
      setLoading(btn, false, 'Tandai Semua Dibaca');
    }
  },

  async _updateUnreadBadge() {
    try {
      const res = await NotificationService.getUnread();
      const count = res?.count ?? (Array.isArray(res) ? res.length : (Array.isArray(res?.data) ? res.data.length : 0));
      setText('unread-count-text', count > 0 ? `${count} belum dibaca` : 'Semua sudah dibaca');
      const badge = document.getElementById('notif-nav-badge');
      if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
      }
    } catch { /* ignore */ }
  },

  _bindEvents() {
    document.getElementById('mark-all-btn')?.addEventListener('click', () => this._markAllRead());

    document.getElementById('load-more-btn')?.addEventListener('click', async (e) => {
      this._page++;
      setLoading(e.currentTarget, true, 'Memuat...');
      await this._loadNotifications(false);
      setLoading(e.currentTarget, false, 'Muat Lebih Banyak');
    });
  },
};

document.addEventListener('DOMContentLoaded', () => NotificationController.init());

export { NotificationController };
