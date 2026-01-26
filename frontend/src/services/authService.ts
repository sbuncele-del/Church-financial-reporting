import api from './api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  TokenResponse,
  User 
} from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
};
