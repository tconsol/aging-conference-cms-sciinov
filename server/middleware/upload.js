const multer = require('multer');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP'), false);
  }
};

const docFilter = (req, file, cb) => {
  if ([...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX'), false);
  }
};

const anyFilter = (req, file, cb) => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.'), false);
  }
};

const storage = multer.memoryStorage();

const uploadImage = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadDoc = multer({ storage, fileFilter: docFilter, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadAny = multer({ storage, fileFilter: anyFilter, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = { uploadImage, uploadDoc, uploadAny };
