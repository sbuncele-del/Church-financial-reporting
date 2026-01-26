import api from './api';
import type { Member, MemberSummary } from '../types';

interface MemberListResponse {
  members: Member[];
  total: number;
  page: number;
  per_page: number;
}

interface MemberCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  member_status?: 'active' | 'inactive' | 'visitor';
  membership_date?: string;
}

export const memberService = {
  async getMembers(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<MemberListResponse> {
    const response = await api.get<MemberListResponse>('/members', { params });
    return response.data;
  },

  async getMembersSummary(): Promise<MemberSummary[]> {
    const response = await api.get<MemberSummary[]>('/members/summary');
    return response.data;
  },

  async getMember(id: number): Promise<Member> {
    const response = await api.get<Member>(`/members/${id}`);
    return response.data;
  },

  async createMember(data: MemberCreate): Promise<Member> {
    const response = await api.post<Member>('/members', data);
    return response.data;
  },

  async updateMember(id: number, data: Partial<MemberCreate>): Promise<Member> {
    const response = await api.put<Member>(`/members/${id}`, data);
    return response.data;
  },

  async deleteMember(id: number): Promise<void> {
    await api.delete(`/members/${id}`);
  },
};
