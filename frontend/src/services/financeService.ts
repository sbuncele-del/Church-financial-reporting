import api from './api';
import type { 
  Income, 
  IncomeCreate, 
  IncomeListResponse,
  Expense,
  ExpenseCreate,
  ExpenseListResponse,
  IncomeCategory,
  ExpenseCategory,
  FinancialAccount,
  FinancialSummary
} from '../types';
import { useAuthStore } from '../stores/authStore';

// Helper to get current church_id
const getChurchId = (): number => {
  const user = useAuthStore.getState().user;
  return user?.church_id || 1;
};

export const financeService = {
  // Income Categories
  async getIncomeCategories(): Promise<IncomeCategory[]> {
    const response = await api.get<IncomeCategory[]>('/finance/income-categories', {
      params: { church_id: getChurchId() }
    });
    return response.data;
  },

  async createIncomeCategory(data: { name: string; description?: string; is_tax_deductible?: boolean }): Promise<IncomeCategory> {
    const response = await api.post<IncomeCategory>('/finance/income-categories', data);
    return response.data;
  },

  // Expense Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const response = await api.get<ExpenseCategory[]>('/finance/expense-categories');
    return response.data;
  },

  async createExpenseCategory(data: { name: string; description?: string; parent_id?: number }): Promise<ExpenseCategory> {
    const response = await api.post<ExpenseCategory>('/finance/expense-categories', data);
    return response.data;
  },

  // Income
  async getIncomes(params?: {
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
    category_id?: number;
    member_id?: number;
  }): Promise<IncomeListResponse> {
    const response = await api.get<IncomeListResponse>('/finance/income', { 
      params: { ...params, church_id: getChurchId() } 
    });
    return response.data;
  },

  async getIncome(id: number): Promise<Income> {
    const response = await api.get<Income>(`/finance/income/${id}`);
    return response.data;
  },

  async createIncome(data: IncomeCreate): Promise<Income> {
    const response = await api.post<Income>('/finance/income', { 
      ...data, 
      church_id: getChurchId() 
    });
    return response.data;
  },

  async updateIncome(id: number, data: Partial<IncomeCreate>): Promise<Income> {
    const response = await api.put<Income>(`/finance/income/${id}`, data);
    return response.data;
  },

  async deleteIncome(id: number): Promise<void> {
    await api.delete(`/finance/income/${id}`);
  },

  // Expenses
  async getExpenses(params?: {
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
    category_id?: number;
    is_approved?: boolean;
  }): Promise<ExpenseListResponse> {
    const response = await api.get<ExpenseListResponse>('/finance/expenses', { params });
    return response.data;
  },

  async getExpense(id: number): Promise<Expense> {
    const response = await api.get<Expense>(`/finance/expenses/${id}`);
    return response.data;
  },

  async createExpense(data: ExpenseCreate): Promise<Expense> {
    const response = await api.post<Expense>('/finance/expenses', data);
    return response.data;
  },

  async updateExpense(id: number, data: Partial<ExpenseCreate>): Promise<Expense> {
    const response = await api.put<Expense>(`/finance/expenses/${id}`, data);
    return response.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/finance/expenses/${id}`);
  },

  // Accounts
  async getAccounts(): Promise<FinancialAccount[]> {
    const response = await api.get<FinancialAccount[]>('/finance/accounts');
    return response.data;
  },

  // Summary
  async getSummary(startDate: string, endDate: string): Promise<FinancialSummary> {
    const response = await api.get<FinancialSummary>('/finance/summary', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
};

export const reportsService = {
  async getIncomeStatement(startDate: string, endDate: string) {
    const response = await api.get('/reports/income-statement', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getMonthlyComparison(year: number) {
    const response = await api.get('/reports/monthly-comparison', {
      params: { year }
    });
    return response.data;
  },

  async getDonorStatement(memberId: number, startDate: string, endDate: string) {
    const response = await api.get(`/reports/donor-statement/${memberId}`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getTopDonors(startDate: string, endDate: string, limit: number = 10) {
    const response = await api.get('/reports/top-donors', {
      params: { start_date: startDate, end_date: endDate, limit }
    });
    return response.data;
  },

  async exportTransactions(startDate: string, endDate: string, type: 'all' | 'income' | 'expense' = 'all') {
    const response = await api.get('/reports/export/transactions', {
      params: { start_date: startDate, end_date: endDate, transaction_type: type },
      responseType: 'blob'
    });
    return response.data;
  },
};
