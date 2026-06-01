# Meu Diário Financeiro

Pasta do projeto: `c:\_PROJETOS\diario-financeiro`  
GitHub: https://github.com/RivasCode-Ops/diario-financeiro

## Como abrir

| Forma | Ação |
|-------|------|
| **Recomendado** | `Iniciar-Diario-Financeiro.bat` ou `Abrir-Diario-Financeiro.bat` |
| Navegador | http://127.0.0.1:8786/ (com o servidor ligado) |

**Não abra** `index.html` com duplo clique — o JavaScript não carrega em `file://` e nada funciona (data, descrição, salvar).

A porta **8765** é do app **FREEDOM** — o Diário usa **8786**.

### Mesmos dados no celular e no notebook

1. Em **Configurações → Configurar sync**, informe o **ID do Gist** e um **token GitHub** (permissão `gist`).
2. Use o **mesmo Gist e token** nos dois aparelhos.
3. Deixe **Sync automático** ligado: ao abrir o app baixa da nuvem; ao salvar, envia (2–3 s depois).
4. Instale como **app** (PWA): no celular “Adicionar à tela inicial”; no PC use o botão **Instalar** em Configurações.
5. Online: [GitHub Pages](https://rivascode-ops.github.io/diario-financeiro/) — se der **404**, siga [docs/ATIVAR-GITHUB-PAGES.md](docs/ATIVAR-GITHUB-PAGES.md).
6. **Wi‑Fi (sem Pages):** `Iniciar-Diario-Financeiro-Rede.bat` e abra no celular o IP que aparecer na janela.

### Não conecta?

1. Deve aparecer a janela **Diario Financeiro Servidor** com `Serving HTTP on 127.0.0.1 port 8786`.
2. Se não abrir, instale [Python](https://www.python.org/downloads/) ou execute `Parar-Diario-Financeiro.bat` e tente de novo.
3. Celular na mesma Wi‑Fi: use `Iniciar-Diario-Financeiro-Rede.bat`.

## Interface

- **Nova UI fintech** (`index.html`) — dashboard, transações, orçamentos, metas, etc.
- **Versão caderno** (`index-legado.html`) — receitas fixas, semana, CSV, sync Gist
- Design system: `docs/DESIGN-SYSTEM.md`, tokens em `css/tokens.css`

## Funcionalidades (versão legado)

- Receitas e gastos fixos editáveis com totais automáticos
- Resumo (receita − gastos = saldo) com alertas
- Tabela semanal (segunda a domingo)
- Anotações e sonhos
- Citação motivacional
- Dados no navegador (`localStorage`)
- Exportar / importar backup JSON
- **Novo mês** — zera planilha mensal mantendo metas e sonhos

## Privacidade

Todos os dados ficam no seu computador. Use **Exportar** antes de limpar o cache do navegador.
