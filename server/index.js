require('dotenv').config();

const logger = require('./utils/logger');

// ── JWT secret guard ──────────────────────────────────────────────────────────
(function validateSecrets() {
  const WEAK_PLACEHOLDERS = [
    'change_this_to_a_long_random_secret_string',
    'secret', 'changeme', 'jwt_secret', 'your_secret',
  ];
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || WEAK_PLACEHOLDERS.some(p => secret.toLowerCase().includes(p))) {
    const auth = logger.child('auth');
    if (process.env.NODE_ENV === 'production') {
      auth.error('JWT_SECRET is missing or insecure — refusing to start', {
        fix: 'Set a 64+ character random hex string as JWT_SECRET',
      });
      process.exit(1);
    } else {
      auth.warn('JWT_SECRET is weak or unset', {
        fix: 'node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
      });
    }
  }
})();
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');
const { verifyTransport } = require('./utils/email');

const app = express();

connectDB();

app.use(helmet());
// Browsers send Origin without a trailing slash, so an env value copied from
// the address bar ("https://example.com/") would never match. Normalise both
// sides instead of trusting whoever typed the Cloud Run env var.
const normaliseOrigin = o => o.trim().replace(/\/+$/, '');
const _allowedOrigins = [
  ...(process.env.CLIENT_URL || '').split(','),
  ...(process.env.ADMIN_URL || '').split(','),
].map(normaliseOrigin).filter(Boolean);
const corsLog = logger.child('cors');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || _allowedOrigins.includes(normaliseOrigin(origin))) return cb(null, true);
    // Reject without throwing: a thrown error becomes a 500 from the error
    // handler, which hides the real cause behind an opaque server error.
    corsLog.warn(`Blocked origin ${origin}`, { allowed: _allowedOrigins.join(', ') || '(none)' });
    cb(null, false);
  },
  credentials: true,
}));
app.use(logger.requests());

// PayPal webhook needs raw body for signature verification must come before express.json()
app.post(
  '/api/registrations/paypal/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/registrationController').handlePaypalWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard stats (admin only)
app.get('/api/dashboard', protect, async (req, res, next) => {
  try {
    const [Abstract, Registration, Speaker, NewsArticle, ContactMessage, NewsletterSubscriber] = [
      require('./models/Abstract'),
      require('./models/Registration'),
      require('./models/Speaker'),
      require('./models/NewsArticle'),
      require('./models/ContactMessage'),
      require('./models/NewsletterSubscriber'),
    ];

    const [
      totalAbstracts,
      approvedAbstracts,
      pendingAbstracts,
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      totalSpeakers,
      publishedNews,
      unreadMessages,
      newsletterCount,
      recentAbstracts,
      recentRegistrations,
      recentMessages,
    ] = await Promise.all([
      Abstract.countDocuments(),
      Abstract.countDocuments({ status: 'approved' }),
      Abstract.countDocuments({ status: 'pending' }),
      Registration.countDocuments(),
      Registration.countDocuments({ paymentStatus: 'confirmed' }),
      Registration.countDocuments({ paymentStatus: 'pending' }),
      Speaker.countDocuments({ isActive: true }),
      NewsArticle.countDocuments({ status: 'published' }),
      ContactMessage.countDocuments({ isRead: false }),
      NewsletterSubscriber.countDocuments(),
      Abstract.find().sort({ submittedAt: -1 }).limit(5).select('firstName lastName abstractTitle status submittedAt'),
      Registration.find().sort({ registeredAt: -1 }).limit(5).select('firstName lastName category paymentStatus registeredAt'),
      ContactMessage.find({ isRead: false }).sort({ submittedAt: -1 }).limit(5).select('name email subject submittedAt'),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalAbstracts, approvedAbstracts, pendingAbstracts,
          totalRegistrations, confirmedRegistrations, pendingRegistrations,
          totalSpeakers, publishedNews, unreadMessages, newsletterCount,
        },
        recentAbstracts,
        recentRegistrations,
        recentMessages,
      },
    });
  } catch (err) { next(err); }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/editions', require('./routes/editionRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/program', require('./routes/programRoutes'));
app.use('/api/speakers', require('./routes/speakerRoutes'));
app.use('/api/speaker-applications', require('./routes/speakerApplicationRoutes'));
app.use('/api/committee', require('./routes/committeeRoutes'));
app.use('/api/abstracts', require('./routes/abstractRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/important-dates', require('./routes/importantDateRoutes'));
app.use('/api/venues', require('./routes/venueRoutes'));
app.use('/api/sponsorship', require('./routes/sponsorshipRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/downloads', require('./routes/downloadRoutes'));
app.use('/api/brochure', require('./routes/brochureRoutes'));
app.use('/api/pages', require('./routes/staticPageRoutes'));
app.use('/api/organizers', require('./routes/organizerRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/help', require('./routes/helpRoutes'));
app.use('/api/faq-topics', require('./routes/faqTopicRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/site-settings', require('./routes/siteSettingsRoutes'));
app.use('/api/fonts', require('./routes/fontRoutes'));
app.use('/api/visibility', require('./routes/visibilityRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/admin-users', require('./routes/adminUserRoutes'));

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.banner('Aging Congress API');
  logger.item('environment', process.env.NODE_ENV || 'development');
  logger.item('listening', `http://localhost:${PORT}`);
  logger.item('cors origins', _allowedOrigins.join(', ') || 'none configured', _allowedOrigins.length > 0);
  logger.item('log level', process.env.LOG_LEVEL || (logger.isProd ? 'http' : 'debug'));
  if (!logger.isProd) process.stdout.write('\n');

  // Reported at boot so a broken mail config is visible in the logs straight
  // away, rather than only when a registration silently fails to notify anyone.
  // Not awaited: mail being down must never stop the API from serving.
  verifyTransport();
});
