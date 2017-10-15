/**
 * NATRA Mobile - Notification Controller
 */

import { NotificationService } from './notification.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, setLoading, timeAgo, showSkeleton, emptyState, setText, initPullToRefresh, showConfirm, showActionSheet } from '../../utils/ui-helpers.js';
import { Cache } from '../../utils/cache.js';

const NotificationController = {
  _page: 1,
  _hasMore: true,

  async init() {
    if (!Auth.requireAuth()) return;

    // SWR Pattern: Load from cache
    const cachedNotifs = Cache.get('notif_list');
    if (cachedNotifs) {
      this._renderNotifications(cachedNotifs, true);
      // Hide skeleton immediately if we have cache
      const container = document.getElementById('notif-list');
      if (container) container.classList.remove('hidden');
    }

    await this._loadNotifications();
    this._bindEvents();

    // Pull to Refresh
    initPullToRefresh('main-content', () => this._loadNotifications(true));
  },

  async _loadNotifications(reset = true, forceSkeleton = false) {
    const container = document.getElementById('notif-list');
    if (!container) return;

    if (reset) {
      this._page = 1;
      // Show skeleton if explicitly requested or NO cache exists
      if (forceSkeleton || !Cache.get('notif_list')) {
        showSkeleton('notif-list', 5);
      }
    }

    try {
      const res = await NotificationService.getAll(this._page);
      const items = res?.data || [];
      const meta = res?.meta;

      this._hasMore = meta ? this._page < meta.last_page : false;

      const loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) {
        const loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) loadMoreContainer.classList.toggle('hidden', !this._hasMore);
        loadMoreBtn.classList.toggle('hidden', !this._hasMore);
      }

      // Save to cache (3-min TTL as requested) on first page reset
      if (reset) {
        Cache.set('notif_list', items, 3);
      }

      this._renderNotifications(items, reset);

      // Update unread count
      this._updateUnreadBadge();
    } catch (err) {
      if (reset && !Cache.get('notif_list')) {
        container.innerHTML = emptyState('Gagal memuat notifikasi');
      }
      showToast(err.message || 'Gagal memuat notifikasi', 'error');
    }
  },

  _renderNotifications(items, reset = true) {
    const container = document.getElementById('notif-list');
    if (!container) return;

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

    // Re-initialize icons for dynamic content
    if (window.lucide) window.lucide.createIcons({ root: container });

    // Bind read and swipe events
    container.querySelectorAll('[data-swipe-card]:not([data-bound])').forEach((item) => {
      const card = item.querySelector('.notif-card-ios');
      item.dataset.bound = '1';
      
      // Handle Click (Mark as Read)
      card.addEventListener('click', (e) => {
        // If they click while it's swiped, it might be an accident or deliberate
        // We'll close swipe if it's open
        if (card.style.transform && card.style.transform !== 'translateX(0px)') {
          this._closeAllSwipes();
          return;
        }
        this._markRead(card, card.dataset.notifId);
      });

      // Handle Swipe Delete Button
      item.querySelector('.notif-swipe-reveal button')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this._deleteNotif(card, card.dataset.notifId);
      });

      // Initialize Gestures
      this._initSwipe(item);
    });
  },

  _closeAllSwipes() {
    document.querySelectorAll('.notif-card-ios').forEach(c => {
      c.style.transform = 'translateX(0px)';
    });
  },

  _initSwipe(item) {
    const card = item.querySelector('.notif-card-ios');
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    const revealWidth = 80;

    item.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
      card.style.transition = 'none';
      isSwiping = true;
      
      // Close other swipes if needed
      document.querySelectorAll('.notif-card-ios').forEach(c => {
        if (c !== card && c.style.transform && c.style.transform !== 'translateX(0px)') {
          c.style.transition = 'transform 0.3s ease';
          c.style.transform = 'translateX(0px)';
        }
      });
    }, { passive: true });

    item.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].pageX;
      const diff = currentX - startX;

      // Only swipe left
      if (diff < 0) {
        // Resistance (rubber-banding)
        const translateX = Math.max(diff, -revealWidth - 20);
        card.style.transform = `translateX(${translateX}px)`;
      } else if (diff > 0 && card.style.transform !== 'translateX(0px)') {
        // Allow swiping back to close
        const currentTranslate = parseInt(card.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
        const translateX = Math.min(0, currentTranslate + diff * 0.5);
        card.style.transform = `translateX(${translateX}px)`;
      }
    }, { passive: true });

    item.addEventListener('touchend', (e) => {
      isSwiping = false;
      card.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      
      const diff = currentX - startX;
      if (diff < -revealWidth / 2) {
        card.style.transform = `translateX(-${revealWidth}px)`;
      } else {
        card.style.transform = 'translateX(0px)';
      }
    });
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
      <div class="notif-swipe-item" data-swipe-card="1">
        <div class="notif-swipe-reveal">
          <button type="button" class="swipe-delete-btn">
            <i data-lucide="trash-2" class="w-6 h-6"></i>
          </button>
        </div>
        
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
    try {
      await NotificationService.markAllRead();
      showToast('Semua notifikasi ditandai dibaca', 'success');
      await this._loadNotifications();
    } catch (err) {
      showToast(err.message || 'Gagal menandai notifikasi', 'error');
    }
  },

  async _deleteNotif(card, id) {
    const confirmed = await showConfirm(
      'Hapus Notifikasi',
      'Apakah Anda yakin ingin menghapus notifikasi ini?',
      { okText: 'Hapus', cancelText: 'Batal', isDestructive: true }
    );

    if (!confirmed) {
      // Snap back if canceled
      card.style.transform = 'translateX(0px)';
      return;
    }
    
    try {
      // Optimistic UI: Hide card first
      card.style.opacity = '0.5';
      card.style.pointerEvents = 'none';
      
      await NotificationService.delete(id);
      
      // Animate out (fade and slide up)
      const container = card.closest('.notif-swipe-item');
      container.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      container.style.opacity = '0';
      container.style.transform = 'translateX(-100%)';
      container.style.marginTop = `-${container.offsetHeight}px`;
      
      setTimeout(() => {
        container.remove();
        this._updateUnreadBadge();
        // If empty, show empty state
        const listContainer = document.getElementById('notif-list');
        if (listContainer && listContainer.children.length === 0) {
          this._loadNotifications(true);
        }
      }, 400);
      
    } catch (err) {
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
      showToast('Gagal menghapus notifikasi', 'error');
    }
  },

  async _clearAll() {
    const confirmed = await showConfirm(
      'Hapus Semua',
      'Hapus semua notifikasi? Tindakan ini tidak dapat dibatalkan.',
      { okText: 'Hapus Semua', cancelText: 'Batal', isDestructive: true }
    );

    if (!confirmed) return;
    
    try {
      await NotificationService.deleteAll();
      showToast('Semua notifikasi dihapus', 'success');
      await this._loadNotifications(true);
    } catch (err) {
      showToast('Gagal menghapus semua notifikasi', 'error');
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
    document.getElementById('notif-menu-btn')?.addEventListener('click', () => {
      showActionSheet([
        { 
          label: 'Tandai Semua Dibaca', 
          icon: 'check-check',
          onClick: () => this._markAllRead() 
        },
        { 
          label: 'Hapus Semua Notifikasi', 
          icon: 'trash-2', 
          isDestructive: true,
          onClick: () => this._clearAll() 
        }
      ], 'Pilihan Notifikasi');
    });

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
