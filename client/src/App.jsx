import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SplashScreen from './components/ui/SplashScreen';
import { SubmitterAuthProvider } from './context/submitterAuthContext';

// Pages
import Home from './pages/Home';
import VisibilityRoute from './components/layout/VisibilityRoute';
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
          <Route path="/about" element={<VisibilityRoute pageKey="about"><About /></VisibilityRoute>} />
          <Route path="/editions" element={<VisibilityRoute pageKey="editions"><Editions /></VisibilityRoute>} />
          <Route path="/editions/:id" element={<VisibilityRoute pageKey="editions"><EditionDetail /></VisibilityRoute>} />
          <Route path="/sessions" element={<VisibilityRoute pageKey="sessions"><Sessions /></VisibilityRoute>} />
          <Route path="/sessions/:id" element={<VisibilityRoute pageKey="sessions"><SessionDetail /></VisibilityRoute>} />
          <Route path="/program" element={<VisibilityRoute pageKey="program"><Program /></VisibilityRoute>} />
          <Route path="/important-dates" element={<VisibilityRoute pageKey="importantDates"><ImportantDates /></VisibilityRoute>} />
          <Route path="/venue" element={<VisibilityRoute pageKey="venue"><Venue /></VisibilityRoute>} />
          <Route path="/speakers" element={<VisibilityRoute pageKey="speakers"><Speakers /></VisibilityRoute>} />
          <Route path="/speakers/:slug" element={<VisibilityRoute pageKey="speakers"><SpeakerDetail /></VisibilityRoute>} />
          <Route path="/committee" element={<VisibilityRoute pageKey="committee"><Committee /></VisibilityRoute>} />
          <Route path="/committee/:id" element={<VisibilityRoute pageKey="committee"><CommitteeDetail /></VisibilityRoute>} />
          <Route path="/organizers" element={<VisibilityRoute pageKey="organizers"><Organizers /></VisibilityRoute>} />
          <Route path="/abstract-submission" element={<VisibilityRoute pageKey="abstractSubmission"><AbstractSubmission /></VisibilityRoute>} />
          <Route path="/registration" element={<VisibilityRoute pageKey="registration"><Registration /></VisibilityRoute>} />
          <Route path="/pricing" element={<VisibilityRoute pageKey="pricing"><Pricing /></VisibilityRoute>} />
          <Route path="/news" element={<VisibilityRoute pageKey="news"><News /></VisibilityRoute>} />
          <Route path="/news/:slug" element={<VisibilityRoute pageKey="news"><NewsDetail /></VisibilityRoute>} />
          <Route path="/reports" element={<VisibilityRoute pageKey="reports"><Reports /></VisibilityRoute>} />
          <Route path="/reports/:id" element={<VisibilityRoute pageKey="reports"><ReportDetail /></VisibilityRoute>} />
          <Route path="/downloads" element={<VisibilityRoute pageKey="downloads"><Downloads /></VisibilityRoute>} />
          <Route path="/contact" element={<VisibilityRoute pageKey="contact"><Contact /></VisibilityRoute>} />
          <Route path="/help" element={<VisibilityRoute pageKey="help"><Help /></VisibilityRoute>} />
          <Route path="/support-tickets" element={<SupportTickets />} />
          <Route path="/sponsorship" element={<VisibilityRoute pageKey="sponsorship"><Sponsorship /></VisibilityRoute>} />
          <Route path="/partners" element={<VisibilityRoute pageKey="partners"><Partners /></VisibilityRoute>} />
          <Route path="/testimonials" element={<VisibilityRoute pageKey="testimonials"><Testimonials /></VisibilityRoute>} />
          <Route path="/become-a-speaker" element={<VisibilityRoute pageKey="becomeASpeaker"><BecomeASpeaker /></VisibilityRoute>} />
          <Route path="/brochure" element={<VisibilityRoute pageKey="brochure"><Brochure /></VisibilityRoute>} />
          <Route path="/guidelines" element={<VisibilityRoute pageKey="guidelines"><StaticPage pageKey="guidelines" /></VisibilityRoute>} />
          <Route path="/publication-policy" element={<VisibilityRoute pageKey="publication"><StaticPage pageKey="publication" /></VisibilityRoute>} />
          <Route path="/terms" element={<VisibilityRoute pageKey="terms"><StaticPage pageKey="terms" /></VisibilityRoute>} />
          <Route path="/newsletter" element={<VisibilityRoute pageKey="newsletter"><Newsletter /></VisibilityRoute>} />
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
