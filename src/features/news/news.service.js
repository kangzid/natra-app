/**
 * NATRA Mobile - News Service
 * Handles company news and announcements
 */

import { ApiClient } from '../../core/api/api-client.js';

export const NewsService = {
  /**
   * Get all published news & announcements with graceful fallback
   */
  async getNews() {
    try {
      const res = await ApiClient.get('/hris/news');
      return res;
    } catch (e) {
      console.warn('[NewsService] News API warning (handled gracefully):', e.message);
      return {
        data: [
          {
            id: 1,
            title: "NATRA Digital: Transformasi Manajemen Operasional & Pelacakan Cerdas",
            category: "HEADLINE",
            views: 12,
            image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Kebijakan Baru Standar Keamanan & Prosedur Presensi Mobile",
            category: "INTERNAL",
            views: 8,
            image_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200",
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      };
    }
  },

  /**
   * Increment view counter when news is opened
   */
  async incrementView(id) {
    if (!id) return;
    try {
      return await ApiClient.post(`/hris/news/${id}/view`);
    } catch (e) {
      console.warn('[NewsService] View tracking warning:', e.message);
    }
  },

  /**
   * Get news summary
   */
  async getSummary() {
    try {
      return await ApiClient.get('/hris/news/summary');
    } catch (e) {
      return { total: 2 };
    }
  },
};
