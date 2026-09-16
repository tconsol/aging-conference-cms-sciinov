/**
 * One log format for the whole server.
 *
 * Development prints aligned, coloured columns so a boot sequence or a burst of
 * requests can be skimmed vertically:
 *
 *   14:22:07  info   db       MongoDB connected · cluster0.mongodb.net
 *   14:22:09  http   api      GET  /api/speakers                 200  42ms
 *   14:22:11  warn   cors     Blocked origin https://example.com
 *
 * Production prints one JSON object per line using the field names Cloud
 * Logging understands (`severity`, `message`), so entries stay searchable and a
 * multi-line stack trace remains a single log entry instead of 20 orphan lines.
 */

const LEVELS = { debug: 10, http: 20, info: 30, warn: 40, error: 50 };

// Cloud Logging severity names; anything unmapped shows up as DEFAULT.
const SEVERITY = {
  debug: 'DEBUG', http: 'INFO', info: 'INFO', warn: 'WARNING', error: 'ERROR',
};

const isProd = process.env.NODE_ENV === 'production';

// Honour NO_COLOR and non-TTY output (log files, Cloud Run) — escape codes in a
// captured log are exactly the noise this module exists to remove.
const useColor = !isProd && !process.env.NO_COLOR && process.stdout.isTTY;

const C = useColor
  ? {
      reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
      grey: '\x1b[90m', red: '\x1b[31m', green: '\x1b[32m',
      yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
    }
  : new Proxy({}, { get: () => '' });

const LEVEL_COLOR = {
  debug: C.grey, http: C.cyan, info: C.green, warn: C.yellow, error: C.red,
};

const threshold = LEVELS[process.env.LOG_LEVEL] ?? (isProd ? LEVELS.http : LEVELS.debug);

const pad = (s, n) => String(s).padEnd(n);
const clock = () => new Date().toTimeString().slice(0, 8);

const emit = (level, scope, message, meta) => {
  if (LEVELS[level] < threshold) return;
  const stream = LEVELS[level] >= LEVELS.warn ? process.stderr : process.stdout;

  if (isProd) {
    stream.write(`${JSON.stringify({
      severity: SEVERITY[level] || 'DEFAULT',
      time: new Date().toISOString(),
      scope,
      message,
      ...(meta || {}),
    })}\n`);
    return;
  }

  const head =
    `${C.grey}${clock()}${C.reset}  ` +
    `${LEVEL_COLOR[level]}${pad(level, 5)}${C.reset}  ` +
    `${C.magenta}${pad(scope, 8)}${C.reset}  `;

  let line = head + message;
  if (meta && Object.keys(meta).length) {
    // Detail is indented under the message column so it never reads as a new
    // event; multi-line values (stack traces) keep that indent line by line.
    const indent = ' '.repeat(27); // width of time + level + scope columns
    const inline = [];
    for (const [k, v] of Object.entries(meta)) {
      const text = typeof v === 'string' ? v : JSON.stringify(v);
      if (text.includes('\n')) {
        line += `\n${text.split('\n').map(l => `${indent}${C.dim}${l.trim()}${C.reset}`).join('\n')}`;
      } else {
        inline.push(`${C.grey}${k}=${C.reset}${text}`);
      }
    }
    if (inline.length) line += `\n${indent}${C.dim}${inline.join('  ')}${C.reset}`;
  }
  stream.write(`${line}\n`);
};

const make = (scope) => ({
  scope,
  debug: (msg, meta) => emit('debug', scope, msg, meta),
  http: (msg, meta) => emit('http', scope, msg, meta),
  info: (msg, meta) => emit('info', scope, msg, meta),
  warn: (msg, meta) => emit('warn', scope, msg, meta),
  error: (msg, meta) => emit('error', scope, msg, meta),
  /** Blank-line separator + bold heading. Boot only; no-op in JSON mode. */
  banner: (title) => {
    if (isProd || LEVELS.info < threshold) return;
    process.stdout.write(`\n${C.bold}${C.cyan}${title}${C.reset}\n`);
  },
  /** `key … value` pair, aligned under a banner. Boot summaries only. */
  item: (key, value, ok = true) => {
    if (isProd) return emit('info', scope, `${key}: ${value}`);
    if (LEVELS.info < threshold) return;
    const dot = ok ? `${C.green}•${C.reset}` : `${C.yellow}•${C.reset}`;
    process.stdout.write(`  ${dot} ${C.grey}${pad(key, 16)}${C.reset}${value}\n`);
  },
});

const logger = make('server');
logger.child = make;
logger.isProd = isProd;

/**
 * Request logger. Replaces morgan so request lines share the columns, colours
 * and (in production) the JSON shape of everything else.
 */
logger.requests = () => (req, res, next) => {
  const started = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    const { statusCode } = res;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';
    const url = req.originalUrl.split('?')[0];

    if (isProd) {
      emit(level, 'api', `${req.method} ${url} ${statusCode}`, {
        method: req.method,
        path: url,
        status: statusCode,
        durationMs: Math.round(ms),
        ip: req.ip,
      });
      return;
    }

    const statusColor =
      statusCode >= 500 ? C.red : statusCode >= 400 ? C.yellow : statusCode >= 300 ? C.cyan : C.green;
    emit(
      level,
      'api',
      `${pad(req.method, 6)}${pad(url, 38)}${statusColor}${statusCode}${C.reset}` +
      `${C.grey}  ${ms.toFixed(0)}ms${C.reset}`,
    );
  });
  next();
};

module.exports = logger;
