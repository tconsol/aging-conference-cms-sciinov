import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  ClipboardList,
  CreditCard,
  Users,
  Newspaper,
  Mail,
} from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';
import Badge, { statusBadge } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { dashboardAPI } from '../api/dashboard';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getStats();
        setData(res.data.data);
      } catch {
        toast.error('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentAbstracts = data?.recentAbstracts || [];
  const recentRegistrations = data?.recentRegistrations || [];
  const recentMessages = data?.recentMessages || [];

  const statCards = [
    { label: 'Total Abstracts', value: stats.totalAbstracts, icon: FileText, color: 'blue' },
    { label: 'Approved Abstracts', value: stats.approvedAbstracts, icon: CheckCircle, color: 'green' },
    { label: 'Pending Abstracts', value: stats.pendingAbstracts, icon: Clock, color: 'amber' },
    { label: 'Total Registrations', value: stats.totalRegistrations, icon: ClipboardList, color: 'indigo' },
    { label: 'Confirmed Registrations', value: stats.confirmedRegistrations, icon: CreditCard, color: 'teal' },
    { label: 'Total Speakers', value: stats.totalSpeakers, icon: Users, color: 'purple' },
    { label: 'Published News', value: stats.publishedNews, icon: Newspaper, color: 'indigo' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: Mail, color: 'amber' },
  ];

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here's an overview of the congress.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Recent abstracts */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Recent Abstracts</h2>
          <button
            onClick={() => navigate('/abstracts')}
            className="text-xs text-teal-700 hover:text-blue-700 font-medium"
          >
            View all →
          </button>
        </div>
        {recentAbstracts.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">No recent abstracts.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAbstracts.slice(0, 5).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="px-6 py-3 text-slate-600 max-w-xs truncate">{item.abstractTitle}</td>
                    <td className="px-6 py-3">{statusBadge(item.status)}</td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(item.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Recent Registrations</h2>
          <button
            onClick={() => navigate('/registrations')}
            className="text-xs text-teal-700 hover:text-blue-700 font-medium"
          >
            View all →
          </button>
        </div>
        {recentRegistrations.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">No recent registrations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRegistrations.slice(0, 5).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{item.category}</td>
                    <td className="px-6 py-3">{statusBadge(item.paymentStatus)}</td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(item.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent messages */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Recent Messages</h2>
          <button
            onClick={() => navigate('/contact')}
            className="text-xs text-teal-700 hover:text-blue-700 font-medium"
          >
            View all →
          </button>
        </div>
        {recentMessages.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">No recent messages.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">From</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMessages.slice(0, 3).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-3 text-slate-600">{item.email}</td>
                    <td className="px-6 py-3 text-slate-600 max-w-xs truncate">{item.subject}</td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(item.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
