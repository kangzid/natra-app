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
