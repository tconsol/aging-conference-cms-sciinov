/**
 * Shared display-order handling.
 *
 * Every ordered collection keeps a unique, gap-free 1..n sequence. Some are ordered
 * globally (partners, reports…) and some within a parent scope (sessions per edition,
 * program slots per edition+day…), so callers pass the scope fields that apply.
 */

// Builds a scope filter from a document, e.g. scopeOf(doc, ['edition']) -> { edition: <id> }
// Fields that are absent are matched as null so unscoped rows group together.
const scopeOf = (doc, fields = []) => {
  const filter = {};
  fields.forEach((f) => {
    const v = doc?.[f];
    filter[f] = v === undefined || v === '' ? null : v;
  });
  return filter;
};

// Next order for a new item: one past the current highest in its scope.
const nextOrder = async (Model, scope = {}) => {
  const last = await Model.findOne(scope).sort({ displayOrder: -1 }).select('displayOrder').lean();
  return (last?.displayOrder ?? 0) + 1;
};

/**
 * Renumbers a scope to a unique, gap-free 1..n sequence.
 *
 * `favorId` wins ties, so an item given an explicit order genuinely claims that slot
 * and the item already sitting there is pushed down instead of silently duplicating.
 * Only rows whose number actually changes are written.
 */
const resequence = async (Model, { scope = {}, favorId = null } = {}) => {
  const docs = await Model.find(scope).select('displayOrder createdAt').lean();
  if (!docs.length) return;

  docs.sort((a, b) => {
    const ao = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const bo = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    if (favorId) {
      if (String(a._id) === String(favorId)) return -1;
      if (String(b._id) === String(favorId)) return 1;
    }
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });

  const ops = docs
    .map((d, i) => ({ d, order: i + 1 }))
    .filter(({ d, order }) => d.displayOrder !== order)
    .map(({ d, order }) => ({
      updateOne: { filter: { _id: d._id }, update: { $set: { displayOrder: order } } },
    }));

  if (ops.length) await Model.bulkWrite(ops);
};

/**
 * True when a fetched list isn't already a clean 1..n per scope either numbers
 * repeat (legacy rows all defaulted to 0) or the sequence has gaps (an item was
 * deleted, or moved to another scope). Drives the self-heal on read.
 */
const hasDuplicateOrders = (docs, scopeFields = []) => {
  const groups = new Map();
  for (const d of docs) {
    const key = scopeFields.map((f) => String(d[f]?._id ?? d[f] ?? '')).join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d.displayOrder);
  }
  for (const orders of groups.values()) {
    const sorted = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) return true; // duplicate or gap
    }
  }
  return false;
};

// Distinct scope combinations present in the collection, so a repair pass can
// resequence each group independently.
const allScopes = async (Model, fields = []) => {
  if (!fields.length) return [{}];
  const rows = await Model.find().select(fields.join(' ')).lean();
  const seen = new Map();
  rows.forEach((r) => {
    const filter = scopeOf(r, fields);
    seen.set(JSON.stringify(filter), filter);
  });
  return [...seen.values()];
};

// Repairs every scope in a collection. Safe to call on read; it writes only when
// a scope actually contains duplicates or gaps.
const resequenceAll = async (Model, fields = []) => {
  const scopes = await allScopes(Model, fields);
  for (const scope of scopes) await resequence(Model, { scope });
};

/**
 * Normalises an incoming displayOrder value.
 * `0` is a legitimate order, so absence must be checked explicitly rather than by
 * falsiness `if (!displayOrder)` wrongly treats 0 as "not supplied".
 */
const parseOrder = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Resolves the order a new document should be created with: the caller's explicit
 * value when supplied, otherwise the next free slot in its scope.
 */
const orderForCreate = async (Model, data, scopeFields = []) => {
  const explicit = parseOrder(data.displayOrder);
  if (explicit !== undefined) return explicit;
  return nextOrder(Model, scopeOf(data, scopeFields));
};

/** Renumbers the scope a document belongs to, letting that document keep its slot. */
const settleOrder = (Model, doc, scopeFields = []) =>
  resequence(Model, { scope: scopeOf(doc, scopeFields), favorId: doc?._id });

/** Closes the gap left in a scope after a document is removed. */
const closeOrderGap = (Model, doc, scopeFields = []) =>
  resequence(Model, { scope: scopeOf(doc, scopeFields) });

/**
 * Repairs a collection's ordering if (and only if) it is already broken.
 * Call at the top of a list handler so legacy rows that share an order or gaps
 * left by older deletes heal themselves without a migration. Costs one lean
 * read on collections that are already clean.
 */
const healOrders = async (Model, scopeFields = []) => {
  const projection = ['displayOrder', ...scopeFields].join(' ');
  const docs = await Model.find().select(projection).lean();
  if (docs.length && hasDuplicateOrders(docs, scopeFields)) {
    await resequenceAll(Model, scopeFields);
  }
};

module.exports = {
  scopeOf,
  nextOrder,
  resequence,
  resequenceAll,
  hasDuplicateOrders,
  parseOrder,
  orderForCreate,
  settleOrder,
  closeOrderGap,
  healOrders,
};
