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

### Não conecta?

1. Deve aparecer a janela **Diario Financeiro Servidor** com `Serving HTTP on 127.0.0.1 port 8786`.
2. Se não abrir, instale [Python](https://www.python.org/downloads/) ou execute `Parar-Diario-Financeiro.bat` e tente de novo.
3. Celular na mesma Wi‑Fi: use `Iniciar-Diario-Financeiro-Rede.bat`.

## Funcionalidades

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
