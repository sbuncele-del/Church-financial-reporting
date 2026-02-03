/**
 * API Types - mirrors backend schemas
 */

// User & Auth
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  church_id?: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export type UserRole = 'super_admin' | 'admin' | 'finance' | 'leader' | 'member';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  church_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Church
export interface Church {
  id: number;
  name: string;
  denomination?: string;
  email?: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  currency: string;
  fiscal_year_start_month: number;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

// Member
export interface Member {
  id: number;
  church_id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
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
  country: string;
  member_status: MemberStatus;
  membership_date?: string;
  full_name: string;
  age?: number;
  created_at: string;
}

export type MemberStatus = 'active' | 'inactive' | 'visitor' | 'transferred' | 'deceased';

export interface MemberSummary {
  id: number;
  full_name: string;
  email?: string;
  member_status: MemberStatus;
}

// Finance
export type PaymentMethod = 'cash' | 'check' | 'card' | 'bank_transfer' | 'online' | 'other';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'other';

export interface IncomeCategory {
  id: number;
  church_id: number;
  name: string;
  description?: string;
  is_tax_deductible: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ExpenseCategory {
  id: number;
  church_id: number;
  name: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Income {
  id: number;
  church_id: number;
  category_id: number;
  member_id?: number;
  is_anonymous: boolean;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  description?: string;
  status: TransactionStatus;
  created_by?: number;
  created_at: string;
  category_name?: string;
  member_name?: string;
}

export interface IncomeCreate {
  category_id: number;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  description?: string;
  member_id?: number;
  is_anonymous?: boolean;
  account_id?: number;
}

export interface Expense {
  id: number;
  church_id: number;
  category_id: number;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  payee_name: string;
  payee_type?: string;
  reference_number?: string;
  invoice_number?: string;
  description?: string;
  status: TransactionStatus;
  is_approved: boolean;
  created_by?: number;
  created_at: string;
  category_name?: string;
}

export interface ExpenseCreate {
  category_id: number;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  payee_name: string;
  payee_type?: string;
  reference_number?: string;
  invoice_number?: string;
  description?: string;
  account_id?: number;
}

export interface FinancialAccount {
  id: number;
  church_id: number;
  name: string;
  account_type: AccountType;
  bank_name?: string;
  current_balance: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

// Reports
export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  income_by_category: Record<string, number>;
  expenses_by_category: Record<string, number>;
  period: string;
}

export interface MonthlyData {
  month: number;
  month_name: string;
  income: number;
  expenses: number;
  net: number;
}

// List Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface IncomeListResponse {
  incomes: Income[];
  total: number;
  total_amount: number;
  page: number;
  per_page: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  total_amount: number;
  page: number;
  per_page: number;
}
