import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SplashScreen from './components/ui/SplashScreen';
import { SubmitterAuthProvider } from './context/submitterAuthContext';

// Pages
import Home from './pages/Home';
const About = lazy(() => import('./pages/About'));
const Editions = lazy(() => import('./pages/Editions'));
const EditionDetail = lazy(() => import('./pages/EditionDetail'));
const Sessions = lazy(() => import('./pages/Sessions'));
const SessionDetail = lazy(() => import('./pages/SessionDetail'));
const Program = lazy(() => import('./pages/Program'));
const ImportantDates = lazy(() => import('./pages/ImportantDates'));
const Venue = lazy(() => import('./pages/Venue'));
const Speakers = lazy(() => import('./pages/Speakers'));
const SpeakerDetail = lazy(() => import('./pages/SpeakerDetail'));
const Committee = lazy(() => import('./pages/Committee'));
const CommitteeDetail = lazy(() => import('./pages/CommitteeDetail'));
const Organizers = lazy(() => import('./pages/Organizers'));
const AbstractSubmission = lazy(() => import('./pages/AbstractSubmission'));
const Registration = lazy(() => import('./pages/Registration'));
const Pricing = lazy(() => import('./pages/Pricing'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Reports = lazy(() => import('./pages/Reports'));
const ReportDetail = lazy(() => import('./pages/ReportDetail'));
const Downloads = lazy(() => import('./pages/Downloads'));
const Contact = lazy(() => import('./pages/Contact'));
const Help = lazy(() => import('./pages/Help'));
const SupportTickets = lazy(() => import('./pages/SupportTickets'));
const Sponsorship = lazy(() => import('./pages/Sponsorship'));
const Partners = lazy(() => import('./pages/Partners'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const Newsletter = lazy(() => import('./pages/Newsletter'));
const BecomeASpeaker = lazy(() => import('./pages/BecomeASpeaker'));
const Brochure = lazy(() => import('./pages/Brochure'));

// Portal pages
const PortalLogin = lazy(() => import('./pages/portal/PortalLogin'));
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'));
const AcceptanceLetter = lazy(() => import('./pages/portal/AcceptanceLetter'));

// Shown while a route chunk downloads. Deliberately minimal so a fast
// connection never flashes a heavy skeleton.
function RouteFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 34, height: 34, borderRadius: '50%',
          border: '3px solid #e2e8f0', borderTopColor: 'var(--brand)',
          animation: 'route-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes route-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PortalRoot() {
  return (
    <SubmitterAuthProvider>
      <Outlet />
    </SubmitterAuthProvider>
  );
}

export default function App() {
  return (
    <>
      <SplashScreen />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public site */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/editions" element={<Editions />} />
          <Route path="/editions/:id" element={<EditionDetail />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/program" element={<Program />} />
          <Route path="/important-dates" element={<ImportantDates />} />
          <Route path="/venue" element={<Venue />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/speakers/:slug" element={<SpeakerDetail />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/committee/:id" element={<CommitteeDetail />} />
          <Route path="/organizers" element={<Organizers />} />
          <Route path="/abstract-submission" element={<AbstractSubmission />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="/support-tickets" element={<SupportTickets />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/become-a-speaker" element={<BecomeASpeaker />} />
          <Route path="/brochure" element={<Brochure />} />
          <Route path="/guidelines" element={<StaticPage pageKey="guidelines" />} />
          <Route path="/publication-policy" element={<StaticPage pageKey="publication" />} />
          <Route path="/terms" element={<StaticPage pageKey="terms" />} />
          <Route path="/newsletter" element={<Newsletter />} />
        </Route>

        {/* Submitter portal own layout, own auth context */}
        <Route element={<PortalRoot />}>
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal/dashboard" element={<PortalDashboard />} />
          <Route path="/portal/acceptance-letter" element={<AcceptanceLetter />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  );
}
