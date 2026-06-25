import api from './api';

export const platformService = {
  async getOverview() {
    const res = await api.get('/platform/overview');
    return res.data;
  },

  async getChurches() {
    const res = await api.get('/platform/churches');
    return res.data;
  },

  async getChurchSummary(churchId: number) {
    const res = await api.get(`/platform/church/${churchId}/summary`);
    return res.data;
  },

  async getChurchIncome(churchId: number, startDate: string, endDate: string) {
    const res = await api.get(`/platform/church/${churchId}/income`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return res.data;
  },

  async getChurchExpenses(churchId: number, startDate: string, endDate: string) {
    const res = await api.get(`/platform/church/${churchId}/expenses`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return res.data;
  },

  async getChurchIncomeStatement(churchId: number, startDate: string, endDate: string) {
    const res = await api.get(`/platform/church/${churchId}/income-statement`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return res.data;
  },
};
