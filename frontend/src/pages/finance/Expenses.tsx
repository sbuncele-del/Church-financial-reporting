import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { financeService } from '../../services/financeService';
import { formatCurrency } from '../../utils/currency';
import type { Expense, ExpenseCategory, ExpenseCreate } from '../../types';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseCreate>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expenseData, categoryData] = await Promise.all([
        financeService.getExpenses({ per_page: 50 }),
        financeService.getExpenseCategories(),
      ]);
      setExpenses(expenseData.expenses);
      setTotalAmount(expenseData.total_amount);
      setCategories(categoryData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ExpenseCreate) => {
    try {
      if (editingId) {
        await financeService.updateExpense(editingId, data);
        toast.success('Expense updated successfully');
      } else {
        await financeService.createExpense(data);
        toast.success('Expense recorded successfully');
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save expense');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setValue('category_id', expense.category_id);
    setValue('amount', expense.amount);
    setValue('date', expense.date);
    setValue('payment_method', expense.payment_method);
    setValue('payee_name', expense.payee_name);
    setValue('payee_type', expense.payee_type || '');
    setValue('reference_number', expense.reference_number || '');
    setValue('invoice_number', expense.invoice_number || '');
    setValue('description', expense.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    
    try {
      await financeService.deleteExpense(id);
      toast.success('Expense deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const openNewModal = () => {
    reset({
      date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'check',
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track all church expenditures</p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Record Expense
        </button>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100">Total Expenses</p>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="text-red-200">
            {expenses.length} transactions
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="card p-0 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No expense records yet</p>
            <button onClick={openNewModal} className="btn-primary">
              Record your first expense
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Payee</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                    <td>
                      <span className="badge badge-warning">{expense.category_name}</span>
                    </td>
                    <td>{expense.payee_name}</td>
                    <td className="font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td>
                      {expense.is_approved ? (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <CheckIcon className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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
                {editingId ? 'Edit Expense' : 'Record Expense'}
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
              </div>

              <div>
                <label className="label">Payee Name *</label>
                <input
                  type="text"
                  className={`input ${errors.payee_name ? 'input-error' : ''}`}
                  placeholder="Vendor or recipient name"
                  {...register('payee_name', { required: 'Payee name is required' })}
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Payment Method</label>
                  <select className="input" {...register('payment_method')}>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payee Type</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Vendor, Employee"
                    {...register('payee_type')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Reference Number</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Check #, Transaction ID"
                    {...register('reference_number')}
                  />
                </div>
                <div>
                  <label className="label">Invoice Number</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Invoice #"
                    {...register('invoice_number')}
                  />
                </div>
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
