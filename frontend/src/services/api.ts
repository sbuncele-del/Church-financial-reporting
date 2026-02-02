import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';

// Demo mode OFF - using real backend API
const DEMO_MODE = false;

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
  '/members/summary': {
    total: 2,
    active: 2,
    inactive: 0,
    visitors: 0
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
  '/finance/income-categories': [
    { id: 1, name: 'Tithes', description: 'Regular tithes from members', is_tax_deductible: true },
    { id: 2, name: 'Offerings', description: 'General offerings', is_tax_deductible: true },
    { id: 3, name: 'First Fruits', description: 'First fruits offerings', is_tax_deductible: true },
    { id: 4, name: 'Free Will', description: 'Free will offerings', is_tax_deductible: true },
    { id: 5, name: 'Sacrificial Seed', description: 'Sacrificial seed offerings', is_tax_deductible: true },
    { id: 6, name: 'Building Fund', description: 'Donations for building projects', is_tax_deductible: true },
    { id: 7, name: 'Missions', description: 'Donations for mission work', is_tax_deductible: true },
    { id: 8, name: 'Youth Ministry', description: 'Donations for youth programs', is_tax_deductible: true },
    { id: 9, name: 'Benevolence', description: 'Donations to help those in need', is_tax_deductible: true },
    { id: 10, name: 'Other Income', description: 'Miscellaneous income', is_tax_deductible: false },
  ],
  '/finance/expense-categories': [
    { id: 1, name: 'Pastoral Salary', description: 'Pastor compensation' },
    { id: 2, name: 'Staff Salaries', description: 'Other staff compensation' },
    { id: 3, name: 'Rent/Mortgage', description: 'Building payment' },
    { id: 4, name: 'Utilities', description: 'Electric, water, gas, internet' },
    { id: 5, name: 'Maintenance', description: 'Building upkeep' },
    { id: 6, name: 'Office Supplies', description: 'Paper, printing, etc.' },
    { id: 7, name: 'Missions Support', description: 'Missionary support' },
    { id: 8, name: 'Benevolence', description: 'Assistance to those in need' },
    { id: 9, name: 'Events', description: 'Church events and hospitality' },
    { id: 10, name: 'Other Expenses', description: 'Miscellaneous expenses' },
  ],
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

// Demo mode interceptor - return mock data BEFORE making real request
if (DEMO_MODE) {
  api.interceptors.request.use(
    (config) => {
      const path = config.url || '';
      // Sort keys by length (longest first) to match more specific routes first
      const sortedKeys = Object.keys(mockResponses).sort((a, b) => b.length - a.length);
      const mockKey = sortedKeys.find(key => path.includes(key));
      
      if (mockKey) {
        console.log('[DEMO MODE] Intercepting request, returning mock for:', path);
        // Throw a custom error that will be caught by response interceptor
        const error = new Error('DEMO_MOCK') as any;
        error.__DEMO_MOCK__ = true;
        error.__MOCK_DATA__ = mockResponses[mockKey];
        error.config = config;
        throw error;
      }
      
      return config;
    }
  );
  
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // If this is our demo mock, return it as a successful response
      if (error.__DEMO_MOCK__) {
        console.log('[DEMO MODE] Returning mock data');
        return Promise.resolve({
          data: error.__MOCK_DATA__,
          status: 200,
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
// Force rebuild Sun Feb  1 22:28:09 UTC 2026
