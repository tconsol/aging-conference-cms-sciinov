const NewsArticle = require('../models/NewsArticle');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.getAll = async (req, res, next) => {
  try {
    const { status, tag, page = 1, limit = 12, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await NewsArticle.countDocuments(filter);
    const articles = await NewsArticle.find(filter, '-content')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: articles, total });
  } catch (err) { next(err); }
};

exports.getLatest = async (req, res, next) => {
  try {
    const articles = await NewsArticle.find({ status: 'published' }, '-content')
      .sort({ publishedAt: -1 })
      .limit(3);
    res.json({ success: true, data: articles });
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const article = await NewsArticle.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, data: article });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const article = await NewsArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, data: article });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.body.tags && typeof req.body.tags === 'string') {
      data.tags = req.body.tags.split(',').map((t) => t.trim());
    }
    if (req.file) {
      const dest = gcsFilename('aging-congress/news', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.featuredImage = result.url;
      data.featuredImagePublicId = result.filename;
    }
    const article = await NewsArticle.create(data);
    res.status(201).json({ success: true, data: article });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const article = await NewsArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    const data = { ...req.body };
    if (req.body.tags && typeof req.body.tags === 'string') {
      data.tags = req.body.tags.split(',').map((t) => t.trim());
    }
    if (req.file) {
      if (article.featuredImagePublicId) await deleteFromGCS(article.featuredImagePublicId);
      const dest = gcsFilename('aging-congress/news', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.featuredImage = result.url;
      data.featuredImagePublicId = result.filename;
    }
    const updated = await NewsArticle.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const article = await NewsArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    if (article.featuredImagePublicId) await deleteFromGCS(article.featuredImagePublicId);
    await article.deleteOne();
    res.json({ success: true, message: 'Article deleted.' });
  } catch (err) { next(err); }
};
