const Edition = require('../models/Edition');
const GalleryImage = require('../models/GalleryImage');
const { uploadToGCS, deleteFromGCS, gcsFilename, streamGCSFile } = require('../utils/gcs');

exports.getAll = async (req, res, next) => {
  try {
    const editions = await Edition.find().sort({ year: -1 });
    res.json({ success: true, data: editions });
  } catch (err) { next(err); }
};

exports.getActive = async (req, res, next) => {
  try {
    const edition = await Edition.findOne({ isActive: true });
    res.json({ success: true, data: edition });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const edition = await Edition.findOne({ $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { slug: req.params.id }] });
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });
    res.json({ success: true, data: edition });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.highlights && typeof data.highlights === 'string') {
      try { data.highlights = JSON.parse(data.highlights); } catch { data.highlights = []; }
    }
    if (req.file) {
      const dest = gcsFilename('aging-congress/editions', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.bannerImage = result.url;
      data.bannerImagePublicId = result.filename;
    }
    if (data.isActive) {
      await Edition.updateMany({ isActive: true }, { isActive: false });
    }
    const edition = await Edition.create(data);
    res.status(201).json({ success: true, data: edition });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const edition = await Edition.findById(req.params.id);
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });

    const data = { ...req.body };
    if (data.highlights && typeof data.highlights === 'string') {
      try { data.highlights = JSON.parse(data.highlights); } catch { data.highlights = []; }
    }
    if (req.file) {
      if (edition.bannerImagePublicId) await deleteFromGCS(edition.bannerImagePublicId);
      const dest = gcsFilename('aging-congress/editions', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.bannerImage = result.url;
      data.bannerImagePublicId = result.filename;
    }
    if (data.isActive) {
      await Edition.updateMany({ _id: { $ne: req.params.id }, isActive: true }, { isActive: false });
    }
    const updated = await Edition.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const edition = await Edition.findById(req.params.id);
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });
    if (edition.bannerImagePublicId) await deleteFromGCS(edition.bannerImagePublicId);
    if (edition.conferenceBook?.coverImagePublicId) await deleteFromGCS(edition.conferenceBook.coverImagePublicId);
    if (edition.conferenceBook?.filePublicId) await deleteFromGCS(edition.conferenceBook.filePublicId);
    if (edition.conferenceProgram?.coverImagePublicId) await deleteFromGCS(edition.conferenceProgram.coverImagePublicId);
    if (edition.conferenceProgram?.filePublicId) await deleteFromGCS(edition.conferenceProgram.filePublicId);

    const galleryImages = await GalleryImage.find({ edition: edition._id }).select('imagePublicId');
    await Promise.all(galleryImages.map((img) => deleteFromGCS(img.imagePublicId)));
    await GalleryImage.deleteMany({ edition: edition._id });

    await edition.deleteOne();
    res.json({ success: true, message: 'Edition deleted.' });
  } catch (err) { next(err); }
};

// Conference Book + Conference Program materials shown on the public "Past Events" card
exports.updateMaterials = async (req, res, next) => {
  try {
    const edition = await Edition.findById(req.params.id);
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });

    const update = {};
    const files = req.files || {};

    if (req.body.bookTitle !== undefined) update['conferenceBook.title'] = req.body.bookTitle;
    if (req.body.programTitle !== undefined) update['conferenceProgram.title'] = req.body.programTitle;

    if (files.bookCoverImage?.[0]) {
      if (edition.conferenceBook?.coverImagePublicId) await deleteFromGCS(edition.conferenceBook.coverImagePublicId);
      const f = files.bookCoverImage[0];
      const dest = gcsFilename('aging-congress/editions/materials', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      update['conferenceBook.coverImage'] = r.url;
      update['conferenceBook.coverImagePublicId'] = r.filename;
    }
    if (files.bookFile?.[0]) {
      if (edition.conferenceBook?.filePublicId) await deleteFromGCS(edition.conferenceBook.filePublicId);
      const f = files.bookFile[0];
      const dest = gcsFilename('aging-congress/editions/materials', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      update['conferenceBook.fileUrl'] = r.url;
      update['conferenceBook.filePublicId'] = r.filename;
      update['conferenceBook.fileName'] = f.originalname;
    }
    if (files.programCoverImage?.[0]) {
      if (edition.conferenceProgram?.coverImagePublicId) await deleteFromGCS(edition.conferenceProgram.coverImagePublicId);
      const f = files.programCoverImage[0];
      const dest = gcsFilename('aging-congress/editions/materials', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      update['conferenceProgram.coverImage'] = r.url;
      update['conferenceProgram.coverImagePublicId'] = r.filename;
    }
    if (files.programFile?.[0]) {
      if (edition.conferenceProgram?.filePublicId) await deleteFromGCS(edition.conferenceProgram.filePublicId);
      const f = files.programFile[0];
      const dest = gcsFilename('aging-congress/editions/materials', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      update['conferenceProgram.fileUrl'] = r.url;
      update['conferenceProgram.filePublicId'] = r.filename;
      update['conferenceProgram.fileName'] = f.originalname;
    }

    const updated = await Edition.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// Public download proxy the browser ignores <a download> across origins,
// so the "Download" button hits this instead of the raw GCS URL.
exports.downloadMaterial = async (req, res, next) => {
  try {
    const { type } = req.params; // 'book' | 'program'
    if (type !== 'book' && type !== 'program') return res.status(400).json({ success: false, message: 'Invalid material type.' });

    const edition = await Edition.findById(req.params.id).select('conferenceBook conferenceProgram');
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });

    const material = type === 'book' ? edition.conferenceBook : edition.conferenceProgram;
    if (!material?.filePublicId) return res.status(404).json({ success: false, message: 'No file available.' });

    const ok = await streamGCSFile(res, { filename: material.filePublicId, downloadName: material.fileName || `${type}.pdf` });
    if (!ok) return res.status(404).json({ success: false, message: 'File no longer available.' });
  } catch (err) { next(err); }
};

exports.setActive = async (req, res, next) => {
  try {
    await Edition.updateMany({ isActive: true }, { isActive: false });
    const edition = await Edition.findByIdAndUpdate(req.params.id, { isActive: true, status: 'active' }, { new: true });
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });
    res.json({ success: true, data: edition });
  } catch (err) { next(err); }
};
