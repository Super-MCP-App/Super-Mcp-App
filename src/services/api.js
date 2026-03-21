import { getSession, signOut } from './supabase';
import { Platform } from 'react-native';

const API_BASE = 'https://super-mcp-app.vercel.app/api';

// Core fetch wrapper with auth
async function apiFetch(endpoint, options = {}) {
  const session = await getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  // Handle unauthorized / expired tokens globally
  if (response.status === 401) {
    try { await signOut(); } catch (e) {}
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }
  return data;
}

// ============ Auth ============
export const authApi = {
  register: (email, password, full_name) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name }) }),
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

// ============ Conversations ============
export const conversationsApi = {
  list: () => apiFetch('/conversations'),
  get: (id) => apiFetch(`/conversations/${id}`),
  create: (title, model) => apiFetch('/conversations', { method: 'POST', body: JSON.stringify({ title, model }) }),
  delete: (id) => apiFetch(`/conversations/${id}`, { method: 'DELETE' }),
};

// ============ Messages ============
export const messagesApi = {
  send: (conversation_id, content, useMcp = true, imageBase64 = null) =>
    apiFetch('/messages', { method: 'POST', body: JSON.stringify({ conversation_id, content, useMcp, image: imageBase64 }) }),
};

// ============ Tasks ============
export const tasksApi = {
  list: (status) => apiFetch(`/tasks${status ? `?status=${status}` : ''}`),
  get: (id) => apiFetch(`/tasks/${id}`),
  create: (title, description) =>
    apiFetch('/tasks', { method: 'POST', body: JSON.stringify({ title, description }) }),
  update: (id, updates) =>
    apiFetch(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  delete: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),
};

// ============ Notifications ============
export const notificationsApi = {
  list: () => apiFetch('/notifications'),
  markRead: (ids) => apiFetch('/notifications', { method: 'PATCH', body: JSON.stringify({ ids }) }),
  markAllRead: () => apiFetch('/notifications', { method: 'PATCH', body: JSON.stringify({ markAll: true }) }),
};

// ============ Usage ============
export const usageApi = {
  get: (days = 7) => apiFetch(`/usage?days=${days}`),
};

// ============ Profile ============
export const profileApi = {
  get: () => apiFetch('/profile'),
  update: (updates) => apiFetch('/profile', { method: 'PATCH', body: JSON.stringify(updates) }),
};

// ============ Integrations ============
export const integrationsApi = {
  list: () => apiFetch('/integrations'),
  disconnect: (provider) =>
    apiFetch('/integrations', { method: 'DELETE', body: JSON.stringify({ provider }) }),

  // Figma
  figmaAuth: (redirectUrl = '') => 
    apiFetch(`/integrations/figma?action=auth&redirect_url=${encodeURIComponent(redirectUrl)}`),
  figmaStatus: () => apiFetch('/integrations/figma'),
  figmaGetFile: (fileKey) =>
    apiFetch('/integrations/figma', { method: 'POST', body: JSON.stringify({ action: 'getFile', fileKey }) }),
  figmaGetImages: (fileKey, nodeIds) =>
    apiFetch('/integrations/figma', { method: 'POST', body: JSON.stringify({ action: 'getImages', fileKey, nodeIds }) }),

  // Canva
  canvaAuth: (redirectUrl = '') => 
    apiFetch(`/integrations/canva?action=auth&redirect_url=${encodeURIComponent(redirectUrl)}`),
  canvaStatus: () => apiFetch('/integrations/canva'),
  canvaGetDesign: (designId) =>
    apiFetch('/integrations/canva', { method: 'POST', body: JSON.stringify({ action: 'getDesign', designId }) }),
  canvaExport: (designId, format) =>
    apiFetch('/integrations/canva', { method: 'POST', body: JSON.stringify({ action: 'export', designId, format }) }),
};
