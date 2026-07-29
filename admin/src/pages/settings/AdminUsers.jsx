import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, Key, Users } from 'lucide-react';
import { adminUsersAPI } from '../../api/settings';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatusToggle from '../../components/ui/StatusToggle';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'editor', label: 'Editor' },
];

const roleBadgeVariant = {
  super_admin: 'purple',
  editor: 'info',
};

const roleLabel = {
  super_admin: 'Super Admin',
  editor: 'Editor',
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      await adminUsersAPI.update(item._id, { isActive: !item.isActive });
      setUsers((prev) => prev.map((u) => u._id === item._id ? { ...u, isActive: !u.isActive } : u));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: errorsPwd },
  } = useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUsersAPI.getAll();
      setUsers(res.data.data || res.data.users || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    reset({
      name: '',
      email: '',
      role: '',
      isActive: true,
      password: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || '',
      email: item.email || '',
      role: item.role || '',
      isActive: item.isActive ?? true,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const payload = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };
      if (!editingItem) {
        payload.password = data.password;
      }
      if (editingItem) {
        await adminUsersAPI.update(editingItem._id, payload);
        toast.success('Admin user updated.');
      } else {
        await adminUsersAPI.create(payload);
        toast.success('Admin user created.');
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminUsersAPI.delete(deleteTarget._id);
      toast.success('Admin user deleted.');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const openResetPassword = (item) => {
    setResetPasswordTarget(item);
    resetPwd({ newPassword: '' });
  };

  const handleResetPassword = async (data) => {
    if (!resetPasswordTarget) return;
    try {
      setResetting(true);
      await adminUsersAPI.resetPassword(resetPasswordTarget._id, data.newPassword);
      toast.success('Password reset successfully.');
      setResetPasswordTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  const isSelf = (item) => currentUser?._id === item._id || currentUser?.id === item._id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Users"
        subtitle="Manage admin accounts and permissions"
        actionLabel="Add Admin"
        actionIcon={Plus}
        action={openAdd}
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            message="No admin users"
            description="Create the first admin user."
            action={openAdd}
            actionLabel="Add Admin"
            icon={Users}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isSelf(item) && (
                          <span className="text-xs text-teal-600 font-normal">(You)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{item.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={roleBadgeVariant[item.role] || 'default'}>
                        {roleLabel[item.role] || item.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <StatusToggle
                        isActive={item.isActive}
                        loading={togglingId === item._id}
                        onToggle={() => toggleStatus(item)}
                      />
                    </td>
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {formatDateTime(item.lastLogin) || '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-blue-50 transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => openResetPassword(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Reset password"
                        >
                          <Key size={15} />
                        </button>
                        {!isSelf(item) && (
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Admin User' : 'Add Admin User'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="admin-user-form" loading={saving}>
              {editingItem ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <form id="admin-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            register={register}
            required="Name is required"
            error={errors.name?.message}
            placeholder="Full name"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            required="Email is required"
            error={errors.email?.message}
            placeholder="admin@example.com"
          />
          <Select
            label="Role"
            name="role"
            register={register}
            required="Role is required"
            error={errors.role?.message}
            options={ROLE_OPTIONS}
            placeholder="Select role..."
          />
          {!editingItem && (
            <Input
              label="Password"
              name="password"
              type="password"
              register={register}
              required="Password is required"
              error={errors.password?.message}
              placeholder="Minimum 8 characters"
            />
          )}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="userIsActive"
              {...register('isActive')}
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            <label htmlFor="userIsActive" className="text-sm font-medium text-slate-700">
              Active
            </label>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={!!resetPasswordTarget}
        onClose={() => setResetPasswordTarget(null)}
        title="Reset Password"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetPasswordTarget(null)} disabled={resetting}>
              Cancel
            </Button>
            <Button type="submit" form="reset-pwd-form" loading={resetting} variant="warning">
              Reset Password
            </Button>
          </>
        }
      >
        <form id="reset-pwd-form" onSubmit={handleSubmitPwd(handleResetPassword)} className="space-y-4">
          <p className="text-sm text-slate-600">
            Reset password for <span className="font-semibold">{resetPasswordTarget?.name}</span>.
          </p>
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            register={registerPwd}
            required="Password is required"
            error={errorsPwd.newPassword?.message}
            placeholder="Minimum 8 characters"
          />
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Admin User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
