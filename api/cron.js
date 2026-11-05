// GET /api/cron — chamado pelo Vercel Cron (ver vercel.json)
// Executa as tarefas vencidas e guarda o resultado para o app exibir.
const { getJSON, setJSON } = require('../lib/kv');
const { cronAuthOk } = require('../lib/auth');
const { callModel } = require('../lib/model');

const MAX_RUNS = 200;

module.exports = async (req, res) => {
  if (!cronAuthOk(req)) return res.status(401).json({ error: 'Não autorizado' });
  try {
    const now = Date.now();
    const tasks = await getJSON('tasks', []);
    const runs = await getJSON('runs', []);
    let ran = 0;

    for (const t of tasks) {
      if (t.nextRun > now) continue;
      t.nextRun = now + t.everyMin * 60000;
      ran++;
      const runId = `${t.id}-${now}`;
      try {
        const reply = await callModel(t.instructions, [{ role: 'user', text: t.prompt }]);
        runs.push({ id: runId, taskId: t.id, agentId: t.agentId, ts: now, ok: true, text: reply });
      } catch (e) {
        runs.push({ id: runId, taskId: t.id, agentId: t.agentId, ts: now, ok: false, text: `Falha: ${e.message}` });
      }
    }

    await setJSON('tasks', tasks);
    await setJSON('runs', runs.slice(-MAX_RUNS));
    return res.status(200).json({ ran });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
