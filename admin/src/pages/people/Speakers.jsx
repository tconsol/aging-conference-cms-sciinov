import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatusToggle from '../../components/ui/StatusToggle';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SearchBar from '../../components/ui/SearchBar';
import Dropdown from '../../components/ui/Dropdown';
import { speakersAPI } from '../../api/people';
import { editionsAPI } from '../../api/congress';
import { getErrorMessage } from '../../utils/helpers';

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-green-100 text-green-700',
  'bg-indigo-100 text-indigo-700',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getColorClass(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
}

export default function Speakers() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEdition, setFilterEdition] = useState('');
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, hasFile: false });
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      await speakersAPI.update(item._id, { isActive: !item.isActive });
      setItems((prev) => prev.map((s) => s._id === item._id ? { ...s, isActive: !s.isActive } : s));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const fetchEditions = async () => {
    try {
      const res = await editionsAPI.getAll();
      setEditions(res.data.data || []);
    } catch {
      // silently ignore
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterEdition) params.edition = filterEdition;
      if (search) params.search = search;
      const res = await speakersAPI.getAll(params);
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load speakers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchItems(); }, [filterEdition, search]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await speakersAPI.delete(deleteDialog.id);
      toast.success('Speaker deleted.');
      setDeleteDialog({ open: false, id: null, hasFile: false });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Speakers"
        subtitle={`${items.length} speaker${items.length !== 1 ? 's' : ''}`}
        action={() => navigate('/speakers/new')}
        actionLabel="Add Speaker"
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name..."
        />
        <Dropdown
          value={filterEdition}
          onChange={setFilterEdition}
          options={[{ value: '', label: 'All Editions' }, ...editions.map((e) => ({ value: e._id, label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})` }))]}
          className="w-56"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No speakers found"
            description="Add speakers to your congress."
            action={() => navigate('/speakers/new')}
            actionLabel="Add Speaker"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getColorClass(item.fullName)}`}
                        >
                          {getInitials(item.fullName)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800">{item.fullName}</td>
                    <td className="px-6 py-3 text-slate-600">{item.designation || '—'}</td>
                    <td className="px-6 py-3 text-slate-600">{item.organization || '—'}</td>
                    <td className="px-6 py-3 text-slate-600">{item.country || '—'}</td>
                    <td className="px-6 py-3">
                      {item.isFeatured ? (
                        <Badge variant="warning">Featured</Badge>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <StatusToggle
                        isActive={item.isActive}
                        loading={togglingId === item._id}
                        onToggle={() => toggleStatus(item)}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/speakers/${item._id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: item._id, hasFile: !!item.photo })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, hasFile: false })}
        onConfirm={handleDelete}
        title="Delete Speaker"
        message="Are you sure you want to delete this speaker? This action cannot be undone."
        loading={deleting}
        storageWarning={deleteDialog.hasFile}
      />
    </div>
  );
}
