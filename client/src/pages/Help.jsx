import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ChevronDown, Search, Send, CheckCircle, LifeBuoy } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { contactAPI } from '../api/contact';
import { getErrorMessage } from '../utils/helpers';

const INPUT_CLS =
  'w-full h-11 px-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const TEXTAREA_CLS =
  'w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const LABEL_CLS = 'block text-sm font-semibold text-slate-700 mb-1.5';
const ERROR_CLS = 'text-xs text-red-500 mt-1';

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-stone-50 transition-colors"
      >
        <span className="font-bold text-slate-900 pr-4 text-sm leading-snug">{faq.question}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-stone-100 pt-4 bg-white">
          {faq.answer || faq.content || ''}
        </div>
      )}
    </div>
  );
}

export default function Help() {
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    contactAPI
      .getFAQs()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setFaqs(Array.isArray(data) ? data : []);
      })
      .catch(() => setFaqs([]))
      .finally(() => setFaqsLoading(false));
  }, []);

  const onTicketSubmit = async (data) => {
    setTicketSubmitting(true);
    try {
      await contactAPI.submitTicket({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
      setTicketSubmitted(true);
      reset();
      toast.success('Support ticket submitted! We will respond shortly.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Client-side filtering
  const filtered = search.trim()
    ? faqs.filter((f) => f.question?.toLowerCase().includes(search.trim().toLowerCase()))
    : faqs;

  // Group by category if categories exist
  const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))];
  const hasCats = categories.length > 0;

  const grouped = hasCats
    ? categories.reduce((acc, cat) => {
        acc[cat] = filtered.filter((f) => f.category === cat);
        return acc;
      }, {})
    : { all: filtered };

  return (
    <div>
      <PageHero
        title="Help & FAQs"
        subtitle="Find answers to common questions about the Aging congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Help & FAQs' }]}
      />

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              label="Frequently Asked Questions"
              title="Find Your Answer"
              subtitle="Search through our FAQ library or browse by category."
            />

            {/* Search bar */}
            <div className="relative mb-8">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full h-11 pl-10 pr-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            {faqsLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 border border-stone-200 rounded-lg">
                <LifeBuoy size={36} className="text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">FAQs Coming Soon</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Frequently asked questions will be published here shortly.
                </p>
                <Button to="/contact" variant="primary">
                  Contact Us Directly
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 border border-stone-200 rounded-lg">
                <p className="text-slate-600 text-sm">No questions match your search. Try different keywords.</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-teal-700 text-sm font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : hasCats ? (
              <div className="space-y-10">
                {Object.entries(grouped).map(([cat, items]) =>
                  items.length === 0 ? null : (
                    <div key={cat}>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-stone-200 pb-2 mb-4 capitalize">
                        {cat}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {items.map((faq) => (
                          <FAQItem key={faq._id || faq.question} faq={faq} />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((faq) => (
                  <FAQItem key={faq._id || faq.question} faq={faq} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Support Ticket Section */}
      <section className="section-padding bg-stone-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <SectionHeader
              label="Support"
              title="Still need help? Submit a support request"
              subtitle="Our team typically responds within one business day."
            />

            {ticketSubmitted ? (
              <div className="flex flex-col items-start gap-4 bg-white border border-teal-200 rounded-lg p-8">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Ticket Submitted!</h3>
                  <p className="text-slate-600 text-sm">
                    We've received your request and will follow up via email shortly.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setTicketSubmitted(false)}>
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-lg p-6 lg:p-8">
                <p className="text-lg font-black text-slate-900 border-b border-stone-200 pb-2 mb-6">
                  Support Request
                </p>
                <form onSubmit={handleSubmit(onTicketSubmit)} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Full Name *</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Your full name"
                        className={INPUT_CLS}
                      />
                      {errors.name && <p className={ERROR_CLS}>{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Email Address *</label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                        })}
                        placeholder="you@example.com"
                        className={INPUT_CLS}
                      />
                      {errors.email && <p className={ERROR_CLS}>{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Subject *</label>
                    <input
                      {...register('subject', { required: 'Subject is required' })}
                      placeholder="Briefly describe your issue"
                      className={INPUT_CLS}
                    />
                    {errors.subject && <p className={ERROR_CLS}>{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Message *</label>
                    <textarea
                      {...register('message', {
                        required: 'Message is required',
                        minLength: { value: 10, message: 'Please provide more detail' },
                      })}
                      rows={5}
                      placeholder="Describe your issue in detail..."
                      className={TEXTAREA_CLS}
                    />
                    {errors.message && <p className={ERROR_CLS}>{errors.message.message}</p>}
                  </div>

                  <div>
                    <Button type="submit" variant="primary" size="lg" loading={ticketSubmitting}>
                      <Send size={16} />
                      Submit Ticket
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
