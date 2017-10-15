/**
 * NATRA Mobile - UI Helpers (Tailwind CSS Version)
 */

let _toastTimeout = null;

/**
 * iOS Style Dynamic Island / Pill Notification
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('ios-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ios-toast-container';
    container.className = 'ios-toast-container';
    document.body.appendChild(container);
  }

  // Clear existing toast if any
  container.innerHTML = '';

  const pill = document.createElement('div');
  pill.className = 'ios-toast-pill';
  
  const icons = {
    success: '<i data-lucide="check-circle-2" class="text-emerald-400"></i>',
    error: '<i data-lucide="x-circle" class="text-red-400"></i>',
    warning: '<i data-lucide="alert-triangle" class="text-amber-400"></i>',
    info: '<i data-lucide="info" class="text-blue-400"></i>',
  };

  pill.innerHTML = `
    <div class="ios-toast-icon">${icons[type] || icons.info}</div>
    <div class="ios-toast-message">${message}</div>
  `;
  
  container.appendChild(pill);
  if (window.lucide) window.lucide.createIcons({ root: pill });

  // Trigger animation
  requestAnimationFrame(() => {
    pill.classList.add('active');
  });

  if (_toastTimeout) clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => {
    pill.classList.remove('active');
    setTimeout(() => pill.remove(), 400);
  }, duration);
}

/**
 * iOS Style Alert Dialog (OK only)
 */
export function showAlert(title, message, btnText = 'OK') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'ios-alert-overlay';
    
    overlay.innerHTML = `
      <div class="ios-alert">
        <div class="ios-alert-body">
          <div class="ios-alert-title">${title}</div>
          <div class="ios-alert-message">${message}</div>
        </div>
        <div class="ios-alert-btns">
          <button class="ios-alert-btn ios-alert-btn-bold" id="ios-alert-ok">${btnText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 10);

    overlay.querySelector('#ios-alert-ok').onclick = () => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 250);
    };
  });
}

/**
 * iOS Style Confirmation Dialog (Cancel / OK)
 */
export function showConfirm(title, message, options = {}) {
  const { 
    okText = 'OK', 
    cancelText = 'Cancel', 
    isDestructive = false 
  } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'ios-alert-overlay';
    
    overlay.innerHTML = `
      <div class="ios-alert">
        <div class="ios-alert-body">
          <div class="ios-alert-title">${title}</div>
          <div class="ios-alert-message">${message}</div>
        </div>
        <div class="ios-alert-btns">
          <button class="ios-alert-btn" id="ios-alert-cancel">${cancelText}</button>
          <button class="ios-alert-btn ios-alert-btn-bold ${isDestructive ? 'ios-alert-btn-danger' : ''}" id="ios-alert-ok">${okText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 10);

    const close = (result) => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 250);
    };

    overlay.querySelector('#ios-alert-cancel').onclick = () => close(false);
    overlay.querySelector('#ios-alert-ok').onclick = () => close(true);
  });
}

/**
 * iOS Style Action Sheet (Bottom Menu)
 */
export function showActionSheet(actions = [], title = null) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'ios-modal-overlay';
    
    let actionsHtml = actions.map((action, index) => `
      <button class="ios-action-btn ${action.isDestructive ? 'ios-action-btn-danger' : ''}" data-index="${index}">
        ${action.icon ? `<i data-lucide="${action.icon}" class="w-5 h-5"></i>` : ''}
        ${action.label}
      </button>
    `).join('');

    overlay.innerHTML = `
      <div class="ios-bottom-sheet">
        <div class="ios-sheet-handle"></div>
        ${title ? `<div class="text-center mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">${title}</div>` : ''}
        <div class="ios-action-list">
          ${actionsHtml}
          <button class="ios-action-btn ios-action-btn-cancel" id="btn-cancel-sheet">Batal</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) window.lucide.createIcons({ root: overlay });

    setTimeout(() => overlay.classList.add('active'), 10);

    const close = (result = null) => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        if (result !== null) resolve(result);
      }, 300);
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    overlay.querySelector('#btn-cancel-sheet').onclick = () => close();

    overlay.querySelectorAll('.ios-action-btn[data-index]').forEach(btn => {
      btn.onclick = () => {
        const index = parseInt(btn.dataset.index);
        close(index);
        if (actions[index].onClick) actions[index].onClick();
      };
    });
  });
}

export function setLoading(btn, loading, loadingText = 'Loading...', originalText = null) {
  if (!btn) return;
  if (loading) {
    btn._originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<div class="flex items-center justify-center gap-2"><div class="spinner-circle border-t-white"></div><span>${loadingText}</span></div>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = originalText || btn._originalText || loadingText;
  }
}

export function formatTime(timeStr) {
  if (!timeStr) return '-';
  return timeStr.substring(0, 5);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  // Ambil hanya bagian YYYY-MM-DD jika ada spasi/waktu
  const cleanDate = dateStr.split(' ')[0];
  const d = new Date(cleanDate + 'T00:00:00');
  
  if (isNaN(d.getTime())) return dateStr; // Fallback jika tetap gagal
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
}

export function priorityBadge(priority) {
  const map = {
    low: { label: 'Rendah', cls: 'ios-priority-low' },
    medium: { label: 'Sedang', cls: 'ios-priority-medium' },
    high: { label: 'Tinggi', cls: 'ios-priority-high' },
    urgent: { label: 'Urgent', cls: 'ios-priority-urgent' },
  };
  const p = map[priority] || map.low;
  return `<span class="ios-priority-pill ${p.cls}">${p.label}</span>`;
}

export function statusBadge(status) {
  const map = {
    pending: { label: 'Pending', bg: 'bg-slate-100 text-slate-500' },
    accepted: { label: 'Diterima', bg: 'bg-blue-50 text-blue-600' },
    in_progress: { label: 'Progres', bg: 'bg-amber-50 text-amber-600' },
    completed: { label: 'Selesai', bg: 'bg-emerald-50 text-emerald-600' },
    present: { label: 'Hadir', bg: 'bg-emerald-50 text-emerald-600' },
    late: { label: 'Terlambat', bg: 'bg-amber-50 text-amber-600' },
    absent: { label: 'Absen', bg: 'bg-red-50 text-red-600' },
  };
  const s = map[status] || map.pending;
  return `<span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-black/5 ${s.bg}">${s.label}</span>`;
}

export function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? '-';
}

export function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

export function showkeleton(containerId, count = 3) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Array.from({ length: count }, () => `
    <div class="bg-white border border-slate-100 rounded-2xl p-4 animate-pulse">
      <div class="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
      <div class="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div class="h-3 bg-slate-200 rounded w-1/3"></div>
    </div>
  `).join('');
}
// kept old name just in case
export const showSkeleton = showkeleton;

export function emptyState(message = 'Tidak ada data', icon = 'layout-list') {
  const iconHtml = icon.includes('<svg') 
    ? icon 
    : `<i data-lucide="${icon}" class="w-8 h-8 text-slate-300"></i>`;
    
  return `
    <div class="flex flex-col items-center justify-center p-8 text-center text-slate-400">
      <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
        ${iconHtml}
      </div>
      <p class="text-sm font-medium">${message}</p>
    </div>
  `;
}

/**
 * --- Pull to Refresh Logic ---
 */

/**
 * Initialize Pull to Refresh on a container
 * @param {string|HTMLElement} target Container element or ID
 * @param {Function} onRefresh Callback when refresh is triggered
 */
export function initPullToRefresh(target, onRefresh) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;

  // Add PTR structure if not exists
  const ptrId = `ptr-${typeof target === 'string' ? target : 'global'}`;
  let ptr = document.getElementById(ptrId);
  
  if (!ptr) {
    ptr = document.createElement('div');
    ptr.id = ptrId;
    ptr.className = 'ptr-element';
    ptr.innerHTML = `
      <div class="ptr-icon">
        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
      </div>
    `;
    document.body.appendChild(ptr);
    if (window.lucide) window.lucide.createIcons({ root: ptr });
  }

  let startY = 0;
  let currentY = 0;
  let isPulling = false;
  const threshold = 80; // Distance to trigger refresh

  el.addEventListener('touchstart', (e) => {
    // Only pull if we are at the top
    if (window.scrollY > 0) return;
    startY = e.touches[0].pageY;
    ptr.classList.remove('ptr-refreshing');
    ptr.classList.remove('ptr-transition');
  }, { passive: true });

  el.addEventListener('touchmove', (e) => {
    if (window.scrollY > 0) return;
    
    currentY = e.touches[0].pageY;
    const diff = currentY - startY;

    if (diff > 0) {
      isPulling = true;
      const pullDistance = Math.min(diff * 0.35, threshold);
      
      // Update opacity and icon rotation only
      // Icon is fixed at top, so it stays put while content moves
      ptr.style.opacity = Math.min(pullDistance / (threshold * 0.7), 1);
      
      const rotate = Math.min(pullDistance * 4, 340);
      const icon = ptr.querySelector('.ptr-icon');
      if (icon) icon.style.transform = `rotate(${rotate}deg)`;

      if (pullDistance >= threshold - 10) {
        ptr.classList.add('ptr-over');
      } else {
        ptr.classList.remove('ptr-over');
      }
    }
  }, { passive: true });

  el.addEventListener('touchend', async () => {
    if (!isPulling) return;
    isPulling = false;
    
    const diff = currentY - startY;
    
    if (diff * 0.35 >= threshold - 10) {
      // Trigger update
      ptr.classList.add('ptr-refreshing');
      ptr.classList.add('ptr-transition');
      ptr.style.opacity = '1';
      
      if (onRefresh) await onRefresh();
      
      // Reset
      setTimeout(() => {
        ptr.classList.remove('ptr-refreshing', 'ptr-over');
        ptr.style.opacity = '0';
      }, 500);
    } else {
      // Snap back
      ptr.classList.add('ptr-transition');
      ptr.style.opacity = '0';
    }
  });
}

// Add CSS for PTR dynamically
const style = document.createElement('style');
style.textContent = `
  .ptr-element {
    position: fixed;
    top: 15px; /* Fixed small distance from top */
    left: 0;
    right: 0;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10; /* Lower layer */
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .ptr-element.ptr-transition {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s;
  }
  .ptr-refreshing, .ptr-over {
    opacity: 1;
  }
  .ptr-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8; /* slate-400 */
    transition: color 0.3s ease;
  }
  .ptr-over .ptr-icon {
    color: #64748b; /* slate-500 */
  }
  .ptr-refreshing .ptr-icon {
    color: #3b82f6; /* blue-500 */
  }
  .ptr-refreshing .ptr-icon i {
    animation: ptr-spin 0.8s linear infinite;
  }
  @keyframes ptr-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
