// GET /api/runs — execuções feitas pelo cron, para o app mostrar no chat
const { getJSON } = require('../lib/kv');
const { appAuthOk } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  if (!appAuthOk(req)) return res.status(401).json({ error: 'Não autorizado' });
  try {
    return res.status(200).json({ runs: await getJSON('runs', []) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
