# War Thunder Reference — Cloudflare Pages

## Estrutura do projeto

```
wt-pages-project/
├── public/
│   └── index.html          ← o site completo
├── functions/
│   └── api/
│       ├── data.js         ← GET/POST /api/data  (ler/guardar dados)
│       ├── auth.js         ← POST /api/auth       (login do editor)
│       └── health.js       ← GET /api/health      (verificação)
└── wrangler.toml           ← configuração
```

As `functions/` são **Cloudflare Pages Functions** — correm automaticamente no edge, sem precisar de configurar um Worker separado. A Cloudflare deteta-as automaticamente.

---

## Deploy passo a passo

### Pré-requisitos
```bash
npm install -g wrangler
wrangler login   # abre o browser para autenticar na tua conta Cloudflare
```

---

### Passo 1 — Criar a base de dados KV

```bash
npx wrangler kv:namespace create WT_DATA
```

Resultado (exemplo):
```
✨ Success!
Add the following to your configuration file:
[[kv_namespaces]]
binding = "WT_DATA"
id = "a1b2c3d4e5f6..."
```

Abre `wrangler.toml` e substitui `<KV_NAMESPACE_ID>` pelo `id` gerado.

---

### Passo 2 — Criar o projeto no Cloudflare Pages

```bash
npx wrangler pages project create wt-reference
```

---

### Passo 3 — Definir a password do editor

```bash
npx wrangler pages secret put EDITOR_PASSWORD --project-name wt-reference
# → escreve a tua password quando pedir (ex: MinhaSuperPassword123)
```

> ⚠️ Esta password TEM de ser igual à que está em `public/index.html`.  
> Procura `const EDITOR_PW = 'wt2025'` e altera para a mesma password.

---

### Passo 4 — Fazer deploy

```bash
npx wrangler pages deploy public --project-name wt-reference
```

O site fica disponível em: `https://wt-reference.pages.dev`

---

### (Alternativa) Via GitHub — deploy automático

1. Faz push do projeto para um repositório GitHub
2. Cloudflare Dashboard → **Pages → Create a project → Connect to Git**
3. Seleciona o repositório
4. Configurações de build:
   - **Framework preset:** None
   - **Build command:** (vazio)
   - **Build output directory:** `public`
5. Em **Settings → Environment variables**, adiciona:
   - `EDITOR_PASSWORD` = a tua password
6. Em **Settings → Functions → KV namespace bindings**, adiciona:
   - Variable name: `WT_DATA` → seleciona o namespace criado no Passo 1

A partir daí, cada `git push` faz deploy automático.

---

## Como funciona

```
Browser                      Cloudflare Pages
   │                               │
   ├── GET /          ────────────►│── serve index.html
   │                               │
   ├── GET /api/data  ────────────►│── functions/api/data.js ──► KV.get('main')
   │◄── JSON (todos os dados) ─────│
   │  (aplica ao site na abertura) │
   │                               │
   ├── POST /api/auth ────────────►│── functions/api/auth.js (verifica password)
   │◄── { token: "..." } ──────────│
   │                               │
   ├── POST /api/data ────────────►│── functions/api/data.js ──► KV.put('main', dados)
   │  (com Authorization: Bearer)  │   + backup automático (7 dias)
   │◄── { ok: true } ─────────────│
```

**Leitura** — qualquer visitante vê os dados mais recentes (sem login).  
**Escrita** — só quem tem a password do editor pode guardar alterações.

---

## Indicador de sync (canto superior direito do site)

| Ícone | Significado |
|-------|-------------|
| `○ A ligar…` | A carregar dados do servidor |
| `✓ Sincronizado · HH:MM:SS` | Dados guardados com sucesso |
| `● Alterações…` | Há alterações por guardar (aguarda 2s) |
| `⟳ A guardar…` | A enviar para o servidor |
| `⚡ Offline (cache)` | Sem ligação — a usar localStorage |
| `✗ Erro sync` | Falha ao guardar — tentar de novo |
| `🔒 Sessão expirou` | Token de 1h expirou — fazer login de novo |

---

## Alterar a password depois do deploy

**No servidor:**
```bash
npx wrangler pages secret put EDITOR_PASSWORD --project-name wt-reference
```

**No HTML** (`public/index.html`):
Procura `const EDITOR_PW = 'wt2025'` e altera para a nova password. Faz novo deploy.

---

## Backup e restauro

O servidor guarda automaticamente backups dos últimos 7 dias com chave `backup:<timestamp>`.

**Listar backups:**
```bash
npx wrangler kv:key list --namespace-id=<ID>
```

**Ver um backup:**
```bash
npx wrangler kv:key get "backup:1234567890" --namespace-id=<ID>
```

**Restaurar** (colar o JSON no campo de importação do editor → "☁️ Guardar").

---

## Limites do plano gratuito Cloudflare Pages

| Recurso | Limite gratuito | Uso típico deste site |
|---|---|---|
| Pages requests | 500k/mês | ~500 visitas/dia |
| Functions requests | 100k/dia | Mais que suficiente |
| KV reads | 100k/dia | Mais que suficiente |
| KV writes | 1k/dia | ~10 saves/dia |
| KV storage | 1 GB | Site cabe em ~2 MB |
