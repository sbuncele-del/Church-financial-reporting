import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userService, type ChurchUser } from '../../services/userService';
import { useAuthStore } from '../../stores/authStore';
import {
  PlusIcon,
  PencilSquareIcon,
  LockClosedIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';

const ROLES = ['admin', 'finance', 'leader', 'member'] as const;
type Role = typeof ROLES[number];

const roleBadge: Record<string, string> = {
  admin:   'bg-purple-100 text-purple-700',
  finance: 'bg-blue-100 text-blue-700',
  leader:  'bg-amber-100 text-amber-700',
  member:  'bg-gray-100 text-gray-600',
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

type AddForm = { first_name: string; last_name: string; email: string; role: Role; password: string; confirm_password: string };
type EditForm = { first_name: string; last_name: string; role: Role; is_active: boolean };
type ResetForm = { password: string; confirm_password: string };

export default function Users() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<ChurchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'add' | 'edit' | 'reset'>(null);
  const [selected, setSelected] = useState<ChurchUser | null>(null);

  const addForm = useForm<AddForm>();
  const editForm = useForm<EditForm>();
  const resetForm = useForm<ResetForm>();

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await userService.getUsers());
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u: ChurchUser) => {
    setSelected(u);
    editForm.reset({ first_name: u.first_name, last_name: u.last_name, role: u.role as Role, is_active: u.is_active });
    setModal('edit');
  };

  const openReset = (u: ChurchUser) => {
    setSelected(u);
    resetForm.reset();
    setModal('reset');
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const onAdd = addForm.handleSubmit(async (data) => {
    if (data.password !== data.confirm_password) {
      addForm.setError('confirm_password', { message: 'Passwords do not match' });
      return;
    }
    try {
      const u = await userService.createUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      });
      setUsers(prev => [...prev, u as ChurchUser]);
      toast.success(`${u.first_name} added successfully`);
      closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to add user');
    }
  });

  const onEdit = editForm.handleSubmit(async (data) => {
    if (!selected) return;
    try {
      const u = await userService.updateUser(selected.id, data);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...u } : x));
      toast.success('User updated');
      closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update user');
    }
  });

  const onReset = resetForm.handleSubmit(async (data) => {
    if (!selected) return;
    if (data.password !== data.confirm_password) {
      resetForm.setError('confirm_password', { message: 'Passwords do not match' });
      return;
    }
    try {
      await userService.updateUser(selected.id, { password: data.password });
      toast.success(`Password reset for ${selected.first_name}`);
      closeModal();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to reset password');
    }
  });

  const toggleActive = async (u: ChurchUser) => {
    try {
      const updated = await userService.updateUser(u.id, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === updated.id ? { ...x, ...updated } : x));
      toast.success(updated.is_active ? `${u.first_name} reactivated` : `${u.first_name} deactivated`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage who has access to your church account</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn btn-secondary flex items-center gap-2 text-sm">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => { addForm.reset(); setModal('add'); }} className="btn btn-primary flex items-center gap-2 text-sm">
            <PlusIcon className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <ArrowPathIcon className="w-7 h-7 text-primary-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No users yet. Add one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary-700">
                          {u.first_name[0]}{u.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                        {u.id === me?.id && <p className="text-xs text-primary-500">You</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge[u.role] || roleBadge.member}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.is_active
                      ? <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" />
                      : <NoSymbolIcon className="w-5 h-5 text-red-400 mx-auto" />}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        title="Edit user"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openReset(u)}
                        title="Reset password"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-amber-600 transition-colors"
                      >
                        <LockClosedIcon className="w-4 h-4" />
                      </button>
                      {u.id !== me?.id && (
                        <button
                          onClick={() => toggleActive(u)}
                          title={u.is_active ? 'Deactivate' : 'Reactivate'}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${u.is_active ? 'text-gray-500 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                        >
                          {u.is_active ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Role guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Role permissions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { role: 'admin', desc: 'Full access — manage users, finances, all settings' },
            { role: 'finance', desc: 'Record income & expenses, view reports' },
            { role: 'leader', desc: 'View financial reports and dashboards' },
            { role: 'member', desc: 'Read-only access to dashboards' },
          ].map(r => (
            <div key={r.role} className="rounded-lg border border-gray-100 p-3">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize mb-1.5 ${roleBadge[r.role]}`}>
                {r.role}
              </span>
              <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {modal === 'add' && (
        <Modal title="Add New User" onClose={closeModal}>
          <form onSubmit={onAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <input className={`input ${addForm.formState.errors.first_name ? 'input-error' : ''}`}
                  placeholder="John" {...addForm.register('first_name', { required: 'Required' })} />
                {addForm.formState.errors.first_name && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last name</label>
                <input className={`input ${addForm.formState.errors.last_name ? 'input-error' : ''}`}
                  placeholder="Doe" {...addForm.register('last_name', { required: 'Required' })} />
                {addForm.formState.errors.last_name && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className={`input ${addForm.formState.errors.email ? 'input-error' : ''}`}
                placeholder="john@church.org" {...addForm.register('email', { required: 'Required' })} />
              {addForm.formState.errors.email && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" {...addForm.register('role', { required: true })}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className={`input ${addForm.formState.errors.password ? 'input-error' : ''}`}
                placeholder="Min. 6 characters" {...addForm.register('password', { required: 'Required', minLength: { value: 6, message: 'Min. 6 characters' } })} />
              {addForm.formState.errors.password && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input type="password" className={`input ${addForm.formState.errors.confirm_password ? 'input-error' : ''}`}
                placeholder="Repeat password" {...addForm.register('confirm_password', { required: 'Required' })} />
              {addForm.formState.errors.confirm_password && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.confirm_password.message}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={addForm.formState.isSubmitting} className="btn btn-primary flex-1">
                {addForm.formState.isSubmitting ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {modal === 'edit' && selected && (
        <Modal title={`Edit — ${selected.first_name} ${selected.last_name}`} onClose={closeModal}>
          <form onSubmit={onEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <input className="input" {...editForm.register('first_name', { required: true })} />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" {...editForm.register('last_name', { required: true })} />
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" {...editForm.register('role')}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" id="is_active" className="w-4 h-4 text-primary-600 rounded"
                {...editForm.register('is_active')} />
              <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">Active (can log in)</label>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={editForm.formState.isSubmitting} className="btn btn-primary flex-1">
                {editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {modal === 'reset' && selected && (
        <Modal title={`Reset Password — ${selected.first_name} ${selected.last_name}`} onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">Set a new password for this user. Share it with them securely.</p>
          <form onSubmit={onReset} className="space-y-4">
            <div>
              <label className="label">New password</label>
              <input type="password" className={`input ${resetForm.formState.errors.password ? 'input-error' : ''}`}
                placeholder="Min. 6 characters"
                {...resetForm.register('password', { required: 'Required', minLength: { value: 6, message: 'Min. 6 characters' } })} />
              {resetForm.formState.errors.password && <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input type="password" className={`input ${resetForm.formState.errors.confirm_password ? 'input-error' : ''}`}
                placeholder="Repeat password"
                {...resetForm.register('confirm_password', { required: 'Required' })} />
              {resetForm.formState.errors.confirm_password && <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.confirm_password.message}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={resetForm.formState.isSubmitting} className="btn btn-primary flex-1">
                {resetForm.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
