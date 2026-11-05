// Armazenamento simples via REST compatível com Upstash / Vercel KV.
// Variáveis: KV_REST_API_URL e KV_REST_API_TOKEN
async function cmd(args) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Armazenamento não configurado (KV_REST_API_URL / KV_REST_API_TOKEN)');
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`Armazenamento HTTP ${r.status}`);
  const d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.result;
}

async function getJSON(key, fallback) {
  const v = await cmd(['GET', key]);
  return v ? JSON.parse(v) : fallback;
}

async function setJSON(key, value) {
  await cmd(['SET', key, JSON.stringify(value)]);
}

module.exports = { getJSON, setJSON };
