const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    type: 'service_account',
    project_id: process.env.GCS_PROJECT_ID,
    private_key_id: process.env.GCP_PRIVATE_KEY_ID,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GCP_CLIENT_EMAIL,
    client_id: process.env.GCP_CLIENT_ID,
  },
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

// Streams a stored object back to an Express response as an attachment.
// Browsers ignore <a download> across origins, so downloads are proxied through us.
const streamGCSFile = async (res, { filename, downloadName }) => {
  const file = bucket.file(filename);
  const [exists] = await file.exists();
  if (!exists) return false;

  let contentType = 'application/octet-stream';
  try {
    const [metadata] = await file.getMetadata();
    if (metadata.contentType) contentType = metadata.contentType;
  } catch {
    // fall back to octet-stream
  }

  // ASCII fallback + RFC 5987 encoded name, and strip quotes/newlines to keep
  // untrusted filenames out of the header grammar.
  const safe = String(downloadName || 'download')
    .replace(/[\r\n"\\]/g, '')
    .replace(/[^\x20-\x7E]/g, '_');

  res.setHeader('Content-Type', contentType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(downloadName || 'download')}`
  );

  await new Promise((resolve, reject) => {
    file.createReadStream()
      .on('error', reject)
      .on('end', resolve)
      .pipe(res);
  });
  return true;
};

// Recovers the object path from a stored public URL, for legacy records
// saved before filePublicId was tracked.
const gcsPathFromUrl = (url) => {
  if (!url) return null;
  const prefix = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/`;
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
};

const gcsFilename = (folder, mimetype, originalname) => {
  const ext = (originalname && originalname.includes('.'))
    ? originalname.split('.').pop()
    : (mimetype ? mimetype.split('/')[1] : 'bin');
  const rand = Math.random().toString(36).substr(2, 8);
  return `${folder}/${Date.now()}-${rand}.${ext}`;
};

module.exports = { uploadToGCS, deleteFromGCS, gcsFilename, streamGCSFile, gcsPathFromUrl };
