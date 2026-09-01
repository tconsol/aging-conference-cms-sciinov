import {
  FileEdit, Search, CalendarCheck,
  UserPlus, Mail, Globe,
  Mic, Users, Calendar,
} from 'lucide-react';

const SPEAKER_STEPS = [
  {
    number: '01',
    icon: FileEdit,
    title: 'Submit Abstract',
    desc: 'Submit your research abstract or proposed presentation for consideration by the Scientific Committee.',
    link: { label: 'Get started', href: '/abstract-submission' },
  },
  {
    number: '02',
    icon: Search,
    title: 'Review & Acceptance',
    desc: 'Your submission is reviewed by the Scientific Committee. Upon acceptance, you will receive an official acceptance notification.',
    link: { label: 'Learn more', href: '/guidelines' },
  },
  {
    number: '03',
    icon: CalendarCheck,
    title: 'Register & Confirm Your Slot',
    desc: 'Complete the applicable registration process. Once confirmed, your presentation slot will be secured in the conference program.',
    link: { label: 'Get started', href: '/registration' },
  },
];

const ATTENDEE_STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Register',
    desc: 'Choose your participation category and complete your conference registration securely.',
    link: { label: 'Register now', href: '/registration' },
  },
  {
    number: '02',
    icon: Mail,
    title: 'Participation Confirmed',
    desc: 'Receive your registration confirmation along with important information and access details.',
    link: { label: 'Learn more', href: '/about' },
  },
  {
    number: '03',
    icon: Globe,
    title: 'Join the Congress',
    desc: 'Attend world-class sessions, network with experts, and explore the latest advances in aging research.',
    link: { label: 'See program', href: '/sessions' },
  },
];

function StepCard({ step, isLast }) {
  const Icon = step.icon;
  return (
    <div className="jy-step-wrapper">
      <a href={step.link.href} className="jy-card">
        {/* Number badge */}
        <div className="jy-badge">{step.number}</div>

        {/* Icon box */}
        <div className="jy-icon-box">
          <Icon size={26} className="jy-icon" />
        </div>

        {/* Text */}
        <div className="jy-text">
          <h4 className="jy-title">{step.title}</h4>
          <p className="jy-desc">{step.desc}</p>
        </div>

        {/* Link */}
        <span className="jy-link">{step.link.label} →</span>
      </a>

      {/* Dashed arrow connector */}
      {!isLast && (
        <div className="jy-arrow" aria-hidden="true">
          <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
            <line
              x1="2" y1="12" x2="38" y2="12"
              stroke="#2dd4bf" strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <polyline
              points="34,6 42,12 34,18"
              stroke="#2dd4bf" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function TrackSection({ icon: TrackIcon, label, sublabel, steps }) {
  return (
    <div className="jy-track">
      {/* Track header */}
      <div className="jy-track-header">
        <div className="jy-track-icon-wrap">
          <TrackIcon size={22} className="jy-track-icon" />
        </div>
        <div>
          <p className="jy-track-label">{label}</p>
          <p className="jy-track-sub">{sublabel}</p>
        </div>
      </div>

      {/* Steps row */}
      <div className="jy-steps-row">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}

export default function JourneySection() {
  return (
    <>
      <style>{`
        .jy-section {
          background: #080f14;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 80px 0 0;
        }
        .jy-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── Header ── */
        .jy-header { margin-bottom: 56px; }
        .jy-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .jy-eyebrow-bar {
          width: 4px;
          height: 18px;
          background: #2dd4bf;
          border-radius: 2px;
        }
        .jy-eyebrow-text {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2dd4bf;
        }
        .jy-heading {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.15;
          margin: 0 0 12px;
        }
        .jy-subheading {
          font-size: 1rem;
          color: #94a3b8;
          max-width: 520px;
          line-height: 1.65;
          margin: 0;
        }

        /* ── Track ── */
        .jy-track {
          margin-bottom: 48px;
        }
        .jy-track-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .jy-track-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid rgba(45,212,191,0.45);
          background: rgba(45,212,191,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .jy-track-icon { color: #2dd4bf; }
        .jy-track-label {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2dd4bf;
          margin: 0 0 2px;
        }
        .jy-track-sub {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* ── Steps row ── */
        .jy-steps-row {
          display: flex;
          align-items: stretch;
          gap: 0;
        }
        .jy-step-wrapper {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        /* ── Card ── */
        .jy-card {
          flex: 1;
          min-width: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 24px 22px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-decoration: none;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
          cursor: pointer;
        }
        .jy-card:hover {
          background: rgba(45,212,191,0.05);
          border-color: rgba(45,212,191,0.3);
          transform: translateY(-3px);
        }

        /* Badge */
        .jy-badge {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid rgba(45,212,191,0.5);
          background: rgba(45,212,191,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #2dd4bf;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }

        /* Icon box */
        .jy-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .jy-icon { color: #38bdf8; }
        .jy-card:hover .jy-icon { color: #2dd4bf; }

        /* Text */
        .jy-text { flex: 1; }
        .jy-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .jy-card:hover .jy-title { color: #2dd4bf; }
        .jy-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.65;
          margin: 0;
        }

        /* Link */
        .jy-link {
          font-size: 12px;
          font-weight: 700;
          color: #2dd4bf;
          transition: color 0.2s;
        }
        .jy-card:hover .jy-link { color: #5eead4; }

        /* Arrow */
        .jy-arrow {
          padding: 0 4px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -40px;
        }

        /* ── Important Dates bar ── */
        .jy-dates-bar {
          background: rgba(255,255,255,0.04);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 16px;
        }
        .jy-dates-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .jy-dates-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: rgba(45,212,191,0.1);
          border: 1px solid rgba(45,212,191,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2dd4bf;
          flex-shrink: 0;
        }
        .jy-dates-title {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 2px;
        }
        .jy-dates-sub {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .jy-dates-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #2dd4bf;
          color: #042f2e;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s;
        }
        .jy-dates-btn:hover { background: #5eead4; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .jy-steps-row {
            flex-direction: column;
            gap: 12px;
          }
          .jy-step-wrapper {
            flex-direction: column;
            align-items: stretch;
          }
          .jy-arrow {
            transform: rotate(90deg);
            margin: 0 auto;
            margin-top: 0;
          }
        }
        @media (max-width: 600px) {
          .jy-section { padding-top: 56px; }
          .jy-dates-bar { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <section className="jy-section">
        <div className="jy-container">
          {/* Header */}
          <div className="jy-header">
            <div className="jy-eyebrow">
              <div className="jy-eyebrow-bar" />
              <span className="jy-eyebrow-text">Your Journey</span>
            </div>
            <h2 className="jy-heading">Choose Your Journey</h2>
            <p className="jy-subheading">
              Whether you're sharing your research or joining the global aging community,
              choose the path that fits your participation.
            </p>
          </div>

          {/* Track 1 Speakers */}
          <TrackSection
            icon={Mic}
            label="For Speakers / Researchers"
            sublabel="Share your research. Follow these steps to become a speaker at the congress."
            steps={SPEAKER_STEPS}
          />

          {/* Track 2 Attendees */}
          <TrackSection
            icon={Users}
            label="For Attendees / Delegates"
            sublabel="Join the global aging community. Register and be part of the conversation."
            steps={ATTENDEE_STEPS}
          />
        </div>

        {/* Important Dates bar */}
        <div className="jy-dates-bar">
          <div className="jy-dates-left">
            <div className="jy-dates-icon">
              <Calendar size={18} />
            </div>
            <div>
              <p className="jy-dates-title">Important Dates</p>
              <p className="jy-dates-sub">Abstract Submission Deadline, Early Bird Registration and more.</p>
            </div>
          </div>
          <a href="/important-dates" className="jy-dates-btn">
            View Important Dates →
          </a>
        </div>
      </section>
    </>
  );
}
