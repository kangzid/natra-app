const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mobileDir = path.resolve('.');

// 1. Update frontend-locatrack/src/routes/admin/tasks/+page.server.ts
const adminServerPath = path.join(svelteDir, 'src/routes/admin/tasks/+page.server.ts');
let adminServerContent = fs.readFileSync(adminServerPath, 'utf8');

const updatedActions = `export const actions = {
    create: async ({ cookies, request }) => {
        const token = cookies.get('token');
        if (!token) return { success: false, error: 'Unauthorized' };

        const data = await request.formData();
        const taskType = (data.get('task_type') as string) || 'general';
        const vehicleId = data.get('vehicle_id') ? Number(data.get('vehicle_id')) : null;

        const taskData: any = {
            title: data.get('title') as string,
            description: data.get('description') as string,
            task_type: taskType,
            assigned_to: Number(data.get('assigned_to')),
            vehicle_id: vehicleId,
            priority: data.get('priority') as 'low' | 'medium' | 'high',
            due_date: data.get('due_date') as string,
            status: taskType === 'dispatch' ? 'assigned' : 'pending'
        };

        if (taskType === 'dispatch') {
            taskData.origin_address = data.get('origin_address') as string;
            taskData.destination_address = data.get('destination_address') as string;
            if (data.get('origin_lat') && data.get('origin_lat') !== '') taskData.origin_lat = Number(data.get('origin_lat'));
            if (data.get('origin_lng') && data.get('origin_lng') !== '') taskData.origin_lng = Number(data.get('origin_lng'));
            if (data.get('destination_lat') && data.get('destination_lat') !== '') taskData.destination_lat = Number(data.get('destination_lat'));
            if (data.get('destination_lng') && data.get('destination_lng') !== '') taskData.destination_lng = Number(data.get('destination_lng'));
            if (data.get('start_odometer') && data.get('start_odometer') !== '') taskData.start_odometer = Number(data.get('start_odometer'));
        }

        try {
            await taskService.createTask(token, taskData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    update: async ({ cookies, request }) => {
        const token = cookies.get('token');
        if (!token) return { success: false, error: 'Unauthorized' };

        const data = await request.formData();
        const id = Number(data.get('id'));
        const taskType = (data.get('task_type') as string) || 'general';
        const vehicleId = data.get('vehicle_id') ? Number(data.get('vehicle_id')) : null;

        const taskData: any = {
            title: data.get('title') as string,
            description: data.get('description') as string,
            priority: data.get('priority') as 'low' | 'medium' | 'high',
            status: data.get('status') as any
        };

        if (taskType === 'dispatch') {
            taskData.task_type = 'dispatch';
            taskData.vehicle_id = vehicleId;
            taskData.origin_address = data.get('origin_address') as string;
            taskData.destination_address = data.get('destination_address') as string;
            if (data.get('origin_lat') && data.get('origin_lat') !== '') taskData.origin_lat = Number(data.get('origin_lat'));
            if (data.get('origin_lng') && data.get('origin_lng') !== '') taskData.origin_lng = Number(data.get('origin_lng'));
            if (data.get('destination_lat') && data.get('destination_lat') !== '') taskData.destination_lat = Number(data.get('destination_lat'));
            if (data.get('destination_lng') && data.get('destination_lng') !== '') taskData.destination_lng = Number(data.get('destination_lng'));
            if (data.get('start_odometer') && data.get('start_odometer') !== '') taskData.start_odometer = Number(data.get('start_odometer'));
            if (data.get('end_odometer') && data.get('end_odometer') !== '') taskData.end_odometer = Number(data.get('end_odometer'));
        }

        try {
            await taskService.updateTask(token, id, taskData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },`;

adminServerContent = adminServerContent.replace(/export const actions = {[\s\S]*?update: async \({ cookies, request }\) => {[\s\S]*?},/, updatedActions);
fs.writeFileSync(adminServerPath, adminServerContent, 'utf8');
console.log('Updated admin tasks/+page.server.ts with exact coordinate fields!');

// 2. Update tracker-loc-backend/app/Http/Controllers/Api/TaskController.php
const taskCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/TaskController.php');
let taskCtrlContent = fs.readFileSync(taskCtrlPath, 'utf8');

// Ensure show method loads vehicle relationship
taskCtrlContent = taskCtrlContent.replace(
    "$task = Task::with(['employee.user', 'assignedBy'])->findOrFail($id);",
    "$task = Task::with(['employee.user', 'assignedBy', 'vehicle'])->findOrFail($id);"
);

fs.writeFileSync(taskCtrlPath, taskCtrlContent, 'utf8');
console.log('Updated TaskController.php show method with vehicle relationship!');

// 3. Update natra-mobile/pages/task-detail.html (remove select-none to enable copy text)
const detailHtmlPath = path.join(mobileDir, 'pages/task-detail.html');
let detailHtmlContent = fs.readFileSync(detailHtmlPath, 'utf8');
detailHtmlContent = detailHtmlContent.replace('select-none', '');
fs.writeFileSync(detailHtmlPath, detailHtmlContent, 'utf8');
console.log('Updated task-detail.html: removed select-none!');
