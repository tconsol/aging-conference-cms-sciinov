const SiteSettings = require('../models/SiteSettings');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.get = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    const updated = await SiteSettings.findByIdAndUpdate(
      settings._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    const data = { ...req.body };
    if (req.body.socialLinks && typeof req.body.socialLinks === 'string') {
      data.socialLinks = JSON.parse(req.body.socialLinks);
    }
    if (req.body.seo && typeof req.body.seo === 'string') {
      data.seo = JSON.parse(req.body.seo);
    }

    if (req.body.aboutPage && typeof req.body.aboutPage === 'string') {
      data.aboutPage = JSON.parse(req.body.aboutPage);
    }

    if (req.files?.logo) {
      if (settings.logoPublicId) await deleteFromGCS(settings.logoPublicId);
      const f = req.files.logo[0];
      const dest = gcsFilename('aging-congress/site', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.logo = r.url;
      data.logoPublicId = r.filename;
    } else if (req.body.removeLogo === 'true') {
      // Distinct from "no new file sent": without this there is no way to get
      // back to a logo-less header once one has been uploaded.
      if (settings.logoPublicId) await deleteFromGCS(settings.logoPublicId);
      data.logo = '';
      data.logoPublicId = '';
    }
    if (req.files?.favicon) {
      if (settings.faviconPublicId) await deleteFromGCS(settings.faviconPublicId);
      const f = req.files.favicon[0];
      const dest = gcsFilename('aging-congress/site', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.favicon = r.url;
      data.faviconPublicId = r.filename;
    }

    const updated = await SiteSettings.findByIdAndUpdate(settings._id, data, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

/**
 * Sample abstract template, offered as a download on the public submission page.
 * Kept off the main settings route because that one runs the image-only multer
 * filter (and is super_admin only) — this accepts PDF/DOC/DOCX from any admin.
 */
exports.updateSampleAbstract = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    if (settings.sampleAbstractPublicId) await deleteFromGCS(settings.sampleAbstractPublicId);

    const dest = gcsFilename('aging-congress/site', req.file.mimetype, req.file.originalname);
    const r = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });

    const updated = await SiteSettings.findByIdAndUpdate(
      settings._id,
      {
        sampleAbstractUrl: r.url,
        sampleAbstractPublicId: r.filename,
        sampleAbstractName: req.file.originalname,
      },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.removeSampleAbstract = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: 'Settings not found.' });
    if (settings.sampleAbstractPublicId) await deleteFromGCS(settings.sampleAbstractPublicId);

    const updated = await SiteSettings.findByIdAndUpdate(
      settings._id,
      { sampleAbstractUrl: '', sampleAbstractPublicId: '', sampleAbstractName: '' },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};
