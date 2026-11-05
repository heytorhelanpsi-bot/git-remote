// GET /api/tasks — lista tarefas agendadas
// PUT /api/tasks — substitui a lista (enviada pelo app)
const { getJSON, setJSON } = require('../lib/kv');
const { appAuthOk } = require('../lib/auth');

const ALLOWED_INTERVALS = [60, 360, 1440, 10080];
const MAX_TASKS = 50;

module.exports = async (req, res) => {
  if (!appAuthOk(req)) return res.status(401).json({ error: 'Não autorizado' });
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ tasks: await getJSON('tasks', []) });
    }
    if (req.method === 'PUT') {
      const list = Array.isArray(req.body?.tasks) ? req.body.tasks.slice(0, MAX_TASKS) : null;
      if (!list) return res.status(400).json({ error: 'Envie { tasks: [...] }' });
      const clean = list
        .map(t => ({
          id: String(t.id || '').slice(0, 40),
          agentId: String(t.agentId || '').slice(0, 40),
          agentName: String(t.agentName || 'Agente').slice(0, 80),
          instructions: String(t.instructions || '').slice(0, 4000),
          prompt: String(t.prompt || '').slice(0, 4000),
          everyMin: ALLOWED_INTERVALS.includes(Number(t.everyMin)) ? Number(t.everyMin) : 1440,
          nextRun: Number(t.nextRun) || Date.now(),
        }))
        .filter(t => t.id && t.prompt);
      await setJSON('tasks', clean);
      return res.status(200).json({ ok: true, count: clean.length });
    }
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
