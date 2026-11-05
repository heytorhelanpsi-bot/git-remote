// POST /api/chat — conversa interativa com um agente
const { appAuthOk } = require('../lib/auth');
const { callModel } = require('../lib/model');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!appAuthOk(req)) return res.status(401).json({ error: 'Não autorizado' });
  const body = req.body || {};
  try {
    const reply = await callModel(body.instructions, Array.isArray(body.messages) ? body.messages : []);
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
