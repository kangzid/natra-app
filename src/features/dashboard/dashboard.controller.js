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
    setText('shift-text', employee?.shift || 'Shift Siang'); // Dummy shift data

    const avatarEl = document.getElementById('user-avatar');
    const avatarImg = document.getElementById('user-avatar-img');
    const avatarText = document.getElementById('user-avatar-text');

    if (avatarEl) {
      // Use premium dummy image (iOS 18 style)
      const dummyImageUrl = `https://i.pravatar.cc/150?u=${employee?.employee_id || 'natra'}`;
      if (avatarImg) {
        avatarImg.src = dummyImageUrl;
        avatarImg.classList.remove('hidden');
      }
      if (avatarText) {
        avatarText.classList.add('hidden');
      }
    }
  },

  _attendanceChart: null,

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

      // Map unread notifications
      data.unread_notifications = notifRes?.count ?? (Array.isArray(notifRes) ? notifRes.length : (Array.isArray(notifRes?.data) ? notifRes.data.length : 0));

      this._renderDashboard(data);
      
      // Small delay to ensure DOM is ready for animation & chart
      setTimeout(() => {
        if (contentEl) {
          contentEl.classList.remove('hidden');
          contentEl.style.display = 'block'; // Force display to ensure height calc
        }
        if (loadingEl) loadingEl.classList.add('hidden');
        
        // Render Chart after content is visible for proper canvas sizing
        this._renderAttendanceChart(data.monthly_attendance);
      }, 50);

    } catch (err) {
      console.error('Dashboard Error:', err);
      showToast(err.message || 'Gagal memuat dashboard', 'error');
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  },

  _renderAttendanceChart(monthly) {
    const ctx = document.getElementById('attendanceDonutChart')?.getContext('2d');
    if (!ctx) return;

    const present = monthly?.present ?? 0;
    const late = monthly?.late ?? 0;
    const absent = monthly?.absent ?? 0;
    const total = present + late + absent;
    
    // Calculate percentage
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    setText('presence-percentage', `${percentage}%`);

    if (this._attendanceChart) {
      this._attendanceChart.destroy();
    }

    this._attendanceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Hadir', 'Telat', 'Absen'],
        datasets: [{
          data: [present, late, absent],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0,
          cutout: '82%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        elements: {
          arc: {
            borderRadius: 10
          }
        }
      }
    });
  },

  _renderDashboard(data) {
    // 1. Smart Attendance Today - Punch Style
    let att = data.today_attendance;
    if (Array.isArray(att)) att = att.length > 0 ? att[0] : null;

    const checkin = att?.check_in ? formatTime(att.check_in) : '--:--';
    const checkout = att?.check_out ? formatTime(att.check_out) : '--:--';
    
    setText('att-checkin', checkin);
    setText('att-checkout', checkout);
    
    // Toggle active state for punch badges
    const badgeIn = document.getElementById('badge-checkin');
    const badgeOut = document.getElementById('badge-checkout');
    
    if (checkin !== '--:--') badgeIn?.classList.add('active');
    else badgeIn?.classList.remove('active');
    
    if (checkout !== '--:--') badgeOut?.classList.add('active');
    else badgeOut?.classList.remove('active');

    // Status text
    const statusEl = document.getElementById('att-status');
    if (statusEl) {
      if (checkout !== '--:--') statusEl.textContent = 'Selesai';
      else if (checkin !== '--:--') statusEl.textContent = 'Bekerja';
      else statusEl.textContent = 'Belum Absen';
    }

    // 2. Smart Tasks & Priority Focus
    const pending = data.pending_tasks ?? 0;
    const inProgress = data.in_progress_tasks ?? 0;
    const completed = data.completed_tasks_this_month ?? 0;

    setText('tasks-pending', pending);
    setText('tasks-inprogress', inProgress);
    setText('tasks-completed', completed);

    // Find focus task (First in-progress task from data.active_tasks_list if available)
    const activeTasks = data.active_tasks_list || [];
    const focusTask = activeTasks.find(t => t.status === 'proses') || activeTasks[0];
    
    if (focusTask) {
      setText('focus-task-title', focusTask.title);
      setText('focus-task-priority', focusTask.priority === 'urgent' ? 'Segera' : 'Aktif');
    } else {
      setText('focus-task-title', 'Siap untuk tugas baru?');
      setText('focus-task-priority', 'Santai');
    }

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

    // Re-initialize icons for new dynamic widgets
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
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
