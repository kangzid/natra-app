const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');

// 1. Update src/features/tasks/tasks.controller.js
const tasksCtrlPath = path.join(mobileDir, 'src/features/tasks/tasks.controller.js');
let tasksCtrlContent = fs.readFileSync(tasksCtrlPath, 'utf8');

// Update _taskCardHTML to display Task Type (Dispatch vs General), vehicle plate, and route info cleanly
const newTaskCardFunc = `  _taskCardHTML(task) {
    const isUrgent = this._isDueUrgent(task.due_date);
    const canHide = ['completed', 'cancelled'].includes(task.status);
    const isDispatch = task.task_type === 'dispatch' || task.type === 'dispatch' || !!task.vehicle_id;
    const vehicleInfo = task.vehicle?.license_plate || task.vehicle?.plate_number || (task.vehicle_id ? 'Armada Ditugaskan' : null);
    
    const cardContent = \`
      <div class="task-card-ios" data-task-id="\${task.id}">
        <div class="flex justify-between items-start mb-3">
          <div class="flex flex-wrap gap-2">
            \${isDispatch 
              ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1"><i data-lucide="truck" class="w-3 h-3"></i> Driver Dispatch</span>' 
              : '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><i data-lucide="clipboard-list" class="w-3 h-3"></i> Tugas Umum</span>'
            }
            \${priorityBadge(task.priority)}
            \${statusBadge(task.status)}
          </div>
        </div>
        
        <h3 class="ios-task-title">\${task.title}</h3>
        
        \${task.description ? \`<p class="text-[13px] text-slate-500 line-clamp-2 mb-3 leading-snug font-medium">\${task.description}</p>\` : '<div class="mb-2"></div>'}
        
        \${isDispatch && (vehicleInfo || task.origin_address || task.destination_address) ? \`
          <div class="mb-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
            \${vehicleInfo ? \`
              <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold">
                <i data-lucide="car" class="w-3.5 h-3.5 text-blue-500 shrink-0"></i>
                <span>\${vehicleInfo}</span>
                \${task.start_odometer ? \`<span class="text-[10px] text-slate-400 font-normal ml-auto">Odo: \${Number(task.start_odometer).toLocaleString()} km</span>\` : ''}
              </div>
            \` : ''}
            \${task.origin_address && task.destination_address ? \`
              <div class="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <i data-lucide="navigation" class="w-3 h-3 text-primary-500 shrink-0"></i>
                <span class="truncate">\${task.origin_address}</span>
                <span class="text-slate-400 font-bold">&rarr;</span>
                <span class="truncate">\${task.destination_address}</span>
              </div>
            \` : ''}
          </div>
        \` : ''}

        <div class="flex items-center justify-between pt-3 border-t border-slate-50">
          <div class="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest \${isUrgent ? 'text-red-500' : 'text-primary-500'}">
            <div class="w-2 h-2 rounded-full \${isUrgent ? 'bg-red-500' : 'bg-primary-500'} animate-pulse"></div>
            <span>\${isUrgent ? 'Segera Berakhir' : 'Tenggat'}</span>
          </div>
          <span class="text-[11px] font-extrabold text-slate-400">
            \${formatDate(task.due_date)}
          </span>
        </div>
      </div>
    \`;

    if (canHide) {
      return \`
        <div class="notif-swipe-item mb-4 rounded-2xl" data-task-id="\${task.id}">
          \${cardContent}
        </div>
      \`;
    }

    return \`<div class="mb-4">\${cardContent}</div>\`;
  },`;

tasksCtrlContent = tasksCtrlContent.replace(/  _taskCardHTML\(task\) \{[\s\S]*?return `<div class="mb-4">\${cardContent}<\/div>`;\n  \},/, newTaskCardFunc);
fs.writeFileSync(tasksCtrlPath, tasksCtrlContent, 'utf8');
console.log('Updated tasks.controller.js with dispatch vs general differentiation!');

// 2. Update src/features/tasks/task-detail.controller.js
const taskDetailCtrlPath = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');
let taskDetailContent = fs.readFileSync(taskDetailCtrlPath, 'utf8');

const newTaskRenderLogic = `  _renderTask(task) {
    if (!task) return;
    const isDispatch = task.task_type === 'dispatch' || task.type === 'dispatch' || !!task.vehicle_id;
    const typeBadge = isDispatch 
      ? '<span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1.5"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Driver Dispatch</span>'
      : '<span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5"><i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i> Tugas Umum</span>';

    setText('task-title', task.title);
    setText('task-description', task.description || 'Tidak ada deskripsi');
    setText('task-due', formatDate(task.due_date));
    setHTML('task-priority', \`\${typeBadge} \${priorityBadge(task.priority)}\`);
    setHTML('task-status', statusBadge(task.status));

    // Dynamic Dispatch Information (Vehicle & Route)
    const existingDispatchInfo = document.getElementById('task-dispatch-details');
    if (existingDispatchInfo) existingDispatchInfo.remove();

    if (isDispatch && (task.vehicle || task.origin_address || task.destination_address)) {
      const vehicleName = task.vehicle ? \`\${task.vehicle.license_plate || task.vehicle.plate_number} • \${task.vehicle.model || task.vehicle.name || 'Armada'}\` : (task.vehicle_id ? 'Armada Ditugaskan' : null);
      
      const dispatchHtml = \`
        <div id="task-dispatch-details" class="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 space-y-3 mb-4">
          <h3 class="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="truck" class="w-4 h-4"></i> Rute Pengiriman & Armada Kendaraan
          </h3>
          
          \${vehicleName ? \`
            <div class="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-blue-50 dark:border-blue-900/30 text-xs">
              <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <i data-lucide="car" class="w-4 h-4 text-blue-500"></i>
                <span>\${vehicleName}</span>
              </div>
              \${task.start_odometer ? \`<span class="text-[11px] text-slate-500 font-semibold">Odo Awal: \${Number(task.start_odometer).toLocaleString()} km</span>\` : ''}
            </div>
          \` : ''}

          \${task.origin_address ? \`
            <div class="flex items-start gap-2 text-xs">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase">Titik Asal / Penjemputan</p>
                <p class="font-bold text-slate-700 dark:text-slate-200">\${task.origin_address}</p>
              </div>
            </div>
          \` : ''}

          \${task.destination_address ? \`
            <div class="flex items-start gap-2 text-xs">
              <div class="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></div>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase">Titik Tujuan / Pengantaran</p>
                <p class="font-bold text-slate-700 dark:text-slate-200">\${task.destination_address}</p>
              </div>
            </div>
          \` : ''}

          \${task.destination_lat && task.destination_lng ? \`
            <div class="pt-1">
              <a href="https://www.google.com/maps/dir/?api=1&destination=\${task.destination_lat},\${task.destination_lng}" target="_blank" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                <i data-lucide="navigation" class="w-3.5 h-3.5"></i> Buka Rute di Google Maps
              </a>
            </div>
          \` : ''}
        </div>
      \`;

      const descBox = document.querySelector('#task-content .card .bg-slate-50');
      if (descBox) {
        descBox.insertAdjacentHTML('afterend', dispatchHtml);
      }
    }

    if (task.completion_notes) {
      setText('completion-notes', task.completion_notes);
      const notesEl = document.getElementById('completion-section');
      if (notesEl) notesEl.classList.remove('hidden');
    }

    this._renderActionButton(task.status);
    if (window.lucide) window.lucide.createIcons();
  },`;

taskDetailContent = taskDetailContent.replace(/  _renderTask\(task\) \{[\s\S]*?this\._renderActionButton\(task\.status\);\n  \},/, newTaskRenderLogic);
fs.writeFileSync(taskDetailCtrlPath, taskDetailContent, 'utf8');
console.log('Updated task-detail.controller.js with dispatch details & route navigation!');
