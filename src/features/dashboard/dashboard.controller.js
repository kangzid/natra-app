/**
 * NATRA Mobile - Dashboard Controller
 */

import { DashboardService } from './dashboard.service.js';
import { Auth } from '../../core/auth/auth.js';
import { GpsController } from '../gps/gps.controller.js';
import { Storage } from '../../core/storage/storage.js';
import { AttendanceService } from '../attendance/attendance.service.js';
import { NotificationService } from '../notification/notification.service.js';
import { showToast, setText, formatTime, getInitials } from '../../utils/ui-helpers.js';

const DashboardController = {
  async init() {
    if (!Auth.requireAuth()) return;

    this._renderHeader();
    await this._loadDashboard();
    this._bindEvents();
    this._restoreTracking();
  },

  _renderHeader() {
    const user = Auth.getUser();
    const employee = Auth.getEmployee();
    const name = user?.name || 'Karyawan';
    const hour = new Date().getHours();
    const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

    setText('greeting-text', greeting);
    setText('user-name', name);
    setText('employee-id-text', employee?.employee_id || '-');

    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) avatarEl.textContent = getInitials(name);
  },

  async _loadDashboard() {
    const loadingEl = document.getElementById('dashboard-loading');
    const contentEl = document.getElementById('dashboard-content');
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');

    try {
      // Fetch concurrently
      const [dashboardRes, monthlyRes, notifRes] = await Promise.all([
        DashboardService.getDashboard(),
        AttendanceService.getMonthly().catch(() => []),
        NotificationService.getUnread().catch(() => ({ data: [], count: 0 })),
      ]);

      const data = dashboardRes || {};
      
      // Calculate monthly summary manually since API returns an array
      const monthlyRecords = Array.isArray(monthlyRes) ? monthlyRes : (monthlyRes?.data || []);
      let present = 0, late = 0, absent = 0;
      monthlyRecords.forEach(r => {
        if (r.status === 'present') present++;
        else if (r.status === 'late') late++;
        else if (r.status === 'absent') absent++;
      });
      data.monthly_attendance = { present, late, absent };

      // Map unread notifications (API returns an array directly)
      data.unread_notifications = notifRes?.count ?? (Array.isArray(notifRes) ? notifRes.length : (Array.isArray(notifRes?.data) ? notifRes.data.length : 0));

      this._renderDashboard(data);
      if (contentEl) contentEl.classList.remove('hidden');
    } catch (err) {
      showToast(err.message || 'Gagal memuat dashboard', 'error');
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  },

  _renderDashboard(data) {
    // Attendance today
    let att = data.today_attendance;
    if (Array.isArray(att)) att = att.length > 0 ? att[0] : null;

    const statusEl = document.getElementById('att-status');
    const checkInEl = document.getElementById('att-checkin');
    const checkOutEl = document.getElementById('att-checkout');

    if (att?.status) {
      const statusMap = { present: 'Hadir', late: 'Terlambat', absent: 'Absen' };
      if (statusEl) statusEl.textContent = statusMap[att.status] || att.status;
    } else {
      if (statusEl) statusEl.textContent = 'Belum Absen';
    }
    if (checkInEl) checkInEl.textContent = att?.check_in ? formatTime(att.check_in) : '--:--';
    if (checkOutEl) checkOutEl.textContent = att?.check_out ? formatTime(att.check_out) : '--:--';

    // Tasks summary
    const pending = data.pending_tasks ?? 0;
    const inProgress = data.in_progress_tasks ?? 0;
    const completed = data.completed_tasks_this_month ?? 0;
    const total = pending + inProgress + completed; // Kalkulasi total

    setText('tasks-total', total);
    setText('tasks-pending', pending);
    setText('tasks-inprogress', inProgress);
    setText('tasks-completed', completed);

    // Notifications unread badge
    const unread = data.unread_notifications ?? 0;
    setText('notif-count', unread);
    const badge = document.getElementById('notif-nav-badge');
    if (badge) {
      badge.textContent = unread;
      badge.classList.toggle('hidden', unread === 0);
    }

    // Monthly attendance
    const monthly = data.monthly_attendance;
    setText('monthly-present', monthly?.present ?? 0);
    setText('monthly-late', monthly?.late ?? 0);
    setText('monthly-absent', monthly?.absent ?? 0);
  },

  _bindEvents() {
    // GPS toggle
    const gpsToggle = document.getElementById('gps-toggle');
    if (gpsToggle) {
      gpsToggle.addEventListener('change', async () => {
        await GpsController.toggle();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._loadDashboard());
    }
  },

  _restoreTracking() {
    // Resume tracking if it was active before
    if (Storage.isTrackingActive()) {
      GpsController.startTracking();
    }
  },
};

document.addEventListener('DOMContentLoaded', () => DashboardController.init());

export { DashboardController };
