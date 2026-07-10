import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Spinner from './components/ui/Spinner';

// Auth
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard
import Dashboard from './pages/Dashboard';

// Congress
import Editions from './pages/congress/Editions';
import Sessions from './pages/congress/Sessions';
import Program from './pages/congress/Program';
import ImportantDates from './pages/congress/ImportantDates';
import Venue from './pages/congress/Venue';

// People
import Speakers from './pages/people/Speakers';
import SpeakerForm from './pages/people/SpeakerForm';
import Committee from './pages/people/Committee';
import Organizers from './pages/people/Organizers';
import SpeakerApplications from './pages/people/SpeakerApplications';
import SpeakerApplicationDetail from './pages/people/SpeakerApplicationDetail';

// Submissions
import Abstracts from './pages/submissions/Abstracts';
import AbstractDetail from './pages/submissions/AbstractDetail';
import Registrations from './pages/submissions/Registrations';
import RegistrationDetail from './pages/submissions/RegistrationDetail';

// Finance
import Pricing from './pages/finance/Pricing';
import Sponsorship from './pages/finance/Sponsorship';
import SponsorshipDetail from './pages/finance/SponsorshipDetail';

// Content
import News from './pages/content/News';
import NewsForm from './pages/content/NewsForm';
import Reports from './pages/content/Reports';
import Downloads from './pages/content/Downloads';
import Brochure from './pages/content/Brochure';
import StaticPageEditor from './pages/content/StaticPageEditor';

// Community
import Partners from './pages/community/Partners';
import Testimonials from './pages/community/Testimonials';
import Newsletter from './pages/community/Newsletter';

// Inbox
import Contact from './pages/inbox/Contact';
import ContactDetail from './pages/inbox/ContactDetail';
import HelpFAQs from './pages/inbox/HelpFAQs';
import FAQTopics from './pages/inbox/FAQTopics';
import HelpTickets from './pages/inbox/HelpTickets';
import TicketDetail from './pages/inbox/TicketDetail';

// Settings
import SiteSettings from './pages/settings/SiteSettings';
import AdminUsers from './pages/settings/AdminUsers';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Congress */}
          <Route path="/editions" element={<Editions />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/program" element={<Program />} />
          <Route path="/important-dates" element={<ImportantDates />} />
          <Route path="/venues" element={<Venue />} />

          {/* People */}
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/speakers/new" element={<SpeakerForm />} />
          <Route path="/speakers/:id/edit" element={<SpeakerForm />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/organizers" element={<Organizers />} />
          <Route path="/speaker-applications" element={<SpeakerApplications />} />
          <Route path="/speaker-applications/:id" element={<SpeakerApplicationDetail />} />

          {/* Submissions */}
          <Route path="/abstracts" element={<Abstracts />} />
          <Route path="/abstracts/:id" element={<AbstractDetail />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/registrations/:id" element={<RegistrationDetail />} />

          {/* Finance */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/sponsorship/:id" element={<SponsorshipDetail />} />

          {/* Content */}
          <Route path="/news" element={<News />} />
          <Route path="/news/new" element={<NewsForm />} />
          <Route path="/news/:id/edit" element={<NewsForm />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/brochure" element={<Brochure />} />
          <Route path="/pages/:key" element={<StaticPageEditor />} />

          {/* Community */}
          <Route path="/partners" element={<Partners />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/newsletter" element={<Newsletter />} />

          {/* Inbox */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact/:id" element={<ContactDetail />} />
          <Route path="/help" element={<HelpFAQs />} />
          <Route path="/help/topics" element={<FAQTopics />} />
          <Route path="/help/tickets" element={<HelpTickets />} />
          <Route path="/help/tickets/:id" element={<TicketDetail />} />

          {/* Settings */}
          <Route path="/settings" element={<SiteSettings />} />
          <Route path="/admin-users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
