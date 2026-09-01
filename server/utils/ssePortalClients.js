const clients = new Map(); // abstractId -> Set<res>

function addPortalClient(abstractId, res) {
  const key = abstractId.toString();
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
}

function removePortalClient(abstractId, res) {
  const key = abstractId.toString();
  const set = clients.get(key);
  if (set) { set.delete(res); if (!set.size) clients.delete(key); }
}

function broadcastToAbstract(abstractId, event, data) {
  const set = clients.get(abstractId.toString());
  if (!set || !set.size) return;
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try { res.write(msg); } catch { set.delete(res); }
  }
}

module.exports = { addPortalClient, removePortalClient, broadcastToAbstract };
