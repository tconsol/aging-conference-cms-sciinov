require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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
app.use('/api/admin-users', require('./routes/adminUserRoutes'));

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
