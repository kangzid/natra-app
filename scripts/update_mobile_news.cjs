const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const newsHtmlPath = path.join(mobileDir, 'pages/news.html');
const newsCtrlPath = path.join(mobileDir, 'src/features/news/news.controller.js');

const newHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>NATRA - Berita & Pengumuman</title>
  <link rel="stylesheet" href="../src/styles/tailwind.css">
  <script src="../src/core/theme/theme-init.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-50 dark:bg-slate-900 pb-12">
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
      <div id="headline-card" class="relative w-full h-56 rounded-[2.5rem] overflow-hidden shadow-lg group cursor-pointer active:scale-[0.99] transition-transform">
        <img id="headline-img" src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Headline news">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-6 space-y-2">
          <div class="flex items-center gap-2">
            <span id="headline-badge" class="px-2.5 py-1 bg-primary-600 text-white rounded-lg text-[9px] font-extrabold uppercase tracking-widest">Headline</span>
            <span id="headline-urgent" class="hidden px-2 py-0.5 bg-rose-600 text-white rounded-md text-[9px] font-extrabold uppercase tracking-widest">Urgent</span>
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

  <!-- Modal Baca Berita Lengkap -->
  <div id="news-detail-modal" class="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-800 rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
      <div id="modal-banner-wrap" class="w-full h-48 bg-slate-100 dark:bg-slate-700 relative shrink-0">
        <img id="modal-banner-img" src="" class="w-full h-full object-cover" alt="Banner" />
        <button id="modal-close-btn-top" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm active:scale-90 transition-transform">
          ✕
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-4 flex-1">
        <div class="flex items-center justify-between gap-2">
          <span id="modal-category" class="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 text-[10px] font-extrabold uppercase tracking-wider">
            Pengumuman
          </span>
          <span id="modal-date" class="text-xs text-slate-400 font-medium">-</span>
        </div>

        <h2 id="modal-title" class="text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
          Judul Pengumuman
        </h2>

        <div class="flex items-center gap-2 text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-700">
          <span>Oleh: <strong id="modal-author" class="text-slate-700 dark:text-slate-300">HR Admin</strong></span>
          &bull;
          <span id="modal-target">Target: <strong>Semua</strong></span>
        </div>

        <div id="modal-content" class="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
          Isi pengumuman...
        </div>
      </div>

      <div class="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end shrink-0">
        <button id="modal-close-btn" class="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform">
          Tutup
        </button>
      </div>
    </div>
  </div>

  <script type="module" src="../src/features/news/news.controller.js"></script>
</body>
</html>
`;

const newCtrlContent = `/**
 * NATRA Mobile - News Controller
 * Handles UI logic, encrypted banners, and full modal view for company news & announcements.
 */

import { NewsService } from './news.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast } from '../../utils/ui-helpers.js';

class NewsController {
  constructor() {
    this.newsItems = [];
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

    const modal = document.getElementById('news-detail-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const closeBtnTop = document.getElementById('modal-close-btn-top');

    const closeModal = () => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnTop) closeBtnTop.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    const headlineCard = document.getElementById('headline-card');
    if (headlineCard) {
      headlineCard.addEventListener('click', () => {
        if (this.newsItems.length > 0) {
          this.openDetail(this.newsItems[0]);
        }
      });
    }
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

    const defaultHeadlineBanner = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600';
    const bannerSrc = headline.banner_base64 || headline.banner_url || headline.image_url || defaultHeadlineBanner;

    if (headlineImg) headlineImg.src = bannerSrc;
    if (headlineBadge) headlineBadge.textContent = headline.category || 'PENGUMUMAN';
    if (headlineTitle) headlineTitle.textContent = headline.title || 'Informasi Perusahaan';
    
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

      return \`
        <div data-news-idx="\${idx}" class="news-feed-card bg-white dark:bg-slate-800 rounded-[2rem] p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer">
          <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
             <img src="\${imageUrl}" class="w-full h-full object-cover" alt="\${item.title || 'News thumbnail'}">
          </div>
          <div class="flex flex-col justify-center gap-1 min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-extrabold text-primary-600 uppercase tracking-wider">\${category}</span>
              \${isUrgent ? '<span class="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-extrabold uppercase">Urgent</span>' : ''}
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

    const modal = document.getElementById('news-detail-modal');
    const bannerImg = document.getElementById('modal-banner-img');
    const bannerWrap = document.getElementById('modal-banner-wrap');
    const category = document.getElementById('modal-category');
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
      target.textContent = \`Target: \${audLabel}\`;
    }
    if (content) content.textContent = item.content || 'Tidak ada rincian konten.';

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NewsController();
});

export { NewsController };
`;

fs.writeFileSync(newsHtmlPath, newHtmlContent, 'utf8');
fs.writeFileSync(newsCtrlPath, newCtrlContent, 'utf8');
console.log('Successfully updated mobile news.html and news.controller.js!');
