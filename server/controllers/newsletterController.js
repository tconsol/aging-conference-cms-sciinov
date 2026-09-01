const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { broadcast } = require('../utils/sseClients');

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) return res.json({ success: true, message: 'Already subscribed.' });
    const subscriber = await NewsletterSubscriber.create({ email });

    broadcast('new_subscriber', { id: subscriber._id, email: subscriber.email, createdAt: subscriber.createdAt });

    res.status(201).json({ success: true, message: 'Subscribed successfully.' });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const filter = {};
    if (search) filter.email = { $regex: search, $options: 'i' };
    const total = await NewsletterSubscriber.countDocuments(filter);
    const subscribers = await NewsletterSubscriber.find(filter)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: subscribers, total });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subscriber removed.' });
  } catch (err) { next(err); }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ subscribedAt: -1 });
    const csv = ['Email,Subscribed At', ...subscribers.map((s) => `"${s.email}","${s.subscribedAt?.toISOString()}"`)].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};
