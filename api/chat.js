// Função serverless do Vercel: POST /api/chat
// Variáveis de ambiente necessárias:
//   ANTHROPIC_API_KEY  (obrigatória) chave da API
//   APP_TOKEN          (recomendada) senha de acesso ao endpoint

const MODEL = 'claude-haiku-5-5';
const MAX_MESSAGES = 40;
const MAX_CHARS = 8000;

function mergeTurns(messages) {
  // A API exige alternância user/assistant: junta turnos seguidos do mesmo papel
  const out = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    const role = m.role === 'user' ? 'user' : 'assistant';
    const text = String(m.text || '').slice(0, MAX_CHARS);
    if (!text) continue;
    if (out.length && out[out.length - 1].role === role) {
      out[out.length - 1].content += '\n\n' + text;
    } else {
      out.push({ role, content: text });
    }
  }
  if (!out.length || out[0].role !== 'user') {
    out.unshift({ role: 'user', content: '(início da conversa)' });
  }
  return out;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const appToken = process.env.APP_TOKEN;
  if (appToken && req.headers.authorization !== `Bearer ${appToken}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });
  }

  const body = req.body || {};
  const payload = {
    model: MODEL,
    max_tokens: 1024,
    system: String(body.instructions || 'Você é um assistente útil.').slice(0, MAX_CHARS),
    messages: mergeTurns(Array.isArray(body.messages) ? body.messages : []),
  };

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      return res.status(502).json({ error: `Falha no modelo (HTTP ${r.status})` });
    }
    const data = await r.json();
    const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(502).json({ error: 'Não foi possível contatar o modelo' });
  }
};
