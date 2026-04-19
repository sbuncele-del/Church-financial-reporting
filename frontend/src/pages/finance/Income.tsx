import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { financeService } from '../../services/financeService';
import { memberService } from '../../services/memberService';
import { formatCurrency } from '../../utils/currency';
import type { Income, IncomeCategory, MemberSummary, IncomeCreate } from '../../types';

// Fallback categories when backend is unreachable
const FALLBACK_INCOME_CATEGORIES: IncomeCategory[] = [
  { id: 1, church_id: 0, name: 'Tithes', description: 'Regular tithes from members', is_tax_deductible: true, is_active: true, sort_order: 1, created_at: '' },
  { id: 2, church_id: 0, name: 'First Fruits', description: 'First fruits offerings', is_tax_deductible: true, is_active: true, sort_order: 2, created_at: '' },
  { id: 3, church_id: 0, name: 'Regular Seed', description: 'Consistent seed sowing', is_tax_deductible: true, is_active: true, sort_order: 3, created_at: '' },
  { id: 4, church_id: 0, name: 'Alms', description: 'Gifts to support the poor', is_tax_deductible: true, is_active: true, sort_order: 4, created_at: '' },
  { id: 5, church_id: 0, name: 'Special Seed', description: 'One-time sacrificial seeds', is_tax_deductible: true, is_active: true, sort_order: 5, created_at: '' },
  { id: 6, church_id: 0, name: 'Offerings', description: 'General offerings', is_tax_deductible: true, is_active: true, sort_order: 6, created_at: '' },
  { id: 7, church_id: 0, name: 'Building Fund', description: 'Donations for building projects', is_tax_deductible: true, is_active: true, sort_order: 7, created_at: '' },
  { id: 8, church_id: 0, name: 'Missions', description: 'Donations for mission work', is_tax_deductible: true, is_active: true, sort_order: 8, created_at: '' },
  { id: 9, church_id: 0, name: 'Youth Ministry', description: 'Donations for youth programs', is_tax_deductible: true, is_active: true, sort_order: 9, created_at: '' },
  { id: 10, church_id: 0, name: 'Other Income', description: 'Miscellaneous income', is_tax_deductible: false, is_active: true, sort_order: 99, created_at: '' },
];

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IncomeCreate>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[Income Page] Starting to load data...');

      // Load each resource independently so one failure doesn't block the others
      const [incomeResult, categoryResult, memberResult] = await Promise.allSettled([
        financeService.getIncomes({ per_page: 50 }),
        financeService.getIncomeCategories(),
        memberService.getMembersSummary(),
      ]);

      // Income
      if (incomeResult.status === 'fulfilled') {
        setIncomes(incomeResult.value.incomes);
        setTotalAmount(incomeResult.value.total_amount);
      } else {
        console.error('[Income Page] Failed to load income:', incomeResult.reason);
      }

      // Categories — use fallback when API fails
      if (categoryResult.status === 'fulfilled' && categoryResult.value.length > 0) {
        setCategories(categoryResult.value);
        setUsingFallback(false);
      } else {
        console.warn('[Income Page] Using fallback categories');
        setCategories(FALLBACK_INCOME_CATEGORIES);
        setUsingFallback(true);
      }

      // Members
      if (memberResult.status === 'fulfilled') {
        setMembers(memberResult.value);
      }

      // Show a warning only if something failed
      const failures = [incomeResult, categoryResult, memberResult].filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        toast.error('Some data failed to load — categories are available offline');
      }

      console.log('[Income Page] Data loaded');
    } catch (error) {
      console.error('[Income Page] Failed to load data:', error);
      // Even if everything fails, still provide fallback categories
      setCategories(FALLBACK_INCOME_CATEGORIES);
      setUsingFallback(true);
      toast.error('Failed to load data — using offline categories');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: IncomeCreate) => {
    try {
      if (editingId) {
        await financeService.updateIncome(editingId, data);
        toast.success('Income updated successfully');
      } else {
        await financeService.createIncome(data);
        toast.success('Income recorded successfully');
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save income');
    }
  };

  const handleEdit = (income: Income) => {
    setEditingId(income.id);
    setValue('category_id', income.category_id);
    setValue('amount', income.amount);
    setValue('date', income.date);
    setValue('payment_method', income.payment_method);
    setValue('member_id', income.member_id || undefined);
    setValue('is_anonymous', income.is_anonymous);
    setValue('reference_number', income.reference_number || '');
    setValue('description', income.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;
    
    try {
      await financeService.deleteIncome(id);
      toast.success('Income deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete income');
    }
  };

  const openNewModal = () => {
    reset({
      date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'cash',
      is_anonymous: false,
    });
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connectivity Warning */}
      {usingFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-800 text-sm">
          <span className="font-medium">Offline mode:</span>
          <span>Using default categories. Saved records will sync when the connection is restored.</span>
          <button onClick={loadData} className="ml-auto text-amber-600 hover:text-amber-800 font-medium underline">
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income</h1>
          <p className="text-gray-600">Track tithes, offerings, and donations</p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Record Income
        </button>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">Total Income</p>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="text-green-200">
            {incomes.length} transactions
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="card p-0 overflow-hidden">
        {incomes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No income records yet</p>
            <button onClick={openNewModal} className="btn-primary">
              Record your first income
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td>{format(new Date(income.date), 'MMM dd, yyyy')}</td>
                    <td>
                      <span className="badge badge-info">{income.category_name}</span>
                    </td>
                    <td>
                      {income.is_anonymous ? (
                        <span className="text-gray-400 italic">Anonymous</span>
                      ) : (
                        income.member_name || '-'
                      )}
                    </td>
                    <td className="font-semibold text-green-600">
                      {formatCurrency(income.amount)}
                    </td>
                    <td className="capitalize">{(income.payment_method || 'cash').replace('_', ' ')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(income)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Income' : 'Record Income'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">Category *</label>
                <select
                  className={`input ${errors.category_id ? 'input-error' : ''}`}
                  {...register('category_id', { required: 'Category is required', valueAsNumber: true })}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`input ${errors.amount ? 'input-error' : ''}`}
                    placeholder="0.00"
                    {...register('amount', { required: 'Amount is required', valueAsNumber: true, min: 0.01 })}
                  />
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    className={`input ${errors.date ? 'input-error' : ''}`}
                    {...register('date', { required: 'Date is required' })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Donor</label>
                <select
                  className="input"
                  {...register('member_id', { valueAsNumber: true })}
                >
                  <option value="">Select donor (optional)</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{member.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  className="rounded border-gray-300"
                  {...register('is_anonymous')}
                />
                <label htmlFor="is_anonymous" className="text-sm text-gray-700">
                  Anonymous donation
                </label>
              </div>

              <div>
                <label className="label">Payment Method</label>
                <select className="input" {...register('payment_method')}>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Reference Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Check number, transaction ID, etc."
                  {...register('reference_number')}
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Additional notes..."
                  {...register('description')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
