import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as LucideIcons from 'lucide-react';
import { Plus, Search, Send, CheckCircle, LifeBuoy, HelpCircle, MessageCircleQuestion } from 'lucide-react';
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

function toPascalCase(str) {
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function TopicIcon({ icon, size = 20, className = '' }) {
  const Comp = (icon && LucideIcons[toPascalCase(icon)]) || HelpCircle;
  return <Comp size={size} className={className} />;
}

function FAQItem({ faq, open, onToggle }) {
  return (
    <div
      className={`rounded-xl border transition-colors break-inside-avoid mb-3 ${
        open ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white hover:border-teal-200'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <span className="font-semibold text-slate-900 text-sm leading-snug">{faq.question}</span>
        <span
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
            open ? 'bg-teal-600 rotate-45' : 'bg-slate-100'
          }`}
        >
          <Plus size={13} className={open ? 'text-white' : 'text-slate-500'} />
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

const GENERAL_TOPIC = { _id: 'general', name: 'General Queries', subtitle: 'Other frequently asked questions.', icon: 'help-circle' };

const TOPIC_ACCENTS = [
  { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'group-hover:ring-teal-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'group-hover:ring-amber-200' },
  { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'group-hover:ring-sky-200' },
  { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'group-hover:ring-violet-200' },
  { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'group-hover:ring-rose-200' },
];

export default function Help() {
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState(null);
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

  // Group FAQs by topic, falling back to a "General Queries" bucket for topicless FAQs
  const topicMap = new Map();
  faqs.forEach((f) => {
    const topic = f.topic || GENERAL_TOPIC;
    const key = topic._id;
    if (!topicMap.has(key)) topicMap.set(key, { topic, items: [] });
    topicMap.get(key).items.push(f);
  });
  const topicGroups = [...topicMap.values()].sort((a, b) => {
    if (a.topic._id === 'general') return 1;
    if (b.topic._id === 'general') return -1;
    return (a.topic.displayOrder ?? 0) - (b.topic.displayOrder ?? 0);
  });

  const q = search.trim().toLowerCase();
  const visibleGroups = topicGroups
    .map((g) => ({
      ...g,
      items: q
        ? g.items.filter((f) => f.question?.toLowerCase().includes(q) || f.answer?.toLowerCase().includes(q))
        : g.items,
    }))
    .filter((g) => g.items.length > 0);

  const totalCount = faqs.length;

  return (
    <div>
      <PageHero
        title="Help & Support"
        subtitle="Your questions answered — everything you need to know about the Aging congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Help & Support' }]}
      />

      {/* Search + Popular Topics */}
      {!faqsLoading && faqs.length > 0 && (
        <section className="bg-white pt-14 pb-4">
          <div className="container-custom">
            <div className="max-w-xl mx-auto text-center mb-10">
              <span className="section-label inline-block border-l-0 pl-0 border-b-4 border-teal-500 pb-1 mx-auto">Get Support</span>
              <h2 className="text-3xl font-black text-slate-900 mt-2 mb-6">How can we help you?</h2>
              <div className="relative">
                <Search size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for a question (e.g. registration, abstract)"
                  className="w-full py-3.5 pl-12 pr-4 border border-slate-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                />
              </div>
              <p className="text-xs text-slate-400 mt-3">{totalCount} questions across {topicGroups.length} topics</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {topicGroups.map(({ topic, items }, i) => {
                const accent = TOPIC_ACCENTS[i % TOPIC_ACCENTS.length];
                return (
                  <a
                    key={topic._id}
                    href={`#topic-${topic._id}`}
                    className="group flex flex-col items-center text-center gap-2.5 bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`w-12 h-12 rounded-full ${accent.bg} flex items-center justify-center ring-4 ring-transparent ${accent.ring} transition-all`}>
                      <TopicIcon icon={topic.icon} className={accent.text} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">{topic.name}</span>
                    <span className="text-[11px] text-slate-400">{items.length} questions</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {faqsLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 border border-stone-200 rounded-2xl">
                <LifeBuoy size={36} className="text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">FAQs Coming Soon</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Frequently asked questions will be published here shortly.
                </p>
                <Button to="/contact" variant="primary">
                  Contact Us Directly
                </Button>
              </div>
            ) : visibleGroups.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 border border-stone-200 rounded-2xl">
                <p className="text-slate-600 text-sm">No questions match your search. Try different keywords.</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-teal-700 text-sm font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {visibleGroups.map(({ topic, items }, i) => {
                  const accent = TOPIC_ACCENTS[i % TOPIC_ACCENTS.length];
                  return (
                    <div
                      key={topic._id}
                      id={`topic-${topic._id}`}
                      style={{ scrollMarginTop: 90 }}
                      className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-8"
                    >
                      <div className="flex items-center gap-4 pb-5 mb-5 border-b border-slate-100">
                        <div className={`w-11 h-11 rounded-xl ${accent.bg} flex items-center justify-center shrink-0`}>
                          <TopicIcon icon={topic.icon} className={accent.text} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">{topic.name}</h3>
                          {topic.subtitle && (
                            <p className="text-sm text-slate-500 mt-0.5">{topic.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <div className="sm:columns-2 gap-6">
                        {items.map((faq) => (
                          <FAQItem
                            key={faq._id || faq.question}
                            faq={faq}
                            open={openFaqId === (faq._id || faq.question)}
                            onToggle={() =>
                              setOpenFaqId((cur) =>
                                cur === (faq._id || faq.question) ? null : (faq._id || faq.question)
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
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
              <div className="flex flex-col items-start gap-4 bg-white border border-teal-200 rounded-2xl p-8">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
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
              <div className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-6">
                  <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                    <MessageCircleQuestion size={18} className="text-teal-700" />
                  </div>
                  <p className="text-lg font-black text-slate-900">Support Request</p>
                </div>
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
