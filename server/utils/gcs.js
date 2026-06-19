const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_FILE,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const uploadToGCS = (buffer, { destination, contentType = 'application/octet-stream' }) =>
  new Promise((resolve, reject) => {
    const file = bucket.file(destination);
    const stream = file.createWriteStream({
      metadata: { contentType },
      resumable: false,
    });
    stream.on('error', reject);
    stream.on('finish', () => {
      resolve({
        url: `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${destination}`,
        filename: destination,
      });
    });
    stream.end(buffer);
  });

const deleteFromGCS = async (filename) => {
  if (!filename) return;
  try {
    await bucket.file(filename).delete();
  } catch {
    // ignore not-found
  }
};

const gcsFilename = (folder, mimetype, originalname) => {
  const ext = (originalname && originalname.includes('.'))
    ? originalname.split('.').pop()
    : (mimetype ? mimetype.split('/')[1] : 'bin');
  const rand = Math.random().toString(36).substr(2, 8);
  return `${folder}/${Date.now()}-${rand}.${ext}`;
};

module.exports = { uploadToGCS, deleteFromGCS, gcsFilename };
