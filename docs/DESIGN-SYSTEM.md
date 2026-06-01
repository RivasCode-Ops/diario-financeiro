# Design system — Diário Financeiro (fintech)

## Direção

- Fintech premium, limpo, sem gradientes decorativos.
- Neutros claros + **teal** `#0d6e6e` como destaque.
- Tipografia: **DM Sans**.
- Mobile first; sidebar (desktop) + bottom nav (mobile).

## Tokens (`css/tokens.css`)

| Token | Uso |
|-------|-----|
| `--bg`, `--surface` | Fundo e cards |
| `--text`, `--text-secondary` | Hierarquia tipográfica |
| `--accent` | Ações, estado ativo, barras de progresso |
| `--positive` / `--negative` | Receitas / despesas |
| `--radius-md`, `--shadow-sm` | Cards e elevação |
| `[data-theme="dark"]` | Modo escuro |

## Componentes (`css/app.css`)

- **Shell:** `.sidebar`, `.topbar`, `.bottom-nav`, `.menu-sheet`
- **Navegação:** `.nav-item__btn.is-active`
- **Cards:** `.card`, `.card--clickable`, `.stat-card`
- **Dados:** `.tx-list`, `.budget-list`, `.progress`, `.chart-bars`
- **Formulários:** `.btn`, `.btn--primary`, `.toggle`

## Arquitetura de telas

| ID | Seção |
|----|--------|
| `view-dashboard` | Dashboard resumida |
| `view-transacoes` | Tabela de lançamentos |
| `view-orcamentos` | Limites por categoria |
| `view-contas` | Contas e cartões |
| `view-metas` | Objetivos com progresso |
| `view-relatorios` | Exportações |
| `view-configuracoes` | Tema, backup, legado |

## Arquivos

- `index.html` — layout completo
- `app-shell.js` — navegação, tema, dados demo
- `index-legado.html` — versão caderno anterior
- `diario.js` — lógica de dados (integração futura)

## Próximo passo técnico

Conectar `diario.js` (localStorage) aos componentes do dashboard e às views de transações/metas.
