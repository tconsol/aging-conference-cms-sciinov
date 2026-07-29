async function nextDisplayOrder(Model, filter = {}) {
  const last = await Model.findOne(filter).sort({ displayOrder: -1 }).select('displayOrder').lean();
  return (last?.displayOrder ?? 0) + 1;
}

module.exports = nextDisplayOrder;
