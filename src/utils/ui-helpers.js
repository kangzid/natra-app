/**
 * NATRA Mobile - UI Helpers (Tailwind CSS Version)
 */

let _toastTimeout = null;

export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 inset-x-4 z-50 flex flex-col items-center gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  
  const typeMap = {
    success: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '<i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>' },
    error: { bg: 'bg-red-50 text-red-800 border-red-200', icon: '<i data-lucide="x-circle" class="w-5 h-5 text-red-500"></i>' },
    warning: { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: '<i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>' },
    info: { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: '<i data-lucide="info" class="w-5 h-5 text-blue-500"></i>' },
  };

  const style = typeMap[type] || typeMap.info;

  toast.className = `flex items-center gap-3 w-full max-w-sm p-4 rounded-2xl shadow-lg border ${style.bg} transition-all duration-300 transform -translate-y-4 opacity-0`;
  toast.innerHTML = `<div class="shrink-0">${style.icon}</div><div class="text-sm font-medium leading-tight">${message}</div>`;
  
  container.appendChild(toast);
  
  if (window.lucide) window.lucide.createIcons({ root: toast });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove('-translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('-translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
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
    low: { label: 'Rendah', bg: 'bg-slate-100 text-slate-700' },
    medium: { label: 'Sedang', bg: 'bg-blue-100 text-blue-700' },
    high: { label: 'Tinggi', bg: 'bg-amber-100 text-amber-700' },
    urgent: { label: 'Urgent', bg: 'bg-red-100 text-red-700' },
  };
  const p = map[priority] || map.low;
  return `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.bg}">${p.label}</span>`;
}

export function statusBadge(status) {
  const map = {
    pending: { label: 'Pending', bg: 'bg-slate-100 text-slate-700' },
    accepted: { label: 'Diterima', bg: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'Dikerjakan', bg: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Selesai', bg: 'bg-emerald-100 text-emerald-700' },
    present: { label: 'Hadir', bg: 'bg-emerald-100 text-emerald-700' },
    late: { label: 'Terlambat', bg: 'bg-amber-100 text-amber-700' },
    absent: { label: 'Absen', bg: 'bg-red-100 text-red-700' },
  };
  const s = map[status] || map.pending;
  return `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg}">${s.label}</span>`;
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
