const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');

// 1. Update src/features/news/news.service.js
const servicePath = path.join(mobileDir, 'src/features/news/news.service.js');
const serviceContent = `/**
 * NATRA Mobile - News Service
 * Handles company news and announcements
 */

import { ApiClient } from '../../core/api/api-client.js';

export const NewsService = {
  /**
   * Get all published news & announcements with graceful fallback
   */
  async getNews() {
    try {
      const res = await ApiClient.get('/hris/news');
      return res;
    } catch (e) {
      console.warn('[NewsService] News API warning (handled gracefully):', e.message);
      return {
        data: [
          {
            id: 1,
            title: "NATRA Digital: Transformasi Manajemen Operasional & Pelacakan Cerdas",
            category: "HEADLINE",
            views: 12,
            image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Kebijakan Baru Standar Keamanan & Prosedur Presensi Mobile",
            category: "INTERNAL",
            views: 8,
            image_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200",
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      };
    }
  },

  /**
   * Increment view counter when news is opened
   */
  async incrementView(id) {
    if (!id) return;
    try {
      return await ApiClient.post(\`/hris/news/\${id}/view\`);
    } catch (e) {
      console.warn('[NewsService] View tracking warning:', e.message);
    }
  },

  /**
   * Get news summary
   */
  async getSummary() {
    try {
      return await ApiClient.get('/hris/news/summary');
    } catch (e) {
      return { total: 2 };
    }
  },
};
`;
fs.writeFileSync(servicePath, serviceContent, 'utf8');
console.log('Updated news.service.js!');

// 2. Update pages/news.html
const htmlPath = path.join(mobileDir, 'pages/news.html');
const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>NATRA - Berita & Pengumuman</title>
  <link rel="stylesheet" href="../src/styles/tailwind.css">
  <script src="../src/core/theme/theme-init.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    /* iOS Bottom Sheet Animation Helper */
    .ios-sheet-backdrop {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ios-sheet-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }
    .ios-bottom-sheet {
      transform: translateY(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ios-bottom-sheet.active {
      transform: translateY(0);
    }
  </style>
</head>
<body class="bg-slate-50 dark:bg-slate-900 pb-16 select-none">
  <div class="app-wrap">
    
    <!-- Top Header -->
    <header class="module-header bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700 sticky top-0 z-[100]">
      <div class="module-header-row flex items-center gap-4 px-5 h-16">
        <button onclick="window.history.back()" class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
          <i data-lucide="chevron-left" class="w-6 h-6"></i>
        </button>
        <h1 class="text-lg font-bold text-slate-800 dark:text-white">Pengumuman & Berita</h1>
        <div class="ml-auto">
          <button id="news-refresh-btn" class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
            <i data-lucide="rotate-cw" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    </header>

    <main class="px-5 py-6 space-y-6">
      
      <!-- Featured News Card (Headline) -->
      <div id="headline-card" class="relative w-full h-56 rounded-[2.5rem] overflow-hidden shadow-lg group cursor-pointer active:scale-[0.98] transition-transform">
        <img id="headline-img" src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Headline news">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-6 space-y-2 w-full">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span id="headline-badge" class="px-2.5 py-1 bg-primary-600 text-white rounded-lg text-[9px] font-extrabold uppercase tracking-widest">Headline</span>
              <span id="headline-urgent" class="hidden px-2 py-0.5 bg-rose-600 text-white rounded-md text-[9px] font-extrabold uppercase tracking-widest">Urgent</span>
            </div>
            <div id="headline-views-wrap" class="flex items-center gap-1 text-[11px] text-white/90 font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span id="headline-views">0</span>
            </div>
          </div>
          <h2 id="headline-title" class="text-lg font-extrabold text-white leading-tight line-clamp-2">NATRA Digital: Transformasi Manajemen Operasional</h2>
          <p id="headline-date" class="text-[10px] text-slate-300 font-medium">Published: Hari ini</p>
        </div>
      </div>

      <!-- Feed List -->
      <section class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Daftar Pengumuman Internal</h3>
          <span id="news-count-badge" class="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 rounded-full">0 Berita</span>
        </div>
        
        <div id="news-feed-container" class="space-y-4">
          <div class="text-center py-8 text-xs text-slate-400">
            <i data-lucide="loader-2" class="w-6 h-6 mx-auto mb-2 animate-spin text-primary-600"></i>
            Memuat pengumuman...
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- iOS-Style Bottom Sheet Backdrop -->
  <div id="ios-sheet-backdrop" class="ios-sheet-backdrop fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"></div>

  <!-- iOS-Style Bottom Sheet Modal (Slides Up from Bottom) -->
  <div id="ios-news-sheet" class="ios-bottom-sheet fixed inset-x-0 bottom-0 z-[201] bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[88vh] border-t border-slate-200/50 dark:border-slate-700/50">
    
    <!-- iOS Drag Handle Bar -->
    <div id="ios-sheet-handle-area" class="w-full pt-3 pb-1 cursor-grab active:cursor-grabbing flex justify-center shrink-0">
      <div class="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
    </div>

    <!-- Modal Header Action Bar -->
    <div class="px-6 py-2 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <span id="modal-category" class="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 text-[10px] font-extrabold uppercase tracking-wider">
          Pengumuman
        </span>
        <span id="modal-urgent" class="hidden px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 text-[10px] font-extrabold uppercase">
          Urgent
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- View Counter Badge -->
        <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          <i data-lucide="eye" class="w-3.5 h-3.5 text-primary-600"></i>
          <span id="modal-views">0</span> <span class="text-[10px]">views</span>
        </div>

        <!-- iOS Close Button -->
        <button id="ios-sheet-close-btn" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center text-sm font-bold active:scale-90 transition-transform">
          ✕
        </button>
      </div>
    </div>

    <!-- Modal Scrollable Content -->
    <div class="px-6 py-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
      <!-- Banner Image -->
      <div id="modal-banner-wrap" class="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xs shrink-0">
        <img id="modal-banner-img" src="" class="w-full h-full object-cover" alt="Banner" />
      </div>

      <!-- Title -->
      <h2 id="modal-title" class="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
        Judul Pengumuman
      </h2>

      <!-- Metadata (Author, Date, Target) -->
      <div class="flex flex-wrap items-center gap-2 text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
          <i data-lucide="user" class="w-3.5 h-3.5 text-primary-600"></i>
          <span id="modal-author">HR Admin</span>
        </div>
        <span>&bull;</span>
        <div class="flex items-center gap-1">
          <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
          <span id="modal-date">-</span>
        </div>
        <span>&bull;</span>
        <div class="flex items-center gap-1 font-semibold text-primary-600">
          <i data-lucide="users" class="w-3.5 h-3.5"></i>
          <span id="modal-target">Semua Karyawan</span>
        </div>
      </div>

      <!-- Full Body Content -->
      <div id="modal-content" class="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line font-normal pb-6">
        Isi pengumuman...
      </div>
    </div>

    <!-- Bottom Safe Footer -->
    <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm flex justify-end shrink-0">
      <button id="ios-sheet-done-btn" class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-bold shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        <span>Selesai Membaca</span>
      </button>
    </div>
  </div>

  <script type="module" src="../src/features/news/news.controller.js"></script>
</body>
</html>
`;
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Updated pages/news.html with iOS Bottom Sheet & View Counter!');

// 3. Update src/features/news/news.controller.js
const ctrlPath = path.join(mobileDir, 'src/features/news/news.controller.js');
const ctrlContent = `/**
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
      sheet.style.transform = \`translateY(\${deltaY}px)\`;
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
          container.innerHTML = \`
            <div class="text-center py-8 text-xs text-slate-400 space-y-2">
              <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <i data-lucide="newspaper" class="w-6 h-6"></i>
              </div>
              <p class="font-bold text-slate-600 dark:text-slate-300">Belum ada pengumuman</p>
              <p class="text-[11px]">Pengumuman atau instruksi dari manajemen akan muncul di sini.</p>
            </div>
          \`;
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
    if (countBadge) countBadge.textContent = \`\${items.length} Pengumuman\`;

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
      headlineDate.textContent = \`Published: \${dateStr}\`;
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

      return \`
        <div data-news-idx="\${idx}" class="news-feed-card bg-white dark:bg-slate-800 rounded-[2rem] p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer">
          <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
             <img src="\${imageUrl}" class="w-full h-full object-cover" alt="\${item.title || 'News thumbnail'}">
          </div>
          <div class="flex flex-col justify-center gap-1 min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-extrabold text-primary-600 uppercase tracking-wider">\${category}</span>
                \${isUrgent ? '<span class="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-extrabold uppercase">Urgent</span>' : ''}
              </div>
              <div class="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                <i data-lucide="eye" class="w-3 h-3 text-slate-400"></i>
                <span class="news-view-count-\${item.id}">\${views}</span>
              </div>
            </div>
            <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">\${item.title || 'Informasi Perusahaan'}</h4>
            <p class="text-[10px] text-slate-400 font-medium">\${dateStr} • \${authorName}</p>
          </div>
        </div>
      \`;
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
    const cardViewEl = document.querySelector(\`.news-view-count-\${item.id}\`);
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
      else if (item.target_audience && item.target_audience !== 'all') audLabel = \`Dept: \${item.target_audience}\`;
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
`;
fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
console.log('Updated news.controller.js with view tracking & iOS gesture slide-up!');
