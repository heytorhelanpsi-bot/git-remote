// Usuário: APP_TOKEN (opcional). Se definido, exigido nas rotas do app.
function appAuthOk(req) {
  const token = process.env.APP_TOKEN;
  return !token || req.headers.authorization === `Bearer ${token}`;
}

// Cron do Vercel envia Authorization: Bearer CRON_SECRET. Sempre obrigatório.
function cronAuthOk(req) {
  const secret = process.env.CRON_SECRET;
  return !!secret && req.headers.authorization === `Bearer ${secret}`;
}

module.exports = { appAuthOk, cronAuthOk };
