const StaticPage = require('../models/StaticPage');

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
    const page = await StaticPage.findOneAndUpdate(
      { key },
      { content: req.body.content, title: req.body.title || PAGES[key] },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: page });
  } catch (err) { next(err); }
};
