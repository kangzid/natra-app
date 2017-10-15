/**
 * NATRA Mobile - Tasks Service
 * Handles all task-related API calls
 */

import { ApiClient } from '../../core/api/api-client.js';

const TasksService = {
  /**
   * Get all tasks (with optional filters)
   * GET /my-tasks?status=&priority=
   * @param {{ status?: string, priority?: string, page?: number }} params
   */
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.priority) query.set('priority', params.priority);
    if (params.page) query.set('page', params.page);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return ApiClient.get(`/my-tasks${qs}`);
  },

  /**
   * Get task detail
   * GET /tasks/{id}
   */
  async getTaskById(id) {
    return ApiClient.get(`/tasks/${id}`);
  },

  /**
   * Accept a task
   * POST /tasks/{id}/accept
   */
  async acceptTask(id) {
    return ApiClient.post(`/tasks/${id}/accept`, {});
  },

  /**
   * Start a task
   * POST /tasks/{id}/start
   */
  async startTask(id) {
    return ApiClient.post(`/tasks/${id}/start`, {});
  },

  /**
   * Complete a task
   * POST /tasks/{id}/complete
   * @param {number} id
   * @param {{ completion_notes?: string, latitude?: number, longitude?: number }} body
   */
  async completeTask(id, body = {}) {
    return ApiClient.post(`/tasks/${id}/complete`, body);
  },

  /**
   * Hide a task from employee view (Soft Hide)
   * POST /tasks/{id}/hide
   */
  async hideTask(id) {
    return ApiClient.post(`/tasks/${id}/hide`, {});
  },
};

export { TasksService };
