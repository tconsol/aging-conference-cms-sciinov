/**
 * One feed of everything the public site collects.
 *
 * Six unrelated collections back this, each with its own field names, status
 * vocabulary and timestamp. Rather than teach the admin panel all six shapes,
 * each is projected into a common row here: type, name, email, status, date.
 *
 * Sorting and pagination happen across the merged set, so a page of results can
 * legitimately mix types. That rules out per-collection `.skip()` — the whole
 * matching set is fetched, merged, then sliced. Fine at this scale (thousands,
 * not millions); if the collections grow past that this wants a real union view.
 */
const Abstract = require('../models/Abstract');
const Registration = require('../models/Registration');
const SpeakerApplication = require('../models/SpeakerApplication');
const SponsorshipInquiry = require('../models/SponsorshipInquiry');
const ContactMessage = require('../models/ContactMessage');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const SupportTicket = require('../models/SupportTicket');

const full = (first, last) => [first, last].filter(Boolean).join(' ').trim();

// Each source declares how to find its rows and how to flatten one.
const SOURCES = {
  abstract: {
    label: 'Abstract',
    model: () => Abstract,
    dateField: 'submittedAt',
    editionField: 'edition',
    searchFields: ['firstName', 'lastName', 'email', 'abstractTitle', 'loginId'],
    statuses: ['pending', 'received_accepted', 'under_review', 'decision_pending', 'accepted', 'rejected'],
    map: (d) => ({
      name: full(d.firstName, d.lastName),
      email: d.email,
      status: d.status,
      title: d.abstractTitle,
      detail: `/abstracts/${d._id}`,
      extra: d.loginId ? `ID ${d.loginId}` : '',
    }),
  },
  registration: {
    label: 'Registration',
    model: () => Registration,
    dateField: 'registeredAt',
    editionField: 'edition',
    searchFields: ['firstName', 'lastName', 'email', 'organization', 'transactionId'],
    statuses: ['pending', 'confirmed', 'cancelled', 'refunded'],
    statusField: 'paymentStatus',
    map: (d) => ({
      name: full(d.firstName, d.lastName),
      email: d.email,
      status: d.paymentStatus,
      title: d.category,
      detail: `/registrations/${d._id}`,
      extra: d.amount != null ? `${d.currency || 'USD'} ${d.amount}` : '',
    }),
  },
  speakerApplication: {
    label: 'Speaker Application',
    model: () => SpeakerApplication,
    dateField: 'submittedAt',
    editionField: 'edition',
    searchFields: ['name', 'email', 'organization', 'expertise'],
    map: (d) => ({
      name: d.name,
      email: d.email,
      status: d.status,
      title: d.expertise || d.designation,
      detail: `/speaker-applications/${d._id}`,
      extra: d.organization || '',
    }),
  },
  sponsorship: {
    label: 'Sponsorship Inquiry',
    model: () => SponsorshipInquiry,
    dateField: 'submittedAt',
    searchFields: ['organizationName', 'contactPerson', 'email'],
    map: (d) => ({
      name: d.contactPerson || d.organizationName,
      email: d.email,
      status: d.status,
      title: d.sponsorshipInterest,
      detail: `/sponsorship/${d._id}`,
      extra: d.organizationName || '',
    }),
  },
  contact: {
    label: 'Contact Message',
    model: () => ContactMessage,
    dateField: 'submittedAt',
    searchFields: ['name', 'email', 'subject'],
    map: (d) => ({
      name: d.name,
      email: d.email,
      // No status field — read/unread is the only state it has.
      status: d.isRead ? 'read' : 'unread',
      title: d.subject,
      detail: `/contact/${d._id}`,
      extra: '',
    }),
  },
  supportTicket: {
    label: 'Support Ticket',
    model: () => SupportTicket,
    dateField: 'submittedAt',
    searchFields: ['name', 'email', 'subject'],
    map: (d) => ({
      name: d.name,
      email: d.email,
      status: d.status,
      title: d.subject,
      detail: `/help/tickets/${d._id}`,
      extra: '',
    }),
  },
  newsletter: {
    label: 'Newsletter Signup',
    model: () => NewsletterSubscriber,
    dateField: 'subscribedAt',
    searchFields: ['email'],
    map: (d) => ({
      name: d.email,
      email: d.email,
      status: 'subscribed',
      title: '',
      detail: '/newsletter',
      extra: '',
    }),
  },
};

const buildFilter = (src, { q, from, to, edition }) => {
  const filter = {};

  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = src.searchFields.map((f) => ({ [f]: rx }));
  }

  if (from || to) {
    filter[src.dateField] = {};
    if (from) filter[src.dateField].$gte = new Date(from);
    // `to` is a calendar day; include everything up to its final millisecond.
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter[src.dateField].$lte = end;
    }
  }

  // Sources with no edition link are simply not filtered by it, rather than
  // being excluded — a newsletter signup belongs to no single edition.
  if (edition && src.editionField) filter[src.editionField] = edition;

  return filter;
};

exports.getAll = async (req, res, next) => {
  try {
    const {
      type, status, q, from, to, edition,
      page = 1, limit = 25,
    } = req.query;

    const wanted = type && type !== 'all'
      ? String(type).split(',').filter((t) => SOURCES[t])
      : Object.keys(SOURCES);

    if (!wanted.length) {
      return res.status(400).json({ success: false, message: 'Unknown submission type.' });
    }

    const batches = await Promise.all(wanted.map(async (key) => {
      const src = SOURCES[key];
      const Model = src.model();
      const filter = buildFilter(src, { q, from, to, edition });

      // Edition filters are skipped for sources that have no edition, but if the
      // user asked for an edition those sources should not flood the results.
      if (edition && !src.editionField) return [];

      const docs = await Model.find(filter).sort({ [src.dateField]: -1 }).lean();
      return docs.map((d) => {
        const mapped = src.map(d);
        return {
          id: String(d._id),
          type: key,
          typeLabel: src.label,
          date: d[src.dateField] || d.createdAt || null,
          edition: d[src.editionField] ? String(d[src.editionField]) : null,
          ...mapped,
        };
      });
    }));

    let rows = batches.flat();

    // Status vocabularies differ per source, so this is matched after mapping
    // rather than pushed into each query.
    if (status && status !== 'all') {
      const wantedStatuses = String(status).split(',');
      rows = rows.filter((r) => wantedStatuses.includes(r.status));
    }

    rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const total = rows.length;
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 200);
    const current = Math.max(parseInt(page, 10) || 1, 1);
    const start = (current - 1) * perPage;

    res.json({
      success: true,
      data: rows.slice(start, start + perPage),
      pagination: {
        total,
        page: current,
        limit: perPage,
        pages: Math.ceil(total / perPage) || 1,
      },
      // Counts for the whole filtered set, so the type chips can show totals
      // that do not change as the user pages through.
      counts: Object.keys(SOURCES).reduce((acc, k) => {
        acc[k] = rows.filter((r) => r.type === k).length;
        return acc;
      }, {}),
    });
  } catch (err) { next(err); }
};

/** Type list and each type's status vocabulary, so the filters build themselves. */
exports.getMeta = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: Object.entries(SOURCES).map(([key, src]) => ({
        key,
        label: src.label,
        statuses: src.statuses || null,
      })),
    });
  } catch (err) { next(err); }
};
