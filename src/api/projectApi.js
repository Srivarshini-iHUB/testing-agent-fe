import apiClient from './client';

// Map backend project shape to UI-friendly shape
const mapProjectToUI = (p) => ({
  id: p.id,
  projectId: p.project_id,
  name: p.project_name,
  description: p.project_description,
  repository: p.github_repo_id || '',
  frdDocument: p.frd || '',
  userStories: p.user_story || '',
  postmanCollection: p.swagger_documentation || '',
  projectUrl: p.project_url || '',
  userId: p.user_id,
  isActive: p.is_active,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

export const projectApi = {
  async getProjects({ userId, limit = 100, search } = {}) {
    // Prefer dedicated endpoint when filtering by user
    if (userId) {
      const res = await apiClient.get(`/api/projects/user/${encodeURIComponent(userId)}`);
      return (res.data || []).map(mapProjectToUI);
    }
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (search) params.set('search', search);
    const res = await apiClient.get(`/api/projects${params.toString() ? `?${params.toString()}` : ''}`);
    return (res.data || []).map(mapProjectToUI);
  },

  async getProject(projectId) {
    const res = await apiClient.get(`/api/projects/${encodeURIComponent(projectId)}`);
    return mapProjectToUI(res.data);
  },

  async createProject(project) {
    // project: { project_name, project_description, user_id, ... }
    const res = await apiClient.post('/api/projects/', project);
    return mapProjectToUI(res.data);
  },

  async updateProject(projectId, updates) {
    const res = await apiClient.patch(`/api/projects/${encodeURIComponent(projectId)}`, updates);
    return mapProjectToUI(res.data);
  },

  async deleteProject(projectId) {
    await apiClient.delete(`/api/projects/${encodeURIComponent(projectId)}`);
  },
};


