/**
 * NATRA Mobile
 * UI Templates Concept
 *
 * This file contains HTML templates as JavaScript functions.
 * Using templates keeps HTML out of your controllers and makes it easy to 
 * redesign components (like task cards, logs, etc.) in a single location.
 */

export const UITemplates = {
  
  /**
   * Generates a reusable Task Stack card for lists 
   * (Used in the pending/completed tasks list)
   * 
   * @param {Object} task Object containing task details
   * @param {Boolean} isLink Make the card clickable?
   */
  taskCard: (task, isLink = true) => {
    // Generate color based on priority
    let priorityClass = 'ios-priority-low';
    if (task.priority === 'urgent') priorityClass = 'ios-priority-urgent';
    if (task.priority === 'high') priorityClass = 'ios-priority-high';
    if (task.priority === 'medium') priorityClass = 'ios-priority-medium';

    const innerContent = `
      <div class="flex justify-between items-start mb-2">
        <span class="ios-priority-pill ${priorityClass}">${task.priority.toUpperCase()}</span>
        <span class="text-xs font-semibold text-slate-400">${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due'}</span>
      </div>
      <h3 class="ios-task-title">${task.title}</h3>
      <p class="text-sm text-slate-500 line-clamp-2 mt-1 mb-4">${task.description || 'Tidak ada deskripsi.'}</p>
      
      <div class="task-meta-ios">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
            <i class="fas fa-user-circle text-slate-300"></i>
          </div>
          <span class="text-xs font-bold text-slate-600">${task.assigned_by?.name || 'Admin'}</span>
        </div>
        ${isLink ? '<i class="fas fa-chevron-right text-slate-300 text-sm"></i>' : ''}
      </div>
    `;

    if (isLink) {
      // Return clickable A tag
      return `<a href="task-detail.html?id=${task.id}" class="task-card-ios block cursor-pointer select-none">${innerContent}</a>`;
    }

    // Return static div
    return `<div class="task-card-ios">${innerContent}</div>`;
  },

  /**
   * UI Component for empty states (No tasks, no payroll, etc.)
   */
  emptyState: (title, message, iconClass = 'fa-inbox') => {
    return `
      <div class="text-center py-12 px-6 fade-in flex flex-col items-center">
        <div class="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
          <i class="fas ${iconClass} text-2xl text-slate-400"></i>
        </div>
        <h3 class="font-bold text-lg text-slate-800 mb-1">${title}</h3>
        <p class="text-slate-500 text-sm leading-relaxed">${message}</p>
      </div>
    `;
  }
};
