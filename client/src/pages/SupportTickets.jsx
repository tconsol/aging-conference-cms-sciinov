import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send, CheckCircle, MessageCircleQuestion } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { contactAPI } from '../api/contact';
import { getErrorMessage } from '../utils/helpers';

const INPUT_CLS =
  'w-full h-11 px-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const TEXTAREA_CLS =
  'w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const LABEL_CLS = 'block text-sm font-semibold text-slate-700 mb-1.5';
const ERROR_CLS = 'text-xs text-red-500 mt-1';

export default function SupportTickets() {
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

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

  return (
    <div>
      <PageHero
        title="Support Tickets"
        subtitle="Can't find your answer in the FAQs? Submit a support request and our team will follow up."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Help & Support' }, { label: 'Support Tickets' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <SectionHeader
              label="Support"
              title="Submit a support request"
              subtitle="Our team typically responds within one business day."
            />

            {ticketSubmitted ? (
              <div className="flex flex-col items-start gap-4 bg-teal-50 border border-teal-200 rounded-2xl p-8">
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

            <p className="text-center text-sm text-slate-500 mt-6">
              Looking for quick answers instead?{' '}
              <Link to="/help" className="text-teal-700 font-semibold hover:underline">
                Browse our FAQs
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
