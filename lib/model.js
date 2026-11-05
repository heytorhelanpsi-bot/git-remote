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

async function callModel(instructions, messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: String(instructions || 'Você é um assistente útil.').slice(0, MAX_CHARS),
      messages: mergeTurns(messages),
    }),
  });
  if (!r.ok) throw new Error(`Falha no modelo (HTTP ${r.status})`);
  const data = await r.json();
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

module.exports = { callModel, mergeTurns };
