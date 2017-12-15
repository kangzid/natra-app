/**
 * NATRA Mobile - News Controller
 * Handles UI logic, iOS Bottom Sheet slide-up transition, real-time view tracking, and encrypted banners.
 */

import { NewsService } from './news.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast } from '../../utils/ui-helpers.js';

class NewsController {
  constructor() {
    this.newsItems = [];
    this.isSheetOpen = false;
    this.init();
  }

  async init() {
    Auth.requireAuth();
    if (window.lucide) window.lucide.createIcons();

    this.setupEventListeners();
    await this.loadData();
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById('news-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        showToast('Memperbarui pengumuman...', 'info');
        await this.loadData();
      });
    }

    // iOS Sheet controls
    const backdrop = document.getElementById('ios-sheet-backdrop');
    const closeBtn = document.getElementById('ios-sheet-close-btn');
    const doneBtn = document.getElementById('ios-sheet-done-btn');

    if (backdrop) backdrop.addEventListener('click', () => this.closeDetail());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDetail());
    if (doneBtn) doneBtn.addEventListener('click', () => this.closeDetail());

    // Swipe down gesture to close on mobile
    this.setupTouchGestures();

    // Headline card click
    const headlineCard = document.getElementById('headline-card');
    if (headlineCard) {
      headlineCard.addEventListener('click', () => {
        if (this.newsItems.length > 0) {
          this.openDetail(this.newsItems[0]);
        }
      });
    }
  }

  setupTouchGestures() {
    const sheet = document.getElementById('ios-news-sheet');
    const handle = document.getElementById('ios-sheet-handle-area');
    if (!sheet || !handle) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    handle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
      sheet.style.transition = 'none';
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = Math.max(0, currentY - startY);
      sheet.style.transform = `translateY(${deltaY}px)`;
    }, { passive: true });

    handle.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      sheet.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      const deltaY = currentY - startY;
      if (deltaY > 100) {
        this.closeDetail();
      } else {
        sheet.style.transform = 'translateY(0)';
      }
    });
  }

  async loadData() {
    const container = document.getElementById('news-feed-container');
    try {
      const res = await NewsService.getNews();
      const items = Array.isArray(res) ? res : (res?.data || []);
      this.newsItems = items;

      if (items.length > 0) {
        this.renderNews(items);
      } else {
        if (container) {
          container.innerHTML = `
            <div class="text-center py-8 text-xs text-slate-400 space-y-2">
              <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <i data-lucide="newspaper" class="w-6 h-6"></i>
              </div>
              <p class="font-bold text-slate-600 dark:text-slate-300">Belum ada pengumuman</p>
              <p class="text-[11px]">Pengumuman atau instruksi dari manajemen akan muncul di sini.</p>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    } catch (e) {
      console.warn('[NewsController] Error loading news:', e.message);
    }
  }

  renderNews(items) {
    if (!Array.isArray(items) || items.length === 0) return;

    const countBadge = document.getElementById('news-count-badge');
    if (countBadge) countBadge.textContent = `${items.length} Pengumuman`;

    // 1. Render Headline Card (First Item)
    const headline = items[0];
    const headlineImg = document.getElementById('headline-img');
    const headlineBadge = document.getElementById('headline-badge');
    const headlineUrgent = document.getElementById('headline-urgent');
    const headlineTitle = document.getElementById('headline-title');
    const headlineDate = document.getElementById('headline-date');
    const headlineViews = document.getElementById('headline-views');

    const defaultHeadlineBanner = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600';
    const bannerSrc = headline.banner_base64 || headline.banner_url || headline.image_url || defaultHeadlineBanner;

    if (headlineImg) headlineImg.src = bannerSrc;
    if (headlineBadge) headlineBadge.textContent = headline.category || 'PENGUMUMAN';
    if (headlineTitle) headlineTitle.textContent = headline.title || 'Informasi Perusahaan';
    if (headlineViews) headlineViews.textContent = (headline.views || 0).toLocaleString();
    
    if (headlineUrgent) {
      if (headline.priority === 'urgent') {
        headlineUrgent.classList.remove('hidden');
      } else {
        headlineUrgent.classList.add('hidden');
      }
    }

    if (headlineDate) {
      const dateStr = (headline.published_at || headline.created_at) 
        ? new Date(headline.published_at || headline.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : 'Terbaru';
      headlineDate.textContent = `Published: ${dateStr}`;
    }

    // 2. Render Feed Items
    const container = document.getElementById('news-feed-container');
    if (!container) return;

    const defaultFeedBanner = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200';

    container.innerHTML = items.map((item, idx) => {
      const imageUrl = item.banner_base64 || item.banner_url || item.image_url || defaultFeedBanner;
      const category = item.category || 'PENGUMUMAN';
      const dateStr = (item.published_at || item.created_at) 
        ? new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) 
        : 'Terbaru';
      const authorName = item.author?.name || 'Manajemen NATRA';
      const isUrgent = item.priority === 'urgent';
      const views = (item.views || 0).toLocaleString();

      return `
        <div data-news-idx="${idx}" class="news-feed-card bg-white dark:bg-slate-800 rounded-[2rem] p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer">
          <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
             <img src="${imageUrl}" class="w-full h-full object-cover" alt="${item.title || 'News thumbnail'}">
          </div>
          <div class="flex flex-col justify-center gap-1 min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-extrabold text-primary-600 uppercase tracking-wider">${category}</span>
                ${isUrgent ? '<span class="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-extrabold uppercase">Urgent</span>' : ''}
              </div>
              <div class="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                <i data-lucide="eye" class="w-3 h-3 text-slate-400"></i>
                <span class="news-view-count-${item.id}">${views}</span>
              </div>
            </div>
            <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">${item.title || 'Informasi Perusahaan'}</h4>
            <p class="text-[10px] text-slate-400 font-medium">${dateStr} • ${authorName}</p>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to feed cards
    container.querySelectorAll('.news-feed-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-news-idx') || '0', 10);
        if (items[idx]) {
          this.openDetail(items[idx]);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  openDetail(item) {
    if (!item) return;

    // 1. Immediately increment local view counter for snappy feedback
    item.views = (item.views || 0) + 1;

    // Update views on card and headline in real-time
    const cardViewEl = document.querySelector(`.news-view-count-${item.id}`);
    if (cardViewEl) cardViewEl.textContent = item.views.toLocaleString();

    if (this.newsItems[0]?.id === item.id) {
      const headlineViews = document.getElementById('headline-views');
      if (headlineViews) headlineViews.textContent = item.views.toLocaleString();
    }

    // 2. Send increment to backend API
    NewsService.incrementView(item.id);

    // 3. Fill iOS Bottom Sheet
    const backdrop = document.getElementById('ios-sheet-backdrop');
    const sheet = document.getElementById('ios-news-sheet');
    const bannerImg = document.getElementById('modal-banner-img');
    const bannerWrap = document.getElementById('modal-banner-wrap');
    const category = document.getElementById('modal-category');
    const urgent = document.getElementById('modal-urgent');
    const views = document.getElementById('modal-views');
    const date = document.getElementById('modal-date');
    const title = document.getElementById('modal-title');
    const author = document.getElementById('modal-author');
    const target = document.getElementById('modal-target');
    const content = document.getElementById('modal-content');

    const bannerSrc = item.banner_base64 || item.banner_url || item.image_url;
    if (bannerSrc && bannerImg && bannerWrap) {
      bannerImg.src = bannerSrc;
      bannerWrap.classList.remove('hidden');
    } else if (bannerWrap) {
      bannerWrap.classList.add('hidden');
    }

    if (category) category.textContent = item.category || 'Pengumuman';
    if (urgent) {
      if (item.priority === 'urgent') urgent.classList.remove('hidden');
      else urgent.classList.add('hidden');
    }
    if (views) views.textContent = item.views.toLocaleString();

    if (date) {
      const dateStr = (item.published_at || item.created_at) 
        ? new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : '-';
      date.textContent = dateStr;
    }
    if (title) title.textContent = item.title || 'Pengumuman';
    if (author) author.textContent = item.author?.name || 'HR Admin';
    if (target) {
      let audLabel = 'Semua Karyawan';
      if (item.target_audience === 'drivers_only') audLabel = 'Khusus Driver';
      else if (item.target_audience === 'staff_only') audLabel = 'Khusus Staf';
      else if (item.target_audience && item.target_audience !== 'all') audLabel = `Dept: ${item.target_audience}`;
      target.textContent = audLabel;
    }
    if (content) content.textContent = item.content || 'Tidak ada rincian konten.';

    if (window.lucide) window.lucide.createIcons();

    // 4. Trigger iOS Bottom Sheet Slide-Up Transition
    if (backdrop && sheet) {
      sheet.style.transform = '';
      sheet.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      backdrop.classList.add('active');
      sheet.classList.add('active');
      this.isSheetOpen = true;
    }
  }

  closeDetail() {
    const backdrop = document.getElementById('ios-sheet-backdrop');
    const sheet = document.getElementById('ios-news-sheet');
    if (backdrop && sheet) {
      backdrop.classList.remove('active');
      sheet.classList.remove('active');
      this.isSheetOpen = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NewsController();
});

export { NewsController };
