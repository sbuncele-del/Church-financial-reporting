import api from './api';

export interface ChurchUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const userService = {
  async getUsers(): Promise<ChurchUser[]> {
    const res = await api.get('/users');
    return res.data;
  },

  async createUser(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Promise<ChurchUser> {
    const res = await api.post('/users', data);
    return res.data;
  },

  async updateUser(id: number, data: {
    first_name?: string;
    last_name?: string;
    role?: string;
    is_active?: boolean;
    password?: string;
  }): Promise<ChurchUser> {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
};
