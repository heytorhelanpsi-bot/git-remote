# Agentes — contexto do projeto

App web de agentes persistentes com conversas, tarefas agendadas (no navegador) e fila de compras com aprovação manual.

## Estrutura
- `index.html` — interface completa em página única (HTML, CSS e JS sem build).
- `api/chat.js` — função serverless do Vercel: `POST /api/chat`, repassa a conversa ao modelo.

## Regras importantes
- A chave `ANTHROPIC_API_KEY` fica só nas variáveis de ambiente do Vercel. Nunca commitar chaves.
- `APP_TOKEN` (opcional) protege o endpoint; o app envia como `Authorization: Bearer`.
- Compras: o agente só propõe. A aprovação é sempre manual, com confirmação e limites. Não adicionar execução automática de pagamento nem tratamento de dados de cartão.
- Modelo padrão: `claude-haiku-5-5`.

## Desenvolvimento
- Rodar localmente: `vercel dev` (após `npm i -g vercel`).
- Deploy: `vercel --prod`.

## Agendamento no servidor
- `lib/kv.js`: armazenamento REST compatível com Upstash/Vercel KV. Variáveis: `KV_REST_API_URL`, `KV_REST_API_TOKEN`.
- `api/tasks.js`: o app envia a lista de tarefas (`PUT`) e lê o estado (`GET`).
- `api/cron.js`: executado pelo Vercel Cron (`vercel.json`, a cada hora). Exige `CRON_SECRET` (o Vercel envia como Bearer).
- `api/runs.js`: resultados das execuções, exibidos no chat do agente pelo app.
- Publicado, o navegador não executa tarefas (evita duplicidade). Em arquivo local, executa.
- Atenção: o plano Hobby do Vercel aceita cron apenas diário; para horário é preciso plano pago.

## Variáveis de ambiente (Vercel)
- `ANTHROPIC_API_KEY`, `APP_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `CRON_SECRET`.
