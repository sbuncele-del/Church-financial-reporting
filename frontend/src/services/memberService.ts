import api from './api';
import type { Member, MemberSummary, MemberStatus } from '../types';
import { useAuthStore } from '../stores/authStore';

const getChurchId = (): number => {
  const user = useAuthStore.getState().user;
  if (!user?.church_id) throw new Error('No church_id available');
  return user.church_id;
};

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
  member_status?: MemberStatus;
  membership_date?: string;
}

export const memberService = {
  async getMembers(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<MemberListResponse> {
    const response = await api.get<MemberListResponse>('/members', {
      params: { ...params, church_id: getChurchId() }
    });
    return response.data;
  },

  async getMembersSummary(): Promise<MemberSummary[]> {
    const response = await api.get<MemberSummary[]>('/members/summary', {
      params: { church_id: getChurchId() }
    });
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
