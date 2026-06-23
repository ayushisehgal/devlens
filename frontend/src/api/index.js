import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devlens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function loginWithGitHub() {
  window.location.href = `${BASE_URL}/auth/github`;
}

export async function syncRepos() {
  const { data } = await api.post('/api/repos/sync');
  return data;
}

export async function getRepos() {
  const { data } = await api.get('/api/repos');
  return data;
}

export async function getCommits(repoId) {
  const { data } = await api.get(`/api/repos/${repoId}/commits`);
  return data;
}

export async function getPRs(repoId) {
  const { data } = await api.get(`/api/repos/${repoId}/prs`);
  return data;
}

export async function getStaleAlerts() {
  const { data } = await api.get('/api/alerts/stale-prs');
  return data;
}

export default api;
