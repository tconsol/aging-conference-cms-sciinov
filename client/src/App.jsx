import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SplashScreen from './components/ui/SplashScreen';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Sessions from './pages/Sessions';
import Program from './pages/Program';
import ImportantDates from './pages/ImportantDates';
import Venue from './pages/Venue';
import Speakers from './pages/Speakers';
import SpeakerDetail from './pages/SpeakerDetail';
import Committee from './pages/Committee';
import Organizers from './pages/Organizers';
import AbstractSubmission from './pages/AbstractSubmission';
import Registration from './pages/Registration';
import Pricing from './pages/Pricing';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Reports from './pages/Reports';
import Downloads from './pages/Downloads';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Sponsorship from './pages/Sponsorship';
import Partners from './pages/Partners';
import Testimonials from './pages/Testimonials';
import StaticPage from './pages/StaticPage';
import Newsletter from './pages/Newsletter';

export default function App() {
  return (
    <>
      <SplashScreen />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/program" element={<Program />} />
        <Route path="/important-dates" element={<ImportantDates />} />
        <Route path="/venue" element={<Venue />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/speakers/:slug" element={<SpeakerDetail />} />
        <Route path="/committee" element={<Committee />} />
        <Route path="/organizers" element={<Organizers />} />
        <Route path="/abstract-submission" element={<AbstractSubmission />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/sponsorship" element={<Sponsorship />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/guidelines" element={<StaticPage pageKey="guidelines" />} />
        <Route path="/publication-policy" element={<StaticPage pageKey="publication" />} />
        <Route path="/terms" element={<StaticPage pageKey="terms" />} />
        <Route path="/newsletter" element={<Newsletter />} />
      </Route>
    </Routes>
    </>
  );
}
