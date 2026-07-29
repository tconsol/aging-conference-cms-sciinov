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

    if (req.files?.logo) {
      if (settings.logoPublicId) await deleteFromGCS(settings.logoPublicId);
      const f = req.files.logo[0];
      const dest = gcsFilename('aging-congress/site', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.logo = r.url;
      data.logoPublicId = r.filename;
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
