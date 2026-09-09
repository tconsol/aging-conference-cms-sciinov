const StaticPage = require('../models/StaticPage');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

const PAGES = {
  about: 'About',
  guidelines: 'Presentation Guidelines',
  publication: 'Publication',
  terms: 'Terms & Conditions',
};

exports.getByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!PAGES[key]) return res.status(404).json({ success: false, message: 'Page not found.' });
    let page = await StaticPage.findOne({ key });
    if (!page) {
      page = await StaticPage.create({ key, title: PAGES[key], content: '' });
    }
    res.json({ success: true, data: page });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!PAGES[key]) return res.status(404).json({ success: false, message: 'Page not found.' });

    const existing = await StaticPage.findOne({ key });
    const data = {
      content: req.body.content ?? existing?.content ?? '',
      title: req.body.title || PAGES[key],
      subtitle: req.body.subtitle ?? existing?.subtitle ?? '',
    };

    if (req.file) {
      if (existing?.imagePublicId) await deleteFromGCS(existing.imagePublicId);
      const dest = gcsFilename('aging-congress/pages', req.file.mimetype, req.file.originalname);
      const r = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.image = r.url;
      data.imagePublicId = r.filename;
    } else if (req.body.removeImage === 'true') {
      // Explicit removal, distinct from "no new file supplied" — without this
      // flag there is no way to clear an image once one has been set.
      if (existing?.imagePublicId) await deleteFromGCS(existing.imagePublicId);
      data.image = '';
      data.imagePublicId = '';
    }

    const page = await StaticPage.findOneAndUpdate(
      { key },
      data,
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: page });
  } catch (err) { next(err); }
};
