import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { memberService } from '../services/memberService';
import type { Member } from '../types';

interface MemberFormData {
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
  member_status?: 'active' | 'inactive' | 'visitor';
  membership_date?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MemberFormData>();

  useEffect(() => {
    loadMembers();
  }, [search]);

  const loadMembers = async () => {
    try {
      const data = await memberService.getMembers({ search: search || undefined, per_page: 50 });
      setMembers(data.members);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    try {
      if (editingId) {
        await memberService.updateMember(editingId, data);
        toast.success('Member updated successfully');
      } else {
        await memberService.createMember(data);
        toast.success('Member added successfully');
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      loadMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save member');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingId(member.id);
    setValue('first_name', member.first_name);
    setValue('last_name', member.last_name);
    setValue('email', member.email || '');
    setValue('phone', member.phone || '');
    setValue('mobile', member.mobile || '');
    setValue('date_of_birth', member.date_of_birth || '');
    setValue('gender', member.gender || undefined);
    setValue('marital_status', member.marital_status || undefined);
    setValue('address_line1', member.address_line1 || '');
    setValue('city', member.city || '');
    setValue('state', member.state || '');
    setValue('postal_code', member.postal_code || '');
    setValue('member_status', member.member_status);
    setValue('membership_date', member.membership_date || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await memberService.deleteMember(id);
      toast.success('Member removed successfully');
      loadMembers();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const openNewModal = () => {
    reset({ member_status: 'active' });
    setEditingId(null);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-danger';
      case 'visitor':
        return 'badge-info';
      default:
        return 'badge-warning';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage your church congregation</p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold">{total}</span> members
        </div>
      </div>

      {/* Members Table */}
      <div className="card p-0 overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">
              {search ? 'No members found matching your search' : 'No members yet'}
            </p>
            {!search && (
              <button onClick={openNewModal} className="btn-primary">
                Add your first member
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Member Since</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {member.first_name[0]}{member.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.full_name}</p>
                          {member.email && (
                            <p className="text-sm text-gray-500">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {member.phone || member.mobile || '-'}
                    </td>
                    <td>
                      <span className={`badge capitalize ${getStatusBadge(member.member_status)}`}>
                        {member.member_status}
                      </span>
                    </td>
                    <td>
                      {member.membership_date || '-'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
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
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Member' : 'Add Member'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    className={`input ${errors.first_name ? 'input-error' : ''}`}
                    {...register('first_name', { required: 'First name is required' })}
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    className={`input ${errors.last_name ? 'input-error' : ''}`}
                    {...register('last_name', { required: 'Last name is required' })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" {...register('email')} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" {...register('phone')} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" className="input" {...register('date_of_birth')} />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" {...register('gender')}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Marital Status</label>
                  <select className="input" {...register('marital_status')}>
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Address</label>
                <input type="text" className="input" placeholder="Street address" {...register('address_line1')} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">City</label>
                  <input type="text" className="input" {...register('city')} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input type="text" className="input" {...register('state')} />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input type="text" className="input" {...register('postal_code')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Member Status</label>
                  <select className="input" {...register('member_status')}>
                    <option value="active">Active</option>
                    <option value="visitor">Visitor</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="label">Membership Date</label>
                  <input type="date" className="input" {...register('membership_date')} />
                </div>
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
