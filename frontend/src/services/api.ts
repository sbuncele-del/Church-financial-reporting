import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';

// Demo mode - works without backend
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Use environment variable with proper fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Log for debugging
console.log('[API Config]', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  allEnv: import.meta.env
});

// Mock data for demo mode
const mockResponses: Record<string, unknown> = {
  '/auth/login': {
    access_token: 'demo_access_token_12345',
    refresh_token: 'demo_refresh_token_12345',
    token_type: 'bearer',
    user: {
      id: 1,
      email: 'demo@church.org',
      first_name: 'Demo',
      last_name: 'User',
      role: 'admin',
      church_id: 1,
      is_active: true,
      is_verified: true,
      created_at: '2026-01-01T00:00:00Z'
    }
  },
  '/users/me': {
    id: 1,
    email: 'demo@church.org',
    first_name: 'Demo',
    last_name: 'User',
    role: 'admin',
    church_id: 1,
    is_active: true,
    is_verified: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  '/solar/dashboard/1': {
    church_id: 1,
    church_name: 'Demo Church',
    assessment_period: 'Q1 2026',
    overall_score: 72.5,
    dimension_scores: {
      S: { score: 78, name: 'Spiritual Vitality', color: '#8B5CF6' },
      O: { score: 65, name: 'Organisational Governance', color: '#3B82F6' },
      L: { score: 82, name: 'Love & Care', color: '#EC4899' },
      A: { score: 68, name: 'Advancement', color: '#10B981' },
      R: { score: 70, name: 'Resources', color: '#F59E0B' }
    },
    strengths: ['Strong prayer culture', 'Active small groups', 'Excellent pastoral care'],
    improvements: ['Financial systems need updating', 'Youth ministry growth needed'],
    trend: 'improving'
  },
  '/solar/kpis/summary': {
    total_kpis: 50,
    dimensions: {
      S: { name: 'Spiritual Vitality', kpi_count: 10, avg_score: 78 },
      O: { name: 'Organisational Governance', kpi_count: 10, avg_score: 65 },
      L: { name: 'Love & Care', kpi_count: 10, avg_score: 82 },
      A: { name: 'Advancement', kpi_count: 10, avg_score: 68 },
      R: { name: 'Resources', kpi_count: 10, avg_score: 70 }
    }
  },
  '/members': {
    members: [
      { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', member_status: 'active', created_at: '2024-01-01' },
      { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', member_status: 'active', created_at: '2024-01-02' },
    ],
    total: 2,
    page: 1,
    per_page: 20
  },
  '/finance/income': { items: [], total: 0, page: 1, per_page: 20 },
  '/finance/expenses': { items: [], total: 0, page: 1, per_page: 20 },
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo mode interceptor - return mock data
if (DEMO_MODE) {
  api.interceptors.request.use(async (config) => {
    const path = config.url || '';
    
    // Find matching mock response
    const mockKey = Object.keys(mockResponses).find(key => path.includes(key));
    
    if (mockKey) {
      // Return mock data
      const mockData = mockResponses[mockKey];
      return Promise.reject({
        __MOCK__: true,
        data: mockData,
        status: 200,
        config
      });
    }
    
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.__MOCK__) {
        return Promise.resolve({
          data: error.data,
          status: error.status,
          statusText: 'OK',
          headers: {},
          config: error.config
        } as AxiosResponse);
      }
      return Promise.reject(error);
    }
  );
}

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[API Request]', config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      fullURL: (config.baseURL || '') + (config.url || ''),
      hasAuth: !!token
    });
    return config;
  },
  (error) => {
    if (error.__MOCK__) return Promise.reject(error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log('[API Response] Success:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    if (error.__MOCK__) return Promise.reject(error);
    
    console.error('[API Response] Error:', error.config?.url, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    const originalRequest = error.config;
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          useAuthStore.getState().setTokens(access_token, refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
