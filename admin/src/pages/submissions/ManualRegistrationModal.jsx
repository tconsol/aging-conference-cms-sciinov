import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserPlus, CreditCard, User, Layers } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { registrationsAPI } from '../../api/submissions';
import { pricingAPI } from '../../api/finance';
import { CATEGORY_LABELS, PAYMENT_METHOD_OPTIONS, getErrorMessage } from '../../utils/helpers';

const TITLE_OPTIONS = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.'].map((v) => ({ value: v, label: v }));

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

const ATTENDANCE_OPTIONS = [
  { value: 'in_person', label: 'In-Person' },
  { value: 'virtual',   label: 'Virtual' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending',   label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

const TIER_NAME_LABELS = {
  early_bird: 'Early Bird',
  mid_term:   'Mid Term',
  on_spot:    'On Spot',
};

const DEFAULTS = {
  edition: '', title: 'Dr.', firstName: '', lastName: '', email: '',
  alternateEmail: '', phone: '', whatsapp: '', country: '', organization: '',
  category: '', attendanceMode: '', pricingTier: '', amount: '', currency: 'USD',
  paymentStatus: 'confirmed', paymentMethod: 'bank_transfer', transactionId: '', notes: '',
};

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-1">
      <Icon size={13} className="text-teal-600" />
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{children}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export default function ManualRegistrationModal({ open, onClose, editions = [], onCreated }) {
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers]   = useState([]);
  const [sendEmail, setSendEmail] = useState(false);

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULTS });

  const editionId  = watch('edition');
  const pricingTier = watch('pricingTier');
  const category   = watch('category');
  const paymentStatus = watch('paymentStatus');

  // Reset the form each time the modal is opened
  useEffect(() => {
    if (open) {
      reset(DEFAULTS);
      setSendEmail(false);
      setTiers([]);
    }
  }, [open, reset]);

  // Load pricing tiers for the chosen edition
  useEffect(() => {
    if (!editionId) { setTiers([]); return; }
    let cancelled = false;
    pricingAPI.getAll({ edition: editionId })
      .then((res) => { if (!cancelled) setTiers(res.data.data || []); })
      .catch(() => { if (!cancelled) setTiers([]); });
    return () => { cancelled = true; };
  }, [editionId]);

  // Auto-fill amount from the selected tier + category
  useEffect(() => {
    if (!pricingTier || !category) return;
    const tier = tiers.find((t) => t._id === pricingTier);
    const price = tier?.prices?.[category];
    if (price !== undefined && price !== null) setValue('amount', String(price));
  }, [pricingTier, category, tiers, setValue]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, sendEmail };
      if (payload.amount === '') delete payload.amount;
      const res = await registrationsAPI.create(payload);
      toast.success(
        sendEmail && data.paymentStatus === 'confirmed'
          ? 'Registration created. Confirmation email sent.'
          : 'Registration created.'
      );
      onCreated?.(res.data.data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const editionOptions = editions.map((e) => ({
    value: e._id,
    label: e.year ? `${e.title} (${e.year})` : e.title,
  }));

  const tierOptions = [
    { value: '', label: '— No tier / custom amount —' },
    ...tiers.map((t) => ({
      value: t._id,
      label: `${t.label || TIER_NAME_LABELS[t.name] || t.name}${t.isActive ? ' · Active' : ''}`,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Registration Manually"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="manual-registration-form" loading={saving}>
            <UserPlus size={14} /> Create Registration
          </Button>
        </>
      }
    >
      <form id="manual-registration-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <SectionLabel icon={Layers}>Edition</SectionLabel>
        <Select
          label="Edition"
          name="edition"
          register={register}
          required="Edition is required"
          error={errors.edition?.message}
          options={editionOptions}
          placeholder="Select edition…"
          defaultValue=""
        />

        <SectionLabel icon={User}>Attendee</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Title"
            name="title"
            register={register}
            options={TITLE_OPTIONS}
            defaultValue="Dr."
          />
          <Input
            label="First Name" name="firstName" register={register}
            required="Required" error={errors.firstName?.message}
          />
          <Input
            label="Last Name" name="lastName" register={register}
            required="Required" error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email" name="email" type="email" register={register}
            required="Required" error={errors.email?.message}
          />
          <Input label="Alternate Email" name="alternateEmail" type="email" register={register} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone" name="phone" register={register} />
          <Input label="WhatsApp" name="whatsapp" register={register} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Country" name="country" register={register}
            required="Required" error={errors.country?.message}
          />
          <Input label="Institution / Organization" name="organization" register={register} />
        </div>

        <SectionLabel icon={Layers}>Registration</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            register={register}
            required="Category is required"
            error={errors.category?.message}
            options={CATEGORY_OPTIONS}
            placeholder="Select category…"
            defaultValue=""
          />
          <Select
            label="Attendance Mode"
            name="attendanceMode"
            register={register}
            required="Attendance mode is required"
            error={errors.attendanceMode?.message}
            options={ATTENDANCE_OPTIONS}
            placeholder="Select mode…"
            defaultValue=""
          />
        </div>

        <Select
          label="Pricing Tier"
          name="pricingTier"
          register={register}
          options={tierOptions}
          placeholder={editionId ? 'Select tier…' : 'Select an edition first'}
          disabled={!editionId}
          defaultValue=""
        />

        <SectionLabel icon={CreditCard}>Payment</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            register={register}
            hint="Auto-filled from the pricing tier — override if needed"
          />
          <Select
            label="Currency"
            name="currency"
            register={register}
            options={CURRENCY_OPTIONS}
            defaultValue="USD"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Status"
            name="paymentStatus"
            register={register}
            required="Required"
            error={errors.paymentStatus?.message}
            options={PAYMENT_STATUS_OPTIONS}
            defaultValue="confirmed"
          />
          <Select
            label="Payment Method"
            name="paymentMethod"
            register={register}
            options={PAYMENT_METHOD_OPTIONS}
            defaultValue="bank_transfer"
          />
        </div>

        <Input
          label="Transaction / Reference ID"
          name="transactionId"
          register={register}
          placeholder="e.g. UTR number, PayPal capture ID, cheque no."
        />

        <Textarea
          label="Internal Notes"
          name="notes"
          register={register}
          rows={2}
          placeholder="Optional — visible to admins only"
        />

        {/* Send email toggle */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            paymentStatus === 'confirmed'
              ? 'border-slate-200 hover:border-teal-300 bg-slate-50'
              : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
          }`}
        >
          <input
            type="checkbox"
            checked={sendEmail}
            disabled={paymentStatus !== 'confirmed'}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-teal-600"
          />
          <span className="text-sm text-slate-700">
            Send confirmation email to the attendee
            <span className="block text-xs text-slate-500 mt-0.5">
              {paymentStatus === 'confirmed'
                ? 'Uses the same template as an online PayPal payment.'
                : 'Only available when the payment status is Confirmed.'}
            </span>
          </span>
        </label>
      </form>
    </Modal>
  );
}
