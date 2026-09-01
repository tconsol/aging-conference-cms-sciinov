import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { registrationsAPI } from '../../api/submissions';
import {
  formatDateTime, formatCurrency, CATEGORY_LABELS, ATTENDANCE_MODE_LABELS,
  PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS, getErrorMessage,
} from '../../utils/helpers';

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentMethodOptions = [{ value: '', label: 'Not set ' }, ...PAYMENT_METHOD_OPTIONS];

// Registrations confirmed before paymentMethod was tracked were all PayPal,
// so fall back to that rather than showing a blank.
function resolvePaymentMethod(reg) {
  if (reg?.paymentMethod) return PAYMENT_METHOD_LABELS[reg.paymentMethod] || reg.paymentMethod;
  if (reg?.paymentStatus === 'confirmed' && reg?.transactionId) return 'PayPal';
  return null;
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800 break-words">{value || ''}</dd>
    </div>
  );
}

export default function RegistrationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchRegistration = async () => {
    setLoading(true);
    try {
      const res = await registrationsAPI.getOne(id);
      const data = res.data.data || res.data;
      setRegistration(data);
      reset({
        paymentStatus: data.paymentStatus || 'pending',
        paymentMethod: data.paymentMethod || '',
        transactionId: data.transactionId || '',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistration(); }, [id]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await registrationsAPI.updatePayment(id, {
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
      });
      toast.success('Payment status updated successfully.');
      fetchRegistration();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Registration not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/registrations')}>
          <ArrowLeft size={15} /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/registrations')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Registrations
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {registration.title ? `${registration.title} ` : ''}{registration.firstName} {registration.lastName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{registration.email}</p>
        </div>
        <div>{statusBadge(registration.paymentStatus)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Personal Information</h2>
            <dl>
              <DetailRow label="Title" value={registration.title} />
              <DetailRow label="Full Name" value={`${registration.title ? registration.title + ' ' : ''}${registration.firstName} ${registration.lastName}`} />
              <DetailRow label="Email" value={registration.email} />
              <DetailRow label="Alternate Email" value={registration.alternateEmail} />
              <DetailRow label="Phone" value={registration.phone} />
              <DetailRow label="WhatsApp" value={registration.whatsapp} />
              <DetailRow label="Country" value={registration.country} />
              <DetailRow label="Institution / Organization" value={registration.organization} />
            </dl>
          </div>

          {/* Registration Details */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Registration Details</h2>
            <dl>
              <DetailRow label="Edition" value={registration.edition?.title || registration.editionId} />
              <DetailRow label="Category" value={categoryLabel(registration.category)} />
              <DetailRow label="Attendance Mode" value={ATTENDANCE_MODE_LABELS[registration.attendanceMode] || registration.attendanceMode} />
              <DetailRow label="Amount" value={formatCurrency(registration.amount, registration.currency)} />
              <DetailRow label="Currency" value={registration.currency} />
              <DetailRow label="Transaction ID" value={registration.transactionId} />
              <DetailRow label="Payment Method" value={resolvePaymentMethod(registration)} />
              <DetailRow label="Registered At" value={formatDateTime(registration.createdAt)} />
            </dl>
          </div>
        </div>

        {/* Payment Update Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Update Payment</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Payment Status"
                name="paymentStatus"
                register={register}
                error={errors.paymentStatus?.message}
                options={paymentStatusOptions}
                required
                defaultValue={registration?.paymentStatus || 'pending'}
              />
              <Select
                label="Payment Method"
                name="paymentMethod"
                register={register}
                error={errors.paymentMethod?.message}
                options={paymentMethodOptions}
                defaultValue={registration?.paymentMethod || ''}
              />
              <Input
                label="Transaction ID"
                name="transactionId"
                register={register}
                error={errors.transactionId?.message}
                placeholder="e.g. TXN123456789"
              />
              <Button type="submit" loading={saving} className="w-full">
                Save Changes
              </Button>
            </form>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Summary</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registration ID</dt>
                <dd className="text-sm text-slate-700 mt-0.5 font-mono truncate">{registration._id}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Amount Due</dt>
                <dd className="text-lg font-bold text-slate-800 mt-0.5">{formatCurrency(registration.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Payment Status</dt>
                <dd className="mt-1">{statusBadge(registration.paymentStatus)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registered</dt>
                <dd className="text-sm text-slate-700 mt-0.5">{formatDateTime(registration.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
