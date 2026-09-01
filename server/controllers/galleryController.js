const GalleryImage = require('../models/GalleryImage');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');
const { nextOrder, resequence, healOrders } = require('../utils/displayOrder');

// Gallery photos are ordered within their edition
const ORDER_SCOPE = ['edition'];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(GalleryImage, ORDER_SCOPE);
    const filter = {};
    if (req.query.edition) filter.edition = req.query.edition;
    const images = await GalleryImage.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) { next(err); }
};

// Bulk upload accepts multiple files under the 'images' field
exports.create = async (req, res, next) => {
  try {
    const { edition, caption } = req.body;
    if (!edition) return res.status(400).json({ success: false, message: 'Edition is required.' });
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'At least one image is required.' });

    let order = await nextOrder(GalleryImage, { edition });

    const created = [];
    for (const f of req.files) {
      const dest = gcsFilename('aging-congress/gallery', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      created.push(await GalleryImage.create({
        edition,
        imageUrl: r.url,
        imagePublicId: r.filename,
        caption: caption || undefined,
        displayOrder: order++,
      }));
    }

    await resequence(GalleryImage, { scope: { edition } });

    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      { caption: req.body.caption },
      { new: true }
    );
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });
    res.json({ success: true, data: image });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });
    await deleteFromGCS(image.imagePublicId);
    await image.deleteOne();
    await resequence(GalleryImage, { scope: { edition: image.edition } });
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) { next(err); }
};
