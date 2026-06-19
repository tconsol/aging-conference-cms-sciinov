import { useState } from 'react';
import { Mail, Bell, BookOpen, CalendarClock, CheckCircle, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { communityAPI } from '../api/community';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const INPUT_CLS =
  'w-full h-11 px-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';

const BENEFITS = [
  {
    icon: Bell,
    title: 'congress Updates',
    desc: 'Be the first to know about keynote announcements, program updates, and schedule changes for each edition.',
  },
  {
    icon: BookOpen,
    title: 'Research Highlights',
    desc: 'Curated summaries of the latest findings in geroscience, senescence research, and longevity medicine.',
  },
  {
    icon: CalendarClock,
    title: 'Early Registration Alerts',
    desc: 'Get notified as soon as registration opens and secure early-bird rates before they sell out.',
  },
];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (val) => /^\S+@\S+\.\S+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await communityAPI.subscribe(email.trim());
      setSubscribed(true);
      setEmail('');
      toast.success('You have been subscribed to the newsletter!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Newsletter"
        subtitle="Stay informed with the latest from aging research, congress announcements, and early registration alerts."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Newsletter' }]}
      />

      {/* Hero Subscribe Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <span className="section-label inline-block border-l-0 pl-0 border-b-4 border-teal-500 pb-1 mx-auto mb-6">
              Stay Connected
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 leading-tight">
              Join Our Research Community
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Subscribe to receive exclusive updates, research highlights, and early access to congress news delivered directly to your inbox.
            </p>

            {subscribed ? (
              <div className="flex flex-col items-center gap-4 bg-teal-50 border border-teal-200 rounded-lg p-10">
                <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={28} className="text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">You're Subscribed!</h3>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto">
                    Welcome to the Aging congress community. Watch your inbox for the latest updates.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubscribed(false)}
                >
                  Subscribe another address
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="your@email.com"
                    className={`${INPUT_CLS} ${emailError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1 text-left">{emailError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            {!subscribed && (
              <p className="mt-4 text-xs text-slate-500">
                No spam, ever. Unsubscribe at any time. We respect your privacy.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-stone-50">
        <div className="container-custom">
          <SectionHeader
            label="What You'll Receive"
            title="Everything That Matters to You"
            subtitle="Our newsletter keeps you at the forefront of aging science without the noise."
            centered
          />
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-stone-200 rounded-lg p-6 text-center hover:border-teal-300 transition-colors">
                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-teal-700" />
                </div>
                <h3 className="font-black text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="section-padding bg-slate-950">
        <div className="container-custom text-center">
          <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Mail size={22} className="text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
            Ready to Stay Informed?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of researchers worldwide who trust the Aging congress newsletter.
          </p>
          {!subscribed ? (
            <Button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="white"
              size="lg"
            >
              Subscribe Now
              <ArrowRight size={16} />
            </Button>
          ) : (
            <div className="inline-flex items-center gap-2 text-teal-400 font-semibold">
              <CheckCircle size={18} />
              You are subscribed
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
