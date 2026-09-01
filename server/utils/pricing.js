/**
 * Reads a category's price off a PricingTier.
 *
 * `PricingTier.prices` is declared as a Mongoose `Map` so admins can add their
 * own categories without a schema change. That makes access shape-dependent:
 *
 *   - hydrated document (findById / find)  -> real Map, needs .get(key)
 *   - .lean() query or serialised JSON     -> plain object (toJSON flattenMaps)
 *
 * Bracket access on the Map form returns `undefined` silently rather than
 * throwing, which previously collapsed every price to 0 and rejected every
 * PayPal order with "Invalid registration amount." Always read through this.
 */
const priceFor = (tier, category) => {
  const prices = tier?.prices;
  if (!prices || !category) return 0;

  const raw = typeof prices.get === 'function'
    ? prices.get(category)   // Mongoose Map
    : prices[category];      // plain object

  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

module.exports = { priceFor };
