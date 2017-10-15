/**
 * NATRA Mobile - Attendance Controller
 */

import { AttendanceService } from './attendance.service.js';
import { GpsController } from '../gps/gps.controller.js';
import { GpsService } from '../gps/gps.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, setLoading, setText, formatTime, formatDate, statusBadge, showSkeleton, emptyState } from '../../utils/ui-helpers.js';

const AttendanceController = {
  _todayData: null,
  _map: null,
  _marker: null,
  _circle: null,

  async init() {
    if (!Auth.requireAuth()) return;
    this._initMap();
    await this._loadToday();
    await this._loadMonthly();
    this._bindEvents();
  },

  _initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || !window.L) return;
    
    // Clear loading text FIRST before initializing
    mapEl.innerHTML = '';
    
    // Default to Jakarta
    this._map = L.map('map', { zoomControl: false }).setView([-6.200000, 106.816666], 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(this._map);
  },

  async _loadToday() {
    try {
      const res = await AttendanceService.getToday();
      this._todayData = Array.isArray(res) ? res[0] : (res?.data || (res?.id ? res : null));
      this._renderTodayCard(this._todayData);
    } catch (err) {
      showToast('Gagal memuat data absensi hari ini', 'error');
    }
  },

  _renderTodayCard(data) {
    const hasCheckin = !!data?.check_in;
    const hasCheckout = !!data?.check_out;

    // Update button
    const btn = document.getElementById('attendance-btn');
    const btnLabel = document.getElementById('btn-label');
    const btnSub = document.getElementById('btn-sub');

    if (btn && btnLabel) {
      const baseClasses = ['relative', 'group', 'w-40', 'h-40', 'rounded-full', 'flex', 'flex-col', 'items-center', 'justify-center', 'transition-all', 'border-4', 'shadow-inner'];
      
      // Reset classes first
      btn.className = '';
      btn.classList.add(...baseClasses);

      const btnIcon = document.getElementById('btn-icon');
      const curvedText = document.getElementById('completed-curved-text');

      if (!hasCheckin) {
        btn.classList.add('bg-primary-500', 'text-white', 'border-primary-100', 'shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)]');
        btnLabel.textContent = 'Absen Masuk';
        if (btnSub) btnSub.textContent = 'Tap Sekarang';
        if (curvedText) curvedText.classList.add('hidden');
      } else if (!hasCheckout) {
        btn.classList.add('bg-amber-500', 'text-white', 'border-amber-100', 'shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)]');
        btnLabel.textContent = 'Absen Keluar';
        if (btnSub) btnSub.textContent = 'Tap Selesai';
        if (curvedText) curvedText.classList.add('hidden');
      } else {
        btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-100', 'shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)]', 'cursor-not-allowed');
        
        // Hide standard center text and icon
        if (btnLabel) btnLabel.classList.add('hidden');
        if (btnSub) btnSub.classList.add('hidden');
        if (btnIcon) btnIcon.classList.add('hidden');
        
        // Add a giant check inside
        if (!document.getElementById('done-check-icon')) {
          btn.insertAdjacentHTML('beforeend', '<i data-lucide="check" id="done-check-icon" class="w-16 h-16 text-white/50 relative z-10"></i>');
          window.lucide?.createIcons({ root: btn });
        }
        
        // Show curved text
        if (curvedText) curvedText.classList.remove('hidden');
        
        btn.disabled = true;
      }
    }

    // Info row
    setText('today-checkin', data?.check_in ? formatTime(data.check_in) : '--:--');
    setText('today-checkout', data?.check_out ? formatTime(data.check_out) : '--:--');

    // Status badge
    const statusEl = document.getElementById('today-status');
    if (statusEl) {
      statusEl.innerHTML = data?.status ? statusBadge(data.status) : '<span class="badge badge-gray">Belum Absen</span>';
    }

    // Attempt initial map ping
    this._checkLocationStatus();
  },

  _updateMapMarker(lat, lng, withinRadius) {
    if (!this._map) return;
    
    this._map.setView([lat, lng], 16);
    
    const iconColor = withinRadius ? '#10b981' : '#f43f5e';
    
    const svgIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<svg width="36" height="36" viewBox="0 0 24 24" fill="${iconColor}" stroke="#fff" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#fff"></circle></svg>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });

    if (this._marker) this._map.removeLayer(this._marker);
    if (this._circle) this._map.removeLayer(this._circle);
    
    this._marker = L.marker([lat, lng], { icon: svgIcon }).addTo(this._map);
    this._circle = L.circle([lat, lng], { radius: 50, color: iconColor, fillColor: iconColor, fillOpacity: 0.15 }).addTo(this._map);
  },

  async _checkLocationStatus() {
    const locEl = document.getElementById('location-status');
    if (locEl) locEl.textContent = 'Memeriksa lokasi...';
    try {
      const coords = await GpsService.getCurrentPosition();
      const res = await AttendanceService.checkLocation(coords.latitude, coords.longitude);
      const within = res?.is_within_radius;
      
      this._updateMapMarker(coords.latitude, coords.longitude, within);
      
      if (locEl) {
        locEl.innerHTML = within
          ? `<span class="text-emerald-600">✓ Dalam radius kantor (${Math.round(res.distance_meters || 0)}m)</span>`
          : `<span class="text-red-500">✗ Di luar radius kantor (${Math.round(res.distance_meters || 0)}m)</span>`;
      }
    } catch (err) {
      if (locEl) locEl.textContent = 'Tidak dapat mendeteksi lokasi';
      console.warn('[AttendanceController] Check location failed:', err.message);
    }
  },

  async _updateManualLocation() {
    const btn = document.getElementById('update-loc-btn');
    const locEl = document.getElementById('location-status');
    
    if (btn) btn.disabled = true;
    if (locEl) locEl.innerHTML = '<span class="animate-pulse">Memperbarui posisi...</span>';
    
    try {
      const coords = await GpsService.getCurrentPosition();
      const res = await AttendanceService.checkLocation(coords.latitude, coords.longitude);
      const within = res?.is_within_radius;
      
      this._updateMapMarker(coords.latitude, coords.longitude, within);
      
      showToast('Titik Lokasi diperbarui', 'success');
      
      if (locEl) {
        locEl.innerHTML = within
          ? `<span class="text-emerald-600">✓ Dalam radius kantor (${Math.round(res.distance_meters || 0)}m)</span>`
          : `<span class="text-red-500">✗ Di luar radius kantor (${Math.round(res.distance_meters || 0)}m)</span>`;
      }
    } catch (err) {
      if (locEl) locEl.textContent = 'Gagal memperbarui titik';
      showToast(err.message || 'Gagal memuat GPS', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  async _loadMonthly() {
    try {
      const container = document.getElementById('history-list');
      if (container) showSkeleton('history-list', 3);

      const res = await AttendanceService.getMonthly();
      const records = Array.isArray(res) ? res : (res?.data || []);

      let present = 0, late = 0, absent = 0;
      records.forEach(r => {
        if (r.status === 'present') present++;
        else if (r.status === 'late') late++;
        else if (r.status === 'absent') absent++;
      });

      const now = new Date();
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      setText('monthly-present', present);
      setText('monthly-late', late);
      setText('monthly-absent', absent);
      setText('monthly-period', `${monthNames[now.getMonth()]} ${now.getFullYear()}`);

      this._renderCalendar(records, now);
    } catch {
      // fail silently
    }
  },

  _renderCalendar(records, date) {
    const container = document.getElementById('history-list');
    if (!container) return;

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    let html = `<div class="grid grid-cols-7 gap-2 text-center text-[11px]">`;
    
    daysOfWeek.forEach(d => {
      html += `<div class="font-bold text-slate-400 pb-1">${d}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div></div>`;
    }

    const recordMap = {};
    records.forEach(r => {
      if (r.date) {
        const dObj = new Date(r.date);
        const y = dObj.getFullYear();
        const m = String(dObj.getMonth() + 1).padStart(2, '0');
        const d = String(dObj.getDate()).padStart(2, '0');
        recordMap[`${y}-${m}-${d}`] = r;
      }
    });

    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const rec = recordMap[dStr];

      let baseClasses = 'aspect-square rounded-xl flex flex-col items-center justify-center relative font-bold text-xs border';
      let stateClasses = 'bg-white text-slate-600 border-slate-100 shadow-sm';

      if (rec) {
        if (rec.status === 'present') { stateClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'; }
        else if (rec.status === 'late') { stateClasses = 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'; }
        else if (rec.status === 'absent') { stateClasses = 'bg-red-50 text-red-700 border-red-200 shadow-sm'; }
      }

      const isToday = i === new Date().getDate() && month === new Date().getMonth();
      if (isToday) stateClasses += ' ring-2 ring-primary-500 ring-offset-2';

      html += `
        <div class="${baseClasses} ${stateClasses}">
          ${i}
          ${rec && rec.check_in ? `<span class="text-[8px] font-medium opacity-80 mt-0.5">${rec.check_in.substring(0,5)}</span>` : ''}
        </div>
      `;
    }
    
    html += `</div>`;
    html += `
      <div class="flex flex-wrap justify-center gap-4 mt-6 text-[10px] text-slate-500 font-semibold">
        <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-sm bg-emerald-50 border border-emerald-200"></div> Hadir</div>
        <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-sm bg-amber-50 border border-amber-200"></div> Telat</div>
        <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-sm bg-red-50 border border-red-200"></div> Absen</div>
      </div>
    `;

    container.innerHTML = html;
  },

  _bindEvents() {
    const btn = document.getElementById('attendance-btn');
    if (btn) {
      btn.addEventListener('click', () => this._handleAttendance(btn));
    }
    
    // Bind Map Update Location Button
    const mapBtn = document.getElementById('update-loc-btn');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => this._updateManualLocation());
    }
  },

  async _handleAttendance(btn) {
    const hasCheckin = !!this._todayData?.check_in;
    const hasCheckout = !!this._todayData?.check_out;

    if (hasCheckin && hasCheckout) return; // done

    setLoading(btn, true, 'Memproses...');

    try {
      const coords = await GpsService.getCurrentPosition();
      let res;

      if (!hasCheckin) {
        res = await AttendanceService.checkIn(coords.latitude, coords.longitude);
        showToast('Check-in berhasil! ✓', 'success');
        GpsController.startTracking(); // Start GPS on check-in
      } else {
        res = await AttendanceService.checkOut(coords.latitude, coords.longitude);
        showToast('Check-out berhasil! ✓', 'success');
        GpsController.stopTracking(); // Stop GPS on check-out
      }

      this._todayData = res?.attendance || null;
      // Handle wrapped responses based on API changes
      if (!this._todayData && res?.id) this._todayData = res;
      else if (Array.isArray(res)) this._todayData = res[0];

      this._renderTodayCard(this._todayData);
      await this._loadMonthly();
    } catch (err) {
      showToast(err.message || 'Gagal melakukan absensi', 'error');
    } finally {
      setLoading(btn, false);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => AttendanceController.init());

export { AttendanceController };
