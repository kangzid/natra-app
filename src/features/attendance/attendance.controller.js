/**
 * NATRA Mobile - Attendance Controller
 */

import { AttendanceService } from './attendance.service.js';
import { GpsController } from '../gps/gps.controller.js';
import { GpsService } from '../gps/gps.service.js';
import { Auth } from '../../core/auth/auth.js';
import { showToast, showAlert, setLoading, setText, formatTime, formatDate, statusBadge, showSkeleton, emptyState, initPullToRefresh } from '../../utils/ui-helpers.js';
import { Cache } from '../../utils/cache.js';

const AttendanceController = {
  _todayData: null,
  _todaySchedule: null,
  _todayWindow: null,
  _map: null,
  _marker: null,
  _circle: null,
  _monthlyRecords: [],

  async init() {
    if (!Auth.requireAuth()) return;
    this._initMap();

    // SWR Pattern: Load from cache
    const cachedToday = Cache.get('att_today');
    const cachedSchedule = Cache.get('att_schedule');
    const cachedMonthly = Cache.get('att_monthly');

    if (cachedToday) {
      this._todayData = cachedToday;
      this._todaySchedule = cachedSchedule || null;
      this._renderTodayCard(cachedToday, this._todaySchedule);
      
      const loadingEl = document.getElementById('today-schedule-loading');
      const contentEl = document.getElementById('today-schedule-content');
      if (loadingEl) loadingEl.classList.add('hidden');
      if (contentEl) contentEl.classList.remove('hidden');
    }

    if (cachedMonthly) {
      this._monthlyRecords = cachedMonthly;
      this._renderMonthlySummary(cachedMonthly);
      this._renderCalendar(cachedMonthly, new Date());
      
      const cachedWeekly = Cache.get('att_weekly_roster');
      const cachedMonthLabel = Cache.get('att_month_label');
      if (cachedWeekly) {
        this._renderWeeklyShift(cachedWeekly, cachedMonthLabel);
      }
      
      const weeklyLoadEl = document.getElementById('weekly-shift-loading');
      const weeklyContentEl = document.getElementById('weekly-shift-content');
      if (weeklyLoadEl) weeklyLoadEl.classList.add('hidden');
      if (weeklyContentEl) weeklyContentEl.classList.remove('hidden');
    }

    await Promise.all([
      this._loadToday(),
      this._loadMonthly()
    ]);
    
    this._bindEvents();
  },

  _initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || !window.L) return;
    
    mapEl.innerHTML = '';
    
    // Default coordinates
    this._map = L.map('map', { zoomControl: false }).setView([-6.200000, 106.816666], 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(this._map);
  },

  async _loadToday() {
    const loadingEl = document.getElementById('today-schedule-loading');
    const contentEl = document.getElementById('today-schedule-content');
    const weeklyLoadEl = document.getElementById('weekly-shift-loading');
    const weeklyContentEl = document.getElementById('weekly-shift-content');

    const hasCache = !!Cache.get('att_today');
    if (loadingEl && !hasCache) loadingEl.classList.remove('hidden');
    if (contentEl && !hasCache) contentEl.classList.add('hidden');
    if (weeklyLoadEl && !hasCache) weeklyLoadEl.classList.remove('hidden');
    if (weeklyContentEl && !hasCache) weeklyContentEl.classList.remove('hidden');

    try {
      const res = await AttendanceService.getToday();
      this._todayData = res?.attendance || (res?.id ? res : null);
      this._todaySchedule = res?.schedule || null;
      this._todayWindow = {
        can_check_in: res?.can_check_in,
        can_check_out: res?.can_check_out,
        window_status: res?.window_status,
        window_message: res?.window_message,
      };
      
      const weeklyRoster = res?.weekly_roster || null;
      const monthLabel = res?.current_month_label || null;

      // Save to cache
      Cache.set('att_today', this._todayData, 3);
      if (this._todaySchedule) Cache.set('att_schedule', this._todaySchedule, 3);
      if (weeklyRoster) Cache.set('att_weekly_roster', weeklyRoster, 3);
      if (monthLabel) Cache.set('att_month_label', monthLabel, 3);

      this._renderTodayCard(this._todayData, this._todaySchedule, this._todayWindow);
      this._renderWeeklyShift(weeklyRoster, monthLabel);

      if (loadingEl) loadingEl.classList.add('hidden');
      if (contentEl) contentEl.classList.remove('hidden');
      if (weeklyLoadEl) weeklyLoadEl.classList.add('hidden');
      if (weeklyContentEl) weeklyContentEl.classList.remove('hidden');
    } catch (err) {
      if (!Cache.get('att_today')) {
        showToast('Gagal memuat data absensi hari ini', 'error');
      }
      if (loadingEl) loadingEl.classList.add('hidden');
      if (contentEl) contentEl.classList.remove('hidden');
      if (weeklyLoadEl) weeklyLoadEl.classList.add('hidden');
      if (weeklyContentEl) weeklyContentEl.classList.remove('hidden');
    }
  },

  _renderTodayCard(data, schedule, windowInfo) {
    const hasCheckin = !!data?.check_in;
    const hasCheckout = !!data?.check_out;
    const isSpecialLeave = ['sakit', 'cuti', 'izin', 'dinas'].includes(data?.status);

    // Update schedule badge on top
    const scheduleContent = document.getElementById('today-schedule-content') || document.getElementById('schedule-content');
    if (scheduleContent && schedule) {
      const isOff = !!schedule.is_day_off || schedule.shift_code === 'OFF' || (schedule.shift_name || '').toLowerCase().includes('libur');
      const scheduleLabel = isOff
        ? 'Hari Libur Kerja (Day-Off)'
        : (schedule.is_shift && schedule.shift_name)
          ? `${schedule.shift_name} (${schedule.work_start_time?.substring(0, 5)} - ${schedule.work_end_time?.substring(0, 5)} WIB)`
          : `Jadwal Reguler (${schedule.work_start_time?.substring(0, 5) || '08:00'} - ${schedule.work_end_time?.substring(0, 5) || '17:00'} WIB)`;
      
      const labelP = scheduleContent.querySelector('p');
      if (labelP) {
        const badgeColor = isOff ? '#64748b' : (schedule.color || '#3b82f6');
        labelP.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style="background-color: ${badgeColor}15; color: ${badgeColor}">${scheduleLabel}</span>`;
      }
    }

    // Info row: show actual time if done, else target schedule time
    if (hasCheckin) {
      setText('today-checkin', formatTime(data.check_in));
    } else {
      setText('today-checkin', schedule?.work_start_time || (schedule?.is_day_off ? 'Libur' : '--:--'));
    }

    if (hasCheckout) {
      setText('today-checkout', formatTime(data.check_out));
    } else {
      setText('today-checkout', schedule?.work_end_time || (schedule?.is_day_off ? 'Libur' : '--:--'));
    }

    // Update main action button
    const btn = document.getElementById('attendance-btn');
    const btnLabel = document.getElementById('btn-label');
    const btnSub = document.getElementById('btn-sub');
    const btnIcon = document.getElementById('btn-icon');
    const curvedText = document.getElementById('completed-curved-text');

    if (btn && btnLabel) {
      const baseClasses = ['relative', 'group', 'w-40', 'h-40', 'rounded-full', 'flex', 'flex-col', 'items-center', 'justify-center', 'transition-all', 'border-4'];
      
      btn.className = '';
      btn.classList.add(...baseClasses);
      btn.disabled = false;

      if (btnLabel) btnLabel.classList.remove('hidden');
      if (btnSub) btnSub.classList.remove('hidden');
      if (btnIcon) btnIcon.classList.remove('hidden');
      if (curvedText) curvedText.classList.add('hidden');

      const doneCheck = document.getElementById('done-check-icon');
      if (doneCheck) doneCheck.remove();

      if (isSpecialLeave) {
        let specialBg = 'bg-rose-500 border-rose-100';
        let specialLabel = 'Izin Sakit';
        if (data.status === 'cuti') {
          specialBg = 'bg-purple-500 border-purple-100';
          specialLabel = 'Cuti';
        } else if (data.status === 'izin') {
          specialBg = 'bg-sky-500 border-sky-100';
          specialLabel = 'Izin Absen';
        } else if (data.status === 'dinas') {
          specialBg = 'bg-indigo-500 border-indigo-100';
          specialLabel = 'Dinas Luar';
        }

        btn.classList.add(...specialBg.split(' '), 'text-white', 'cursor-default');
        btnLabel.textContent = specialLabel;
        if (btnSub) btnSub.textContent = 'Izin Disetujui';
        btn.disabled = true;
      } else if (!hasCheckin) {
        // Not checked in yet
        const status = windowInfo?.window_status;

        if (status === 'day_off' || schedule?.is_day_off) {
          btn.classList.add('bg-slate-700', 'text-white', 'border-slate-500', 'active:scale-95');
          btnLabel.textContent = 'Hari Libur';
          if (btnSub) btnSub.textContent = 'Tap Jika Masuk';
          btn.disabled = false;
        } else if (status === 'too_early') {
          btn.classList.add('bg-slate-100', 'text-slate-400', 'border-slate-200', 'cursor-not-allowed');
          btnLabel.textContent = 'Belum Buka';
          if (btnSub) btnSub.textContent = `Buka ${schedule?.check_in_start || '07:00'} WIB`;
          btn.disabled = true;
        } else if (status === 'locked_late') {
          btn.classList.add('bg-rose-50', 'text-rose-500', 'border-rose-200');
          btnLabel.textContent = 'Waktu Lewat';
          if (btnSub) btnSub.textContent = 'Hubungi HRD';
          btn.disabled = false; // allow click to show clear alert
        } else {
          // Normal or late allowed
          btn.classList.add('bg-primary-600', 'text-white', 'border-primary-200', 'active:scale-95');
          btnLabel.textContent = 'Absen Masuk';
          if (btnSub) btnSub.textContent = status === 'late' ? 'Terlambat' : 'Tap Sekarang';
          btn.disabled = false;
        }
      } else if (!hasCheckout) {
        // Checked in, waiting for checkout
        const status = windowInfo?.window_status;

        if (status === 'checked_in_waiting_checkout') {
          btn.classList.add('bg-amber-500/90', 'text-white', 'border-amber-200', 'active:scale-95');
          btnLabel.textContent = 'Belum Pulang';
          if (btnSub) btnSub.textContent = `Pulang ${schedule?.work_end_time || '17:00'}`;
          btn.disabled = false; // allow click to show alert if early checkout prohibited
        } else {
          btn.classList.add('bg-amber-500', 'text-white', 'border-amber-200', 'active:scale-95');
          btnLabel.textContent = 'Absen Keluar';
          if (btnSub) btnSub.textContent = 'Tap Selesai';
          btn.disabled = false;
        }
      } else {
        // Both check in & check out completed
        btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-200', 'cursor-default');
        
        if (btnLabel) btnLabel.classList.add('hidden');
        if (btnSub) btnSub.classList.add('hidden');
        if (btnIcon) btnIcon.classList.add('hidden');
        
        btn.insertAdjacentHTML('beforeend', '<i data-lucide="check" id="done-check-icon" class="w-16 h-16 text-white/90 relative z-10"></i>');
        window.lucide?.createIcons({ root: btn });
        
        if (curvedText) curvedText.classList.remove('hidden');
        btn.disabled = true;
      }
    }

    // Status badge
    const statusEl = document.getElementById('today-status');
    if (statusEl) {
      if (data?.status) {
        statusEl.innerHTML = statusBadge(data.status);
      } else if (schedule?.is_day_off) {
        statusEl.innerHTML = '<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Libur Kerja</span>';
      } else {
        statusEl.innerHTML = '<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500">Belum Absen</span>';
      }
    }

    // Ping map location
    this._checkLocationStatus();
  },

  _renderWeeklyShift(weeklyRoster, monthLabel) {
    const weeklyContentEl = document.getElementById('weekly-shift-content');
    if (!weeklyContentEl) return;

    if (monthLabel) {
      setText('weekly-shift-month', monthLabel);
    }

    // If weeklyRoster is available from backend
    if (Array.isArray(weeklyRoster) && weeklyRoster.length > 0) {
      let html = '';
      weeklyRoster.forEach((d) => {
        const isOff = !!d.is_day_off || (d.shift_name || '').toLowerCase().includes('libur') || d.shift_code === 'OFF';
        const cleanName = isOff ? 'Libur' : (d.shift_name || 'Reguler').replace(/\s*\(.*\)/, '').replace(/Shift\s+/i, '');
        const isNight = !isOff && (!!d.is_night_shift || cleanName.toLowerCase().includes('malam'));
        
        let iconName = 'sun';
        let iconColor = 'text-amber-500';
        if (isOff) {
          iconName = 'coffee';
          iconColor = 'text-slate-400';
        } else if (isNight) {
          iconName = 'moon';
          iconColor = 'text-blue-500';
        }

        if (d.is_today) {
          const bgClass = isOff ? 'bg-slate-700 text-white border-slate-600' : 'bg-primary-600 text-white border-primary-500';
          html += `
            <div class="flex-shrink-0 w-[76px] py-3.5 rounded-2xl ${bgClass} flex flex-col items-center border relative cursor-pointer active:scale-95 transition-all shadow-sm"
              onclick="window.showShiftDetail('${d.date}', '${isOff ? 'Libur Kerja (Day-Off)' : d.shift_name}', '${d.work_start_time || ''}', '${d.work_end_time || ''}')">
              <div class="absolute top-1 right-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
              <p class="text-[9px] font-bold text-blue-100 uppercase mb-1.5">${d.day_name}</p>
              <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-1.5">
                <i data-lucide="${iconName}" class="w-5 h-5 text-white"></i>
              </div>
              <p class="text-[10px] font-bold line-clamp-1">${cleanName}</p>
            </div>
          `;
        } else if (d.is_past) {
          html += `
            <div class="flex-shrink-0 w-[70px] py-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center opacity-50 cursor-pointer active:scale-95 transition-all"
              onclick="window.showShiftDetail('${d.date}', '${isOff ? 'Libur Kerja (Day-Off)' : d.shift_name}', '${d.work_start_time || ''}', '${d.work_end_time || ''}')">
              <p class="text-[9px] font-bold text-slate-400 uppercase mb-1.5">${d.day_name}</p>
              <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1.5">
                <i data-lucide="${iconName}" class="w-4 h-4 text-slate-400"></i>
              </div>
              <p class="text-[9px] font-semibold text-slate-500 line-clamp-1">${cleanName}</p>
            </div>
          `;
        } else {
          // Future day
          const bgPill = isOff ? 'bg-slate-100 dark:bg-slate-800' : 'bg-blue-50 dark:bg-blue-950/40';
          const textClass = isOff ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200';
          html += `
            <div class="flex-shrink-0 w-[70px] py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center cursor-pointer active:scale-95 transition-all"
              onclick="window.showShiftDetail('${d.date}', '${isOff ? 'Libur Kerja (Day-Off)' : d.shift_name}', '${d.work_start_time || ''}', '${d.work_end_time || ''}')">
              <p class="text-[9px] font-bold text-slate-400 uppercase mb-1.5">${d.day_name}</p>
              <div class="w-8 h-8 rounded-full ${bgPill} flex items-center justify-center mb-1.5">
                <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor}"></i>
              </div>
              <p class="text-[9px] font-semibold ${textClass} line-clamp-1">${cleanName}</p>
            </div>
          `;
        }
      });

      weeklyContentEl.innerHTML = html;
      window.lucide?.createIcons({ root: weeklyContentEl });
      return;
    }

    // Fallback if no weekly array
    const days = [
      { name: 'Sen', full: 'Senin' },
      { name: 'Sel', full: 'Selasa' },
      { name: 'Rab', full: 'Rabu' },
      { name: 'Kam', full: 'Kamis' },
      { name: 'Jum', full: 'Jumat' },
      { name: 'Sab', full: 'Sabtu' },
      { name: 'Min', full: 'Minggu' },
    ];
    const todayDayIndex = (new Date().getDay() + 6) % 7;
    const shiftName = (weeklyRoster?.shift_name || 'Reguler').replace(/\s*\(.*\)/, '').replace(/Shift\s+/i, '');

    let html = '';
    days.forEach((d, idx) => {
      const isToday = idx === todayDayIndex;
      const isPast = idx < todayDayIndex;

      if (isToday) {
        html += `
          <div class="flex-shrink-0 w-[76px] py-3.5 rounded-2xl bg-primary-600 text-white flex flex-col items-center border border-primary-500 relative shadow-sm">
            <div class="absolute top-1 right-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
            <p class="text-[9px] font-bold text-blue-100 uppercase mb-1.5">${d.name}</p>
            <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-1.5">
              <i data-lucide="sun" class="w-5 h-5 text-white"></i>
            </div>
            <p class="text-[10px] font-bold">${shiftName}</p>
          </div>
        `;
      } else if (isPast) {
        html += `
          <div class="flex-shrink-0 w-[70px] py-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center opacity-50">
            <p class="text-[9px] font-bold text-slate-400 uppercase mb-1.5">${d.name}</p>
            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1.5">
              <i data-lucide="sun" class="w-4 h-4 text-slate-400"></i>
            </div>
            <p class="text-[9px] font-semibold text-slate-500">${shiftName}</p>
          </div>
        `;
      } else {
        html += `
          <div class="flex-shrink-0 w-[70px] py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <p class="text-[9px] font-bold text-slate-400 uppercase mb-1.5">${d.name}</p>
            <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-1.5">
              <i data-lucide="sun" class="w-4 h-4 text-blue-500"></i>
            </div>
            <p class="text-[9px] font-semibold text-slate-700 dark:text-slate-200">${shiftName}</p>
          </div>
        `;
      }
    });

    weeklyContentEl.innerHTML = html;
    window.lucide?.createIcons({ root: weeklyContentEl });
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
      const within = res?.is_in_office ?? res?.is_within_radius;
      
      this._updateMapMarker(coords.latitude, coords.longitude, within);
      
      if (locEl) {
        locEl.innerHTML = within
          ? `<span class="text-emerald-600 font-bold">✓ Dalam area kantor (${res.message || 'Valid'})</span>`
          : `<span class="text-red-500 font-bold">✗ Di luar area kantor (${res.message || 'Harap mendekat'})</span>`;
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
      const within = res?.is_in_office ?? res?.is_within_radius;
      
      this._updateMapMarker(coords.latitude, coords.longitude, within);
      showToast('Titik Lokasi diperbarui', 'success');
      
      if (locEl) {
        locEl.innerHTML = within
          ? `<span class="text-emerald-600 font-bold">✓ Dalam area kantor</span>`
          : `<span class="text-red-500 font-bold">✗ Di luar area kantor</span>`;
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
      if (container && !Cache.get('att_monthly')) showSkeleton('history-list', 3);

      const res = await AttendanceService.getMonthly();
      const records = Array.isArray(res) ? res : (res?.data || []);

      this._monthlyRecords = records;
      Cache.set('att_monthly', records, 3);

      this._renderMonthlySummary(records);
      this._renderCalendar(records, new Date());
    } catch {
      // fail silently
    }
  },

  _renderMonthlySummary(records) {
    let present = 0, late = 0, absent = 0, leave = 0;
    records.forEach(r => {
      if (r.status === 'present') present++;
      else if (r.status === 'late') late++;
      else if (r.status === 'absent') absent++;
      else if (['sakit', 'cuti', 'izin', 'dinas'].includes(r.status)) leave++;
    });

    const now = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    setText('monthly-present', present);
    setText('monthly-late', late);
    setText('monthly-absent', absent);
    setText('monthly-period', `${monthNames[now.getMonth()]} ${now.getFullYear()}`);
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

      let baseClasses = 'aspect-square rounded-2xl flex flex-col items-center justify-center relative font-bold text-xs border cursor-pointer active:scale-95 transition-all';
      let stateClasses = 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-slate-800 hover:border-slate-300';
      let subLabel = '';

      if (rec) {
        if (rec.status === 'present') {
          stateClasses = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
          if (rec.check_in) subLabel = `<span class="text-[8px] font-semibold text-emerald-600 mt-0.5">${rec.check_in.substring(0,5)}</span>`;
        } else if (rec.status === 'late') {
          stateClasses = 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
          if (rec.check_in) subLabel = `<span class="text-[8px] font-semibold text-amber-600 mt-0.5">${rec.check_in.substring(0,5)}</span>`;
        } else if (rec.status === 'absent') {
          stateClasses = 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
          subLabel = `<span class="text-[7px] font-extrabold text-red-500 uppercase">Alpha</span>`;
        } else if (rec.status === 'sakit') {
          stateClasses = 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
          subLabel = `<span class="text-[7px] font-extrabold text-rose-500 uppercase">Sakit</span>`;
        } else if (rec.status === 'cuti') {
          stateClasses = 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
          subLabel = `<span class="text-[7px] font-extrabold text-purple-500 uppercase">Cuti</span>`;
        } else if (rec.status === 'izin') {
          stateClasses = 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800';
          subLabel = `<span class="text-[7px] font-extrabold text-sky-500 uppercase">Izin</span>`;
        } else if (rec.status === 'dinas') {
          stateClasses = 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
          subLabel = `<span class="text-[7px] font-extrabold text-indigo-500 uppercase">Dinas</span>`;
        }
      }

      html += `
        <div class="${baseClasses} ${stateClasses}" onclick="window.showAttendanceDayDetail('${dStr}')">
          <span>${i}</span>
          ${subLabel}
        </div>
      `;
    }
    
    html += `</div>`;

    html += `
      <div class="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold">
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-200"></div> Hadir</div>
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-md bg-amber-50 border border-amber-200"></div> Telat</div>
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-md bg-red-50 border border-red-200"></div> Alpha</div>
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-md bg-rose-50 border border-rose-200"></div> Izin Sakit</div>
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-md bg-purple-50 border border-purple-200"></div> Cuti</div>
        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-md bg-sky-50 border border-sky-200"></div> Izin Absen</div>
      </div>
    `;

    container.innerHTML = html;
  },

  _bindEvents() {
    const btn = document.getElementById('attendance-btn');
    if (btn) {
      btn.addEventListener('click', () => this._handleAttendance(btn));
    }
    
    const mapBtn = document.getElementById('update-loc-btn');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => this._updateManualLocation());
    }

    initPullToRefresh('main-content', async () => {
      await Promise.all([
        this._loadToday(),
        this._loadMonthly()
      ]);
    });
  },

  async _handleAttendance(btn) {
    const hasCheckin = !!this._todayData?.check_in;
    const hasCheckout = !!this._todayData?.check_out;

    if (hasCheckin && hasCheckout) return;

    // Handle locked cutoff check
    if (!hasCheckin && this._todayWindow?.window_status === 'locked_late') {
      showAlert('Batas Waktu Absensi Berakhir', `Batas waktu absensi masuk untuk jadwal ini telah berakhir (pukul ${this._todaySchedule?.check_in_end || '08:30'} WIB).\n\nSilakan hubungi HRD untuk konfirmasi dan penyesuaian kehadiran Anda.`);
      return;
    }

    // Handle early checkout check
    if (hasCheckin && !hasCheckout && this._todayWindow?.window_status === 'checked_in_waiting_checkout') {
      showAlert('Belum Waktu Jam Pulang', `Jam pulang kerja resmi adalah pukul ${this._todaySchedule?.work_end_time || '17:00'} WIB.\n\nAbsen keluar dapat dilakukan minimal pada jam pulang atau setelahnya.`);
      return;
    }

    setLoading(btn, true, 'Memproses...');

    try {
      const coords = await GpsService.getCurrentPosition();
      let res;

      if (!hasCheckin) {
        res = await AttendanceService.checkIn(coords.latitude, coords.longitude);
        showToast('Check-in berhasil! ✓', 'success');
        GpsController.startTracking();
      } else {
        res = await AttendanceService.checkOut(coords.latitude, coords.longitude);
        showToast('Check-out berhasil! ✓', 'success');
        GpsController.stopTracking();
      }

      this._todayData = res?.attendance || (res?.id ? res : null);
      if (res?.schedule) this._todaySchedule = res.schedule;

      await this._loadToday();
      await this._loadMonthly();
    } catch (err) {
      const errMsg = err.message || 'Gagal melakukan absensi';
      showAlert('Pemberitahuan Absensi', errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(btn, false);
    }
  },
};

// Global interactive day details
window.showAttendanceDayDetail = (dateStr) => {
  const records = AttendanceController._monthlyRecords || [];
  const rec = records.find(r => r.date && r.date.startsWith(dateStr));

  const d = new Date(dateStr + 'T00:00:00');
  const formattedDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (!rec) {
    showAlert(formattedDate, 'Tidak ada catatan absensi atau izin pada tanggal ini.');
    return;
  }

  let statusLabel = 'Hadir (Tepat Waktu)';
  if (rec.status === 'late') statusLabel = 'Terlambat Masuk';
  else if (rec.status === 'absent') statusLabel = 'Alpha (Tidak Hadir)';
  else if (rec.status === 'sakit') statusLabel = 'Izin Sakit';
  else if (rec.status === 'cuti') statusLabel = 'Cuti Tahunan / Khusus';
  else if (rec.status === 'izin') statusLabel = 'Izin Absen Kerja';
  else if (rec.status === 'dinas') statusLabel = 'Dinas Luar Kantor';

  let detailMsg = `Status: ${statusLabel}`;
  if (rec.shift) detailMsg += `\nShift: ${rec.shift.name} (${rec.shift.work_start_time?.substring(0, 5)} - ${rec.shift.work_end_time?.substring(0, 5)})`;
  if (rec.check_in) detailMsg += `\nCheck In: ${rec.check_in.substring(0, 5)} WIB`;
  if (rec.check_out) detailMsg += `\nCheck Out: ${rec.check_out.substring(0, 5)} WIB`;
  if (rec.notes) detailMsg += `\nKeterangan: ${rec.notes}`;

  showAlert(formattedDate, detailMsg);
};

window.showShiftDetail = (dateStr, shiftName, startTime, endTime) => {
  const d = new Date(dateStr + 'T00:00:00');
  const formattedDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hoursMsg = startTime && endTime ? `\nJam Kerja: ${startTime} - ${endTime} WIB` : '';
  showAlert(formattedDate, `Jadwal Shift: ${shiftName}${hoursMsg}`);
};

document.addEventListener('DOMContentLoaded', () => AttendanceController.init());

export { AttendanceController };
