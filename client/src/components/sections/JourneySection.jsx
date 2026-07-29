import { useRef } from 'react';
import { UserPlus, FileText, Mic } from 'lucide-react';
import AnimatedMeteorsLink from '../ui/AnimatedMeteorsLink';
import SectionHeader from '../ui/SectionHeader';

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Register',
    desc: 'Secure your spot at the world\'s premier aging science congress. Early-bird rates available.',
    theme: 'emerald-matrix',
    href: '/registration',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Submit Abstract',
    desc: 'Share your research with global experts. Abstract submissions open for all topics in geroscience.',
    theme: 'ice-aurora',
    href: '/abstract-submission',
  },
  {
    number: '03',
    icon: Mic,
    title: 'Join the Congress',
    desc: 'Attend world-class sessions, network with leaders, and shape the future of aging research.',
    theme: 'cosmic-fire',
    href: '/sessions',
  },
];

export default function JourneySection() {
  const containerRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const stepRefs = [step1Ref, step2Ref, step3Ref];

  return (
    <section className="section-padding bg-slate-950 border-t border-slate-800">
      <div className="container-custom">
        <SectionHeader
          label="Your Journey"
          title="From Registration to Discovery"
          subtitle="Three steps to become part of the global aging science community."
          light
        />

        {/* Cards + meteor connections */}
        <div ref={containerRef} className="relative mt-14">
          {/* Meteor links — desktop only */}
          <div className="hidden lg:block">
            <AnimatedMeteorsLink
              containerRef={containerRef}
              sourceRef={step1Ref}
              targetRef={step2Ref}
              curvature={-50}
              meteorCount={2}
              duration={2.4}
              bidirectional={false}
              enableSplash={true}
              themePreset="emerald-matrix"
            />
            <AnimatedMeteorsLink
              containerRef={containerRef}
              sourceRef={step2Ref}
              targetRef={step3Ref}
              curvature={-50}
              meteorCount={2}
              duration={2.4}
              bidirectional={false}
              enableSplash={true}
              themePreset="ice-aurora"
            />
          </div>

          {/* Step cards */}
          <div className="grid sm:grid-cols-3 gap-6 relative z-10">
            {STEPS.map(({ number, icon: Icon, title, desc, href }, i) => (
              <a
                key={i}
                ref={stepRefs[i]}
                href={href}
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/8 hover:border-teal-500/40 transition-all duration-300 flex flex-col gap-5"
              >
                {/* Step number */}
                <span className="text-xs font-black text-slate-600 tracking-[0.2em] uppercase">
                  Step {number}
                </span>

                {/* Icon circle */}
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-colors">
                  <Icon size={24} className="text-teal-400" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-teal-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>

                {/* Arrow */}
                <div className="mt-auto pt-2">
                  <span className="text-xs font-bold text-teal-500 group-hover:text-teal-300 transition-colors">
                    Get started →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
