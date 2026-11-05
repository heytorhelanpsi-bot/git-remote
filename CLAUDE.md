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

## Pendências
- Tarefas agendadas só rodam com a aba aberta. Para execução no servidor, é preciso armazenamento (ex.: Vercel KV/Blob) e um Cron Job.
