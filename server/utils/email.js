const nodemailer = require('nodemailer');

const REQUIRED_VARS = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
const missingVars = () => REQUIRED_VARS.filter((k) => !process.env[k]);

// Parsed as a number rather than compared as the string '465': EMAIL_PORT set
// with a stray space, or injected as a number by a deploy config, would fail a
// `=== '465'` check and fall back to plaintext on an implicit-TLS port — which
// does not error, it just hangs until the socket times out.
const port = parseInt(process.env.EMAIL_PORT, 10) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Without these a blocked outbound port stalls the request until the platform
  // kills it, hiding a network problem behind an apparent hang.
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

/**
 * Checks SMTP reachability and credentials at boot. The password is never
 * logged — only which variables are present and whether the handshake worked.
 */
const verifyTransport = async () => {
  const missing = missingVars();
  if (missing.length) {
    console.error(
      `[smtp] NOT CONFIGURED — missing env var(s): ${missing.join(', ')}. No email will be sent.`
    );
    return false;
  }

  console.log(
    `[smtp] connecting to ${process.env.EMAIL_HOST}:${port} ` +
    `(secure=${port === 465}) as ${process.env.EMAIL_USER}`
  );

  try {
    await transporter.verify();
    console.log('[smtp] CONNECTED — authenticated, ready to send');
    return true;
  } catch (err) {
    console.error(`[smtp] CONNECTION FAILED — ${err.code || 'ERROR'}: ${err.message}`);
    return false;
  }
};

// `attachments` follows nodemailer's shape, e.g.
// [{ filename: 'letter.pdf', content: <Buffer>, contentType: 'application/pdf' }]
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  const missing = missingVars();
  if (missing.length) {
    const reason = `SMTP not configured — missing ${missing.join(', ')}`;
    console.error(`[smtp] SKIPPED "${subject}" → ${to}: ${reason}`);
    throw new Error(reason);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
      ...(attachments?.length ? { attachments } : {}),
    });
    console.log(`[smtp] sent "${subject}" → ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    // Callers deliberately swallow send failures so a notification can never
    // break the request that triggered it. Log here, at the one place every
    // send passes through, or the failure leaves no trace at all.
    console.error(`[smtp] FAILED "${subject}" → ${to}: ${err.code || 'ERROR'} ${err.message}`);
    throw err;
  }
};

module.exports = { sendEmail, verifyTransport };
